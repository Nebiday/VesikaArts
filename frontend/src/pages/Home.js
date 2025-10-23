import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const HeroSection = styled.section`
  padding: 4rem 2rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled(Link)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &.secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }
`;

const StatsSection = styled.section`
  background: white;
  padding: 3rem 2rem;
  margin: 2rem auto;
  max-width: 1200px;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-weight: 500;
`;

const FeaturesSection = styled.section`
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #1f2937;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
`;

const Home = () => {
  const { isConnected } = useWeb3();
  const { contracts, vesikaCoinActions } = useContracts();
  const [stats, setStats] = useState({
    totalSupply: '0',
    totalStaked: '0',
    deployedTokens: '0',
    activeArtists: '0',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Check if contracts are loaded
        if (!contracts.vesikaCoin || !contracts.factory) {
          console.log('Contracts not loaded yet');
          return;
        }

        console.log('Loading stats...');
        
        // Get total supply with error handling
        let totalSupply = '0';
        try {
          const supply = await contracts.vesikaCoin.totalSupply();
          totalSupply = (parseInt(supply.toString()) / 1e18 / 1000000).toFixed(1) + 'M';
        } catch (error) {
          console.error('Error getting total supply:', error);
          totalSupply = 'N/A';
        }
        
        // Get total staked with error handling
        let totalStaked = '0';
        try {
          console.log('🔍 Calling totalStaked...');
          const staked = await contracts.vesikaCoin.totalStaked();
          console.log('📊 totalStaked raw value:', staked?.toString());
          
          // Check if staked is valid and not empty
          if (staked && staked.toString() !== '0x' && staked.toString() !== '') {
            const stakedValue = parseFloat(ethers.utils.formatEther(staked));
            console.log('💰 Staked value (formatted):', stakedValue);
            
            if (stakedValue === 0) {
              totalStaked = '0';
            } else if (stakedValue >= 1000000) {
              totalStaked = (stakedValue / 1000000).toFixed(1) + 'M';
            } else if (stakedValue >= 1000) {
              totalStaked = (stakedValue / 1000).toFixed(1) + 'K';
            } else {
              totalStaked = stakedValue.toFixed(1);
            }
            console.log('✅ Final totalStaked display:', totalStaked);
          } else {
            console.log('⚠️ totalStaked is empty or invalid');
            totalStaked = '0';
          }
        } catch (error) {
          console.error('❌ Error getting total staked:', error);
          totalStaked = '0';
        }
        
        // Get deployed tokens count with error handling
        let deployedTokens = '0';
        try {
          const tokens = await contracts.factory.deployedTokenCount();
          deployedTokens = tokens.toString();
        } catch (error) {
          console.error('Error getting deployed tokens count:', error);
          deployedTokens = 'N/A';
        }
        
        // Get active artists count with error handling
        let activeArtists = '0';
        try {
          const approvedCount = await contracts.factory.getApprovedArtistCount();
          activeArtists = approvedCount.toString();
        } catch (error) {
          console.error('Error getting active artists count:', error);
          activeArtists = 'N/A';
        }

        console.log('Stats loaded:', { totalSupply, totalStaked, deployedTokens, activeArtists });
        
        setStats({
          totalSupply,
          totalStaked,
          deployedTokens,
          activeArtists,
        });
      } catch (error) {
        console.error('Error in loadStats:', error);
      }
    };

    loadStats();
    
    // Set up polling to refresh stats every 30 seconds
    const intervalId = setInterval(loadStats, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [contracts]);

  const features = [
    {
      icon: '🎨',
      title: 'Artist Tokens',
      description: 'Sanatçılar kendi ERC20 token\'larını oluşturabilir ve hayranlarıyla doğrudan etkileşime geçebilir.',
    },
    {
      icon: '🏛️',
      title: 'DAO Yönetişimi',
      description: 'VesikaCoin sahipleri platform kararlarında oy kullanabilir ve gelecek yönünü belirleyebilir.',
    },
    {
      icon: '💎',
      title: 'Staking Ödülleri',
      description: 'Token\'larınızı stake ederek %5-15 arası yıllık getiri elde edin ve oy gücünüzü artırın.',
    },
    {
      icon: '🔄',
      title: 'Token Swap',
      description: 'Ana token ile sanatçı token\'ları arasında güvenli ve düşük maliyetli takas yapın.',
    },
    {
      icon: '🛡️',
      title: 'Güvenli Sistem',
      description: 'OpenZeppelin standartları ile geliştirilmiş, denetlenmiş akıllı kontratlar.',
    },
    {
      icon: '🌐',
      title: 'Merkeziyetsiz',
      description: 'Blokzincir teknolojisi ile tamamen merkeziyetsiz ve şeffaf işlemler.',
    },
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          VesikaArt Ekosistemi
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Sanatçılar ve hayranlar için merkeziyetsiz token ekosistemi. 
          Kendi token'ınızı oluşturun, stake edin ve DAO'ya katılın.
        </HeroSubtitle>

        <CTAButtons
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {isConnected ? (
            <>
              <CTAButton to="/staking">Staking Başla</CTAButton>
              <CTAButton to="/artist" className="secondary">Sanatçı Ol</CTAButton>
            </>
          ) : (
            <>
              <CTAButton to="/staking">Cüzdanını Bağla</CTAButton>
              <CTAButton to="/artist" className="secondary">Daha Fazla Bilgi</CTAButton>
            </>
          )}
        </CTAButtons>

        <StatsSection>
          <StatsGrid>
            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <StatNumber>{stats.totalSupply}</StatNumber>
              <StatLabel>Toplam VSK Arzı</StatLabel>
            </StatCard>
            
            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <StatNumber>{stats.totalStaked}</StatNumber>
              <StatLabel>Stake Edilen VSK</StatLabel>
            </StatCard>
            
            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <StatNumber>{stats.deployedTokens}</StatNumber>
              <StatLabel>Sanatçı Token'ı</StatLabel>
            </StatCard>
            
            <StatCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <StatNumber>{stats.activeArtists}</StatNumber>
              <StatLabel>Aktif Sanatçı</StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsSection>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Platform Özellikleri</SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default Home;
