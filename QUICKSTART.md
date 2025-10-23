# ⚡ Hızlı Başlangıç Rehberi

Bu rehber projeyi 5 dakikada çalıştırmanıza yardımcı olacak.

## 📋 Ön Gereksinimler

- ✅ Node.js v16+ kurulu
- ✅ npm kurulu
- ✅ MetaMask tarayıcı eklentisi kurulu

## 🚀 5 Adımda Çalıştır

### 1️⃣ Bağımlılıkları Yükle

```bash
# Backend bağımlılıkları
npm install

# Frontend bağımlılıkları
cd frontend
npm install
cd ..
```

### 2️⃣ Contract'ları Derle

```bash
npx hardhat compile
```

### 3️⃣ Hardhat Node'u Başlat

**Yeni terminal açın (Terminal 1):**
```bash
npx hardhat node
```

Bu komut:
- Local blockchain başlatır (port 8545)
- 20 test hesabı oluşturur
- Her hesaba 10000 ETH verir

### 4️⃣ Contract'ları Deploy Et

**Yeni terminal açın (Terminal 2):**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Deploy edilen contract adresleri `deployments/localhost/deployment.json` dosyasına kaydedilir.

### 5️⃣ Frontend'i Başlat

**Yeni terminal açın (Terminal 3):**
```bash
cd frontend
npm start
```

Tarayıcı otomatik olarak [http://localhost:3000](http://localhost:3000) adresini açacak.

## 🦊 MetaMask Kurulumu

### 1. Network Ekle

MetaMask'ı açın ve:

```
Network Name: Hardhat Local
RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
```

### 2. Test Hesabı Import Et

Hardhat node çıktısında gösterilen private key'lerden birini kullanın:

1. MetaMask → Hesap → Import Account
2. Private key'i yapıştır
3. Import

**Örnek Account #0:**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 🎨 İlk Adımlar

### Admin İşlemleri

1. **Admin olarak giriş yapın** (Account #0 varsayılan admin)
2. `/admin` sayfasına gidin
3. Sanatçı başvurularını onaylayın

### Sanatçı İşlemleri

1. **Yeni hesap açın** (Account #1, #2, vb.)
2. `/register` sayfasından kayıt olun
3. Admin onayını bekleyin
4. `/artist` sayfasından token talebinde bulunun
5. Admin onayından sonra token'ınızı deploy edin
6. Likidite havuzu oluşturun

### VSK Satın Alma

1. `/buy` sayfasına gidin
2. ETH karşılığında VSK satın alın
3. Bakiyenizi kontrol edin

### Token Swap

1. `/swap` sayfasına gidin
2. Aktif pool'ları görüntüleyin
3. VSK ↔ Artist Token swap yapın

## 🧪 Test Senaryosu

Sistemi test etmek için şu akışı takip edin:

```bash
# 1. Admin rolü ver (Terminal 2)
npx hardhat run scripts/grant-admin-role.js --network localhost

# 2. Sanatçı kaydet
# Frontend'den /register ile kayıt ol

# 3. Sanatçı onayla
# Frontend'den /admin ile onayla

# 4. Token talebi oluştur
# Frontend'den /artist ile token talebi oluştur

# 5. Token talebini onayla ve deploy et
# Frontend'den /admin ile onayla
# Frontend'den /artist ile deploy et

# 6. Likidite havuzu oluştur
# Frontend'den /artist ile pool oluştur

# 7. Swap yap
# Frontend'den /swap ile işlem yap
```

## ⚠️ Sık Karşılaşılan Sorunlar

### Problem: MetaMask bağlanamıyor
**Çözüm:**
- Hardhat node'un çalıştığından emin olun
- Network ayarlarını kontrol edin
- MetaMask'ı resetleyin (Settings → Advanced → Reset Account)

### Problem: Contract bulunamadı
**Çözüm:**
- Deploy scriptini çalıştırın
- `deployments/localhost/deployment.json` dosyasının var olduğunu kontrol edin
- Frontend'i yeniden başlatın

### Problem: Transaction başarısız
**Çözüm:**
- Hesabınızda yeterli ETH olduğundan emin olun
- Gas limit'i artırın
- Nonce sorunları için hesabı resetleyin

### Problem: Frontend contract'a bağlanamıyor
**Çözüm:**
- Hardhat node ve deploy işlemlerini yeniden yapın
- Browser console'da hata mesajlarını kontrol edin
- `deployment.json` dosyasındaki adresleri manuel kontrol edin

## 📚 Daha Fazla Bilgi

- [Ana README](README.md) - Detaylı dökümantasyon
- [Frontend README](frontend/README.md) - Frontend dokümantasyonu
- [Smart Contracts](contracts/) - Contract kodları

## 🎯 Sonraki Adımlar

1. Contract testlerini çalıştır: `npx hardhat test`
2. Frontend kodlarını incele: `frontend/src/`
3. Kendi özelliklerini ekle
4. Production deployment için hazırla

## 💡 İpuçları

- Her yeni Hardhat node başlatmada tüm veriler sıfırlanır
- Test hesapları her zaman aynı adreslere sahiptir
- Contract değişiklikleri için yeniden compile ve deploy gerekir
- Frontend hot-reload destekler, kod değişiklikleri otomatik yüklenir

---

🎉 **Başarılar! Artık Web3 Artist Token System'i kullanmaya hazırsınız!**

Sorularınız için: [GitHub Issues](https://github.com/yourusername/web3-artist-token-system/issues)
