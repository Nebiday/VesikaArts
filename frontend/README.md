# 🎨 Web3 Artist Token System - Frontend

React tabanlı modern Web3 kullanıcı arayüzü.

## 🚀 Başlangıç

### Kurulum

```bash
npm install
```

### Geliştirme Sunucusu

```bash
npm start
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Build

```bash
npm run build
```

Production için optimize edilmiş build `build/` klasöründe oluşturulur.

## 📱 Özellikler

- ✨ Modern ve responsive tasarım
- 🔐 MetaMask entegrasyonu
- ⚡ Real-time blockchain etkileşimi
- 🎯 Context API ile state yönetimi
- 🎨 Smooth animasyonlar ve transitions

## 🗂️ Proje Yapısı

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js          # Navigasyon
│   │   ├── Home.js             # Ana sayfa
│   │   ├── Register.js         # Sanatçı kaydı
│   │   ├── Artist.js           # Sanatçı dashboard
│   │   ├── Admin.js            # Admin paneli
│   │   ├── Buy.js              # VSK satın alma
│   │   └── Swap.js             # Token swap
│   ├── context/
│   │   └── ContractContext.js  # Blockchain state
│   ├── contracts/
│   │   └── ABIs/              # Contract ABI'ları
│   ├── App.js
│   └── index.js
└── package.json
```

## 🔌 Contract Entegrasyonu

Frontend, `ContractContext.js` üzerinden smart contract'larla iletişim kurar.

Contract adresleri otomatik olarak `../deployments/localhost/deployment.json` dosyasından yüklenir.

## 🎨 Stil ve Tema

- Modern gradient arka planlar
- Glassmorphism efektleri
- Smooth hover animasyonları
- Responsive grid layout
- Dark/Light theme uyumlu

## 📦 Kullanılan Kütüphaneler

- **React** ^18.0.0
- **Web3** ^4.0.0
- **React Router DOM** ^6.0.0

## 🔧 Yapılandırma

### MetaMask Ayarları

```
Network Name: Localhost
RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
```

### Test Hesapları

Hardhat node çalıştırıldığında test hesapları otomatik oluşturulur.

## 🐛 Hata Ayıklama

**Problem**: MetaMask bağlanamıyor
- Çözüm: Hardhat node'un çalıştığından emin olun

**Problem**: Contract bulunamadı
- Çözüm: Contract'ların deploy edildiğinden ve deployment.json dosyasının oluşturulduğundan emin olun

**Problem**: Transaction başarısız
- Çözüm: Hesabınızda yeterli ETH olduğundan ve gerekli onayları aldığınızdan emin olun

## 📝 Lisans

MIT License
