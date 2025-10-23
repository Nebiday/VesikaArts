import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useContracts } from '../contexts/ContractContext';

const SaleSection = styled.div`
  margin-top: 2rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 1.5rem;
  border-radius: 0.75rem;
  color: white;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const FormCard = styled.div`
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h3`
  margin-bottom: 1rem;
  color: #1f2937;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VesikaSaleAdmin = () => {
  const { contracts } = useContracts();
  const [loading, setLoading] = useState(false);
  const [saleInfo, setSaleInfo] = useState(null);
  const [rateForm, setRateForm] = useState('');
  const [inventoryForm, setInventoryForm] = useState('');

  useEffect(() => {
    if (contracts.vesikaSale) {
      loadSaleInfo();
    }
  }, [contracts.vesikaSale]);

  const loadSaleInfo = async () => {
    if (!contracts.vesikaSale) return;
    
    try {
      const info = await contracts.vesikaSale.getSaleInfo();
      setSaleInfo({
        rate: ethers.utils.formatEther(info.rate),
        minBuy: ethers.utils.formatEther(info.minBuy),
        maxBuy: ethers.utils.formatEther(info.maxBuy),
        sold: ethers.utils.formatEther(info.sold),
        raised: ethers.utils.formatEther(info.raised),
        available: ethers.utils.formatEther(info.available)
      });
    } catch (error) {
      console.error('Error loading sale info:', error);
    }
  };

  const handleUpdateRate = async () => {
    if (!rateForm || rateForm === '0') {
      toast.error('Geçerli bir oran girin');
      return;
    }

    if (!contracts.vesikaSale) {
      toast.error('VesikaSale kontratı yüklenmedi');
      return;
    }

    setLoading(true);
    try {
      const rateWei = ethers.utils.parseEther(rateForm);
      const tx = await contracts.vesikaSale.updateRate(rateWei);
      toast.success('Oran güncelleniyor...');
      await tx.wait();
      toast.success('Oran başarıyla güncellendi!');
      await loadSaleInfo();
      setRateForm('');
    } catch (error) {
      console.error('Error updating rate:', error);
      toast.error('Oran güncellenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventory = async () => {
    if (!inventoryForm || inventoryForm === '0') {
      toast.error('Geçerli bir miktar girin');
      return;
    }

    if (!contracts.vesikaSale) {
      toast.error('VesikaSale kontratı yüklenmedi');
      return;
    }

    setLoading(true);
    try {
      const amountWei = ethers.utils.parseEther(inventoryForm);
      const tx = await contracts.vesikaSale.addInventory(amountWei);
      toast.success('Envanter ekleniyor...');
      await tx.wait();
      toast.success(`${inventoryForm} VSK envantere eklendi!`);
      await loadSaleInfo();
      setInventoryForm('');
    } catch (error) {
      console.error('Error adding inventory:', error);
      toast.error('Envanter eklenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!saleInfo) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <SaleSection>
      <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>💎 VesikaCoin Satış Yönetimi</h2>

      {/* Mevcut Durum */}
      <InfoGrid>
        <InfoCard>
          <InfoLabel>Mevcut Oran</InfoLabel>
          <InfoValue>{parseFloat(saleInfo.rate).toLocaleString()}</InfoValue>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>VSK per ETH</div>
        </InfoCard>
        <InfoCard>
          <InfoLabel>📦 Satışta Kalan</InfoLabel>
          <InfoValue>{parseFloat(saleInfo.available).toLocaleString()}</InfoValue>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>VSK</div>
        </InfoCard>
        <InfoCard>
          <InfoLabel>📋 Satılan</InfoLabel>
          <InfoValue>{parseFloat(saleInfo.sold).toLocaleString()}</InfoValue>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>VSK</div>
        </InfoCard>
        <InfoCard>
          <InfoLabel>💰 Toplanan ETH</InfoLabel>
          <InfoValue>{parseFloat(saleInfo.raised).toFixed(4)}</InfoValue>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>ETH</div>
        </InfoCard>
      </InfoGrid>

      {/* Oran Güncelleme */}
      <FormCard>
        <FormTitle>🔄 Satış Oranını Güncelle</FormTitle>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
          1 ETH karşılığında kaç VSK verileceğini belirleyin
        </p>
        <InputGroup>
          <Label>Yeni Oran (VSK per ETH)</Label>
          <Input
            type="number"
            value={rateForm}
            onChange={(e) => setRateForm(e.target.value)}
            placeholder="1000"
            min="1"
          />
        </InputGroup>
        <Button
          onClick={handleUpdateRate}
          disabled={loading || !rateForm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Güncelleniyor...' : 'Oranı Güncelle'}
        </Button>
      </FormCard>

      {/* Envanter Ekleme */}
      <FormCard>
        <FormTitle>📦 Envanter Ekle</FormTitle>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Satışa sunulacak VSK miktarını ekleyin. Mevcut envantere eklenir.
        </p>
        <InputGroup>
          <Label>Eklenecek Miktar (VSK)</Label>
          <Input
            type="number"
            value={inventoryForm}
            onChange={(e) => setInventoryForm(e.target.value)}
            placeholder="1000"
            min="1"
          />
        </InputGroup>
        <Button
          onClick={handleAddInventory}
          disabled={loading || !inventoryForm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Ekleniyor...' : 'Envanter Ekle'}
        </Button>
      </FormCard>
    </SaleSection>
  );
};

export default VesikaSaleAdmin;
