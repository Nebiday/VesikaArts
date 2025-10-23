// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ArtistToken
 * @dev Sanatçıya özel ERC20 token - Sınırlı transfer, whitelist kontrolü
 */
contract ArtistToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant ARTIST_ROLE = keccak256("ARTIST_ROLE");
    bytes32 public constant WHITELIST_MANAGER_ROLE = keccak256("WHITELIST_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    address public immutable artist;
    address public immutable factory;
    address public immutable mainToken;
    
    uint256 public immutable maxSupply;
    uint256 public swapRate; // 1 ArtistToken = swapRate MainToken
    
    mapping(address => bool) public whitelist;
    mapping(address => bool) public blacklist;
    
    bool public transferRestricted = true;
    bool public swapEnabled = true;
    
    event WhitelistUpdated(address indexed account, bool status);
    event BlacklistUpdated(address indexed account, bool status);
    event SwapRateUpdated(uint256 newRate);
    event TransferRestrictionUpdated(bool restricted);

    modifier onlyArtist() {
        require(hasRole(ARTIST_ROLE, msg.sender), "Caller is not the artist");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Caller is not the factory");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _artist,
        address _factory,
        address _mainToken,
        uint256 _maxSupply,
        uint256 _initialSwapRate
    ) ERC20(name, symbol) {
        artist = _artist;
        factory = _factory;
        mainToken = _mainToken;
        maxSupply = _maxSupply;
        swapRate = _initialSwapRate;

        _grantRole(DEFAULT_ADMIN_ROLE, _factory);
        _grantRole(ARTIST_ROLE, _artist);
        _grantRole(WHITELIST_MANAGER_ROLE, _artist);
        _grantRole(WHITELIST_MANAGER_ROLE, _factory);
        _grantRole(PAUSER_ROLE, _factory);

        // Sanatçıyı ve factory'yi whitelist'e ekle
        whitelist[_artist] = true;
        whitelist[_factory] = true;
        whitelist[_mainToken] = true;

        // İlk arz - sanatçıya %30, factory'ye %70
        uint256 artistShare = (_maxSupply * 30) / 100;
        uint256 factoryShare = _maxSupply - artistShare;
        
        _mint(_artist, artistShare);
        _mint(_factory, factoryShare);
    }

    /**
     * @dev Whitelist yönetimi
     */
    function updateWhitelist(address account, bool status) 
        external 
        onlyRole(WHITELIST_MANAGER_ROLE) 
    {
        whitelist[account] = status;
        emit WhitelistUpdated(account, status);
    }

    /**
     * @dev Toplu whitelist güncelleme
     */
    function updateWhitelistBatch(address[] calldata accounts, bool status) 
        external 
        onlyRole(WHITELIST_MANAGER_ROLE) 
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }

    /**
     * @dev Blacklist yönetimi
     */
    function updateBlacklist(address account, bool status) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        blacklist[account] = status;
        emit BlacklistUpdated(account, status);
    }

    /**
     * @dev Swap oranını güncelle
     */
    function updateSwapRate(uint256 newRate) external onlyArtist {
        require(newRate > 0, "Swap rate must be greater than 0");
        swapRate = newRate;
        emit SwapRateUpdated(newRate);
    }

    /**
     * @dev Transfer kısıtlamasını güncelle
     */
    function setTransferRestriction(bool restricted) external onlyArtist {
        transferRestricted = restricted;
        emit TransferRestrictionUpdated(restricted);
    }

    /**
     * @dev Swap durumunu güncelle
     */
    function setSwapEnabled(bool enabled) external onlyArtist {
        swapEnabled = enabled;
    }

    /**
     * @dev Sanatçı tarafından ek token mint etme
     */
    function mintByArtist(address to, uint256 amount) external onlyArtist {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(whitelist[to], "Recipient not whitelisted");
        _mint(to, amount);
    }

    /**
     * @dev Factory tarafından token mint etme (swap için)
     */
    function mintByFactory(address to, uint256 amount) external onlyFactory {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Transfer öncesi kontroller
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);

        // Blacklist kontrolü
        require(!blacklist[from] && !blacklist[to], "Address is blacklisted");

        // Transfer kısıtlaması kontrolü
        if (transferRestricted && from != address(0) && to != address(0)) {
            require(
                whitelist[from] || whitelist[to],
                "Transfer restricted to whitelisted addresses"
            );
        }
    }

    /**
     * @dev Kontratı duraklat
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Kontratı devam ettir
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Token bilgilerini al
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        address tokenArtist,
        uint256 tokenMaxSupply,
        uint256 tokenSwapRate,
        bool tokenTransferRestricted,
        bool tokenSwapEnabled
    ) {
        return (
            name(),
            symbol(),
            artist,
            maxSupply,
            swapRate,
            transferRestricted,
            swapEnabled
        );
    }
}
