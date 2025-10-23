# 🤝 Katkıda Bulunma Rehberi

Web3 Artist Token System'e katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, katkı sürecini kolaylaştırmak için hazırlanmıştır.

## 📋 Katkı Türleri

### 🐛 Bug Reports
- Detaylı açıklama
- Adım adım yeniden üretme
- Beklenen ve gerçekleşen davranış
- Sistem bilgileri (OS, Node version, vb.)

### ✨ Feature Requests
- Özelliğin amacı
- Kullanım senaryoları
- Örnek implementasyon fikirleri

### 💻 Code Contributions
- Bug fixes
- Yeni özellikler
- Performans iyileştirmeleri
- Dokümantasyon güncellemeleri

## 🚀 Başlangıç

### 1. Repository'yi Fork Edin

GitHub üzerinden projeyi fork edin.

### 2. Clone Edin

```bash
git clone https://github.com/YOUR_USERNAME/web3-artist-token-system.git
cd web3-artist-token-system
```

### 3. Branch Oluşturun

```bash
git checkout -b feature/your-feature-name
# veya
git checkout -b fix/your-bug-fix
```

Branch isimlendirme:
- `feature/` - Yeni özellikler
- `fix/` - Bug düzeltmeleri
- `docs/` - Dokümantasyon
- `refactor/` - Code refactoring
- `test/` - Test eklemeleri

## 💻 Development Workflow

### 1. Kurulum

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Geliştirme

```bash
# Hardhat node başlat
npx hardhat node

# Contract'ları deploy et (yeni terminal)
npx hardhat run scripts/deploy.js --network localhost

# Frontend başlat (yeni terminal)
cd frontend && npm start
```

### 3. Testler

```bash
# Tüm testleri çalıştır
npx hardhat test

# Belirli bir testi çalıştır
npx hardhat test test/VesikaCoin.test.js

# Coverage raporu
npx hardhat coverage
```

### 4. Code Style

- **Solidity**: Solidity style guide
- **JavaScript**: ESLint standartları
- **Indentation**: 2 spaces
- **Line length**: Max 100 karakter

## 📝 Commit Mesajları

Anlamlı commit mesajları yazın:

```bash
# İyi örnekler ✅
git commit -m "feat: Add liquidity pool creation functionality"
git commit -m "fix: Resolve swap calculation error"
git commit -m "docs: Update README with deployment instructions"

# Kötü örnekler ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### Commit Prefix'leri

- `feat:` - Yeni özellik
- `fix:` - Bug düzeltmesi
- `docs:` - Dokümantasyon
- `style:` - Formatting, missing semi colons, etc
- `refactor:` - Code refactoring
- `test:` - Test eklemeleri
- `chore:` - Bakım işleri

## 🔍 Code Review Süreci

### Pull Request Oluşturma

1. Değişikliklerinizi commit edin
2. Branch'inizi push edin
3. GitHub'da Pull Request oluşturun
4. Template'i doldurun

### PR Template

```markdown
## Açıklama
[Değişikliklerin kısa açıklaması]

## Değişiklik Türü
- [ ] Bug fix
- [ ] Yeni özellik
- [ ] Breaking change
- [ ] Dokümantasyon güncellemesi

## Test Edildi mi?
- [ ] Evet
- [ ] Hayır

## Checklist
- [ ] Code self-review yapıldı
- [ ] Yeni testler eklendi
- [ ] Mevcut testler geçiyor
- [ ] Dokümantasyon güncellendi
```

### Review Süreci

1. Otomatik testler çalışır
2. Maintainer'lar code review yapar
3. Gerekli değişiklikler istenir
4. Onaylandıktan sonra merge edilir

## 🧪 Test Yazma

### Smart Contract Testleri

```javascript
const { expect } = require("chai");

describe("VesikaCoin", function () {
  it("Should mint tokens correctly", async function () {
    // Test implementasyonu
  });
});
```

### Test Coverage

- En az %80 coverage hedeflenir
- Critical fonksiyonlar %100 coverage
- Edge case'leri test edin

## 📚 Dokümantasyon

### Code Comments

```solidity
/**
 * @notice Token swap fonksiyonu
 * @param amount Swap edilecek miktar
 * @return swappedAmount Alınan token miktarı
 */
function swap(uint256 amount) external returns (uint256) {
    // Implementation
}
```

### README Güncellemeleri

Yeni özellikler eklerken:
- README'yi güncelleyin
- QUICKSTART'ı güncelleyin
- Gerekirse yeni dokümantasyon ekleyin

## 🔒 Güvenlik

### Security Checklist

- [ ] Input validasyonları
- [ ] Reentrancy koruması
- [ ] Access control kontrolleri
- [ ] Integer overflow/underflow
- [ ] External call güvenliği

### Güvenlik Açığı Bildirimi

Güvenlik açığı bulduysanız:
1. Public olarak paylaşMAYIN
2. maintainers@example.com adresine email gönderin
3. Detaylı açıklama yapın
4. 48 saat içinde yanıt alacaksınız

## 🎯 İyi Pratikler

### Smart Contracts

- Gas optimizasyonu yapın
- OpenZeppelin kütüphanelerini kullanın
- Güvenlik best practices takip edin
- Detaylı NatSpec comments yazın

### Frontend

- Component'ları modüler tutun
- Error handling yapın
- Loading states ekleyin
- User feedback sağlayın

### Genel

- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Meaningful variable names
- Clean code principles

## 📞 İletişim

- **GitHub Issues**: Sorular ve öneriler için
- **Pull Requests**: Code katkıları için
- **Discussions**: Genel tartışmalar için

## 🎖️ Katkıda Bulunanlar

Tüm katkıda bulunanlar README'de listelenecektir.

## 📜 Lisans

Katkılarınız MIT lisansı altında yayınlanacaktır.

---

Katkılarınız için teşekkür ederiz! 🙏
