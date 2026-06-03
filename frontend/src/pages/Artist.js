import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useContracts } from '../contexts/ContractContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PageContainer,
  ContentContainer,
  PageTitle,
  SectionTitle,
  Label,
  Input,
  TextArea,
  Button,
  StatusBadge,
} from '../components/ui';

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
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6'};
  }
`;

const Card = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const RequestCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
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
      toast.error('Name and bio fields are required');
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
      toast.error('Token name and symbol are required');
      return;
    }

    setLoading(true);
    try {
      
      const standardSupply = '1000000';
      const standardSwapRate = '1';
      
      await factoryActions.requestToken(
        tokenForm.name,
        tokenForm.symbol,
        standardSupply,           // maxSupply (standard 1M)
        standardSwapRate,         // initialSwapRate (irrelevant since AMM is used)
        tokenForm.description,    // description
        JSON.stringify({          // metadata
          createdAt: Date.now(),
          version: '1.0',
          standardSupply: true
        })
      );
      
      toast.success('Token request submitted successfully!');
      await loadArtistData();
      setTokenForm({ name: '', symbol: '', description: '' });
    } catch (error) {
      console.error('Token request error:', error);
      toast.error('Token request failed: ' + error.message);
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
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const handleDeployToken = async (requestId) => {
    setLoading(true);
    try {
      await factoryActions.deployToken(requestId);
      toast.success('Token deployed successfully!');
      await loadArtistData();
    } catch (error) {
      console.error('Deploy error:', error);
      toast.error('Token deployment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async (tokenAddress) => {
    if (!poolForm.mainAmount || !poolForm.artistAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await swapActions.createPool(
        tokenAddress,
        poolForm.mainAmount,
        poolForm.artistAmount
      );
      toast.success('Liquidity pool created successfully!');
      setPoolForm({ mainAmount: '', artistAmount: '' });
      setShowPoolForm(null);
      await loadArtistData();
    } catch (error) {
      console.error('Pool creation error:', error);
      toast.error('An error occurred while creating the pool: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageTitle>Artist Panel</PageTitle>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>Connect your wallet</h3>
              <p>You need to connect your wallet first to access the artist panel.</p>
            </div>
          </Card>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <PageTitle>Artist Panel</PageTitle>

        <TabContainer>
          <Tab 
            $active={activeTab === 'register'} 
            onClick={() => setActiveTab('register')}
          >
            Register
          </Tab>
          <Tab 
            $active={activeTab === 'tokens'} 
            onClick={() => setActiveTab('tokens')}
            disabled={!artistInfo?.isRegistered}
          >
            Token Management
          </Tab>
        </TabContainer>

        {activeTab === 'register' && (
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionTitle>
              🎨 Artist Registration
            </SectionTitle>

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
                  ✅ You are registered as an artist!
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <InfoItem>
                    <InfoLabel>Name</InfoLabel>
                    <InfoValue>{artistInfo.name}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Status</InfoLabel>
                    <StatusBadge $status={artistInfo.isApproved ? 'approved' : 'pending'}>
                      {artistInfo.isApproved ? 'Approved' : 'Pending Approval'}
                    </StatusBadge>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Registration Date</InfoLabel>
                    <InfoValue>{new Date(artistInfo.registrationTime * 1000).toLocaleDateString('en-US')}</InfoValue>
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
                  <Label>Artist Name *</Label>
                  <Input
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                    placeholder="Enter your artist name"
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Bio *</Label>
                  <TextArea
                    value={regForm.bio}
                    onChange={(e) => setRegForm({...regForm, bio: e.target.value})}
                    placeholder="Introduce yourself..."
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
                  <Label>Social Media</Label>
                  <Input
                    type="text"
                    value={regForm.socialMedia}
                    onChange={(e) => setRegForm({...regForm, socialMedia: e.target.value})}
                    placeholder="@username or profile link"
                  />
                </InputGroup>

                <Button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Registering...' : 'Register as Artist'}
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
              <SectionTitle>
                🪙 Create Token Request
              </SectionTitle>

              {artistInfo?.isApproved ? (
                <Form onSubmit={handleTokenRequest}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <InputGroup>
                      <Label>Token Name *</Label>
                      <Input
                        type="text"
                        value={tokenForm.name}
                        onChange={(e) => setTokenForm({...tokenForm, name: e.target.value})}
                        placeholder="e.g. Artist Coin"
                        required
                      />
                    </InputGroup>

                    <InputGroup>
                      <Label>Token Symbol *</Label>
                      <Input
                        type="text"
                        value={tokenForm.symbol}
                        onChange={(e) => setTokenForm({...tokenForm, symbol: e.target.value.toUpperCase()})}
                        placeholder="e.g. ART"
                        maxLength="10"
                        required
                      />
                    </InputGroup>
                  </div>

                  <InputGroup>
                    <Label>Description</Label>
                    <TextArea
                      value={tokenForm.description}
                      onChange={(e) => setTokenForm({...tokenForm, description: e.target.value})}
                      placeholder="Describe the purpose and use case of your token..."
                    />
                  </InputGroup>

                  <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                      ℹ️ <strong>Standard Token Properties:</strong><br/>
                      • Initial Supply: 1,000,000 tokens (automatic)<br/>
                      • Price: Determined by liquidity pool ratios (AMM)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Submitting Request...' : 'Submit Token Request'}
                  </Button>
                </Form>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>Awaiting Approval</h3>
                  <p>You need to wait for admin approval to create a token request.</p>
                </div>
              )}
            </Card>

            {/* Token Requests List */}
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionTitle>
                📋 My Token Requests
              </SectionTitle>

              {tokenRequests.length > 0 ? (
                tokenRequests.map((request, index) => (
                  <RequestCard key={index}>
                    <RequestHeader>
                      <RequestTitle>{request.name} ({request.symbol})</RequestTitle>
                      <StatusBadge $status={getStatusText(request.status)}>
                        {getStatusLabel(getStatusText(request.status))}
                      </StatusBadge>
                    </RequestHeader>

                    <RequestInfo>
                      <InfoItem>
                        <InfoLabel>📊 Total Supply</InfoLabel>
                        <InfoValue>1,000,000 {request.symbol}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>📅 Request Date</InfoLabel>
                        <InfoValue>{new Date(request.timestamp * 1000).toLocaleDateString('en-US')}</InfoValue>
                      </InfoItem>
                      {request.tokenAddress && request.tokenAddress !== '0x0000000000000000000000000000000000000000' && (
                        <InfoItem>
                          <InfoLabel>📍 Token Address</InfoLabel>
                          <InfoValue style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {request.tokenAddress.substring(0, 10)}...{request.tokenAddress.substring(38)}
                          </InfoValue>
                        </InfoItem>
                      )}
                    </RequestInfo>

                    {request.description && (
                      <div>
                        <InfoLabel>Description</InfoLabel>
                        <InfoValue>{request.description}</InfoValue>
                      </div>
                    )}
                    
                    {/* Deploy button - only for approved and not-yet-deployed tokens */}
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
                          {loading ? 'Deploying...' : '🚀 Deploy Token'}
                        </Button>
                      </div>
                    )}

                    {/* Pool creation - for deployed tokens */}
                    {request.tokenAddress && request.tokenAddress !== '0x0000000000000000000000000000000000000000' && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        {showPoolForm === request.id ? (
                          <div>
                            <h4 style={{ marginBottom: '1rem', color: '#1f2937' }}>💧 Create Liquidity Pool</h4>
                            <InputGroup>
                              <Label>VesikaCoin Amount</Label>
                              <Input
                                type="number"
                                value={poolForm.mainAmount}
                                onChange={(e) => setPoolForm({...poolForm, mainAmount: e.target.value})}
                                placeholder="e.g. 100"
                              />
                            </InputGroup>
                            <InputGroup>
                              <Label>{request.symbol} Amount</Label>
                              <Input
                                type="number"
                                value={poolForm.artistAmount}
                                onChange={(e) => setPoolForm({...poolForm, artistAmount: e.target.value})}
                                placeholder="e.g. 100"
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
                                {loading ? 'Creating...' : 'Create Pool'}
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
                                Cancel
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
                            💧 Create Liquidity Pool
                          </Button>
                        )}
                      </div>
                    )}
                  </RequestCard>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>You Have No Token Requests Yet</h3>
                  <p>Create your first token request using the form above.</p>
                </div>
              )}
            </Card>
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Artist;
