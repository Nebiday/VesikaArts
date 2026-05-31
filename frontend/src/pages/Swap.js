import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SwapContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
`;

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SwapInterface = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TokenSelector = styled.div`
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
`;

const TokenHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TokenLabel = styled.span`
  font-weight: 600;
  color: #374151;
`;

const Balance = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const TokenInput = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AmountInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }
`;

const TokenSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.25rem;
  background: white;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
`;

const SwapButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 1rem 0;
  width: 100%;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SwapIcon = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const IconButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(180deg);
    background: #764ba2;
  }
`;

const Swap = () => {
  const { account, isConnected } = useWeb3();
  const { contracts, swapActions } = useContracts();
  
  const [availableTokens, setAvailableTokens] = useState([]);
  const [fromToken, setFromToken] = useState('VSK');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState({});

  const loadAvailableTokens = async () => {
    if (!contracts.factory) return;
    
    try {
      setTokensLoading(true);
      
      // Always include VSK as base token
      const tokens = [{
        symbol: 'VSK',
        name: 'VesikaCoin',
        address: contracts.vesikaCoin?.address || '',
        isBase: true
      }];
      
      // Get deployed tokens
      const requestCounter = await contracts.factory.requestCounter();
      
      for (let i = 0; i <= requestCounter.toNumber(); i++) {
        try {
          const details = await contracts.factory.getRequestDetails(i);
          const tokenData = {
            id: i,
            artist: details[0],
            name: details[1],
            symbol: details[2],
            maxSupply: ethers.utils.formatEther(details[3]),
            initialSwapRate: ethers.utils.formatEther(details[4]),
            description: details[5],
            metadata: details[6],
            timestamp: details[7].toNumber() * 1000,
            approved: details[8],
            deployed: details[9],
            tokenAddress: details[10]
          };
          
          if (tokenData.deployed && tokenData.tokenAddress && 
              tokenData.tokenAddress !== '0x0000000000000000000000000000000000000000') {
            tokens.push({
              symbol: tokenData.symbol,
              name: tokenData.name,
              address: tokenData.tokenAddress,
              initialSwapRate: details[4], // Keep as BigNumber for calculations
              isBase: false
            });
          }
        } catch (e) {
          console.error(`🔴 Error getting request ${i}:`, e);
        }
      }
      
      setAvailableTokens(tokens);
      
      // Set default toToken if not set and tokens available
      if (!toToken && tokens.length > 1) {
        const firstArtToken = tokens.find(t => !t.isBase);
        if (firstArtToken) {
          setToToken(firstArtToken.symbol);
        }
      }
      
    } catch (error) {
      console.error('🔴 Error loading tokens:', error);
    } finally {
      setTokensLoading(false);
    }
  };

  const loadTokenBalances = async () => {
    if (!account || availableTokens.length === 0) return;
    
    try {
      const balances = {};
      
      for (const token of availableTokens) {
        if (token.symbol === 'VSK') {
          // VSK balance
          if (contracts.vesikaCoin) {
            const balance = await contracts.vesikaCoin.balanceOf(account);
            balances[token.symbol] = ethers.utils.formatEther(balance);
          }
        } else {
          // Artist token balance
          if (token.address && token.address !== '') {
            try {
              const tokenContract = new ethers.Contract(
                token.address,
                [
                  'function balanceOf(address) view returns (uint256)',
                  'function decimals() view returns (uint8)'
                ],
                contracts.vesikaCoin.provider
              );
              const balance = await tokenContract.balanceOf(account);
              balances[token.symbol] = ethers.utils.formatEther(balance);
            } catch (error) {
              console.error(`Error loading balance for ${token.symbol}:`, error);
              balances[token.symbol] = '0';
            }
          }
        }
      }
      
      setTokenBalances(balances);
    } catch (error) {
      console.error('🔴 Error loading balances:', error);
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (fromToken === toToken) {
      toast.error('Cannot select the same token');
      return;
    }

    if (!contracts.tokenSwap) {
      toast.error('Swap contract not found');
      return;
    }

    console.log('🟡 Starting swap:', {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      availableTokens: availableTokens.length,
      swapActions: !!swapActions,
      tokenSwap: !!contracts.tokenSwap
    });

    setLoading(true);
    try {
      const fromTokenData = availableTokens.find(t => t.symbol === fromToken);
      const toTokenData = availableTokens.find(t => t.symbol === toToken);
      
      
      if (!fromTokenData || !toTokenData) {
        toast.error('Token information not found');
        return;
      }

      // VSK -> Artist Token swap
      if (fromToken === 'VSK' && toToken !== 'VSK') {
        
        // Approve VSK tokens first
        const amountToApprove = ethers.utils.parseEther(fromAmount);
        const approveTx = await contracts.vesikaCoin.approve(contracts.tokenSwap.address, amountToApprove);
        await approveTx.wait();
        
        const minOut = (parseFloat(toAmount) * 0.90).toString(); // 10% slippage tolerance
        
        await swapActions.swapMainToArtist(
          toTokenData.address,
          fromAmount,
          minOut
        );
      }
      // Artist Token -> VSK swap  
      else if (fromToken !== 'VSK' && toToken === 'VSK') {
        
        // Approve Artist tokens first
        const artistTokenContract = new ethers.Contract(
          fromTokenData.address,
          contracts.vesikaCoin.interface, // Use same interface as it's ERC20
          contracts.vesikaCoin.signer
        );
        const amountToApprove = ethers.utils.parseEther(fromAmount);
        const approveTx = await artistTokenContract.approve(contracts.tokenSwap.address, amountToApprove);
        await approveTx.wait();
        
        const minOut = (parseFloat(toAmount) * 0.90).toString(); // 10% slippage tolerance
        
        await swapActions.swapArtistToMain(
          fromTokenData.address,
          fromAmount,
          minOut
        );
      }
      // Artist Token -> Artist Token (through VSK)
      else {
        toast.error('Direct swaps between artist tokens are not supported yet');
        return;
      }
      
      // Reset form after successful swap
      setFromAmount('');
      setToAmount('');
      
      // Reload balances after swap
      setTimeout(() => {
        loadTokenBalances();
      }, 2000);
      
    } catch (error) {
      console.error('🔴 Swap error:', error);
      toast.error('Swap failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
    setToAmount('');
  };

  // Load available tokens when contracts are ready
  useEffect(() => {
    console.log('🟡 Swap useEffect - contracts:', {
      factory: !!contracts.factory,
      vesikaCoin: !!contracts.vesikaCoin,
      tokenSwap: !!contracts.tokenSwap,
      swapActions: !!swapActions
    });
    
    if (contracts.factory && contracts.vesikaCoin) {
      loadAvailableTokens();
    }
  }, [contracts.factory, contracts.vesikaCoin]);

  // Load balances when tokens are loaded and account is available
  useEffect(() => {
    if (availableTokens.length > 0 && account && contracts.vesikaCoin) {
      loadTokenBalances();
    }
  }, [availableTokens, account, contracts.vesikaCoin]);

  useEffect(() => {
    const calculateSwapAmount = async () => {
      if (!fromAmount || !fromToken || !toToken || fromToken === toToken) {
        setToAmount('');
        return;
      }

      try {
        const fromTokenData = availableTokens.find(t => t.symbol === fromToken);
        const toTokenData = availableTokens.find(t => t.symbol === toToken);
        
        if (!fromTokenData || !toTokenData || !swapActions) {
          setToAmount('');
          return;
        }

        // Use actual pool reserves for accurate swap calculation
        if (fromToken === 'VSK' && toToken !== 'VSK') {
          // VSK -> Artist Token
          try {
            const poolInfo = await contracts.tokenSwap.getPoolInfo(toTokenData.address);
            
            if (poolInfo.mainTokenReserve.gt(0) && poolInfo.artistTokenReserve.gt(0) && poolInfo.isActive) {
              const amountIn = ethers.utils.parseEther(fromAmount);
              const amountOut = await contracts.tokenSwap.getAmountOut(
                amountIn,
                poolInfo.mainTokenReserve,
                poolInfo.artistTokenReserve
              );
              setToAmount(ethers.utils.formatEther(amountOut));
            } else {
              console.warn('Pool not active or has zero reserves');
              setToAmount('0');
            }
          } catch (error) {
            console.error('Error calculating VSK->Artist rate:', error.message);
            setToAmount('0');
          }
        }
        else if (fromToken !== 'VSK' && toToken === 'VSK') {
          // Artist Token -> VSK
          try {
            const poolInfo = await contracts.tokenSwap.getPoolInfo(fromTokenData.address);
            
            if (poolInfo.mainTokenReserve.gt(0) && poolInfo.artistTokenReserve.gt(0) && poolInfo.isActive) {
              const amountIn = ethers.utils.parseEther(fromAmount);
              const amountOut = await contracts.tokenSwap.getAmountOut(
                amountIn,
                poolInfo.artistTokenReserve,
                poolInfo.mainTokenReserve
              );
              setToAmount(ethers.utils.formatEther(amountOut));
            } else {
              console.warn('Pool not active or has zero reserves');
              setToAmount('0');
            }
          } catch (error) {
            console.error('Error calculating Artist->VSK rate:', error.message);
            setToAmount('0');
          }
        }
        // Artist Token -> Artist Token (not supported yet)
        else {
          setToAmount('0');
        }
      } catch (error) {
        console.error('🔴 Error calculating swap amount:', error);
        setToAmount('0');
      }
    };

    if (availableTokens.length > 0 && swapActions) {
      calculateSwapAmount();
    }
  }, [fromAmount, fromToken, toToken, availableTokens, swapActions, contracts.vesikaCoin]);

  if (!isConnected) {
    return (
      <SwapContainer>
        <Container>
          <Title>Token Swap</Title>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Connect your wallet</h3>
              <p>You need to connect your wallet first to swap.</p>
            </div>
          </Card>
        </Container>
      </SwapContainer>
    );
  }

  return (
    <SwapContainer>
      <Container>
        <Title>Token Swap</Title>
        
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SwapInterface>
            {/* From Token */}
            <TokenSelector>
              <TokenHeader>
                <TokenLabel>From</TokenLabel>
                <Balance>Balance: {tokenBalances[fromToken] ? parseFloat(tokenBalances[fromToken]).toFixed(4) : '0.0000'}</Balance>
              </TokenHeader>
              <TokenInput>
                <AmountInput
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                />
                <TokenSelect
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  disabled={tokensLoading}
                >
                  {tokensLoading ? (
                    <option>Loading...</option>
                  ) : (
                    availableTokens.map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))
                  )}
                </TokenSelect>
              </TokenInput>
            </TokenSelector>

            {/* Swap Icon */}
            <SwapIcon>
              <IconButton onClick={swapTokens}>
                ↕️
              </IconButton>
            </SwapIcon>

            {/* To Token */}
            <TokenSelector>
              <TokenHeader>
                <TokenLabel>To</TokenLabel>
                <Balance>Balance: {tokenBalances[toToken] ? parseFloat(tokenBalances[toToken]).toFixed(4) : '0.0000'}</Balance>
              </TokenHeader>
              <TokenInput>
                <AmountInput
                  type="number"
                  value={toAmount}
                  placeholder="0.0"
                  readOnly
                />
                <TokenSelect
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  disabled={tokensLoading}
                >
                  {tokensLoading ? (
                    <option>Loading...</option>
                  ) : (
                    availableTokens.map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))
                  )}
                </TokenSelect>
              </TokenInput>
            </TokenSelector>

            <SwapButton
              onClick={handleSwap}
              disabled={loading || !fromAmount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Swapping...' : 'Swap'}
            </SwapButton>
          </SwapInterface>
        </Card>
      </Container>
    </SwapContainer>
  );
};

export default Swap;
