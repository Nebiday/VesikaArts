import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #1f2937;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6'};
  }
`;

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ItemCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ItemTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

const ItemInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.span`
  font-weight: 600;
  color: #1f2937;
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  flex: 1;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ApproveButton = styled(Button)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

const RejectButton = styled(Button)`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

const DeployButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  opacity: 0.9;
  font-size: 0.875rem;
`;

const Admin = () => {
  const { account, isConnected } = useWeb3();
  const { contracts, factoryActions } = useContracts();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [pendingArtists, setPendingArtists] = useState([]);
  const [pendingTokens, setPendingTokens] = useState([]);
  const [approvedTokens, setApprovedTokens] = useState([]);
  const [stats, setStats] = useState({
    totalArtists: 0,
    pendingArtists: 0,
    totalTokens: 0,
    pendingTokens: 0
  });

  useEffect(() => {
    if (isConnected && account) {
      checkAdminRole();
      loadAdminData();
    }
  }, [isConnected, account, contracts]);

  useEffect(() => {
    if (isAdmin) {
      console.log('isAdmin became true, loading admin data...');
      loadAdminData();
    }
  }, [isAdmin, contracts.factory, factoryActions]);

  const checkAdminRole = async () => {
    if (!contracts.factory || !account) {
      console.log('Admin check: Missing factory or account', { factory: !!contracts.factory, account });
      return;
    }
    
    try {
      const adminRole = await contracts.factory.DEFAULT_ADMIN_ROLE();
      const hasRole = await contracts.factory.hasRole(adminRole, account);
      console.log('Admin role check:', { account, hasRole, adminRole });
      setIsAdmin(hasRole);
    } catch (error) {
      console.error('Error checking admin role:', error);
      // Hata durumunda deployer hesabına geçici erişim ver
      const deployerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      const isDeployer = account?.toLowerCase() === deployerAddress.toLowerCase();
      console.log('Fallback admin check:', { account, deployerAddress, isDeployer });
      setIsAdmin(isDeployer);
    }
  };

  const loadAdminData = async () => {
    try {
      console.log('Loading admin data:', { isAdmin, factory: !!contracts.factory, factoryActions: !!factoryActions });
      
      if (!isAdmin || !contracts.factory || !factoryActions) {
        console.log('Admin data load skipped - missing requirements');
        // Contract'lar henüz hazır değilse placeholder data kullan
        setStats({
          totalArtists: 0,
          pendingArtists: 0,
          totalTokens: 0,
          pendingTokens: 0
        });
        return;
      }

      console.log('Fetching admin data...');
      const artists = await factoryActions.getPendingArtists();
      const tokens = await factoryActions.getPendingTokenRequests();
      const approvedTokensList = await factoryActions.getApprovedTokenRequests();
      
      // Get real approved artist count
      let approvedArtistCount = 0;
      try {
        approvedArtistCount = await contracts.factory.getApprovedArtistCount();
        approvedArtistCount = approvedArtistCount.toString();
      } catch (error) {
        console.error('Error getting approved artist count:', error);
      }

      console.log('Admin data fetched:', { artists, tokens, approvedTokensList, approvedArtistCount });
      setPendingArtists(artists);
      setPendingTokens(tokens);
      setApprovedTokens(approvedTokensList);

      setStats({
        totalArtists: parseInt(approvedArtistCount) + artists.length, // Approved + Pending
        pendingArtists: artists.length,
        totalTokens: tokens.length + approvedTokensList.length,
        pendingTokens: tokens.length
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleApproveArtist = async (artistAddress) => {
    setLoading(true);
    try {
      await factoryActions.approveArtist(artistAddress);
      await loadAdminData();
      toast.success('Sanatçı onaylandı');
    } catch (error) {
      console.error('Error approving artist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectArtist = async (artistAddress) => {
    console.log('🔵 handleRejectArtist called with address:', artistAddress);
    console.log('🔵 factoryActions available:', !!factoryActions);
    console.log('🔵 factoryActions.rejectArtist available:', !!factoryActions?.rejectArtist);
    
    setLoading(true);
    try {
      console.log('🔵 Calling factoryActions.rejectArtist...');
      await factoryActions.rejectArtist(artistAddress);
      console.log('🔵 rejectArtist completed, reloading data...');
      await loadAdminData();
      toast.success('Sanatçı reddedildi');
    } catch (error) {
      console.error('🔵 Error rejecting artist:', error);
      toast.error('Sanatçı reddetme başarısız: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToken = async (requestId) => {
    setLoading(true);
    try {
      await factoryActions.approveTokenRequest(requestId);
      await loadAdminData();
      toast.success('Token talebi onaylandı');
    } catch (error) {
      console.error('Error approving token:', error);
      toast.error('Token onaylama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectToken = async (requestId) => {
    console.log('🔴 handleRejectToken called with requestId:', requestId);
    console.log('🔴 factoryActions available:', !!factoryActions);
    console.log('🔴 factoryActions.rejectTokenRequest available:', !!factoryActions?.rejectTokenRequest);
    
    setLoading(true);
    try {
      console.log('🔴 Calling factoryActions.rejectTokenRequest...');
      await factoryActions.rejectTokenRequest(requestId);
      console.log('🔴 rejectTokenRequest completed, reloading data...');
      await loadAdminData();
      toast.success('Token talebi reddedildi');
    } catch (error) {
      console.error('🔴 Error rejecting token:', error);
      toast.error('Token reddetme başarısız: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployToken = async (artistAddress, requestIndex) => {
    setLoading(true);
    try {
      await factoryActions.deployArtistToken(artistAddress, requestIndex);
      await loadAdminData();
      toast.success('Token başarıyla deploy edildi');
    } catch (error) {
      console.error('Error deploying token:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'approved';
      case 2: return 'rejected';
      default: return 'unknown';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return 'Bilinmiyor';
    }
  };

  if (!isConnected) {
    return (
      <AdminContainer>
        <Container>
          <Title>Admin Paneli</Title>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Cüzdanınızı bağlayın</h3>
              <p>Admin paneline erişmek için önce cüzdanınızı bağlamanız gerekiyor.</p>
            </div>
          </Card>
        </Container>
      </AdminContainer>
    );
  }

  if (!isAdmin) {
    return (
      <AdminContainer>
        <Container>
          <Title>Admin Paneli</Title>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Yetkisiz Erişim</h3>
              <p>Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.</p>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                <p>Mevcut Hesap: {account}</p>
                <p>Beklenen Admin: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
                <p>Contract Durumu: {contracts.factory ? 'Yüklendi' : 'Yükleniyor...'}</p>
              </div>
            </div>
          </Card>
        </Container>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Container>
        <Title>Admin Paneli</Title>
        
        {/* Debug Button */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('isConnected:', isConnected);
              console.log('account:', account);
              console.log('isAdmin:', isAdmin);
              console.log('contracts.factory:', !!contracts.factory);
              console.log('factoryActions:', !!factoryActions);
              console.log('pendingArtists:', pendingArtists);
              console.log('pendingTokens:', pendingTokens);
              if (pendingTokens.length > 0) {
                console.log('First token detailed:', JSON.stringify(pendingTokens[0], null, 2));
              }
              if (contracts.factory) {
                console.log('Factory address:', contracts.factory.address);
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Debug Connection
          </button>
        </div>

        <TabContainer>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Genel Bakış
          </Tab>
          <Tab active={activeTab === 'artists'} onClick={() => setActiveTab('artists')}>
            Sanatçı Onayları
          </Tab>
          <Tab active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')}>
            Token Onayları
          </Tab>
          <Tab active={activeTab === 'deployed'} onClick={() => setActiveTab('deployed')}>
            Deploy Edilenler
          </Tab>
        </TabContainer>

        {activeTab === 'overview' && (
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              📊 Platform İstatistikleri
            </CardTitle>

            <StatsGrid>
              <StatCard>
                <StatNumber>{stats.totalArtists}</StatNumber>
                <StatLabel>Toplam Sanatçı</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.pendingArtists}</StatNumber>
                <StatLabel>Bekleyen Sanatçı</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.totalTokens}</StatNumber>
                <StatLabel>Toplam Token</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.pendingTokens}</StatNumber>
                <StatLabel>Bekleyen Token</StatLabel>
              </StatCard>
            </StatsGrid>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              marginTop: '2rem'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Son Aktiviteler</h3>
              <div style={{ color: '#6b7280' }}>
                <p>• {stats.pendingArtists} sanatçı onay bekliyor</p>
                <p>• {stats.pendingTokens} token talebi onay bekliyor</p>
                <p>• {approvedTokens.filter(t => !t.tokenAddress || t.tokenAddress === '0x0000000000000000000000000000000000000000').length} onaylanmış token deploy bekliyor</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'artists' && (
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              👨‍🎨 Bekleyen Sanatçı Onayları
            </CardTitle>

            {pendingArtists.length > 0 ? (
              <Grid>
                {pendingArtists.map((artist, index) => (
                  <ItemCard key={index}>
                    <ItemHeader>
                      <ItemTitle>{artist.name}</ItemTitle>
                      <StatusBadge status="pending">Beklemede</StatusBadge>
                    </ItemHeader>

                    <ItemInfo>
                      <InfoItem>
                        <InfoLabel>Adres</InfoLabel>
                        <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {artist.address}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Kayıt Tarihi</InfoLabel>
                        <InfoValue>
                          {artist.timestamp ? new Date(artist.timestamp).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                        </InfoValue>
                      </InfoItem>
                    </ItemInfo>

                    {artist.bio && (
                      <div style={{ marginBottom: '1rem' }}>
                        <InfoLabel>Bio</InfoLabel>
                        <InfoValue>{artist.bio}</InfoValue>
                      </div>
                    )}

                    {(artist.website || artist.socialMedia) && (
                      <ItemInfo>
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
                      </ItemInfo>
                    )}

                    <ButtonGroup>
                      <ApproveButton
                        onClick={() => handleApproveArtist(artist.address)}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Onayla
                      </ApproveButton>
                      <RejectButton
                        disabled={loading}
                        onClick={() => handleRejectArtist(artist.address)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Reddet
                      </RejectButton>
                    </ButtonGroup>
                  </ItemCard>
                ))}
              </Grid>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <h3>Bekleyen Sanatçı Yok</h3>
                <p>Şu anda onay bekleyen sanatçı bulunmuyor.</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'tokens' && (
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              🪙 Bekleyen Token Onayları
            </CardTitle>

            {pendingTokens.length > 0 ? (
              <Grid>
                {pendingTokens.map((token, index) => {
                  console.log('🟢 Token data:', token);
                  return (
                  <ItemCard key={index}>
                    <ItemHeader>
                      <ItemTitle>{token.name} ({token.symbol})</ItemTitle>
                      <StatusBadge status="pending">Beklemede</StatusBadge>
                    </ItemHeader>

                    <ItemInfo>
                      <InfoItem>
                        <InfoLabel>Sanatçı</InfoLabel>
                        <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {token.artist}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>İlk Arz</InfoLabel>
                        <InfoValue>
                          {parseFloat(token.maxSupply).toLocaleString()} {token.symbol}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Swap Oranı</InfoLabel>
                        <InfoValue>1 VSK = {token.initialSwapRate} {token.symbol}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Talep Tarihi</InfoLabel>
                        <InfoValue>
                          {new Date(token.timestamp).toLocaleDateString('tr-TR')}
                        </InfoValue>
                      </InfoItem>
                    </ItemInfo>

                    {token.description && (
                      <div style={{ marginBottom: '1rem' }}>
                        <InfoLabel>Açıklama</InfoLabel>
                        <InfoValue>{token.description}</InfoValue>
                      </div>
                    )}

                    <ButtonGroup>
                      <ApproveButton
                        onClick={() => handleApproveToken(token.artist, token.requestIndex)}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Onayla
                      </ApproveButton>
                      <RejectButton
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Reddet
                      </RejectButton>
                    </ButtonGroup>
                  </ItemCard>
                ))}
              </Grid>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <h3>Bekleyen Token Talebi Yok</h3>
                <p>Şu anda onay bekleyen token talebi bulunmuyor.</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'deployed' && (
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              🚀 Onaylanmış Token'lar
            </CardTitle>

            {approvedTokens.length > 0 ? (
              <Grid>
                {approvedTokens.map((token, index) => (
                  <ItemCard key={index}>
                    <ItemHeader>
                      <ItemTitle>{token.name} ({token.symbol})</ItemTitle>
                      <StatusBadge status={token.tokenAddress && token.tokenAddress !== '0x0000000000000000000000000000000000000000' ? 'approved' : 'pending'}>
                        {token.tokenAddress && token.tokenAddress !== '0x0000000000000000000000000000000000000000' ? 'Deploy Edildi' : 'Deploy Bekliyor'}
                      </StatusBadge>
                    </ItemHeader>

                    <ItemInfo>
                      <InfoItem>
                        <InfoLabel>Sanatçı</InfoLabel>
                        <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {token.artist}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>İlk Arz</InfoLabel>
                        <InfoValue>
                          {parseInt(token.initialSupply).toLocaleString()} {token.symbol}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Swap Oranı</InfoLabel>
                        <InfoValue>1 VSK = {token.swapRate} {token.symbol}</InfoValue>
                      </InfoItem>
                      {token.tokenAddress && token.tokenAddress !== '0x0000000000000000000000000000000000000000' && (
                        <InfoItem>
                          <InfoLabel>Token Adresi</InfoLabel>
                          <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {token.tokenAddress}
                          </InfoValue>
                        </InfoItem>
                      )}
                    </ItemInfo>

                    {token.description && (
                      <div style={{ marginBottom: '1rem' }}>
                        <InfoLabel>Açıklama</InfoLabel>
                        <InfoValue>{token.description}</InfoValue>
                      </div>
                    )}

                    {console.log('🟦 Token condition check:', {
                      tokenAddress: token.tokenAddress,
                      shouldShowButtons: (!token.tokenAddress || token.tokenAddress === '0x0000000000000000000000000000000000000000')
                    })}
                    {(!token.tokenAddress || token.tokenAddress === '0x0000000000000000000000000000000000000000') && (
                      <ButtonGroup>
                        <ApproveButton
                          onClick={() => handleApproveToken(token.id)}
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Onayla
                        </ApproveButton>
                        <button
                          onClick={() => {
                            console.log('🔴 Reject button clicked for token:', token.id);
                            handleRejectToken(token.id);
                          }}
                          disabled={loading}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: loading ? 0.6 : 1
                          }}
                        >
                          Reddet
                        </button>
                      </ButtonGroup>
                    )}
                  </ItemCard>
                ))}
              </Grid>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <h3>Onaylanmış Token Yok</h3>
                <p>Henüz onaylanmış token bulunmuyor.</p>
              </div>
            )}
          </Card>
        )}
      </Container>
    </AdminContainer>
  );
};

export default Admin;
