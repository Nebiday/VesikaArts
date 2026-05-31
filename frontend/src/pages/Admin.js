import React, { useState, useEffect } from 'react';
import { useContracts } from '../contexts/ContractContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import VesikaSaleAdmin from '../components/VesikaSaleAdmin';

// Styled Components
const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const AdminCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  
  h3 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  p {
    opacity: 0.9;
    margin: 0;
    font-size: 1.1rem;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  
  ${props => props.active ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
  ` : `
    background: #f8f9fa;
    color: #666;
    
    &:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }
  `}
`;

const ContentSection = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  min-height: 500px;
`;

const RequestGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`;

const RequestCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #667eea;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  h3 {
    color: #333;
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  .status {
    background: linear-gradient(135deg, #ffc107, #ff8c00);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(255, 193, 7, 0.3);
  }
`;

const RequestDetails = styled.div`
  color: #666;
  margin-bottom: 2rem;
  
  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    display: flex;
    justify-content: space-between;
    
    strong {
      color: #333;
      min-width: 120px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  ${props => props.variant === 'approve' ? `
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #218838, #1ea080);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
    }
  ` : props.variant === 'info' ? `
    background: linear-gradient(135deg, #17a2b8, #138496);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #138496, #117a8b);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(23, 162, 184, 0.4);
    }
  ` : `
    background: linear-gradient(135deg, #dc3545, #e74c3c);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #c82333, #c0392b);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  
  h3 {
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => props.status === 'pending' ? `
    background: linear-gradient(135deg, #ffc107, #ff8c00);
    color: white;
  ` : props.status === 'deployed' ? `
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
  ` : `
    background: linear-gradient(135deg, #6c757d, #495057);
    color: white;
  `}
`;

const DetailRow = styled.div`
  margin: 0.5rem 0;
  font-size: 0.95rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  strong {
    color: #333;
    min-width: 120px;
  }
  
  code {
    background: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
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
    border: 5px solid #f3f3f3;
    border-top: 5px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Admin = () => {
  const { contracts, account, factoryActions, swapActions, provider, signer } = useContracts();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('artists');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingArtists, setPendingArtists] = useState([]);
  const [pendingTokens, setPendingTokens] = useState([]);
  const [approvedTokens, setApprovedTokens] = useState([]);
  const [deployedTokens, setDeployedTokens] = useState([]);
  const [stats, setStats] = useState({
    totalArtists: 0,
    pendingArtists: 0,
    totalTokens: 0,
    pendingTokens: 0
  });

  // VesikaSale states
  const [vesikaSaleContract, setVesikaSaleContract] = useState(null);
  const [saleInfo, setSaleInfo] = useState(null);
  const [rateForm, setRateForm] = useState('');
  const [inventoryForm, setInventoryForm] = useState('');

  // Safe timestamp formatting
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp || timestamp === 0) return 'Bilinmiyor';
      
      // Convert BigNumber to number if needed
      let ts = timestamp;
      if (typeof timestamp === 'object' && timestamp.toString) {
        ts = timestamp.toString();
      }
      
      // Parse as number
      const numTs = parseInt(ts);
      
      // If timestamp is too large, it might be in nanoseconds or wrong format
      let date;
      if (numTs > 1e12) {
        // Probably in milliseconds or nanoseconds
        date = new Date(numTs > 1e15 ? numTs / 1e6 : numTs);
      } else {
        // Probably in seconds (Unix timestamp)
        date = new Date(numTs * 1000);
      }
      
      
      if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih';
      }
      
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      console.error('🔴 Error formatting timestamp:', error);
      return 'Tarih Hatası';
    }
  };

  // Admin yetkisi kontrolü
  useEffect(() => {
    const checkAdminRole = async () => {
      
      if (!contracts.factory || !account) {
        return;
      }

      try {
        const hasRole = await contracts.factory.hasRole(
          await contracts.factory.ADMIN_ROLE(),
          account
        );
        setIsAdmin(hasRole);
        
        if (hasRole) {
          loadAdminData();
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };

    checkAdminRole();
  }, [contracts.factory, account]);

  // Admin verilerini yükle
  const loadAdminData = async () => {
    if (!contracts.factory || !factoryActions) return;

    try {
      setLoading(true);

      const artists = await factoryActions.getPendingArtists();
      const tokens = await factoryActions.getPendingTokenRequests();
      const approvedTokensList = await factoryActions.getApprovedTokenRequests();
      const deployedTokensList = await factoryActions.getAllDeployedTokens();

      let approvedArtistCount = 0;
      try {
        approvedArtistCount = await contracts.factory.getApprovedArtistCount();
        approvedArtistCount = approvedArtistCount.toString();
      } catch (error) {
        console.error('Error getting approved artist count:', error);
      }

      setPendingArtists(artists);
      setPendingTokens(tokens);
      setApprovedTokens(approvedTokensList);
      setDeployedTokens(deployedTokensList);
      setStats({
        totalArtists: parseInt(approvedArtistCount) + artists.length,
        pendingArtists: artists.length,
        totalTokens: tokens.length + approvedTokensList.length + deployedTokensList.length,
        pendingTokens: tokens.length
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      console.error('Yönetici verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArtist = async (artistAddress) => {
    try {
      setLoading(true);
      await factoryActions.approveArtist(artistAddress);
      loadAdminData();
    } catch (error) {
      console.error('Error approving artist:', error);
      console.error('Sanatçı onaylanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectArtist = async (artistAddress) => {
    try {
      setLoading(true);
      await factoryActions.rejectArtist(artistAddress);
      loadAdminData();
    } catch (error) {
      console.error('Error rejecting artist:', error);
      console.error('Sanatçı reddedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToken = async (tokenId) => {
    try {
      setLoading(true);
      
      // Token'ı onayla
      await factoryActions.approveTokenRequest(tokenId);
      
      // Token bilgilerini al
      const tokenInfo = pendingTokens.find(t => t.id === tokenId);
      if (tokenInfo && contracts.tokenSwap) {
        try {
          // Artist'e LIQUIDITY_MANAGER_ROLE ver
          const role = await contracts.tokenSwap.LIQUIDITY_MANAGER_ROLE();
          const tx = await contracts.tokenSwap.grantRole(role, tokenInfo.artist);
          await tx.wait();
        } catch (roleError) {
          console.error('⚠️ Yetki verilemedi:', roleError);
          // Yetki verilemese de token onayı başarılı
        }
      }
      
      loadAdminData();
    } catch (error) {
      console.error('Error approving token:', error);
      console.error('Token onaylanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectToken = async (tokenId) => {
    try {
      setLoading(true);
      await factoryActions.rejectTokenRequest(tokenId);
      loadAdminData();
    } catch (error) {
      console.error('Error rejecting token:', error);
      console.error('Token reddedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployToken = async (tokenId) => {
    try {
      setLoading(true);
      await factoryActions.deployToken(tokenId);
      loadAdminData();
    } catch (error) {
      console.error('Error deploying token:', error);
      console.error('Token deploy edilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async (tokenAddress) => {
    try {
      setLoading(true);
      // Başlangıç likidite miktarları (örnek: 1000 VSK ve 10000 Artist Token)
      const mainTokenAmount = '1000';
      const artistTokenAmount = '10000';
      
      await swapActions.createPool(tokenAddress, mainTokenAmount, artistTokenAmount);
      loadAdminData();
    } catch (error) {
      console.error('Error creating pool:', error);
      console.error('Pool oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <AdminContainer>
        <AdminCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <EmptyState>
            <h3>⚠️ Cüzdan Bağlantısı Gerekli</h3>
            <p>Admin paneline erişmek için lütfen cüzdanınızı bağlayın.</p>
          </EmptyState>
        </AdminCard>
      </AdminContainer>
    );
  }

  if (!isAdmin) {
    return (
      <AdminContainer>
        <AdminCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <EmptyState>
            <h3>⚠️ Erişim Reddedildi</h3>
            <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          </EmptyState>
        </AdminCard>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Header>
          <h1>🎨 Admin Paneli</h1>
          <p>Sanatçı ve token taleplerini yönetin</p>
        </Header>

        <StatsGrid>
          <StatCard
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>{stats.totalArtists}</h3>
            <p>Toplam Sanatçı</p>
          </StatCard>
          <StatCard
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3>{stats.pendingArtists}</h3>
            <p>Bekleyen Sanatçı</p>
          </StatCard>
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
            <h3>{stats.pendingTokens}</h3>
            <p>Bekleyen Token</p>
          </StatCard>
        </StatsGrid>

        <TabContainer>
          <TabButtons>
            <TabButton
              active={activeTab === 'artists'}
              onClick={() => setActiveTab('artists')}
            >
              👨‍🎨 Sanatçı Talepleri
            </TabButton>
            <TabButton
              active={activeTab === 'tokens'}
              onClick={() => setActiveTab('tokens')}
            >
              🪙 Token Talepleri
            </TabButton>
            <TabButton
              active={activeTab === 'approved-tokens'}
              onClick={() => setActiveTab('approved-tokens')}
            >
              ✅ Onaylanmış Tokenlar
            </TabButton>
            <TabButton
              active={activeTab === 'deployed-tokens'}
              onClick={() => setActiveTab('deployed-tokens')}
            >
              🚀 Deploy Edilmiş Tokenlar
            </TabButton>
            <TabButton
              active={activeTab === 'sale-management'}
              onClick={() => setActiveTab('sale-management')}
            >
              💰 VSK Satış Yönetimi
            </TabButton>
          </TabButtons>

          <ContentSection>
            {(() => {
              if (loading) {
                return <LoadingSpinner />;
              }
              
              if (activeTab === 'artists') {
                return pendingArtists.length > 0 ? (
                  <RequestGrid>
                    {pendingArtists.map((artist, index) => (
                      <RequestCard
                        key={artist.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <RequestHeader>
                          <h3>👨‍🎨 Sanatçı Başvurusu</h3>
                          <StatusBadge status="pending">⏳ Bekliyor</StatusBadge>
                        </RequestHeader>
                        <RequestDetails>
                          <DetailRow>
                            <strong>Adres:</strong> {artist.address}
                          </DetailRow>
                          <DetailRow>
                            <strong>Profil:</strong> {artist.profileMetadata || 'Bilgi yok'}
                          </DetailRow>
                        </RequestDetails>
                        <ButtonGroup>
                          <ActionButton
                            variant="approve"
                            onClick={() => handleApproveArtist(artist.address)}
                            disabled={loading}
                          >
                            ✅ Onayla
                          </ActionButton>
                          <ActionButton
                            variant="reject"
                            onClick={() => handleRejectArtist(artist.address)}
                            disabled={loading}
                          >
                            ❌ Reddet
                          </ActionButton>
                        </ButtonGroup>
                      </RequestCard>
                    ))}
                  </RequestGrid>
                ) : (
                  <EmptyState>
                    <h3>🎉 Bekleyen Sanatçı Talebi Yok</h3>
                    <p>Şu anda onay bekleyen sanatçı başvurusu bulunmamaktadır.</p>
                  </EmptyState>
                );
              }
              
              if (activeTab === 'tokens') {
                const validTokens = pendingTokens.filter(token => 
                  token.artist !== '0x0000000000000000000000000000000000000000' && 
                  token.name && 
                  token.name.trim() !== ''
                );
                return validTokens.length > 0 ? (
                  <RequestGrid>
                    {validTokens.map((token, index) => {
                      return (
                        <RequestCard
                          key={token.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <RequestHeader>
                            <h3>{token.name} ({token.symbol})</h3>
                            <span className="status">Beklemede</span>
                          </RequestHeader>
                          <RequestDetails>
                            <p><strong>Sanatçı:</strong> <span>{token.artist}</span></p>
                            <p><strong>Max Supply:</strong> <span>{token.maxSupply}</span></p>
                            <p><strong>Swap Rate:</strong> <span>{token.initialSwapRate}</span></p>
                            <p><strong>Açıklama:</strong> <span>{token.description}</span></p>
                            <p><strong>Başvuru Tarihi:</strong> <span>{formatTimestamp(token.timestamp)}</span></p>
                          </RequestDetails>
                          <ButtonGroup>
                            <ActionButton
                              variant="approve"
                              onClick={() => handleApproveToken(token.id)}
                              disabled={loading}
                            >
                              ✅ Onayla
                            </ActionButton>
                            <ActionButton
                              variant="reject"
                              onClick={() => {
                                handleRejectToken(token.id);
                              }}
                              disabled={loading}
                            >
                              ❌ Reddet
                            </ActionButton>
                          </ButtonGroup>
                        </RequestCard>
                      );
                    })}
                </RequestGrid>
                ) : (
                  <EmptyState>
                    <h3>🎉 Bekleyen Token Talebi Yok</h3>
                    <p>Şu anda onay bekleyen token talebi bulunmamaktadır.</p>
                  </EmptyState>
                );
              }
              
              if (activeTab === 'approved-tokens') {
                return approvedTokens.length > 0 ? (
                <RequestGrid>
                  {approvedTokens.map((token, index) => (
                    <RequestCard
                      key={token.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <RequestHeader>
                        <h3>{token.name} ({token.symbol})</h3>
                        <span className="status" style={{ backgroundColor: token.deployed ? '#10b981' : '#f59e0b' }}>
                          {token.deployed ? 'Deploy Edildi' : 'Deploy Bekliyor'}
                        </span>
                      </RequestHeader>
                      <RequestDetails>
                        <p><strong>Sanatçı:</strong> <span>{token.artist}</span></p>
                        <p><strong>Max Supply:</strong> <span>{token.maxSupply}</span></p>
                        <p><strong>Swap Rate:</strong> <span>{token.initialSwapRate}</span></p>
                        <p><strong>Açıklama:</strong> <span>{token.description}</span></p>
                        {token.tokenAddress && token.tokenAddress !== '0x0000000000000000000000000000000000000000' && (
                          <p><strong>Token Adresi:</strong> <span>{token.tokenAddress}</span></p>
                        )}
                        <p><strong>Onay Tarihi:</strong> <span>{formatTimestamp(token.timestamp)}</span></p>
                      </RequestDetails>
                      <ButtonGroup>
                        {!token.deployed ? (
                          <ActionButton
                            variant="approve"
                            onClick={() => handleDeployToken(token.id)}
                            disabled={loading}
                          >
                            🚀 Deploy Et
                          </ActionButton>
                        ) : (
                          <ActionButton
                            variant="approve"
                            onClick={() => handleCreatePool(token.tokenAddress)}
                            disabled={loading}
                          >
                            💧 Pool Oluştur
                          </ActionButton>
                        )}
                      </ButtonGroup>
                    </RequestCard>
                  ))}
                </RequestGrid>
                ) : (
                  <EmptyState>
                    <h3>🎉 Onaylanmış Token Yok</h3>
                    <p>Şu anda onaylanmış token bulunmamaktadır.</p>
                  </EmptyState>
                );
              }
              
              if (activeTab === 'deployed-tokens') {
                return deployedTokens.length > 0 ? (
                <RequestGrid>
                  {deployedTokens.map((token, index) => (
                    <RequestCard key={index}>
                      <RequestHeader>
                        <h3>🚀 {token.name} ({token.symbol})</h3>
                        <StatusBadge status="deployed">🚀 Deploy Edildi</StatusBadge>
                      </RequestHeader>
                      <RequestDetails>
                        <DetailRow>
                          <strong>Sanatçı:</strong> {token.artist}
                        </DetailRow>
                        <DetailRow>
                          <strong>Token Adresi:</strong> 
                          <code style={{fontSize: '0.8em', wordBreak: 'break-all'}}>{token.address}</code>
                        </DetailRow>
                        <DetailRow>
                          <strong>Toplam Arz:</strong> {parseFloat(token.totalSupply).toLocaleString()} {token.symbol}
                        </DetailRow>
                      </RequestDetails>
                      <ButtonGroup>
                        <ActionButton
                          variant="info"
                          onClick={() => window.open(`https://etherscan.io/token/${token.address}`, '_blank')}
                        >
                          🔍 Etherscan'de Gör
                        </ActionButton>
                        <ActionButton
                          variant="approve"
                          onClick={() => handleCreatePool(token.address)}
                          disabled={loading}
                        >
                          💧 Pool Oluştur
                        </ActionButton>
                      </ButtonGroup>
                    </RequestCard>
                  ))}
                </RequestGrid>
                ) : (
                  <EmptyState>
                    <h3>🚀 Deploy Edilmiş Token Yok</h3>
                    <p>Şu anda deploy edilmiş token bulunmamaktadır.</p>
                  </EmptyState>
                );
              }

              if (activeTab === 'sale-management') {
                return <VesikaSaleAdmin />;
              }
            })()}
          </ContentSection>
        </TabContainer>
      </AdminCard>
    </AdminContainer>
  );
};

export default Admin;
