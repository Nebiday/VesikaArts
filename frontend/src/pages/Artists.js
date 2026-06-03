import React, { useState, useEffect } from 'react';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import {
  PageContainer,
  ContentContainer,
  PageTitle,
  Card,
  StatusBadge,
} from '../components/ui';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
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
  const { contracts } = useContracts();
  const [approvedArtists, setApprovedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safe timestamp formatting
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp || timestamp === 0) return 'Unknown';
      
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
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US');
    } catch (error) {
      return 'Date Error';
    }
  };

  useEffect(() => {
    loadApprovedArtists();
  }, [contracts.factory]);

  const loadApprovedArtists = async () => {
    if (!contracts.factory) return;
    
    setLoading(true);
    try {
      
      // Get approved artist addresses
      const approvedAddresses = await contracts.factory.getApprovedArtists();
      
      const artistsWithInfo = [];
      
      for (const artistAddress of approvedAddresses) {
        try {
          const info = await contracts.factory.getArtistInfo(artistAddress);
          
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
      
      setApprovedArtists(artistsWithInfo);
    } catch (error) {
      console.error('Error loading approved artists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageTitle>Approved Artists</PageTitle>
          <LoadingMessage>Loading artists...</LoadingMessage>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <PageTitle>Approved Artists</PageTitle>
        
        {approvedArtists.length > 0 ? (
          <Grid>
            {approvedArtists.map((artist, index) => (
              <Card
                $hover
                key={artist.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ArtistHeader>
                  <ArtistName>{artist.name}</ArtistName>
                  <StatusBadge $status="approved">Approved</StatusBadge>
                </ArtistHeader>

                <ArtistInfo>
                  <InfoItem>
                    <InfoLabel>Address</InfoLabel>
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
                      <InfoLabel>Social Media</InfoLabel>
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
                      <InfoLabel>Approval Date</InfoLabel>
                      <InfoValue>
                        {formatTimestamp(artist.timestamp)}
                      </InfoValue>
                    </InfoItem>
                  )}
                </ArtistInfo>

                <TokenCount>
                  🪙 Created {artist.tokenCount} Token(s)
                </TokenCount>
              </Card>
            ))}
          </Grid>
        ) : (
          <EmptyMessage>
            <h3>No Approved Artists Yet</h3>
            <p>The platform hasn't approved any artists yet. Register to become the first artist!</p>
          </EmptyMessage>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Artists;
