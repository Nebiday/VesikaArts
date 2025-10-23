import React, { useState, useEffect } from 'react';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ArtistsContainer = styled.div`
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ArtistCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ArtistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ArtistName = styled.h3`
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
`;

const StatusBadge = styled.span`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ArtistInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.75rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  color: #374151;
  
  a {
    color: #3b82f6;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const TokenCount = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 600;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  
  h3 {
    margin-bottom: 1rem;
    color: #374151;
  }
`;

const Artists = () => {
  const { contracts, factoryActions } = useContracts();
  const [approvedArtists, setApprovedArtists] = useState([]);
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
    loadApprovedArtists();
  }, [contracts.factory]);

  const loadApprovedArtists = async () => {
    if (!contracts.factory) return;
    
    setLoading(true);
    try {
      console.log('Loading approved artists...');
      
      // Get approved artist addresses
      const approvedAddresses = await contracts.factory.getApprovedArtists();
      console.log('Approved addresses:', approvedAddresses);
      
      const artistsWithInfo = [];
      
      for (const artistAddress of approvedAddresses) {
        try {
          const info = await contracts.factory.getArtistInfo(artistAddress);
          console.log('Artist info for', artistAddress, ':', info);
          
          let artistData = {
            address: artistAddress,
            name: 'Unknown Artist',
            bio: '',
            website: '',
            socialMedia: {},
            timestamp: 0,
            tokenCount: info.tokenCount ? info.tokenCount.toString() : '0'
          };
          
          if (info.profileMetadata) {
            try {
              const metadata = JSON.parse(info.profileMetadata);
              artistData = {
                ...artistData,
                name: metadata.name || 'Unknown Artist',
                bio: metadata.bio || '',
                website: metadata.website || '',
                socialMedia: typeof metadata.socialMedia === 'object' ? metadata.socialMedia : {},
                timestamp: metadata.timestamp || 0
              };
            } catch (e) {
              console.error('Error parsing metadata for', artistAddress, ':', e);
            }
          }
          
          artistsWithInfo.push(artistData);
        } catch (error) {
          console.error('Error getting info for artist', artistAddress, ':', error);
        }
      }
      
      console.log('Processed approved artists:', artistsWithInfo);
      setApprovedArtists(artistsWithInfo);
    } catch (error) {
      console.error('Error loading approved artists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ArtistsContainer>
        <Container>
          <Title>Onaylanmış Sanatçılar</Title>
          <LoadingMessage>Sanatçılar yükleniyor...</LoadingMessage>
        </Container>
      </ArtistsContainer>
    );
  }

  return (
    <ArtistsContainer>
      <Container>
        <Title>Onaylanmış Sanatçılar</Title>
        
        {approvedArtists.length > 0 ? (
          <Grid>
            {approvedArtists.map((artist, index) => (
              <ArtistCard
                key={artist.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ArtistHeader>
                  <ArtistName>{artist.name}</ArtistName>
                  <StatusBadge>Onaylandı</StatusBadge>
                </ArtistHeader>

                <ArtistInfo>
                  <InfoItem>
                    <InfoLabel>Adres</InfoLabel>
                    <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {artist.address}
                    </InfoValue>
                  </InfoItem>
                  
                  {artist.bio && (
                    <InfoItem>
                      <InfoLabel>Bio</InfoLabel>
                      <InfoValue>{artist.bio}</InfoValue>
                    </InfoItem>
                  )}
                  
                  {artist.website && (
                    <InfoItem>
                      <InfoLabel>Website</InfoLabel>
                      <InfoValue>
                        <a href={artist.website} target="_blank" rel="noopener noreferrer">
                          {artist.website}
                        </a>
                      </InfoValue>
                    </InfoItem>
                  )}
                  
                  {artist.socialMedia && Object.keys(artist.socialMedia).length > 0 && (
                    <InfoItem>
                      <InfoLabel>Sosyal Medya</InfoLabel>
                      <InfoValue>
                        {Object.entries(artist.socialMedia).map(([platform, url]) => (
                          <div key={platform}>
                            <strong>{platform}:</strong> 
                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem' }}>
                              {url}
                            </a>
                          </div>
                        ))}
                      </InfoValue>
                    </InfoItem>
                  )}
                  
                  {artist.timestamp > 0 && (
                    <InfoItem>
                      <InfoLabel>Onaylanma Tarihi</InfoLabel>
                      <InfoValue>
                        {formatTimestamp(artist.timestamp)}
                      </InfoValue>
                    </InfoItem>
                  )}
                </ArtistInfo>

                <TokenCount>
                  🪙 {artist.tokenCount} Token Oluşturdu
                </TokenCount>
              </ArtistCard>
            ))}
          </Grid>
        ) : (
          <EmptyMessage>
            <h3>Henüz Onaylanmış Sanatçı Yok</h3>
            <p>Platform henüz hiç sanatçı onaylamadı. İlk sanatçı olmak için kayıt olun!</p>
          </EmptyMessage>
        )}
      </Container>
    </ArtistsContainer>
  );
};

export default Artists;
