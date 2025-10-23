// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title VesikaCoin
 * @dev Ana yönetişim token'ı - Sabit arz, DAO oylaması, staking desteği
 */
contract VesikaCoin is ERC20, ERC20Burnable, Pausable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant STAKING_ROLE = keccak256("STAKING_ROLE");

    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M token
    uint256 public totalStaked;
    
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // saniye cinsinden
        bool isActive;
    }
    
    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public stakingRewards;
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor() ERC20("VesikaCoin", "VSK") ERC20Permit("VesikaCoin") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(STAKING_ROLE, msg.sender);
        
        // İlk arz - toplam arzın %20'si
        _mint(msg.sender, 20_000_000 * 10**18);
    }

    /**
     * @dev Staking işlemi - Token'ları kilitle ve ödül kazan
     */
    function stake(uint256 amount, uint256 lockPeriod) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(lockPeriod >= 30 days, "Minimum lock period is 30 days");
        require(lockPeriod <= 365 days, "Maximum lock period is 365 days");
        require(!stakes[msg.sender].isActive, "Already staking");
        
        _transfer(msg.sender, address(this), amount);
        
        stakes[msg.sender] = StakeInfo({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriod,
            isActive: true
        });
        
        totalStaked += amount;
        emit Staked(msg.sender, amount, lockPeriod);
    }

    /**
     * @dev Staking'i sonlandır ve ödülleri al
     */
    function unstake() external {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        require(
            block.timestamp >= userStake.timestamp + userStake.lockPeriod,
            "Lock period not finished"
        );
        
        uint256 stakedAmount = userStake.amount;
        uint256 reward = calculateReward(msg.sender);
        
        userStake.isActive = false;
        totalStaked -= stakedAmount;
        
        _transfer(address(this), msg.sender, stakedAmount);
        
        if (reward > 0) {
            stakingRewards[msg.sender] += reward;
        }
        
        emit Unstaked(msg.sender, stakedAmount, reward);
    }

    /**
     * @dev Staking ödülünü hesapla
     */
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (!userStake.isActive) return 0;
        
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 annualRate = getAnnualRate(userStake.lockPeriod);
        
        // APY hesaplama: (amount * rate * duration) / (365 days * 100)
        return (userStake.amount * annualRate * stakingDuration) / (365 days * 100);
    }

    /**
     * @dev Kilit süresine göre yıllık ödül oranını al
     */
    function getAnnualRate(uint256 lockPeriod) public pure returns (uint256) {
        if (lockPeriod >= 365 days) return 15; // %15 APY
        if (lockPeriod >= 180 days) return 10; // %10 APY
        if (lockPeriod >= 90 days) return 7;   // %7 APY
        return 5; // %5 APY (30+ gün)
    }

    /**
     * @dev Ödülleri talep et
     */
    function claimRewards() external {
        uint256 reward = stakingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        stakingRewards[msg.sender] = 0;
        
        // Ödül olarak yeni token mint et (toplam arz sınırına dikkat et)
        require(totalSupply() + reward <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Yönetici tarafından token mint etme
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Kontratı duraklat
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Kontratı devam ettir
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Transfer öncesi kontroller
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // ERC20Votes için gerekli override'lar
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    /**
     * @dev Kullanıcının oy gücünü al (staking dahil)
     */
    function getVotingPower(address account) external view returns (uint256) {
        uint256 balance = balanceOf(account);
        uint256 stakedAmount = stakes[account].isActive ? stakes[account].amount : 0;
        
        // Staking yapanlar 1.5x oy gücü alır
        return balance + (stakedAmount * 150) / 100;
    }
}
