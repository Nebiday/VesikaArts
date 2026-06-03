import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import {
  PageContainer,
  ContentContainer,
  PageTitle,
  SectionTitle,
  Card,
  InputGroup,
  Label,
  Input,
  Select,
  Button,
} from '../components/ui';

const StakingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const RewardCard = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const RewardAmount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const RewardLabel = styled.div`
  opacity: 0.9;
`;

const APYTable = styled.div`
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const APYRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const Staking = () => {
  const { account, isConnected } = useWeb3();
  const { contracts, vesikaCoinActions } = useContracts();
  
  const [balance, setBalance] = useState('0');
  const [stakeInfo, setStakeInfo] = useState(null);
  const [pendingReward, setPendingReward] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(30 * 24 * 60 * 60); // 30 days default
  const [loading, setLoading] = useState(false);

  const lockPeriodOptions = [
    { value: 30 * 24 * 60 * 60, label: '30 Days (5% APY)', apy: 5 },
    { value: 90 * 24 * 60 * 60, label: '90 Days (7% APY)', apy: 7 },
    { value: 180 * 24 * 60 * 60, label: '180 Days (10% APY)', apy: 10 },
    { value: 365 * 24 * 60 * 60, label: '365 Days (15% APY)', apy: 15 },
  ];

  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
    }
  }, [isConnected, account, contracts]);

  const loadUserData = async () => {
    try {
      const [userBalance, userStakeInfo, reward] = await Promise.all([
        vesikaCoinActions.getBalance(account),
        vesikaCoinActions.getStakeInfo(account),
        vesikaCoinActions.calculateReward(account),
      ]);

      setBalance(userBalance);
      setStakeInfo(userStakeInfo);
      setPendingReward(reward);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      await vesikaCoinActions.stake(stakeAmount, lockPeriod);
      await loadUserData();
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    setLoading(true);
    try {
      await vesikaCoinActions.unstake();
      await loadUserData();
    } catch (error) {
      console.error('Unstaking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    try {
      await vesikaCoinActions.claimRewards();
      await loadUserData();
    } catch (error) {
      console.error('Claim rewards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US');
  };

  const getTimeRemaining = () => {
    if (!stakeInfo || !stakeInfo.isActive) return null;
    
    const unlockTime = stakeInfo.timestamp + stakeInfo.lockPeriod;
    const now = Math.floor(Date.now() / 1000);
    const remaining = unlockTime - now;
    
    if (remaining <= 0) return 'Lock period ended';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    return `${days} days ${hours} hours`;
  };

  if (!isConnected) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageTitle>Staking</PageTitle>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Connect your wallet</h3>
              <p>You need to connect your wallet first to stake.</p>
            </div>
          </Card>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <PageTitle>VesikaCoin Staking</PageTitle>
        
        <StakingGrid>
          {/* Stake Section */}
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionTitle>
              💎 Stake
            </SectionTitle>

            <InfoGrid>
              <InfoItem>
                <InfoLabel>Your Balance</InfoLabel>
                <InfoValue>{parseFloat(balance).toFixed(4)} VSK</InfoValue>
              </InfoItem>
            </InfoGrid>

            <APYTable>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>APY Rates</h4>
              {lockPeriodOptions.map((option, index) => (
                <APYRow key={index}>
                  <span>{option.label.split('(')[0]}</span>
                  <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                    {option.apy}% APY
                  </span>
                </APYRow>
              ))}
            </APYTable>

            {!stakeInfo?.isActive && (
              <>
                <InputGroup>
                  <Label>Stake Amount (VSK)</Label>
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Lock Period</Label>
                  <Select
                    value={lockPeriod}
                    onChange={(e) => setLockPeriod(parseInt(e.target.value))}
                  >
                    {lockPeriodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </InputGroup>

                <Button
                  $fullWidth
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStake}
                  disabled={loading || !stakeAmount}
                >
                  {loading ? 'Staking...' : 'Stake'}
                </Button>
              </>
            )}

            {stakeInfo?.isActive && (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <p>You already have an active stake.</p>
                <p>To create a new stake, end your current stake first.</p>
              </div>
            )}
          </Card>

          {/* Current Stake Section */}
          <Card
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionTitle>
              📊 Current Stake
            </SectionTitle>

            {stakeInfo?.isActive ? (
              <>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Stake Amount</InfoLabel>
                    <InfoValue>{parseFloat(stakeInfo.amount).toFixed(4)} VSK</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Start Date</InfoLabel>
                    <InfoValue>{formatDate(stakeInfo.timestamp)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Lock Period</InfoLabel>
                    <InfoValue>{Math.floor(stakeInfo.lockPeriod / (24 * 60 * 60))} Days</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Time Remaining</InfoLabel>
                    <InfoValue>{getTimeRemaining()}</InfoValue>
                  </InfoItem>
                </InfoGrid>

                <RewardCard>
                  <RewardAmount>{parseFloat(pendingReward).toFixed(6)} VSK</RewardAmount>
                  <RewardLabel>Pending Reward</RewardLabel>
                </RewardCard>

                {parseFloat(pendingReward) > 0 && (
                  <Button
                    $fullWidth
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClaimRewards}
                    disabled={loading}
                    style={{ marginBottom: '1rem' }}
                  >
                    {loading ? 'Claiming Rewards...' : 'Claim Rewards'}
                  </Button>
                )}

                {getTimeRemaining() === 'Lock period ended' && (
                  <Button
                    $fullWidth
                    $variant="danger"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUnstake}
                    disabled={loading}
                  >
                    {loading ? 'Unstaking...' : 'Unstake'}
                  </Button>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <h3>No Active Stake</h3>
                <p>Stake VSK to start earning rewards.</p>
              </div>
            )}
          </Card>
        </StakingGrid>

        {/* Info Section */}
        <Card
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle>
            ℹ️ About Staking
          </SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>How It Works?</h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>Lock your VSK tokens for a fixed period</li>
                <li>Earn annual rewards based on the lock period</li>
                <li>Stakers get 1.5x voting power</li>
                <li>Rewards are calculated daily</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Important Notes</h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>The minimum lock period is 30 days</li>
                <li>Early withdrawal is not possible</li>
                <li>Rewards are automatically compounded</li>
                <li>The maximum lock period is 365 days</li>
              </ul>
            </div>
          </div>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
};

export default Staking;
