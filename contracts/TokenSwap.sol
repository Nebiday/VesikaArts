// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ArtistToken.sol";
import "./ArtistTokenFactory.sol";

/**
 * @title TokenSwap
 * @dev Ana token ile sanatçı token'ları arasında swap protokolü
 */
contract TokenSwap is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant LIQUIDITY_MANAGER_ROLE = keccak256("LIQUIDITY_MANAGER_ROLE");

    IERC20 public immutable mainToken;
    ArtistTokenFactory public immutable factory;
    
    uint256 public constant FEE_DENOMINATOR = 10000; // 0.01% = 1
    uint256 public swapFee = 30; // 0.3%
    
    struct LiquidityPool {
        uint256 mainTokenReserve;
        uint256 artistTokenReserve;
        uint256 totalLiquidity;
        bool isActive;
        mapping(address => uint256) liquidityShares;
    }
    
    mapping(address => LiquidityPool) public pools;
    mapping(address => bool) public supportedTokens;
    
    address[] public allPools;
    
    event PoolCreated(address indexed artistToken, uint256 mainTokenAmount, uint256 artistTokenAmount);
    event LiquidityAdded(address indexed provider, address indexed artistToken, uint256 mainTokenAmount, uint256 artistTokenAmount);
    event LiquidityRemoved(address indexed provider, address indexed artistToken, uint256 mainTokenAmount, uint256 artistTokenAmount);
    event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event SwapFeeUpdated(uint256 newFee);

    constructor(address _mainToken, address _factory) {
        mainToken = IERC20(_mainToken);
        factory = ArtistTokenFactory(_factory);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(LIQUIDITY_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Yeni likidite havuzu oluştur
     */
    function createPool(
        address artistToken,
        uint256 mainTokenAmount,
        uint256 artistTokenAmount
    ) external onlyRole(LIQUIDITY_MANAGER_ROLE) nonReentrant {
        require(factory.isDeployedToken(artistToken), "Token not deployed by factory");
        require(!supportedTokens[artistToken], "Pool already exists");
        require(mainTokenAmount > 0 && artistTokenAmount > 0, "Invalid amounts");
        
        // Token'ları transfer et
        mainToken.safeTransferFrom(msg.sender, address(this), mainTokenAmount);
        IERC20(artistToken).safeTransferFrom(msg.sender, address(this), artistTokenAmount);
        
        // Pool'u oluştur
        LiquidityPool storage pool = pools[artistToken];
        pool.mainTokenReserve = mainTokenAmount;
        pool.artistTokenReserve = artistTokenAmount;
        pool.totalLiquidity = sqrt(mainTokenAmount * artistTokenAmount);
        pool.isActive = true;
        pool.liquidityShares[msg.sender] = pool.totalLiquidity;
        
        supportedTokens[artistToken] = true;
        allPools.push(artistToken);
        
        emit PoolCreated(artistToken, mainTokenAmount, artistTokenAmount);
    }

    /**
     * @dev Likidite ekle
     */
    function addLiquidity(
        address artistToken,
        uint256 mainTokenAmount,
        uint256 artistTokenAmount,
        uint256 minMainToken,
        uint256 minArtistToken
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[artistToken], "Pool does not exist");
        
        LiquidityPool storage pool = pools[artistToken];
        require(pool.isActive, "Pool is not active");
        
        // Optimal oranları hesapla
        uint256 optimalMainToken = (artistTokenAmount * pool.mainTokenReserve) / pool.artistTokenReserve;
        uint256 optimalArtistToken = (mainTokenAmount * pool.artistTokenReserve) / pool.mainTokenReserve;
        
        uint256 finalMainToken;
        uint256 finalArtistToken;
        
        if (optimalMainToken <= mainTokenAmount) {
            finalMainToken = optimalMainToken;
            finalArtistToken = artistTokenAmount;
        } else {
            finalMainToken = mainTokenAmount;
            finalArtistToken = optimalArtistToken;
        }
        
        require(finalMainToken >= minMainToken, "Insufficient main token amount");
        require(finalArtistToken >= minArtistToken, "Insufficient artist token amount");
        
        // Likidite payını hesapla
        uint256 liquidityMinted = (finalMainToken * pool.totalLiquidity) / pool.mainTokenReserve;
        
        // Token'ları transfer et
        mainToken.safeTransferFrom(msg.sender, address(this), finalMainToken);
        IERC20(artistToken).safeTransferFrom(msg.sender, address(this), finalArtistToken);
        
        // Pool'u güncelle
        pool.mainTokenReserve += finalMainToken;
        pool.artistTokenReserve += finalArtistToken;
        pool.totalLiquidity += liquidityMinted;
        pool.liquidityShares[msg.sender] += liquidityMinted;
        
        emit LiquidityAdded(msg.sender, artistToken, finalMainToken, finalArtistToken);
    }

    /**
     * @dev Likidite çıkar
     */
    function removeLiquidity(
        address artistToken,
        uint256 liquidityAmount,
        uint256 minMainToken,
        uint256 minArtistToken
    ) external nonReentrant {
        require(supportedTokens[artistToken], "Pool does not exist");
        
        LiquidityPool storage pool = pools[artistToken];
        require(pool.liquidityShares[msg.sender] >= liquidityAmount, "Insufficient liquidity");
        
        // Çıkarılacak token miktarlarını hesapla
        uint256 mainTokenAmount = (liquidityAmount * pool.mainTokenReserve) / pool.totalLiquidity;
        uint256 artistTokenAmount = (liquidityAmount * pool.artistTokenReserve) / pool.totalLiquidity;
        
        require(mainTokenAmount >= minMainToken, "Insufficient main token amount");
        require(artistTokenAmount >= minArtistToken, "Insufficient artist token amount");
        
        // Pool'u güncelle
        pool.mainTokenReserve -= mainTokenAmount;
        pool.artistTokenReserve -= artistTokenAmount;
        pool.totalLiquidity -= liquidityAmount;
        pool.liquidityShares[msg.sender] -= liquidityAmount;
        
        // Token'ları transfer et
        mainToken.safeTransfer(msg.sender, mainTokenAmount);
        IERC20(artistToken).safeTransfer(msg.sender, artistTokenAmount);
        
        emit LiquidityRemoved(msg.sender, artistToken, mainTokenAmount, artistTokenAmount);
    }

    /**
     * @dev Ana token -> Sanatçı token swap
     */
    function swapMainToArtist(
        address artistToken,
        uint256 mainTokenAmount,
        uint256 minArtistTokenOut
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[artistToken], "Pool does not exist");
        require(mainTokenAmount > 0, "Invalid amount");
        
        LiquidityPool storage pool = pools[artistToken];
        require(pool.isActive, "Pool is not active");
        
        // Çıktı miktarını hesapla (AMM formülü: x * y = k)
        uint256 artistTokenOut = getAmountOut(mainTokenAmount, pool.mainTokenReserve, pool.artistTokenReserve);
        require(artistTokenOut >= minArtistTokenOut, "Insufficient output amount");
        
        // Fee hesapla
        uint256 fee = (mainTokenAmount * swapFee) / FEE_DENOMINATOR;
        uint256 mainTokenAmountAfterFee = mainTokenAmount - fee;
        
        // Token'ları transfer et
        mainToken.safeTransferFrom(msg.sender, address(this), mainTokenAmount);
        IERC20(artistToken).safeTransfer(msg.sender, artistTokenOut);
        
        // Pool'u güncelle
        pool.mainTokenReserve += mainTokenAmountAfterFee;
        pool.artistTokenReserve -= artistTokenOut;
        
        emit SwapExecuted(msg.sender, address(mainToken), artistToken, mainTokenAmount, artistTokenOut);
    }

    /**
     * @dev Sanatçı token -> Ana token swap
     */
    function swapArtistToMain(
        address artistToken,
        uint256 artistTokenAmount,
        uint256 minMainTokenOut
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[artistToken], "Pool does not exist");
        require(artistTokenAmount > 0, "Invalid amount");
        
        LiquidityPool storage pool = pools[artistToken];
        require(pool.isActive, "Pool is not active");
        
        // Çıktı miktarını hesapla
        uint256 mainTokenOut = getAmountOut(artistTokenAmount, pool.artistTokenReserve, pool.mainTokenReserve);
        require(mainTokenOut >= minMainTokenOut, "Insufficient output amount");
        
        // Fee hesapla
        uint256 fee = (artistTokenAmount * swapFee) / FEE_DENOMINATOR;
        uint256 artistTokenAmountAfterFee = artistTokenAmount - fee;
        
        // Token'ları transfer et
        IERC20(artistToken).safeTransferFrom(msg.sender, address(this), artistTokenAmount);
        mainToken.safeTransfer(msg.sender, mainTokenOut);
        
        // Pool'u güncelle
        pool.artistTokenReserve += artistTokenAmountAfterFee;
        pool.mainTokenReserve -= mainTokenOut;
        
        emit SwapExecuted(msg.sender, artistToken, address(mainToken), artistTokenAmount, mainTokenOut);
    }

    /**
     * @dev Çıktı miktarını hesapla (AMM formülü)
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        
        return numerator / denominator;
    }

    /**
     * @dev Girdi miktarını hesapla
     */
    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountOut > 0, "Invalid output amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        uint256 numerator = reserveIn * amountOut;
        uint256 denominator = reserveOut - amountOut;
        
        return (numerator / denominator) + 1;
    }

    /**
     * @dev Pool bilgilerini al
     */
    function getPoolInfo(address artistToken) external view returns (
        uint256 mainTokenReserve,
        uint256 artistTokenReserve,
        uint256 totalLiquidity,
        bool isActive
    ) {
        LiquidityPool storage pool = pools[artistToken];
        return (
            pool.mainTokenReserve,
            pool.artistTokenReserve,
            pool.totalLiquidity,
            pool.isActive
        );
    }

    /**
     * @dev Kullanıcının likidite payını al
     */
    function getLiquidityShare(address artistToken, address user) external view returns (uint256) {
        return pools[artistToken].liquidityShares[user];
    }

    /**
     * @dev Tüm pool'ları al
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }

    /**
     * @dev Swap fee'sini güncelle
     */
    function updateSwapFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 1000, "Fee too high"); // Max %10
        swapFee = newFee;
        emit SwapFeeUpdated(newFee);
    }

    /**
     * @dev Pool'u aktif/pasif yap
     */
    function togglePool(address artistToken) external onlyRole(ADMIN_ROLE) {
        require(supportedTokens[artistToken], "Pool does not exist");
        pools[artistToken].isActive = !pools[artistToken].isActive;
    }

    /**
     * @dev Karekök hesaplama (Babylonian method)
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
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
}
