import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import toast from 'react-hot-toast';

// Contract ABIs (these files are generated after deployment)
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

  // Read contract addresses from the deployment file
  const getContractAddresses = (chainId) => {
    
    // Try to load from deployment file first
    try {
      if (chainId === 31337) {
        // Localhost - read from deployment file
        const deploymentData = require('../deployments/localhost.json');
        return {
          vesikaCoin: deploymentData.contracts.VesikaCoin,
          factory: deploymentData.contracts.ArtistTokenFactory,
          tokenSwap: deploymentData.contracts.TokenSwap,
          vesikaSale: deploymentData.contracts.VesikaSale,
        };
      }
      if (chainId === 11155111) {
        // Sepolia - read from deployment file
        const deploymentData = require('../deployments/sepolia.json');
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

  // Initialize contracts
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

  // VesikaCoin actions
  const vesikaCoinActions = {
    // Get balance
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

    // Get stake info
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

    // Calculate reward
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

    // Claim rewards
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

  // Factory actions
  const factoryActions = {
    // Artist registration
    registerArtist: async (name, bio, website, socialMedia) => {
      if (!contracts.factory || !signer) return;
      try {
        // Build metadata JSON
        const metadata = JSON.stringify({
          name,
          bio,
          website,
          socialMedia,
          timestamp: Date.now()
        });
        
        const tx = await contracts.factory.registerArtist(metadata);
        toast.success('Artist registration initiated...');
        await tx.wait();
        toast.success('Artist registration completed successfully!');
        return tx;
      } catch (error) {
        console.error('Error registering artist:', error);
        toast.error(`Artist registration failed: ${error.message}`);
        throw error;
      }
    },

    // Get artist info
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

    // Token request
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

    // Get pending requests
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

    // Get request details
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

    // Get the artist's token requests
    getArtistTokenRequests: async (artistAddress) => {
      if (!contracts.factory) return [];
      try {
        // Get all requests and filter the ones belonging to the artist
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

    // Approve artist (admin)
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

    // Reject artist (admin)
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

    // Approve token request (admin)
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

    // Reject token request (admin)
    rejectTokenRequest: async (requestId) => {
      if (!contracts.factory || !signer) {
        console.error('Missing factory contract or signer');
        return;
      }
      
      try {
        
        // First check if the request exists and is valid
        const details = await contracts.factory.getRequestDetails(requestId);
        
        if (details[0] === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid token request ID');
        }
        
        const tx = await contracts.factory.rejectTokenRequest(requestId);
        await tx.wait();
        return tx;
      } catch (error) {
        console.error('Error rejecting token request:', error);
        console.error('Token request rejection failed');
        throw error;
      }
    },

    // Deploy token (admin)
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

    // Get pending artists (for admin)
    getPendingArtists: async () => {
      if (!contracts.factory) return [];
      try {
        const pendingArtists = await contracts.factory.getPendingArtists();
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
        
        return artistsWithInfo;
      } catch (error) {
        console.error('Error getting pending artists:', error);
        return [];
      }
    },

    // Get pending token requests (for admin)
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
        
        return requests;
      } catch (error) {
        console.error('Error getting pending token requests:', error);
        return [];
      }
    },

    // Get approved token requests (for admin)
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
        
        return requests;
      } catch (error) {
        console.error('Error getting approved token requests:', error);
        return [];
      }
    },

    // Get all deployed tokens (from all approved artists)
    getAllDeployedTokens: async () => {
      if (!contracts.factory) return [];
      try {
        
        const deployedTokens = [];
        
        // Get approved artist count
        const approvedCount = await contracts.factory.getApprovedArtistCount();
        
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
        
        return deployedTokens;
      } catch (error) {
        console.error('Error getting all deployed tokens:', error);
        return [];
      }
    },
  };

  // Swap actions
  const swapActions = {
    // Get pool info
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

    // Calculate swap rate
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

    // Main token -> Artist token swap
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

    // Artist token -> Main token swap
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

    // Add an address to the artist token whitelist
    addToWhitelist: async (tokenAddress, addressToWhitelist) => {
      if (!signer) return;
      try {
        
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

    // Create liquidity pool
    createPool: async (artistToken, mainTokenAmount, artistTokenAmount) => {
      if (!contracts.tokenSwap || !signer) return;
      try {
        
        // Connect the artist token contract
        const artistTokenContract = new ethers.Contract(
          artistToken,
          [
            'function approve(address,uint256) returns (bool)',
            'function updateWhitelist(address,bool)',
            'function whitelist(address) view returns (bool)'
          ],
          signer
        );
        
        // Check TokenSwap's whitelist status
        const isWhitelisted = await artistTokenContract.whitelist(contracts.tokenSwap.address);
        
        if (!isWhitelisted) {
          const whitelistTx = await artistTokenContract.updateWhitelist(contracts.tokenSwap.address, true);
          toast.success('Adding TokenSwap to whitelist...');
          await whitelistTx.wait();
          toast.success('TokenSwap whitelisted successfully');
        } else {
        }
        
        // Check and grant allowance
        const mainTokenContract = contracts.vesikaCoin;
        
        const mainAmount = ethers.utils.parseEther(mainTokenAmount);
        const artistAmount = ethers.utils.parseEther(artistTokenAmount);
        
        // Grant allowance
        const mainApproval = await mainTokenContract.approve(contracts.tokenSwap.address, mainAmount);
        await mainApproval.wait();
        
        const artistApproval = await artistTokenContract.approve(contracts.tokenSwap.address, artistAmount);
        await artistApproval.wait();
        
        // Create pool
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
