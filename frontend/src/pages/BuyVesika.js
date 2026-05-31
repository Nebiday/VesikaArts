import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BuyContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255,255,255,0.9);
  font-size: 1.2rem;
  margin-bottom: 3rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  margin-bottom: 2rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 1.5rem;
  border-radius: 0.75rem;
  color: white;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
`;

const OutputBox = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const OutputLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const OutputValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
`;

const StatsCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const StatsTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #6b7280;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const BuyVesika = () => {
  const { account, isConnected } = useWeb3();
  const { contracts } = useContracts();
  const [loading, setLoading] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [vskAmount, setVskAmount] = useState('0');
  const [saleInfo, setSaleInfo] = useState(null);
  const [userBalance, setUserBalance] = useState('0');

  useEffect(() => {
    if (contracts.vesikaSale) {
      loadSaleInfo();
    }
  }, [contracts.vesikaSale]);

  useEffect(() => {
    if (contracts.vesikaCoin && account) {
      loadUserBalance();
    }
  }, [contracts.vesikaCoin, account]);

  const loadSaleInfo = async () => {
    if (!contracts.vesikaSale) return;
    
    try {
      const info = await contracts.vesikaSale.getSaleInfo();
      setSaleInfo({
        rate: ethers.utils.formatEther(info.rate),
        minBuy: ethers.utils.formatEther(info.minBuy),
        maxBuy: ethers.utils.formatEther(info.maxBuy),
        sold: ethers.utils.formatEther(info.sold),
        raised: ethers.utils.formatEther(info.raised),
        available: ethers.utils.formatEther(info.available)
      });
    } catch (error) {
      console.error('Error loading sale info:', error);
    }
  };

  const loadUserBalance = async () => {
    if (!contracts.vesikaCoin || !account) return;
    
    try {
      const balance = await contracts.vesikaCoin.balanceOf(account);
      setUserBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const calculateVsk = async (eth) => {
    if (!contracts.vesikaSale || !eth || eth === '0') {
      setVskAmount('0');
      return;
    }

    try {
      const ethWei = ethers.utils.parseEther(eth);
      const vsk = await contracts.vesikaSale.calculateVsk(ethWei);
      setVskAmount(ethers.utils.formatEther(vsk));
    } catch (error) {
      console.error('Error calculating VSK:', error);
      setVskAmount('0');
    }
  };

  const handleEthChange = (value) => {
    setEthAmount(value);
    calculateVsk(value);
  };

  const handleBuy = async () => {
    if (!ethAmount || ethAmount === '0') {
      toast.error('Please enter an amount');
      return;
    }

    if (!contracts.vesikaSale) {
      toast.error('VesikaSale contract not loaded');
      return;
    }

    setLoading(true);
    try {
      const ethWei = ethers.utils.parseEther(ethAmount);
      const tx = await contracts.vesikaSale.buyVesika({ value: ethWei });
      
      toast.success('Transaction submitted...');
      await tx.wait();
      toast.success(`${vskAmount} VSK purchased successfully!`);
      
      setEthAmount('');
      setVskAmount('0');
      await loadSaleInfo();
      await loadUserBalance();
    } catch (error) {
      console.error('Error buying VSK:', error);
      toast.error('Purchase failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <BuyContainer>
        <Container>
          <Title>💎 Buy VesikaCoin</Title>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Connect your wallet</h3>
              <p>You need to connect your wallet first to buy VesikaCoin.</p>
            </div>
          </Card>
        </Container>
      </BuyContainer>
    );
  }

  return (
    <BuyContainer>
      <Container>
        <Title>💎 Buy VesikaCoin</Title>
        <Subtitle>Buy VesikaCoin with ETH and use it on the platform!</Subtitle>

        {/* Purchase Card */}
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>💰 Purchase</h2>

          {saleInfo && (
            <InfoGrid>
              <InfoCard>
                <InfoLabel>Rate</InfoLabel>
                <InfoValue>{saleInfo.rate} VSK</InfoValue>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>per ETH</div>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Min Buy</InfoLabel>
                <InfoValue>{saleInfo.minBuy} ETH</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Max Buy</InfoLabel>
                <InfoValue>{saleInfo.maxBuy} ETH</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Your VSK Balance</InfoLabel>
                <InfoValue>{parseFloat(userBalance).toFixed(2)}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>📦 Remaining for Sale</InfoLabel>
                <InfoValue>{parseFloat(saleInfo.available).toLocaleString()}</InfoValue>
              </InfoCard>
            </InfoGrid>
          )}

          <InputGroup>
            <Label>ETH Amount</Label>
            <Input
              type="number"
              value={ethAmount}
              onChange={(e) => handleEthChange(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0"
            />
          </InputGroup>

          <OutputBox>
            <OutputLabel>VSK You'll Receive</OutputLabel>
            <OutputValue>{parseFloat(vskAmount).toLocaleString()} VSK</OutputValue>
          </OutputBox>

          <Button
            onClick={handleBuy}
            disabled={loading || !ethAmount || ethAmount === '0'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : '🚀 Buy'}
          </Button>
        </Card>

        {/* Statistics */}
        {saleInfo && (
          <StatsCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatsTitle>📊 Sale Statistics</StatsTitle>
            <StatRow>
              <StatLabel>📦 VSK Remaining for Sale</StatLabel>
              <StatValue>{parseFloat(saleInfo.available).toLocaleString()} VSK</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>📋 Total VSK Sold</StatLabel>
              <StatValue>{parseFloat(saleInfo.sold).toLocaleString()} VSK</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>💰 Total ETH</StatLabel>
              <StatValue>{parseFloat(saleInfo.raised).toFixed(4)} ETH</StatValue>
            </StatRow>
          </StatsCard>
        )}
      </Container>
    </BuyContainer>
  );
};

export default BuyVesika;
