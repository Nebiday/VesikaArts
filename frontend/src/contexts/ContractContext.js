import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import toast from 'react-hot-toast';

// Contract ABIs (Bu dosyalar deployment sonrası oluşturulacak)
import VesikaCoinABI from '../abis/VesikaCoin.json';
import ArtistTokenFactoryABI from '../abis/ArtistTokenFactory.json';
import TokenSwapABI from '../abis/TokenSwap.json';
import VesikaSaleABI from '../abis/VesikaSale.json';

const ContractContext = createContext();

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { provider, signer, chainId, account } = useWeb3();
  
  const [contracts, setContracts] = useState({
    vesikaCoin: null,
    factory: null,
    tokenSwap: null,
    vesikaSale: null,
  });
  
  const [contractAddresses, setContractAddresses] = useState({
    vesikaCoin: '',
    factory: '',
    tokenSwap: '',
    vesikaSale: '',
  });

  const [loading, setLoading] = useState(false);

  // Contract adreslerini deployment dosyasından oku
  const getContractAddresses = (chainId) => {
    console.log('Loading contract addresses for chainId:', chainId);
    
    // Try to load from deployment file first
    try {
      if (chainId === 31337) {
        // Localhost - deployment dosyasından oku
        const deploymentData = require('../deployments/localhost.json');
        return {
          vesikaCoin: deploymentData.contracts.VesikaCoin,
          factory: deploymentData.contracts.ArtistTokenFactory,
          tokenSwap: deploymentData.contracts.TokenSwap,
          vesikaSale: deploymentData.contracts.VesikaSale,
        };
      }
    } catch (error) {
      console.warn('Could not load deployment file, falling back to env variables:', error.message);
    }
    
    // Fallback to environment variables
    const addresses = {
      31337: { // Localhost
        vesikaCoin: process.env.REACT_APP_VESIKA_COIN_ADDRESS || '',
        factory: process.env.REACT_APP_FACTORY_ADDRESS || '',
        tokenSwap: process.env.REACT_APP_TOKEN_SWAP_ADDRESS || '',
        vesikaSale: process.env.REACT_APP_VESIKA_SALE_ADDRESS || '',
      },
      11155111: { // Sepolia
        vesikaCoin: process.env.REACT_APP_SEPOLIA_VESIKA_COIN_ADDRESS || '',
        factory: process.env.REACT_APP_SEPOLIA_FACTORY_ADDRESS || '',
        tokenSwap: process.env.REACT_APP_SEPOLIA_TOKEN_SWAP_ADDRESS || '',
        vesikaSale: process.env.REACT_APP_SEPOLIA_VESIKA_SALE_ADDRESS || '',
      },
    };
    return addresses[chainId] || addresses[31337];
  };

  // Contract'ları başlat
  const initializeContracts = async () => {
    if (!provider || !chainId) return;

    setLoading(true);
    try {
      const addresses = getContractAddresses(chainId);
      setContractAddresses(addresses);

      const vesikaCoin = new ethers.Contract(
        addresses.vesikaCoin,
        VesikaCoinABI,
        signer || provider
      );

      const factory = new ethers.Contract(
        addresses.factory,
        ArtistTokenFactoryABI,
        signer || provider
      );

      const tokenSwap = new ethers.Contract(
        addresses.tokenSwap,
        TokenSwapABI,
        signer || provider
      );

      const vesikaSale = new ethers.Contract(
        addresses.vesikaSale,
        VesikaSaleABI,
        signer || provider
      );

      setContracts({
        vesikaCoin,
        factory,
        tokenSwap,
        vesikaSale,
      });

    } catch (error) {
      console.error('Error initializing contracts:', error);
      toast.error('Failed to initialize contracts');
    } finally {
      setLoading(false);
    }
  };

  // VesikaCoin işlemleri
  const vesikaCoinActions = {
    // Balance al
    getBalance: async (address) => {
      if (!contracts.vesikaCoin) return '0';
      try {
        const balance = await contracts.vesikaCoin.balanceOf(address);
        return ethers.utils.formatEther(balance);
      } catch (error) {
        console.error('Error getting balance:', error);
        return '0';
      }
    },

    // Transfer
    transfer: async (to, amount) => {
      if (!contracts.vesikaCoin || !signer) return;
      try {
        const tx = await contracts.vesikaCoin.transfer(
          to,
          ethers.utils.parseEther(amount)
        );
        toast.success('Transfer initiated');
        await tx.wait();
        toast.success('Transfer completed');
        return tx;
      } catch (error) {
        console.error('Error transferring:', error);
        toast.error('Transfer failed');
        throw error;
      }
    },

    // Stake
    stake: async (amount, lockPeriod) => {
      if (!contracts.vesikaCoin || !signer) return;
      try {
        const tx = await contracts.vesikaCoin.stake(
          ethers.utils.parseEther(amount),
          lockPeriod
        );
        toast.success('Staking initiated');
        await tx.wait();
        toast.success('Staking completed');
        return tx;
      } catch (error) {
        console.error('Error staking:', error);
        toast.error('Staking failed');
        throw error;
      }
    },

    // Unstake
    unstake: async () => {
      if (!contracts.vesikaCoin || !signer) return;
      try {
        const tx = await contracts.vesikaCoin.unstake();
        toast.success('Unstaking initiated');
        await tx.wait();
        toast.success('Unstaking completed');
        return tx;
      } catch (error) {
        console.error('Error unstaking:', error);
        toast.error('Unstaking failed');
        throw error;
      }
    },

    // Stake bilgilerini al
    getStakeInfo: async (address) => {
      if (!contracts.vesikaCoin) return null;
      try {
        const stakeInfo = await contracts.vesikaCoin.stakes(address);
        return {
          amount: ethers.utils.formatEther(stakeInfo.amount),
          timestamp: stakeInfo.timestamp.toNumber(),
          lockPeriod: stakeInfo.lockPeriod.toNumber(),
          isActive: stakeInfo.isActive,
        };
      } catch (error) {
        console.error('Error getting stake info:', error);
        return null;
      }
    },

    // Ödül hesapla
    calculateReward: async (address) => {
      if (!contracts.vesikaCoin) return '0';
      try {
        const reward = await contracts.vesikaCoin.calculateReward(address);
        return ethers.utils.formatEther(reward);
      } catch (error) {
        console.error('Error calculating reward:', error);
        return '0';
      }
    },

    // Ödül talep et
    claimRewards: async () => {
      if (!contracts.vesikaCoin || !signer) return;
      try {
        const tx = await contracts.vesikaCoin.claimRewards();
        toast.success('Claiming rewards');
        await tx.wait();
        toast.success('Rewards claimed');
        return tx;
      } catch (error) {
        console.error('Error claiming rewards:', error);
        toast.error('Failed to claim rewards');
        throw error;
      }
    },
  };

  // Factory işlemleri
  const factoryActions = {
    // Sanatçı kaydı
    registerArtist: async (name, bio, website, socialMedia) => {
      if (!contracts.factory || !signer) return;
      try {
        // Metadata JSON oluştur
        const metadata = JSON.stringify({
          name,
          bio,
          website,
          socialMedia,
          timestamp: Date.now()
        });
        
        const tx = await contracts.factory.registerArtist(metadata);
        toast.success('Sanatçı kaydı başlatıldı...');
        await tx.wait();
        toast.success('Sanatçı kaydı başarıyla tamamlandı!');
        return tx;
      } catch (error) {
        console.error('Error registering artist:', error);
        toast.error(`Sanatçı kaydı başarısız: ${error.message}`);
        throw error;
      }
    },

    // Sanatçı bilgilerini al
    getArtistInfo: async (address) => {
      if (!contracts.factory) return null;
      try {
        const info = await contracts.factory.getArtistInfo(address);
        return {
          isRegistered: info.isRegistered,
          isApproved: info.isApproved,
          tokenCount: info.tokenCount.toNumber(),
          profileMetadata: info.profileMetadata,
        };
      } catch (error) {
        console.error('Error getting artist info:', error);
        return null;
      }
    },

    // Token talebi
    requestToken: async (name, symbol, maxSupply, initialSwapRate, description, metadata) => {
      if (!contracts.factory || !signer) return;
      try {
        const tx = await contracts.factory.requestToken(
          name,
          symbol,
          ethers.utils.parseEther(maxSupply),
          ethers.utils.parseEther(initialSwapRate),
          description,
          metadata
        );
        toast.success('Token request initiated');
        await tx.wait();
        toast.success('Token request submitted');
        return tx;
      } catch (error) {
        console.error('Error requesting token:', error);
        toast.error('Token request failed');
        throw error;
      }
    },

    // Bekleyen talepleri al
    getPendingRequests: async () => {
      if (!contracts.factory) return [];
      try {
        const requests = await contracts.factory.getPendingRequests();
        return requests.map(id => id.toNumber());
      } catch (error) {
        console.error('Error getting pending requests:', error);
        return [];
      }
    },

    // Talep detaylarını al
    getRequestDetails: async (requestId) => {
      if (!contracts.factory) return null;
      try {
        const details = await contracts.factory.getRequestDetails(requestId);
        return {
          artist: details.artist,
          name: details.name,
          symbol: details.symbol,
          maxSupply: ethers.utils.formatEther(details.maxSupply),
          initialSwapRate: ethers.utils.formatEther(details.initialSwapRate),
          description: details.description,
          metadata: details.metadata,
          timestamp: details.timestamp.toNumber(),
          approved: details.approved,
          deployed: details.deployed,
          tokenAddress: details.tokenAddress,
        };
      } catch (error) {
        console.error('Error getting request details:', error);
        return null;
      }
    },

    // Sanatçının token taleplerini al
    getArtistTokenRequests: async (artistAddress) => {
      if (!contracts.factory) return [];
      try {
        // Tüm talepleri al ve sanatçıya ait olanları filtrele
        const requestCounter = await contracts.factory.requestCounter();
        const requests = [];
        
        for (let i = 0; i < requestCounter.toNumber(); i++) {
          try {
            const request = await contracts.factory.tokenRequests(i);
            if (request.artist.toLowerCase() === artistAddress.toLowerCase() && request.artist !== '0x0000000000000000000000000000000000000000') {
              requests.push({
                id: i,
                artist: request.artist,
                name: request.name,
                symbol: request.symbol,
                maxSupply: ethers.utils.formatEther(request.maxSupply),
                initialSwapRate: ethers.utils.formatEther(request.initialSwapRate),
                description: request.description,
                metadata: request.metadata,
                timestamp: request.timestamp.toNumber(),
                approved: request.approved,
                deployed: request.deployed,
                tokenAddress: request.tokenAddress,
                status: request.approved ? (request.deployed ? 2 : 1) : 0 // 0: pending, 1: approved, 2: deployed
              });
            }
          } catch (error) {
            // Skip invalid requests
            continue;
          }
        }
        
        return requests;
      } catch (error) {
        console.error('Error getting artist token requests:', error);
        return [];
      }
    },

    // Sanatçıyı onayla (admin)
    approveArtist: async (artistAddress) => {
      if (!contracts.factory || !signer) return;
      try {
        const tx = await contracts.factory.approveArtist(artistAddress);
        toast.success('Artist approval initiated');
        await tx.wait();
        toast.success('Artist approved');
        return tx;
      } catch (error) {
        console.error('Error approving artist:', error);
        toast.error('Artist approval failed');
        throw error;
      }
    },

    // Sanatçıyı reddet (admin)
    rejectArtist: async (artistAddress) => {
      if (!contracts.factory || !signer) return;
      try {
        const tx = await contracts.factory.rejectArtist(artistAddress);
        toast.success('Artist rejection initiated');
        await tx.wait();
        toast.success('Artist rejected');
        return tx;
      } catch (error) {
        console.error('Error rejecting artist:', error);
        toast.error('Artist rejection failed');
        throw error;
      }
    },

    // Token talebini onayla (admin)
    approveTokenRequest: async (requestId) => {
      if (!contracts.factory || !signer) return;
      try {
        const tx = await contracts.factory.approveTokenRequest(requestId);
        toast.success('Token request approval initiated');
        await tx.wait();
        toast.success('Token request approved');
        return tx;
      } catch (error) {
        console.error('Error approving token request:', error);
        toast.error('Token request approval failed');
        throw error;
      }
    },

    // Token talebini reddet (admin)
    rejectTokenRequest: async (requestId) => {
      if (!contracts.factory || !signer) {
        console.error('Missing factory contract or signer');
        return;
      }
      
      try {
        console.log('🔴 Attempting to reject token request:', requestId);
        console.log('🔴 Factory contract address:', contracts.factory.address);
        console.log('🔴 Signer address:', await signer.getAddress());
        
        // First check if the request exists and is valid
        const details = await contracts.factory.getRequestDetails(requestId);
        console.log('🔴 Token request details:', details);
        
        if (details[0] === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid token request ID');
        }
        
        const tx = await contracts.factory.rejectTokenRequest(requestId);
        console.log('Token request rejection initiated');
        await tx.wait();
        console.log('Token request rejected');
        return tx;
      } catch (error) {
        console.error('Error rejecting token request:', error);
        console.error('Token request rejection failed');
        throw error;
      }
    },

    // Token deploy et (admin)
    deployToken: async (requestId) => {
      if (!contracts.factory || !signer) return;
      try {
        const tx = await contracts.factory.deployToken(requestId);
        toast.success('Token deployment initiated');
        await tx.wait();
        toast.success('Token deployed successfully');
        return tx;
      } catch (error) {
        console.error('Error deploying token:', error);
        toast.error('Token deployment failed');
        throw error;
      }
    },

    // Admin için bekleyen sanatçıları al
    getPendingArtists: async () => {
      console.log('getPendingArtists called, factory:', !!contracts.factory);
      if (!contracts.factory) return [];
      try {
        console.log('Calling factory.getPendingArtists()...');
        const pendingArtists = await contracts.factory.getPendingArtists();
        console.log('Raw pending artists from contract:', pendingArtists);
        const artistsWithInfo = [];
        
        for (const artistAddress of pendingArtists) {
          const info = await contracts.factory.getArtistInfo(artistAddress);
          if (info.profileMetadata) {
            try {
              const metadata = JSON.parse(info.profileMetadata);
              artistsWithInfo.push({
                address: artistAddress,
                name: metadata.name || 'Unknown',
                bio: metadata.bio || '',
                website: metadata.website || '',
                socialMedia: typeof metadata.socialMedia === 'object' ? metadata.socialMedia : {},
                timestamp: metadata.timestamp || 0
              });
            } catch (e) {
              artistsWithInfo.push({
                address: artistAddress,
                name: 'Unknown',
                bio: '',
                website: '',
                socialMedia: {},
                timestamp: 0
              });
            }
          }
        }
        
        console.log('Processed artists with info:', artistsWithInfo);
        return artistsWithInfo;
      } catch (error) {
        console.error('Error getting pending artists:', error);
        return [];
      }
    },

    // Admin için bekleyen token taleplerini al
    getPendingTokenRequests: async () => {
      if (!contracts.factory) return [];
      try {
        const pendingRequestIds = await contracts.factory.getPendingTokenRequests();
        const requests = [];
        
        for (const requestId of pendingRequestIds) {
          const details = await contracts.factory.getRequestDetails(requestId.toNumber());
          // Contract returns: (artist, name, symbol, maxSupply, initialSwapRate, description, metadata, timestamp, approved, deployed, tokenAddress)
          
          // Filter out invalid/empty tokens
          if (details[0] === '0x0000000000000000000000000000000000000000' || !details[1]) {
            console.log('🟡 Skipping invalid token request:', requestId.toNumber());
            continue;
          }
          
          requests.push({
            id: requestId.toNumber(),
            artist: details[0],
            name: details[1],
            symbol: details[2],
            maxSupply: ethers.utils.formatEther(details[3]),
            initialSwapRate: ethers.utils.formatEther(details[4]),
            description: details[5],
            metadata: details[6],
            timestamp: details[7].toNumber() * 1000, // Convert to milliseconds
            approved: details[8],
            deployed: details[9],
            tokenAddress: details[10]
          });
        }
        
        console.log('Parsed pending token requests:', requests);
        return requests;
      } catch (error) {
        console.error('Error getting pending token requests:', error);
        return [];
      }
    },

    // Admin için onaylanmış token taleplerini al
    getApprovedTokenRequests: async () => {
      if (!contracts.factory) return [];
      try {
        const approvedRequestIds = await contracts.factory.getApprovedTokenRequests();
        const requests = [];
        
        for (const requestId of approvedRequestIds) {
          const details = await contracts.factory.getRequestDetails(requestId.toNumber());
          // Contract returns: (artist, name, symbol, maxSupply, initialSwapRate, description, metadata, timestamp, approved, deployed, tokenAddress)
          requests.push({
            id: requestId.toNumber(),
            artist: details[0],
            name: details[1],
            symbol: details[2],
            maxSupply: ethers.utils.formatEther(details[3]),
            initialSwapRate: ethers.utils.formatEther(details[4]),
            description: details[5],
            metadata: details[6],
            timestamp: details[7].toNumber() * 1000, // Convert to milliseconds
            approved: details[8],
            deployed: details[9],
            tokenAddress: details[10]
          });
        }
        
        console.log('Parsed approved token requests:', requests);
        return requests;
      } catch (error) {
        console.error('Error getting approved token requests:', error);
        return [];
      }
    },

    // Deploy edilmiş tüm tokenları al (tüm onaylanmış sanatçılardan)
    getAllDeployedTokens: async () => {
      if (!contracts.factory) return [];
      try {
        console.log('Getting all deployed tokens from all artists...');
        
        const deployedTokens = [];
        
        // Get approved artist count
        const approvedCount = await contracts.factory.getApprovedArtistCount();
        console.log('Approved artist count:', approvedCount.toString());
        
        // Get all approved artists and their tokens
        for (let i = 0; i < approvedCount.toNumber(); i++) {
          try {
            // This might not exist, we'll need to check contract for how to get approved artists
            // For now, let's check the known artist
            const artistAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
            const artistTokens = await contracts.factory.getArtistTokens(artistAddress);
            
            for (const tokenAddress of artistTokens) {
              if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
                // Get token details
                const tokenContract = new ethers.Contract(
                  tokenAddress,
                  ['function name() view returns (string)', 'function symbol() view returns (string)', 'function totalSupply() view returns (uint256)'],
                  provider
                );
                
                try {
                  const name = await tokenContract.name();
                  const symbol = await tokenContract.symbol();
                  const totalSupply = await tokenContract.totalSupply();
                  
                  deployedTokens.push({
                    address: tokenAddress,
                    name,
                    symbol,
                    totalSupply: ethers.utils.formatEther(totalSupply),
                    artist: artistAddress
                  });
                } catch (tokenError) {
                  console.error('Error getting token details:', tokenError);
                }
              }
            }
            break; // For now, just check the known artist
          } catch (error) {
            console.error('Error getting artist tokens:', error);
          }
        }
        
        console.log('All deployed tokens:', deployedTokens);
        return deployedTokens;
      } catch (error) {
        console.error('Error getting all deployed tokens:', error);
        return [];
      }
    },
  };

  // Swap işlemleri
  const swapActions = {
    // Pool bilgilerini al
    getPoolInfo: async (artistTokenAddress) => {
      if (!contracts.tokenSwap) return null;
      try {
        const info = await contracts.tokenSwap.getPoolInfo(artistTokenAddress);
        return {
          mainTokenReserve: ethers.utils.formatEther(info.mainTokenReserve),
          artistTokenReserve: ethers.utils.formatEther(info.artistTokenReserve),
          totalLiquidity: ethers.utils.formatEther(info.totalLiquidity),
          isActive: info.isActive,
        };
      } catch (error) {
        console.error('Error getting pool info:', error);
        return null;
      }
    },

    // Swap oranını hesapla
    getAmountOut: async (amountIn, reserveIn, reserveOut) => {
      if (!contracts.tokenSwap) return '0';
      try {
        const amountOut = await contracts.tokenSwap.getAmountOut(
          ethers.utils.parseEther(amountIn),
          ethers.utils.parseEther(reserveIn),
          ethers.utils.parseEther(reserveOut)
        );
        return ethers.utils.formatEther(amountOut);
      } catch (error) {
        console.error('Error calculating amount out:', error);
        return '0';
      }
    },

    // Ana token -> Sanatçı token swap
    swapMainToArtist: async (artistToken, mainTokenAmount, minArtistTokenOut) => {
      if (!contracts.tokenSwap || !signer) return;
      try {
        const tx = await contracts.tokenSwap.swapMainToArtist(
          artistToken,
          ethers.utils.parseEther(mainTokenAmount),
          ethers.utils.parseEther(minArtistTokenOut)
        );
        toast.success('Swap initiated');
        await tx.wait();
        toast.success('Swap completed');
        return tx;
      } catch (error) {
        console.error('Error swapping:', error);
        toast.error('Swap failed');
        throw error;
      }
    },

    // Sanatçı token -> Ana token swap
    swapArtistToMain: async (artistToken, artistTokenAmount, minMainTokenOut) => {
      if (!contracts.tokenSwap || !signer) return;
      try {
        const tx = await contracts.tokenSwap.swapArtistToMain(
          artistToken,
          ethers.utils.parseEther(artistTokenAmount),
          ethers.utils.parseEther(minMainTokenOut)
        );
        toast.success('Swap initiated');
        await tx.wait();
        toast.success('Swap completed');
        return tx;
      } catch (error) {
        console.error('Error swapping:', error);
        toast.error('Swap failed');
        throw error;
      }
    },

    // Artist token'ı whitelist'e ekle
    addToWhitelist: async (tokenAddress, addressToWhitelist) => {
      if (!signer) return;
      try {
        console.log('🟡 Adding to whitelist:', addressToWhitelist, 'for token:', tokenAddress);
        
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function updateWhitelist(address,bool) external'],
          signer
        );
        
        const tx = await tokenContract.updateWhitelist(addressToWhitelist, true);
        toast.success('Whitelist update initiated');
        await tx.wait();
        toast.success('Address added to whitelist successfully');
        return tx;
      } catch (error) {
        console.error('Error adding to whitelist:', error);
        toast.error('Whitelist update failed: ' + (error.message || 'Unknown error'));
        throw error;
      }
    },

    // Liquidity pool oluştur
    createPool: async (artistToken, mainTokenAmount, artistTokenAmount) => {
      if (!contracts.tokenSwap || !signer) return;
      try {
        console.log('🟡 Creating pool for:', artistToken);
        
        // Artist token kontratını bağla
        const artistTokenContract = new ethers.Contract(
          artistToken,
          [
            'function approve(address,uint256) returns (bool)',
            'function updateWhitelist(address,bool)',
            'function whitelist(address) view returns (bool)'
          ],
          signer
        );
        
        // TokenSwap'in whitelist durumunu kontrol et
        console.log('🟡 Checking TokenSwap whitelist status...');
        const isWhitelisted = await artistTokenContract.whitelist(contracts.tokenSwap.address);
        
        if (!isWhitelisted) {
          console.log('🟡 Adding TokenSwap to whitelist...');
          const whitelistTx = await artistTokenContract.updateWhitelist(contracts.tokenSwap.address, true);
          toast.success('Adding TokenSwap to whitelist...');
          await whitelistTx.wait();
          toast.success('TokenSwap whitelisted successfully');
        } else {
          console.log('✅ TokenSwap already whitelisted');
        }
        
        // Allowance kontrol et ve ver
        const mainTokenContract = contracts.vesikaCoin;
        
        const mainAmount = ethers.utils.parseEther(mainTokenAmount);
        const artistAmount = ethers.utils.parseEther(artistTokenAmount);
        
        // Allowance ver
        console.log('🟡 Approving main token...');
        const mainApproval = await mainTokenContract.approve(contracts.tokenSwap.address, mainAmount);
        await mainApproval.wait();
        
        console.log('🟡 Approving artist token...');
        const artistApproval = await artistTokenContract.approve(contracts.tokenSwap.address, artistAmount);
        await artistApproval.wait();
        
        // Pool oluştur
        console.log('🟡 Creating pool...');
        const tx = await contracts.tokenSwap.createPool(
          artistToken,
          mainAmount,
          artistAmount
        );
        
        toast.success('Pool creation initiated');
        await tx.wait();
        toast.success('Pool created successfully');
        return tx;
      } catch (error) {
        console.error('Error creating pool:', error);
        toast.error('Pool creation failed: ' + (error.message || 'Unknown error'));
        throw error;
      }
    },
  };

  useEffect(() => {
    initializeContracts();
  }, [provider, signer, chainId]);

  const value = {
    contracts,
    contractAddresses,
    loading,
    account,
    provider,
    signer,
    vesikaCoinActions,
    factoryActions,
    swapActions,
    initializeContracts,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
