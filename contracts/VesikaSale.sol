// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IVesikaCoin {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title VesikaSale
 * @dev VesikaCoin satış platformu - ETH ile VSK satın alma
 */
contract VesikaSale is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    IVesikaCoin public immutable vesikaCoin;
    
    // 1 ETH = kaç VSK
    uint256 public vskPerEth = 1000 * 10**18; // Default: 1 ETH = 1000 VSK
    
    // Minimum ve maksimum alım limitleri
    uint256 public minPurchase = 0.01 ether;  // Min 0.01 ETH
    uint256 public maxPurchase = 10 ether;     // Max 10 ETH
    
    // Satış envanteri
    uint256 public availableForSale;  // Satışa hazır VSK miktarı
    
    // İstatistikler
    uint256 public totalSold;
    uint256 public totalEthRaised;
    mapping(address => uint256) public userPurchases;
    
    event VesikaPurchased(
        address indexed buyer,
        uint256 ethAmount,
        uint256 vskAmount
    );
    event RateUpdated(uint256 newRate);
    event LimitsUpdated(uint256 minPurchase, uint256 maxPurchase);
    event EthWithdrawn(address indexed to, uint256 amount);
    event InventoryAdded(uint256 amount);
    event InventoryUpdated(uint256 newAmount);
    
    constructor(address _vesikaCoin) {
        vesikaCoin = IVesikaCoin(_vesikaCoin);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev ETH ile VesikaCoin satın al
     */
    function buyVesika() external payable nonReentrant whenNotPaused {
        require(msg.value >= minPurchase, "Amount too small");
        require(msg.value <= maxPurchase, "Amount too large");
        
        // VSK miktarını hesapla
        uint256 vskAmount = (msg.value * vskPerEth) / 1 ether;
        
        // Envanterde yeterli VSK olduğunu kontrol et
        require(vskAmount <= availableForSale, "Not enough VSK available for sale");
        
        // Envanteri azalt
        availableForSale -= vskAmount;
        
        // VSK'yı mint et ve gönder
        vesikaCoin.mint(msg.sender, vskAmount);
        
        // İstatistikleri güncelle
        totalSold += vskAmount;
        totalEthRaised += msg.value;
        userPurchases[msg.sender] += vskAmount;
        
        emit VesikaPurchased(msg.sender, msg.value, vskAmount);
    }
    
    /**
     * @dev Satış envanterine VSK ekle (admin)
     */
    function addInventory(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(amount > 0, "Amount must be positive");
        availableForSale += amount;
        emit InventoryAdded(amount);
    }
    
    /**
     * @dev Satış envanterini direkt ayarla (admin)
     */
    function setInventory(uint256 amount) external onlyRole(ADMIN_ROLE) {
        availableForSale = amount;
        emit InventoryUpdated(amount);
    }

    /**
     * @dev VSK/ETH oranını güncelle (admin)
     */
    function updateRate(uint256 _vskPerEth) external onlyRole(ADMIN_ROLE) {
        require(_vskPerEth > 0, "Rate must be positive");
        vskPerEth = _vskPerEth;
        emit RateUpdated(_vskPerEth);
    }
    
    /**
     * @dev Alım limitlerini güncelle (admin)
     */
    function updateLimits(uint256 _minPurchase, uint256 _maxPurchase) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_minPurchase > 0, "Min must be positive");
        require(_maxPurchase > _minPurchase, "Max must be greater than min");
        
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
        
        emit LimitsUpdated(_minPurchase, _maxPurchase);
    }
    
    /**
     * @dev ETH çek (admin)
     */
    function withdrawEth() external onlyRole(ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "ETH transfer failed");
        
        emit EthWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Belirli bir ETH miktarı için kaç VSK alınacağını hesapla
     */
    function calculateVsk(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * vskPerEth) / 1 ether;
    }
    
    /**
     * @dev Kontratı duraklat
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Kontratı devam ettir
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Kontrat bilgilerini getir
     */
    function getSaleInfo() external view returns (
        uint256 rate,
        uint256 minBuy,
        uint256 maxBuy,
        uint256 sold,
        uint256 raised,
        uint256 available
    ) {
        return (vskPerEth, minPurchase, maxPurchase, totalSold, totalEthRaised, availableForSale);
    }
}
