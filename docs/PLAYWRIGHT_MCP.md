# 🎭 Playwright MCP Setup Guide

Playwright MCP, Microsoft tarafından geliştirilen ve Playwright tabanlı bir Model Context Protocol (MCP) server'ıdır. Bu rehber, Playwright MCP'yi Cursor'da nasıl kuracağınızı ve kullanacağınızı gösterir.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum](#kurulum)
3. [Yapılandırma](#yapılandırma)
4. [Kullanım Örnekleri](#kullanım-örnekleri)
5. [Özellikler](#özellikler)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

Playwright MCP, AI asistanların:
- ✅ Web sayfalarını otomatik olarak test etmesini
- ✅ Erişilebilirlik ağaçları üzerinden sayfalarla etkileşim kurmasını
- ✅ Form doldurma ve gönderme işlemlerini yapmasını
- ✅ Screenshot alma ve sayfa içeriğini çıkarmasını
- ✅ Network isteklerini ve console mesajlarını izlemesini
- ✅ E2E test senaryolarını oluşturmasını

sağlar.

### Öne Çıkan Özellikler

- **Hızlı ve Hafif**: Playwright'ın erişilebilirlik ağacını kullanarak, piksel tabanlı girdilere ihtiyaç duymadan çalışır
- **LLM Dostu**: Görsel modellere gerek kalmadan, tamamen yapılandırılmış veriler üzerinde çalışır
- **Deterministik**: Ekran görüntüsü tabanlı yaklaşımlarda yaygın olan belirsizlikleri önler

---

## 🚀 Kurulum

### Adım 1: Paket Kurulumu

Playwright MCP paketi zaten kurulmuştur:

```bash
npm install -D @playwright/mcp@latest
```

### Adım 2: MCP Yapılandırması

`.cursor/mcp.json` dosyası zaten güncellenmiş ve Playwright MCP eklenmiştir:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
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
- "playwright" server'ının başarıyla bağlandığını görmelisiniz

---

## 💡 Kullanım Örnekleri

### Örnek 1: Sayfa Navigasyonu

```
"Playwright MCP ile localhost:3000'deki login sayfasına git"
```

### Örnek 2: Form Doldurma

```
"Playwright MCP kullanarak login formunu doldur: email=demo@kafkasder.org, password=demo123456"
```

### Örnek 3: Element Etkileşimi

```
"Playwright MCP ile 'Giriş Yap' butonuna tıkla"
```

### Örnek 4: Screenshot Alma

```
"Playwright MCP kullanarak dashboard sayfasının screenshot'ını al"
```

### Örnek 5: E2E Test Senaryosu

```
"Playwright MCP ile tam bir E2E test yap: login sayfasına git, giriş yap, dashboard'u kontrol et, tüm istatistik kartlarının görünür olduğunu doğrula"
```

### Örnek 6: Network İsteklerini İzleme

```
"Playwright MCP ile network isteklerini izle ve API çağrılarını kontrol et"
```

### Örnek 7: Console Mesajlarını Okuma

```
"Playwright MCP kullanarak console mesajlarını oku ve hataları kontrol et"
```

---

## 🔍 Özellikler

### Playwright MCP'nin Sağladığı Özellikler:

1. **Sayfa Yönetimi**
   - `navigate` - URL'lere gitme
   - `go_back` - Geri navigasyon
   - `reload` - Sayfa yenileme
   - `wait_for_navigation` - Navigasyon bekleme

2. **Element Etkileşimi**
   - `click` - Elemente tıklama
   - `fill` - Form doldurma
   - `hover` - Hover işlemleri
   - `select_option` - Dropdown seçimi
   - `check` / `uncheck` - Checkbox işlemleri

3. **Sayfa Bilgisi**
   - `take_snapshot` - Erişilebilirlik snapshot'ı alma
   - `take_screenshot` - Screenshot alma
   - `get_text_content` - Sayfa içeriğini alma
   - `get_title` - Sayfa başlığını alma

4. **Test ve Analiz**
   - `list_console_messages` - Console mesajlarını listeleme
   - `list_network_requests` - Network isteklerini listeleme
   - `get_network_request` - Belirli bir network isteğini alma
   - `evaluate_script` - JavaScript çalıştırma

5. **Form İşlemleri**
   - `fill_form` - Çoklu form doldurma
   - `upload_file` - Dosya yükleme
   - `press_key` - Tuş basma

---

## 🛠️ Troubleshooting

### Problem: MCP Server Başlamıyor

**Çözüm:**
1. Cursor'ı yeniden başlatın
2. View → Output → "MCP" seçeneğini açın
3. Hata mesajlarını kontrol edin
4. `npx @playwright/mcp@latest` komutunu manuel olarak çalıştırarak test edin

### Problem: "Command not found: npx"

**Çözüm:**
```bash
# Node.js ve npm'in kurulu olduğunu kontrol edin
node --version
npm --version

# Eğer yoksa, Node.js'i kurun
```

### Problem: Playwright Tarayıcıları Yüklü Değil

**Çözüm:**
```bash
# Playwright tarayıcılarını yükleyin
npx playwright install
```

### Problem: Timeout Hataları

**Çözüm:**
1. Dev server'ın çalıştığını kontrol edin (`http://localhost:3000`)
2. Network bağlantısını kontrol edin
3. Timeout değerlerini artırın

---

## 📚 Kaynaklar

### Resmi Dokümantasyon

- **GitHub Repo**: [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **NPM Package**: [npmjs.com/package/@playwright/mcp](https://www.npmjs.com/package/@playwright/mcp)
- **Playwright Docs**: [playwright.dev](https://playwright.dev)

### İlgili Dokümantasyon

- [Browser Use MCP](./BROWSER_USE_MCP.md) - Browser Use MCP rehberi
- [Playwright Config](./playwright.config.ts) - Playwright yapılandırması
- [Test Fixtures](./tests/fixtures/test-fixtures.ts) - Test fixture'ları

---

## 🎓 Best Practices

1. **Erişilebilirlik Snapshot Kullanın**: Screenshot yerine snapshot kullanın (daha hızlı ve hafif)
2. **Bekleme Mekanizmaları**: `wait_for_navigation` ve `wait_for_selector` kullanın
3. **Error Handling**: Hata durumlarını kontrol edin ve logları inceleyin
4. **Test Senaryoları**: Karmaşık test senaryolarını adım adım oluşturun

---

## 📝 Notlar

- Playwright MCP, Playwright'ın erişilebilirlik ağacını kullanır
- Chrome/Chromium gerektirir (zaten yüklü)
- Local setup için internet bağlantısı gerekmez
- MCP server'ın başlaması birkaç saniye sürebilir
- Playwright MCP, Browser Use MCP ile birlikte kullanılabilir

---

## 🔄 Browser Use MCP vs Playwright MCP

### Playwright MCP
- ✅ Microsoft'un resmi paketi
- ✅ Erişilebilirlik ağacı tabanlı (hızlı)
- ✅ Deterministik
- ✅ NPM paketi olarak kurulur

### Browser Use MCP
- ✅ AI-optimized model desteği
- ✅ Cloud browser desteği
- ✅ Python tabanlı
- ✅ Daha fazla AI özelliği

**İkisini birlikte kullanabilirsiniz!** Her biri farklı senaryolar için optimize edilmiştir.

---

**Last Updated**: December 2024  
**Playwright MCP Version**: Latest  
**Project**: Portal-main


