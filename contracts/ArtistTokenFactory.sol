// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ArtistToken.sol";

// VesikaCoin interface for minting
interface IVesikaCoin {
    function mint(address to, uint256 amount) external;
}

/**
 * @title ArtistTokenFactory
 * @dev Sanatçı token'larını oluşturan ve yöneten factory kontratı
 */
contract ArtistTokenFactory is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    address public immutable mainToken;
    address public tokenSwap;
    
    struct TokenRequest {
        address artist;
        string name;
        string symbol;
        uint256 maxSupply;
        uint256 initialSwapRate;
        string description;
        string metadata;
        uint256 timestamp;
        bool approved;
        bool deployed;
        address tokenAddress;
    }
    
    struct ArtistInfo {
        bool isRegistered;
        bool isApproved;
        uint256 tokenCount;
        address[] tokens;
        string profileMetadata;
    }
    
    mapping(uint256 => TokenRequest) public tokenRequests;
    mapping(address => ArtistInfo) public artists;
    mapping(address => bool) public deployedTokens;
    
    uint256 public requestCounter;
    uint256 public deployedTokenCount;
    uint256 public approvedArtistCount;
    
    address[] public allDeployedTokens;
    address[] public approvedArtists;
    address[] public pendingArtists;
    
    event TokenRequested(
        uint256 indexed requestId,
        address indexed artist,
        string name,
        string symbol
    );
    
    event TokenApproved(uint256 indexed requestId, address indexed approver);
    event TokenDeployed(
        uint256 indexed requestId,
        address indexed artist,
        address indexed tokenAddress
    );
    
    event ArtistRegistered(address indexed artist, string metadata);
    event ArtistApproved(address indexed artist, address indexed approver);
    event ArtistRejected(address indexed artist, address indexed rejector);
    event TokenRejected(uint256 indexed requestId, address indexed rejector);

    constructor(address _mainToken) {
        mainToken = _mainToken;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);
    }

    /**
     * @dev TokenSwap adresini ayarla (sadece admin)
     */
    function setTokenSwap(address _tokenSwap) external onlyRole(ADMIN_ROLE) {
        tokenSwap = _tokenSwap;
    }

    /**
     * @dev Sanatçı kaydı
     */
    function registerArtist(string calldata profileMetadata) external {
        require(!artists[msg.sender].isRegistered, "Artist already registered");
        
        artists[msg.sender] = ArtistInfo({
            isRegistered: true,
            isApproved: false,
            tokenCount: 0,
            tokens: new address[](0),
            profileMetadata: profileMetadata
        });
        
        pendingArtists.push(msg.sender);
        
        emit ArtistRegistered(msg.sender, profileMetadata);
    }

    /**
     * @dev Sanatçıyı onayla
     */
    function approveArtist(address artist) external onlyRole(APPROVER_ROLE) {
        require(artists[artist].isRegistered, "Artist not registered");
        require(!artists[artist].isApproved, "Artist already approved");
        
        artists[artist].isApproved = true;
        approvedArtists.push(artist);
        approvedArtistCount++;
        
        // Remove from pending artists
        _removeFromPendingArtists(artist);
        
        emit ArtistApproved(artist, msg.sender);
    }

    /**
     * @dev Token oluşturma talebi
     */
    function requestToken(
        string calldata name,
        string calldata symbol,
        uint256 maxSupply,
        uint256 initialSwapRate,
        string calldata description,
        string calldata metadata
    ) external whenNotPaused returns (uint256) {
        require(artists[msg.sender].isApproved, "Artist not approved");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(initialSwapRate > 0, "Initial swap rate must be greater than 0");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        
        uint256 requestId = requestCounter++;
        
        tokenRequests[requestId] = TokenRequest({
            artist: msg.sender,
            name: name,
            symbol: symbol,
            maxSupply: maxSupply,
            initialSwapRate: initialSwapRate,
            description: description,
            metadata: metadata,
            timestamp: block.timestamp,
            approved: false,
            deployed: false,
            tokenAddress: address(0)
        });
        
        emit TokenRequested(requestId, msg.sender, name, symbol);
        return requestId;
    }

    /**
     * @dev Token talebini onayla
     */
    function approveTokenRequest(uint256 requestId) 
        external 
        onlyRole(APPROVER_ROLE) 
    {
        TokenRequest storage request = tokenRequests[requestId];
        require(request.artist != address(0), "Request does not exist");
        require(!request.approved, "Request already approved");
        require(!request.deployed, "Token already deployed");
        
        request.approved = true;
        emit TokenApproved(requestId, msg.sender);
    }

    /**
     * @dev Token talebini reddet
     */
    function rejectTokenRequest(uint256 requestId) 
        external 
        onlyRole(APPROVER_ROLE) 
    {
        TokenRequest storage request = tokenRequests[requestId];
        require(request.artist != address(0), "Request does not exist");
        require(!request.approved, "Request already approved");
        require(!request.deployed, "Token already deployed");
        
        // Request'i sil
        delete tokenRequests[requestId];
        emit TokenRejected(requestId, msg.sender);
    }

    /**
     * @dev Sanatçıyı reddet
     */
    function rejectArtist(address artistAddress) 
        external 
        onlyRole(APPROVER_ROLE) 
    {
        // Pending artists listesinde olup olmadığını kontrol et
        bool isPending = false;
        uint256 pendingIndex = 0;
        for (uint256 i = 0; i < pendingArtists.length; i++) {
            if (pendingArtists[i] == artistAddress) {
                isPending = true;
                pendingIndex = i;
                break;
            }
        }
        require(isPending, "Artist not pending");
        
        // Approved artists listesinde olmadığını kontrol et
        for (uint256 i = 0; i < approvedArtists.length; i++) {
            require(approvedArtists[i] != artistAddress, "Artist already approved");
        }
        
        // Pending listesinden çıkar (son elemanı bu pozisyona taşı)
        pendingArtists[pendingIndex] = pendingArtists[pendingArtists.length - 1];
        pendingArtists.pop();
        
        emit ArtistRejected(artistAddress, msg.sender);
    }

    /**
     * @dev Onaylı token'ı deploy et - sadece sanatçının kendisi yapabilir
     */
    function deployToken(uint256 requestId) 
        external 
        nonReentrant 
    {
        TokenRequest storage request = tokenRequests[requestId];
        require(request.artist == msg.sender, "Only artist can deploy their token");
        require(request.approved, "Request not approved");
        require(!request.deployed, "Token already deployed");
        
        // Yeni ArtistToken deploy et
        ArtistToken newToken = new ArtistToken(
            request.name,
            request.symbol,
            request.artist,
            address(this),
            mainToken,
            request.maxSupply,
            request.initialSwapRate
        );
        
        address tokenAddress = address(newToken);
        
        // Request'i güncelle
        request.deployed = true;
        request.tokenAddress = tokenAddress;
        
        // Artist bilgilerini güncelle
        artists[request.artist].tokenCount++;
        artists[request.artist].tokens.push(tokenAddress);
        
        // Global kayıtları güncelle
        deployedTokens[tokenAddress] = true;
        allDeployedTokens.push(tokenAddress);
        deployedTokenCount++;
        
        // TokenSwap'i otomatik olarak whitelist'e ekle
        if (tokenSwap != address(0)) {
            newToken.updateWhitelist(tokenSwap, true);
        }
        
        emit TokenDeployed(requestId, request.artist, tokenAddress);
    }

    /**
     * @dev Bekleyen talepleri al
     */
    function getPendingRequests() external view returns (uint256[] memory) {
        uint256[] memory pending = new uint256[](requestCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < requestCounter; i++) {
            if (!tokenRequests[i].approved && tokenRequests[i].artist != address(0)) {
                pending[count] = i;
                count++;
            }
        }
        
        // Boyutu ayarla
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pending[i];
        }
        
        return result;
    }

    /**
     * @dev Onaylı ama deploy edilmemiş talepleri al
     */
    function getApprovedRequests() external view returns (uint256[] memory) {
        uint256[] memory approved = new uint256[](requestCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < requestCounter; i++) {
            if (tokenRequests[i].approved && !tokenRequests[i].deployed) {
                approved[count] = i;
                count++;
            }
        }
        
        // Boyutu ayarla
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = approved[i];
        }
        
        return result;
    }

    /**
     * @dev Sanatçının token'larını al
     */
    function getArtistTokens(address artist) external view returns (address[] memory) {
        return artists[artist].tokens;
    }

    /**
     * @dev Tüm deploy edilmiş token'ları al
     */
    function getAllDeployedTokens() external view returns (address[] memory) {
        return allDeployedTokens;
    }

    /**
     * @dev Token'ın factory tarafından deploy edilip edilmediğini kontrol et
     */
    function isDeployedToken(address token) external view returns (bool) {
        return deployedTokens[token];
    }

    /**
     * @dev Talep detaylarını al
     */
    function getRequestDetails(uint256 requestId) external view returns (
        address artist,
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 initialSwapRate,
        string memory description,
        string memory metadata,
        uint256 timestamp,
        bool approved,
        bool deployed,
        address tokenAddress
    ) {
        TokenRequest memory request = tokenRequests[requestId];
        return (
            request.artist,
            request.name,
            request.symbol,
            request.maxSupply,
            request.initialSwapRate,
            request.description,
            request.metadata,
            request.timestamp,
            request.approved,
            request.deployed,
            request.tokenAddress
        );
    }

    /**
     * @dev Sanatçı bilgilerini al
     */
    function getArtistInfo(address artist) external view returns (
        bool isRegistered,
        bool isApproved,
        uint256 tokenCount,
        string memory profileMetadata
    ) {
        ArtistInfo memory info = artists[artist];
        return (
            info.isRegistered,
            info.isApproved,
            info.tokenCount,
            info.profileMetadata
        );
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
     * @dev Onaylanmış sanatçı sayısını döndür
     */
    function getApprovedArtistCount() external view returns (uint256) {
        return approvedArtistCount;
    }
    
    /**
     * @dev Tüm onaylanmış sanatçıları döndür
     */
    function getApprovedArtists() external view returns (address[] memory) {
        return approvedArtists;
    }
    
    /**
     * @dev Bekleyen sanatçıları döndür
     */
    function getPendingArtists() external view returns (address[] memory) {
        return pendingArtists;
    }
    
    /**
     * @dev Bekleyen token taleplerini döndür
     */
    function getPendingTokenRequests() external view returns (uint256[] memory) {
        uint256[] memory pending = new uint256[](requestCounter);
        uint256 pendingCount = 0;
        
        for (uint256 i = 0; i < requestCounter; i++) {
            if (!tokenRequests[i].approved && !tokenRequests[i].deployed) {
                pending[pendingCount] = i;
                pendingCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](pendingCount);
        for (uint256 i = 0; i < pendingCount; i++) {
            result[i] = pending[i];
        }
        
        return result;
    }
    
    /**
     * @dev Onaylanmış token taleplerini döndür
     */
    function getApprovedTokenRequests() external view returns (uint256[] memory) {
        uint256[] memory approved = new uint256[](requestCounter);
        uint256 approvedCount = 0;
        
        for (uint256 i = 0; i < requestCounter; i++) {
            if (tokenRequests[i].approved && !tokenRequests[i].deployed) {
                approved[approvedCount] = i;
                approvedCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](approvedCount);
        for (uint256 i = 0; i < approvedCount; i++) {
            result[i] = approved[i];
        }
        
        return result;
    }
    
    /**
     * @dev Pending artists listesinden sanatçıyı kaldır
     */
    function _removeFromPendingArtists(address artist) private {
        for (uint256 i = 0; i < pendingArtists.length; i++) {
            if (pendingArtists[i] == artist) {
                pendingArtists[i] = pendingArtists[pendingArtists.length - 1];
                pendingArtists.pop();
                break;
            }
        }
    }
}
