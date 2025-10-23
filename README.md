# 🎨 Web3 Artist Token System (VesikaArts)

Merkezi bir ana token (VesikaCoin) etrafında kurulmuş, sanatçıların kendi ERC20 token'larını oluşturabileceği ve işlem yapabileceği eksiksiz bir Web3 ekosistemi.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Sistem Mimarisi](#-sistem-mimarisi)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Smart Contracts](#-smart-contracts)
- [Frontend](#-frontend)
- [Lisans](#-lisans)

## ✨ Özellikler

### 🪙 VesikaCoin (VSK)
- Ana ekosistem token'ı
- ETH ile satın alınabilir
- Sanatçı token'ları için likidite sağlar
- Role-based yetki sistemi

### 🎭 Sanatçı Token Sistemi
- Sanatçı kaydı ve onay mekanizması
- Admin onayından sonra sanatçının kendi token'ını deploy etmesi
- Özelleştirilebilir token parametreleri (isim, sembol, arz)
- Factory pattern ile güvenli deployment

### 💱 Token Swap & Likidite
- VesikaCoin ↔ Sanatçı Token takası
- Automated Market Maker (AMM) modeli
- Likidite havuzu yönetimi
- %0.3 swap ücreti
- Slippage koruması

### 🛡️ Güvenlik
- Role-based access control (RBAC)
- Admin, Artist, Liquidity Manager rolleri
- Whitelist sistemi
- Reentrancy koruması

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  - Sanatçı Kaydı    - Token Yönetimi    - Swap UI       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Smart Contracts                        │
├─────────────────┬──────────────────┬────────────────────┤
│  VesikaCoin     │ ArtistToken      │   TokenSwap        │
│  (Ana Token)    │ Factory          │   (AMM)            │
├─────────────────┼──────────────────┼────────────────────┤
│  VesikaSale     │ Artist Tokens    │   Liquidity        │
│  (ETH→VSK)      │ (ERC20)          │   Pools            │
└─────────────────┴──────────────────┴────────────────────┘
```

### Akış Şeması

1. **Sanatçı Kaydı**: Sanatçı profil bilgileriyle sisteme kayıt olur
2. **Admin Onayı**: Admin sanatçıyı inceler ve onaylar
3. **Token Talebi**: Onaylı sanatçı token parametrelerini belirler
4. **Token Deployment**: Sanatçı kendi token'ını deploy eder
5. **Likidite Havuzu**: Token için VSK ile likidite havuzu oluşturulur
6. **Trading**: Kullanıcılar token'ları swap edebilir

## 🛠️ Teknoloji Stack

### Smart Contracts
- **Solidity**: ^0.8.19
- **OpenZeppelin**: Güvenli contract kütüphaneleri
- **Hardhat**: Development framework

### Frontend
- **React**: 18.x
- **Web3.js**: Blockchain etkileşimi
- **React Router**: Sayfa yönlendirme
- **CSS3**: Modern ve responsive tasarım

### Development Tools
- **Hardhat Network**: Local blockchain
- **Chai**: Test framework
- **Ethers.js**: Ethereum kütüphanesi

## 🚀 Kurulum

### Gereksinimler
- Node.js v16+ 
- npm v8+
- MetaMask tarayıcı eklentisi

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/yourusername/web3-artist-token-system.git
cd web3-artist-token-system
```

2. **Backend bağımlılıklarını yükleyin**
```bash
npm install
```

3. **Frontend bağımlılıklarını yükleyin**
```bash
cd frontend
npm install
cd ..
```

4. **Smart contract'ları derleyin**
```bash
npx hardhat compile
```

5. **Testleri çalıştırın**
```bash
npx hardhat test
```

## 💻 Kullanım

### Local Development

1. **Hardhat node'u başlatın** (Terminal 1)
```bash
npx hardhat node
```

2. **Contract'ları deploy edin** (Terminal 2)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Frontend'i başlatın** (Terminal 3)
```bash
cd frontend
npm start
```

4. **MetaMask'ı yapılandırın**
   - Network: Localhost 8545
   - Chain ID: 31337
   - Test hesaplarından birini import edin

### Deployment Adresleri

Deploy scriptleri otomatik olarak `deployments/localhost/deployment.json` dosyasına contract adreslerini kaydeder.

## 📜 Smart Contracts

### VesikaCoin.sol
Ana ekosistem token'ı. ERC20 standardı ile mint, burn ve yetkilendirme fonksiyonları.

**Ana Fonksiyonlar:**
- `mint(address to, uint256 amount)`: Token basma (ADMIN_ROLE)
- `burn(uint256 amount)`: Token yakma
- `grantRole(bytes32 role, address account)`: Rol verme

### VesikaSale.sol
Kullanıcıların ETH ile VesikaCoin satın almasını sağlar.

**Ana Fonksiyonlar:**
- `buyVSK()`: ETH karşılığında VSK satın alma
- `setInventory(uint256 amount)`: Satış envanteri ayarlama (ADMIN)
- `updateRate(uint256 rate)`: VSK/ETH oranı güncelleme (ADMIN)

### ArtistTokenFactory.sol
Sanatçı token'larının oluşturulması ve yönetimi.

**Ana Fonksiyonlar:**
- `registerArtist(...)`: Sanatçı kaydı
- `approveArtist(address artist)`: Sanatçı onaylama (ADMIN)
- `requestTokenCreation(...)`: Token oluşturma talebi
- `approveTokenRequest(uint256 requestId)`: Token talebi onaylama (ADMIN)
- `deployToken(uint256 requestId)`: Token deployment (Artist)

### TokenSwap.sol
VesikaCoin ve sanatçı token'ları arasında swap işlemleri.

**Ana Fonksiyonlar:**
- `createLiquidityPool(...)`: Likidite havuzu oluşturma
- `swapVSKForArtistToken(...)`: VSK → Artist Token
- `swapArtistTokenForVSK(...)`: Artist Token → VSK
- `getAmountOut(...)`: Swap miktarı hesaplama

## 🎨 Frontend

### Sayfalar

- **`/`**: Ana sayfa - Sistem özeti
- **`/register`**: Sanatçı kayıt formu
- **`/artist`**: Sanatçı dashboard (token yönetimi)
- **`/admin`**: Admin panel (onay işlemleri)
- **`/buy`**: VSK satın alma sayfası
- **`/swap`**: Token swap interface

### Context API

**ContractContext**: Tüm contract etkileşimlerini merkezi olarak yönetir.
- Contract instance'ları
- Wallet bağlantısı
- Transaction fonksiyonları

## 🧪 Test

```bash
# Tüm testleri çalıştır
npx hardhat test

# Belirli bir testi çalıştır
npx hardhat test test/VesikaCoin.test.js

# Test coverage
npx hardhat coverage
```

## 🔐 Güvenlik

- ✅ OpenZeppelin contract'ları kullanılmıştır
- ✅ Reentrancy guard implementasyonu
- ✅ Role-based access control
- ✅ Input validasyonları
- ✅ Safe transfer implementasyonları

## 📝 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
