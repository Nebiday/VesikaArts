# 🚀 GitHub'a Yükleme Rehberi

## 1. GitHub'da Repository Oluşturun

1. [GitHub](https://github.com) üzerinde oturum açın
2. Sağ üst köşeden **+** → **New repository**
3. Repository bilgileri:
   - **Name**: `web3-artist-token-system`
   - **Description**: `Merkezi bir ana token etrafında kurulmuş sanatçı token ekosistemi`
   - **Public** veya **Private** seçin
   - **Initialize** seçeneklerini BOŞBIRAKIN (README, .gitignore, license)
4. **Create repository** tıklayın

## 2. Local Repository Başlatın

Bu klasörde terminal açın ve şu komutları çalıştırın:

```bash
# Git repository başlat
git init

# Tüm dosyaları stage'e ekle
git add .

# İlk commit
git commit -m "Initial commit: Web3 Artist Token System"

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub repository'yi remote olarak ekle (YOUR_USERNAME yerine kendi kullanıcı adınızı yazın)
git remote add origin https://github.com/YOUR_USERNAME/web3-artist-token-system.git

# Push yapın
git push -u origin main
```

## 3. Repository Ayarları (Opsiyonel)

### Topics Ekleyin
Repository sayfasında ⚙️ Settings → Topics:
- `blockchain`
- `ethereum`
- `web3`
- `solidity`
- `react`
- `nft`
- `defi`
- `artist-tokens`

### About Bölümü
Repository ana sayfasında ⚙️ About:
- **Description**: `Web3 artist token ecosystem with swap functionality`
- **Website**: (varsa)
- **Topics**: Yukarıdaki topics'leri ekleyin

### Branch Protection (Önerilen)
Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

## 4. GitHub Actions (Opsiyonel)

CI/CD için GitHub Actions ekleyebilirsiniz:

`.github/workflows/test.yml` dosyası oluşturun:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Compile contracts
      run: npx hardhat compile
      
    - name: Run tests
      run: npx hardhat test
```

## 5. README Badge'leri Ekleyin (Opsiyonel)

README.md başına şunları ekleyebilirsiniz:

```markdown
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.x-yellow)
![React](https://img.shields.io/badge/React-18.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)
```

## 6. Releases

İlk release oluşturun:
1. Repository → Releases → Create a new release
2. Tag: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Description: Ana özellikleri listeleyin

## ✅ Checklist

Yüklemeden önce kontrol edin:

- [ ] `.gitignore` dosyası var
- [ ] `node_modules/` ignore ediliyor
- [ ] `.env` dosyası yok (sadece `.env.example` var)
- [ ] README.md doldurulmuş
- [ ] LICENSE dosyası eklendi
- [ ] Contract'lar `contracts/` klasöründe
- [ ] Frontend `frontend/` klasöründe
- [ ] GitHub repository oluşturuldu

## 🎉 Tamamlandı!

Repository'niz artık GitHub'da! 

**Next Steps:**
1. README'yi GitHub'da görüntüleyin ve düzenlemeleri kontrol edin
2. Issues aktif edin (Settings → Features → Issues)
3. Discussions aktif edin (Settings → Features → Discussions)
4. Star'lamayı unutmayın! ⭐

## 💡 İpuçları

- Düzenli commit yapın
- Anlamlı commit mesajları kullanın
- Branch'lerle çalışın (feature branches)
- Pull Request kullanın
- Issues ile todo'larınızı yönetin

---

Sorularınız için GitHub Issues kullanabilirsiniz!
