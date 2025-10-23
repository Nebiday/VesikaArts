import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NavbarContainer = styled.nav`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #f0f0f0;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConnectButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(238, 90, 36, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: white;
  font-size: 0.875rem;
`;

const Address = styled.span`
  font-family: monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
`;

const Balance = styled.span`
  opacity: 0.8;
`;

const NetworkIndicator = styled.div`
  background: ${props => props.isCorrect ? '#10b981' : '#ef4444'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Navbar = () => {
  const location = useLocation();
  const { 
    account, 
    balance, 
    chainId, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    getNetworkName,
    isConnected 
  } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const isCorrectNetwork = chainId === 31337 || chainId === 11155111; // Localhost or Sepolia

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/buy', label: '💰 VSK Satın Al' },
    { path: '/artists', label: 'Sanatçılar' },
    { path: '/tokens', label: 'Tokenlar' },
    { path: '/staking', label: 'Staking' },
    { path: '/swap', label: 'Swap' },
    { path: '/artist', label: 'Artist' },
    { path: '/admin', label: 'Admin' },
  ];

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">
          <span>🎨</span>
          VesikaArt
        </Logo>

        <NavLinks>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <WalletSection>
          {isConnected && (
            <>
              <NetworkIndicator isCorrect={isCorrectNetwork}>
                {getNetworkName(chainId)}
              </NetworkIndicator>
              
              <WalletInfo>
                <Address>{formatAddress(account)}</Address>
                <Balance>{formatBalance(balance)} ETH</Balance>
              </WalletInfo>
            </>
          )}

          <ConnectButton
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isConnected ? disconnectWallet : connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
          </ConnectButton>
        </WalletSection>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;
