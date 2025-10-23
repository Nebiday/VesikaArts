import React, { useState, useEffect } from 'react';
import { useContracts } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TokensContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    color: white;
    font-size: 3rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    margin: 0;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  h3 {
    color: white;
    font-size: 2rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 1rem;
  }
`;

const TokensGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
`;

const TokenCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const TokenHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  h3 {
    color: #333;
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
`;

const TokenInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 600;
`;

const InfoValue = styled.span`
  font-weight: 500;
  color: #1f2937;
  font-size: 0.95rem;
`;

const TokenDescription = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  h4 {
    color: #333;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  p {
    color: #666;
    margin: 0;
    line-height: 1.5;
    font-size: 0.9rem;
  }
`;

const ArtistInfo = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    font-family: monospace;
    font-size: 0.85rem;
    opacity: 0.9;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  
  &::after {
    content: '';
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top: 5px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
  
  h3 {
    margin-bottom: 1rem;
    color: white;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const Tokens = () => {
  const { contracts, factoryActions } = useContracts();
  const [deployedTokens, setDeployedTokens] = useState([]);
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalSupply: 0,
    activeTokens: 0
  });
  const [loading, setLoading] = useState(true);

  // Safe timestamp formatting
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp || timestamp === 0) return 'Bilinmiyor';
      
      let ts = timestamp;
      if (typeof timestamp === 'object' && timestamp.toString) {
        ts = timestamp.toString();
      }
      
      const numTs = parseInt(ts);
      
      let date;
      if (numTs > 1e12) {
        date = new Date(numTs > 1e15 ? numTs / 1e6 : numTs);
      } else {
        date = new Date(numTs * 1000);
      }
      
      if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih';
      }
      
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      return 'Tarih Hatası';
    }
  };

  useEffect(() => {
    loadDeployedTokens();
  }, [contracts.factory]);

  const loadDeployedTokens = async () => {
    if (!contracts.factory) {
      console.log('🔴 Factory contract not available');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🟡 Loading deployed tokens...');
      console.log('🟡 Factory contract:', contracts.factory.address);
      
      // Get deployed token count
      const deployedCount = await contracts.factory.deployedTokenCount();
      console.log('🟡 Deployed token count:', deployedCount.toNumber());
      
      // Get all token requests and filter for deployed ones
      const deployedTokens = [];
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
            deployedTokens.push(tokenData);
            console.log(`🟢 Found deployed token: ${tokenData.name}`);
          }
        } catch (e) {
          console.error(`🔴 Error getting request ${i}:`, e);
        }
      }
      
      console.log('🟢 Deployed tokens found:', deployedTokens);
      
      const tokensWithInfo = [];
      let totalSupplySum = 0;
      
      for (const tokenInfo of deployedTokens) {
        try {
          // Get artist info
          let artistInfo = { name: 'Unknown Artist' };
          if (tokenInfo.artist && tokenInfo.artist !== '0x0000000000000000000000000000000000000000') {
            try {
              const artistData = await contracts.factory.getArtistInfo(tokenInfo.artist);
              console.log('🟡 Artist data for', tokenInfo.artist, ':', artistData);
              if (artistData.profileMetadata) {
                const metadata = JSON.parse(artistData.profileMetadata);
                artistInfo.name = metadata.name || 'Unknown Artist';
              }
            } catch (e) {
              console.error('🔴 Error getting artist info:', e);
            }
          }
          
          const tokenData = {
            address: tokenInfo.tokenAddress,
            ...tokenInfo,
            artistName: artistInfo.name
          };
          
          console.log('🟢 Processed token data:', tokenData);
          tokensWithInfo.push(tokenData);
          totalSupplySum += parseFloat(tokenInfo.maxSupply || '0');
        } catch (error) {
          console.error('🔴 Error processing token:', tokenInfo, error);
        }
      }
      
      console.log('🟢 Final processed tokens:', tokensWithInfo);
      setDeployedTokens(tokensWithInfo);
      setStats({
        totalTokens: tokensWithInfo.length,
        totalSupply: totalSupplySum.toLocaleString(),
        activeTokens: tokensWithInfo.length
      });
    } catch (error) {
      console.error('🔴 Error loading deployed tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TokensContainer>
        <Container>
          <Header>
            <h1>🪙 Deployed Tokens</h1>
            <p>Platformda deploy edilmiş tokenları keşfedin</p>
          </Header>
          <LoadingSpinner />
        </Container>
      </TokensContainer>
    );
  }

  return (
    <TokensContainer>
      <Container>
        <Header>
          <h1>🪙 Deployed Tokens</h1>
          <p>Platformda deploy edilmiş tokenları keşfedin</p>
        </Header>

        <StatsSection>
          <StatCard
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>{stats.totalTokens}</h3>
            <p>Toplam Token</p>
          </StatCard>
          <StatCard
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>{stats.totalSupply}</h3>
            <p>Toplam Supply</p>
          </StatCard>
          <StatCard
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>{stats.activeTokens}</h3>
            <p>Aktif Token</p>
          </StatCard>
        </StatsSection>

        {deployedTokens.length > 0 ? (
          <TokensGrid>
            {deployedTokens.map((token, index) => (
              <TokenCard
                key={token.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <TokenHeader>
                  <h3>{token.name} ({token.symbol})</h3>
                  <StatusBadge>Deployed</StatusBadge>
                </TokenHeader>

                <TokenInfo>
                  <InfoItem>
                    <InfoLabel>Max Supply</InfoLabel>
                    <InfoValue>{parseFloat(token.maxSupply).toLocaleString()}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Swap Rate</InfoLabel>
                    <InfoValue>{token.initialSwapRate} VES</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Contract Address</InfoLabel>
                    <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {token.address.slice(0, 10)}...{token.address.slice(-8)}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Deploy Tarihi</InfoLabel>
                    <InfoValue>
                      {formatTimestamp(token.timestamp)}
                    </InfoValue>
                  </InfoItem>
                </TokenInfo>

                {token.description && (
                  <TokenDescription>
                    <h4>📝 Açıklama</h4>
                    <p>{token.description}</p>
                  </TokenDescription>
                )}

                <ArtistInfo>
                  <h4>👨‍🎨 Sanatçı</h4>
                  <p>{token.artistName}</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {token.artist.slice(0, 10)}...{token.artist.slice(-8)}
                  </p>
                </ArtistInfo>
              </TokenCard>
            ))}
          </TokensGrid>
        ) : (
          <EmptyState>
            <h3>🚀 Henüz Token Deploy Edilmemiş</h3>
            <p>Platformda henüz deploy edilmiş token bulunmamaktadır.</p>
          </EmptyState>
        )}
      </Container>
    </TokensContainer>
  );
};

export default Tokens;
