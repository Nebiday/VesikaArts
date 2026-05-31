import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ArtistContainer = styled.div`
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

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
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
  font-size: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const RequestCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RequestTitle = styled.h3`
  margin: 0;
  color: #1f2937;
`;

const RequestInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
`;

const Artist = () => {
  const { account, isConnected } = useWeb3();
  const { contracts, factoryActions, swapActions } = useContracts();
  
  const [activeTab, setActiveTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const [artistInfo, setArtistInfo] = useState(null);
  const [tokenRequests, setTokenRequests] = useState([]);
  const [poolForm, setPoolForm] = useState({ mainAmount: '', artistAmount: '' });
  const [showPoolForm, setShowPoolForm] = useState(null);
  
  // Registration form
  const [regForm, setRegForm] = useState({
    name: '',
    bio: '',
    website: '',
    socialMedia: ''
  });

  // Token request form
  const [tokenForm, setTokenForm] = useState({
    name: '',
    symbol: '',
    description: ''
  });

  useEffect(() => {
    if (isConnected && account) {
      loadArtistData();
    }
  }, [isConnected, account, contracts]);

  const loadArtistData = async () => {
    try {
      const info = await factoryActions.getArtistInfo(account);
      setArtistInfo(info);

      if (info.isRegistered) {
        const requests = await factoryActions.getArtistTokenRequests(account);
        setTokenRequests(requests);
      }
    } catch (error) {
      console.error('Error loading artist data:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.bio) {
      toast.error('İsim ve bio alanları zorunludur');
      return;
    }

    setLoading(true);
    try {
      await factoryActions.registerArtist(
        regForm.name,
        regForm.bio,
        regForm.website,
        regForm.socialMedia
      );
      await loadArtistData();
      setRegForm({ name: '', bio: '', website: '', socialMedia: '' });
      setActiveTab('tokens');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenRequest = async (e) => {
    e.preventDefault();
    if (!tokenForm.name || !tokenForm.symbol) {
      toast.error('Token ismi ve sembolü zorunludur');
      return;
    }

    setLoading(true);
    try {
      
      const standardSupply = '1000000';
      const standardSwapRate = '1';
      
      const result = await factoryActions.requestToken(
        tokenForm.name,
        tokenForm.symbol,
        standardSupply,           // maxSupply (standart 1M)
        standardSwapRate,         // initialSwapRate (AMM kullanıldığı için önemsiz)
        tokenForm.description,    // description
        JSON.stringify({          // metadata
          createdAt: Date.now(),
          version: '1.0',
          standardSupply: true
        })
      );
      
      toast.success('Token talebi başarıyla gönderildi!');
      await loadArtistData();
      setTokenForm({ name: '', symbol: '', description: '' });
    } catch (error) {
      console.error('Token request error:', error);
      toast.error('Token talebi başarısız: ' + error.message);
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

  const handleDeployToken = async (requestId) => {
    setLoading(true);
    try {
      await factoryActions.deployToken(requestId);
      toast.success('Token başarıyla deploy edildi!');
      await loadArtistData();
    } catch (error) {
      console.error('Deploy error:', error);
      toast.error('Token deploy edilemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async (tokenAddress) => {
    if (!poolForm.mainAmount || !poolForm.artistAmount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await swapActions.createPool(
        tokenAddress,
        poolForm.mainAmount,
        poolForm.artistAmount
      );
      toast.success('Liquidity pool başarıyla oluşturuldu!');
      setPoolForm({ mainAmount: '', artistAmount: '' });
      setShowPoolForm(null);
      await loadArtistData();
    } catch (error) {
      console.error('Pool creation error:', error);
      toast.error('Pool oluşturulurken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <ArtistContainer>
        <Container>
          <Title>Sanatçı Paneli</Title>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Cüzdanınızı bağlayın</h3>
              <p>Sanatçı paneline erişmek için önce cüzdanınızı bağlamanız gerekiyor.</p>
            </div>
          </Card>
        </Container>
      </ArtistContainer>
    );
  }

  return (
    <ArtistContainer>
      <Container>
        <Title>Sanatçı Paneli</Title>

        <TabContainer>
          <Tab 
            active={activeTab === 'register'} 
            onClick={() => setActiveTab('register')}
          >
            Kayıt Ol
          </Tab>
          <Tab 
            active={activeTab === 'tokens'} 
            onClick={() => setActiveTab('tokens')}
            disabled={!artistInfo?.isRegistered}
          >
            Token Yönetimi
          </Tab>
        </TabContainer>

        {activeTab === 'register' && (
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>
              🎨 Sanatçı Kaydı
            </CardTitle>

            {artistInfo?.isRegistered ? (
              <div>
                <div style={{ 
                  background: '#10b981', 
                  color: 'white', 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  ✅ Sanatçı olarak kayıtlısınız!
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <InfoItem>
                    <InfoLabel>İsim</InfoLabel>
                    <InfoValue>{artistInfo.name}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Durum</InfoLabel>
                    <StatusBadge status={artistInfo.isApproved ? 'approved' : 'pending'}>
                      {artistInfo.isApproved ? 'Onaylandı' : 'Onay Bekliyor'}
                    </StatusBadge>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Kayıt Tarihi</InfoLabel>
                    <InfoValue>{new Date(artistInfo.registrationTime * 1000).toLocaleDateString('tr-TR')}</InfoValue>
                  </InfoItem>
                </div>

                {artistInfo.bio && (
                  <div style={{ marginTop: '1rem' }}>
                    <InfoLabel>Bio</InfoLabel>
                    <InfoValue>{artistInfo.bio}</InfoValue>
                  </div>
                )}
              </div>
            ) : (
              <Form onSubmit={handleRegister}>
                <InputGroup>
                  <Label>Sanatçı İsmi *</Label>
                  <Input
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                    placeholder="Sanatçı isminizi girin"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Bio *</Label>
                  <TextArea
                    value={regForm.bio}
                    onChange={(e) => setRegForm({...regForm, bio: e.target.value})}
                    placeholder="Kendinizi tanıtın..."
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={regForm.website}
                    onChange={(e) => setRegForm({...regForm, website: e.target.value})}
                    placeholder="https://website.com"
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Sosyal Medya</Label>
                  <Input
                    type="text"
                    value={regForm.socialMedia}
                    onChange={(e) => setRegForm({...regForm, socialMedia: e.target.value})}
                    placeholder="@username veya profil linki"
                  />
                </InputGroup>

                <Button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Kayıt Yapılıyor...' : 'Sanatçı Olarak Kayıt Ol'}
                </Button>
              </Form>
            )}
          </Card>
        )}

        {activeTab === 'tokens' && (
          <>
            {/* Token Request Form */}
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle>
                🪙 Token Talebi Oluştur
              </CardTitle>

              {artistInfo?.isApproved ? (
                <Form onSubmit={handleTokenRequest}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <InputGroup>
                      <Label>Token İsmi *</Label>
                      <Input
                        type="text"
                        value={tokenForm.name}
                        onChange={(e) => setTokenForm({...tokenForm, name: e.target.value})}
                        placeholder="Örn: Artist Coin"
                        required
                      />
                    </InputGroup>

                    <InputGroup>
                      <Label>Token Sembolü *</Label>
                      <Input
                        type="text"
                        value={tokenForm.symbol}
                        onChange={(e) => setTokenForm({...tokenForm, symbol: e.target.value.toUpperCase()})}
                        placeholder="Örn: ART"
                        maxLength="10"
                        required
                      />
                    </InputGroup>
                  </div>

                  <InputGroup>
                    <Label>Açıklama</Label>
                    <TextArea
                      value={tokenForm.description}
                      onChange={(e) => setTokenForm({...tokenForm, description: e.target.value})}
                      placeholder="Token'ınızın amacını ve kullanım alanını açıklayın..."
                    />
                  </InputGroup>

                  <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                      ℹ️ <strong>Standart Token Özellikleri:</strong><br/>
                      • İlk Arz: 1,000,000 token (otomatik)<br/>
                      • Fiyat: Liquidity pool oranlarıyla belirlenir (AMM)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Talep Gönderiliyor...' : 'Token Talebi Gönder'}
                  </Button>
                </Form>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>Onay Bekleniyor</h3>
                  <p>Token talebi oluşturmak için admin onayı beklemeniz gerekiyor.</p>
                </div>
              )}
            </Card>

            {/* Token Requests List */}
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle>
                📋 Token Taleplerim
              </CardTitle>

              {tokenRequests.length > 0 ? (
                tokenRequests.map((request, index) => (
                  <RequestCard key={index}>
                    <RequestHeader>
                      <RequestTitle>{request.name} ({request.symbol})</RequestTitle>
                      <StatusBadge status={getStatusText(request.status)}>
                        {getStatusLabel(getStatusText(request.status))}
                      </StatusBadge>
                    </RequestHeader>

                    <RequestInfo>
                      <InfoItem>
                        <InfoLabel>📊 Toplam Arz</InfoLabel>
                        <InfoValue>1,000,000 {request.symbol}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>📅 Talep Tarihi</InfoLabel>
                        <InfoValue>{new Date(request.timestamp * 1000).toLocaleDateString('tr-TR')}</InfoValue>
                      </InfoItem>
                      {request.tokenAddress && request.tokenAddress !== '0x0000000000000000000000000000000000000000' && (
                        <InfoItem>
                          <InfoLabel>📍 Token Adresi</InfoLabel>
                          <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {request.tokenAddress.substring(0, 10)}...{request.tokenAddress.substring(38)}
                          </InfoValue>
                        </InfoItem>
                      )}
                    </RequestInfo>

                    {request.description && (
                      <div>
                        <InfoLabel>Açıklama</InfoLabel>
                        <InfoValue>{request.description}</InfoValue>
                      </div>
                    )}
                    
                    {/* Deploy butonu - sadece onaylandı ve henüz deploy edilmemiş token'lar için */}
                    {getStatusText(request.status) === 'approved' && 
                     (!request.tokenAddress || request.tokenAddress === '0x0000000000000000000000000000000000000000') && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        <Button
                          onClick={() => handleDeployToken(request.id)}
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ width: '100%' }}
                        >
                          {loading ? 'Deploy Ediliyor...' : '🚀 Tokenı Deploy Et'}
                        </Button>
                      </div>
                    )}

                    {/* Pool oluşturma - deploy edilmiş tokenlar için */}
                    {request.tokenAddress && request.tokenAddress !== '0x0000000000000000000000000000000000000000' && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        {showPoolForm === request.id ? (
                          <div>
                            <h4 style={{ marginBottom: '1rem', color: '#1f2937' }}>💧 Liquidity Pool Oluştur</h4>
                            <InputGroup>
                              <Label>VesikaCoin Miktarı</Label>
                              <Input
                                type="number"
                                value={poolForm.mainAmount}
                                onChange={(e) => setPoolForm({...poolForm, mainAmount: e.target.value})}
                                placeholder="Örn: 100"
                              />
                            </InputGroup>
                            <InputGroup>
                              <Label>{request.symbol} Miktarı</Label>
                              <Input
                                type="number"
                                value={poolForm.artistAmount}
                                onChange={(e) => setPoolForm({...poolForm, artistAmount: e.target.value})}
                                placeholder="Örn: 100"
                              />
                            </InputGroup>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button
                                onClick={() => handleCreatePool(request.tokenAddress)}
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ flex: 1 }}
                              >
                                {loading ? 'Oluşturuluyor...' : 'Pool Oluştur'}
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowPoolForm(null);
                                  setPoolForm({ mainAmount: '', artistAmount: '' });
                                }}
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ flex: 1, background: '#6b7280' }}
                              >
                                İptal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setShowPoolForm(request.id)}
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                          >
                            💧 Liquidity Pool Oluştur
                          </Button>
                        )}
                      </div>
                    )}
                  </RequestCard>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>Henüz Token Talebiniz Yok</h3>
                  <p>Yukarıdaki formu kullanarak ilk token talebinizi oluşturun.</p>
                </div>
              )}
            </Card>
          </>
        )}
      </Container>
    </ArtistContainer>
  );
};

export default Artist;
