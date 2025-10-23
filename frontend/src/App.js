import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import { ContractProvider } from './contexts/ContractContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Artist from './pages/Artist';
import Artists from './pages/Artists';
import Tokens from './pages/Tokens';
import Admin from './pages/Admin';
import Swap from './pages/Swap';
import Staking from './pages/Staking';
import BuyVesika from './pages/BuyVesika';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <ContractProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artist" element={<Artist />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/buy" element={<BuyVesika />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
              }}
            />
          </div>
        </Router>
      </ContractProvider>
    </Web3Provider>
  );
}

export default App;
