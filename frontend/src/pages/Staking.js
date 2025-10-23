import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const StakingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
`;

const StakingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    { value: 30 * 24 * 60 * 60, label: '30 Gün (5% APY)', apy: 5 },
    { value: 90 * 24 * 60 * 60, label: '90 Gün (7% APY)', apy: 7 },
    { value: 180 * 24 * 60 * 60, label: '180 Gün (10% APY)', apy: 10 },
    { value: 365 * 24 * 60 * 60, label: '365 Gün (15% APY)', apy: 15 },
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
      toast.error('Geçerli bir miktar girin');
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(balance)) {
      toast.error('Yetersiz bakiye');
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
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR');
  };

  const getTimeRemaining = () => {
    if (!stakeInfo || !stakeInfo.isActive) return null;
    
    const unlockTime = stakeInfo.timestamp + stakeInfo.lockPeriod;
    const now = Math.floor(Date.now() / 1000);
    const remaining = unlockTime - now;
    
    if (remaining <= 0) return 'Kilit süresi doldu';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    return `${days} gün ${hours} saat`;
  };

  if (!isConnected) {
    return (
      <StakingContainer>
        <Container>
          <Title>Staking</Title>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Cüzdanınızı bağlayın</h3>
              <p>Staking yapmak için önce cüzdanınızı bağlamanız gerekiyor.</p>
            </div>
          </Card>
        </Container>
      </StakingContainer>
    );
  }

  return (
    <StakingContainer>
      <Container>
        <Title>VesikaCoin Staking</Title>
        
        <StakingGrid>
          {/* Stake Section */}
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              💎 Stake Et
            </CardTitle>

            <InfoGrid>
              <InfoItem>
                <InfoLabel>Bakiyeniz</InfoLabel>
                <InfoValue>{parseFloat(balance).toFixed(4)} VSK</InfoValue>
              </InfoItem>
            </InfoGrid>

            <APYTable>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>APY Oranları</h4>
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
                  <Label>Stake Miktarı (VSK)</Label>
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Kilit Süresi</Label>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStake}
                  disabled={loading || !stakeAmount}
                >
                  {loading ? 'Stake Ediliyor...' : 'Stake Et'}
                </Button>
              </>
            )}

            {stakeInfo?.isActive && (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <p>Zaten aktif bir stake'iniz var.</p>
                <p>Yeni stake yapmak için önce mevcut stake'inizi sonlandırın.</p>
              </div>
            )}
          </Card>

          {/* Current Stake Section */}
          <Card
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              📊 Mevcut Stake
            </CardTitle>

            {stakeInfo?.isActive ? (
              <>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Stake Miktarı</InfoLabel>
                    <InfoValue>{parseFloat(stakeInfo.amount).toFixed(4)} VSK</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Başlangıç Tarihi</InfoLabel>
                    <InfoValue>{formatDate(stakeInfo.timestamp)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Kilit Süresi</InfoLabel>
                    <InfoValue>{Math.floor(stakeInfo.lockPeriod / (24 * 60 * 60))} Gün</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Kalan Süre</InfoLabel>
                    <InfoValue>{getTimeRemaining()}</InfoValue>
                  </InfoItem>
                </InfoGrid>

                <RewardCard>
                  <RewardAmount>{parseFloat(pendingReward).toFixed(6)} VSK</RewardAmount>
                  <RewardLabel>Bekleyen Ödül</RewardLabel>
                </RewardCard>

                {parseFloat(pendingReward) > 0 && (
                  <Button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClaimRewards}
                    disabled={loading}
                    style={{ marginBottom: '1rem' }}
                  >
                    {loading ? 'Ödüller Alınıyor...' : 'Ödülleri Al'}
                  </Button>
                )}

                {getTimeRemaining() === 'Kilit süresi doldu' && (
                  <Button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUnstake}
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  >
                    {loading ? 'Unstake Ediliyor...' : 'Unstake Et'}
                  </Button>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <h3>Aktif Stake Yok</h3>
                <p>Ödül kazanmaya başlamak için VSK stake edin.</p>
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
          <CardTitle>
            ℹ️ Staking Hakkında
          </CardTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Nasıl Çalışır?</h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>VSK token'larınızı belirli bir süre kilitleyin</li>
                <li>Kilit süresine göre yıllık ödül kazanın</li>
                <li>Stake edenler 1.5x oy gücü elde eder</li>
                <li>Ödüller günlük olarak hesaplanır</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Önemli Notlar</h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>Minimum kilit süresi 30 gündür</li>
                <li>Erken çıkış mümkün değildir</li>
                <li>Ödüller otomatik olarak birleşir</li>
                <li>Maksimum kilit süresi 365 gündür</li>
              </ul>
            </div>
          </div>
        </Card>
      </Container>
    </StakingContainer>
  );
};

export default Staking;
