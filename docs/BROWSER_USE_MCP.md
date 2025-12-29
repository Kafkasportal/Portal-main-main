# 🌐 Browser Use MCP Setup Guide

Browser Use MCP, AI asistanların tarayıcı otomasyonu yapmasını sağlayan bir Model Context Protocol (MCP) server'ıdır. Bu rehber, Browser Use MCP'yi Cursor'da nasıl kuracağınızı ve kullanacağınızı gösterir.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum Seçenekleri](#kurulum-seçenekleri)
3. [Local Setup (Önerilen)](#local-setup-önerilen)
4. [Cloud Setup](#cloud-setup)
5. [Kullanım Örnekleri](#kullanım-örnekleri)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

Browser Use MCP, AI asistanların:
- ✅ Web sayfalarını otomatik olarak test etmesini
- ✅ Form doldurma ve gönderme işlemlerini yapmasını
- ✅ Web scraping ve veri toplama işlemlerini gerçekleştirmesini
- ✅ UI testlerini otomatik olarak çalıştırmasını
- ✅ E2E test senaryolarını oluşturmasını

sağlar.

---

## 🔧 Kurulum Seçenekleri

Browser Use MCP için iki kurulum seçeneği vardır:

### 1. Local Setup (Önerilen)
- ✅ Ücretsiz
- ✅ API key gerektirmez
- ✅ Hızlı ve güvenilir
- ✅ Offline çalışabilir

### 2. Cloud Setup
- ✅ Cloud browser desteği
- ✅ Ölçeklenebilir
- ✅ API key gerektirir
- ✅ Ücretli planlar mevcut

---

## 🚀 Local Setup (Önerilen)

### Adım 1: Gereksinimler

```bash
# Python 3.12+ gereklidir
python3 --version

# uv kurulumu (önerilen)
pip install uv
# veya
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Adım 2: MCP Yapılandırması

`.cursor/mcp.json` dosyası zaten oluşturulmuş ve Browser Use MCP eklenmiştir:

```json
{
  "mcpServers": {
    "browser-use": {
      "command": "uvx",
      "args": ["browser-use", "--mcp"],
      "env": {}
    }
  }
}
```

### Adım 3: Cursor'ı Yeniden Başlatın

1. Cursor'u tamamen kapatın
2. Cursor'u yeniden açın
3. MCP server otomatik olarak başlayacak

### Adım 4: Doğrulama

Cursor'da MCP server'ın çalıştığını kontrol edin:
- View → Output → "MCP" seçeneğini açın
- "browser-use" server'ının başarıyla bağlandığını görmelisiniz

---

## ☁️ Cloud Setup

### Adım 1: API Key Oluşturma

1. [Browser Use Cloud](https://cloud.browser-use.com) → **Sign Up**
2. **API Keys** sekmesine gidin
3. **New API Key** butonuna tıklayın
4. Key'e bir isim verin (örn: "Cursor MCP")
5. Key'i kopyalayın ve güvenli bir yere kaydedin

**⚠️ Önemli:** API key'i sadece bir kez gösterilir. Kaydedin!

### Adım 2: Environment Variable

```bash
# .env.local dosyasına ekleyin
export BROWSER_USE_API_KEY="your_api_key_here"
```

### Adım 3: MCP Yapılandırması

`.cursor/mcp.json` dosyasında cloud yapılandırması zaten mevcut:

```json
{
  "mcpServers": {
    "browser-use-cloud": {
      "url": "https://api.browser-use.com/mcp",
      "headers": {
        "Authorization": "Bearer ${BROWSER_USE_API_KEY}"
      }
    }
  }
}
```

### Adım 4: Cursor'ı Yeniden Başlatın

1. Cursor'u tamamen kapatın
2. Cursor'u yeniden açın
3. MCP server otomatik olarak başlayacak

---

## 💡 Kullanım Örnekleri

### Örnek 1: Web Sayfasını Test Etme

```
"Browser Use MCP kullanarak localhost:3000'deki login sayfasını test et"
```

### Örnek 2: Form Doldurma

```
"Browser Use ile login formunu doldur: email=demo@kafkasder.org, password=demo123456"
```

### Örnek 3: E2E Test Senaryosu

```
"Browser Use MCP ile dashboard sayfasına giriş yap ve tüm istatistik kartlarının görünür olduğunu doğrula"
```

### Örnek 4: Web Scraping

```
"Browser Use ile üye listesi sayfasından tüm üye isimlerini çıkar"
```

### Örnek 5: UI Test

```
"Browser Use MCP kullanarak responsive tasarımı test et: mobile, tablet ve desktop görünümlerini kontrol et"
```

---

## 🔍 Özellikler

### Browser Use MCP'nin Sağladığı Özellikler:

1. **Sayfa Navigasyonu**
   - Sayfalara gitme
   - Geri/ileri navigasyon
   - Sayfa yenileme

2. **Element Etkileşimi**
   - Tıklama
   - Form doldurma
   - Hover işlemleri
   - Dosya yükleme

3. **Test ve Analiz**
   - Screenshot alma
   - Console mesajlarını okuma
   - Network isteklerini izleme
   - Performance analizi

4. **Form İşlemleri**
   - Çoklu form doldurma
   - Dropdown seçimi
   - Checkbox/Radio seçimi

---

## 🛠️ Troubleshooting

### Problem: MCP Server Başlamıyor

**Çözüm:**
```bash
# uvx'in kurulu olduğunu kontrol edin
which uvx

# Eğer yoksa, uv'yi kurun
pip install uv
```

### Problem: "Command not found: uvx"

**Çözüm:**
```bash
# uv'yi global olarak kurun
pip install --user uv

# PATH'e ekleyin
export PATH="$HOME/.local/bin:$PATH"
```

### Problem: Python Version Hatası

**Çözüm:**
```bash
# Python 3.12+ gereklidir
python3 --version

# Eğer eski versiyon varsa, güncelleyin
```

### Problem: API Key Hatası (Cloud Setup)

**Çözüm:**
1. API key'in doğru olduğundan emin olun
2. Environment variable'ın ayarlandığını kontrol edin
3. Cursor'ı yeniden başlatın

---

## 📚 Kaynaklar

### Resmi Dokümantasyon

- **Browser Use Docs**: [docs.browser-use.com](https://docs.browser-use.com)
- **MCP Server Docs**: [docs.browser-use.com/customize/integrations/mcp-server](https://docs.browser-use.com/customize/integrations/mcp-server)
- **Quick Start**: [docs.browser-use.com/quickstart](https://docs.browser-use.com/quickstart)

### Örnekler

- **GitHub Repo**: [github.com/browser-use/browser-use](https://github.com/browser-use/browser-use)
- **Examples**: [docs.browser-use.com/examples](https://docs.browser-use.com/examples)

---

## 🎓 Best Practices

1. **Local Setup Kullanın**: Geliştirme için local setup daha hızlı ve ücretsizdir
2. **API Key Güvenliği**: API key'leri asla commit etmeyin
3. **Test Senaryoları**: Karmaşık test senaryolarını adım adım oluşturun
4. **Error Handling**: Hata durumlarını kontrol edin ve logları inceleyin

---

## 📝 Notlar

- Browser Use MCP, Playwright tabanlıdır
- Chrome/Chromium gerektirir (zaten yüklü)
- Local setup için internet bağlantısı gerekmez
- Cloud setup için internet bağlantısı ve API key gereklidir

---

**Last Updated**: December 2024  
**Browser Use Version**: Latest  
**Project**: Portal-main



