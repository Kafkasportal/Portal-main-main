# 🔗 GitHub MCP Server Kurulumu

GitHub MCP (Model Context Protocol) server'ını Cursor'da kullanarak GitHub repository'lerinizi doğal dil komutlarıyla yönetin.

## 📋 İçindekiler

1. [GitHub MCP Nedir?](#github-mcp-nedir)
2. [GitHub Personal Access Token Oluşturma](#github-personal-access-token-oluşturma)
3. [Cursor'da Yapılandırma](#cursorda-yapılandırma)
4. [Kullanım Örnekleri](#kullanım-örnekleri)
5. [Özellikler](#özellikler)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 GitHub MCP Nedir?

GitHub MCP, GitHub repository'leriniz için geliştirilmiş bir Model Context Protocol sunucusudur. Bu sunucu sayesinde:

- ✅ GitHub repository'lerinizi yönetebilirsiniz
- ✅ Issue'ları oluşturup yönetebilirsiniz
- ✅ Pull Request'leri görüntüleyip yönetebilirsiniz
- ✅ Repository bilgilerini sorgulayabilirsiniz
- ✅ Commit geçmişini inceleyebilirsiniz
- ✅ Branch'leri yönetebilirsiniz

---

## 🔑 GitHub Personal Access Token Oluşturma

### Adım 1: GitHub Settings'e Gidin

1. [GitHub.com](https://github.com) → Sağ üst köşe → **Settings**
2. Sol menüden **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** → **Generate new token (classic)** butonuna tıklayın

### Adım 2: Token Ayarları

**Note (İsim):**
```
Cursor MCP Server
```

**Expiration (Süre):**
- 30 days (önerilen)
- 60 days
- 90 days
- No expiration (production için)

**Scopes (İzinler):**
Aşağıdaki izinleri seçin:

- ✅ **repo** (Full control of private repositories)
  - `repo:status` - Commit status access
  - `repo_deployment` - Deployment access
  - `public_repo` - Public repository access
  - `repo:invite` - Repository invitation access
  - `security_events` - Security events access

- ✅ **workflow** (Update GitHub Action workflows)

- ✅ **read:org** (Read org and team membership) - Eğer organization kullanıyorsanız

**Not:** Minimum olarak `repo` scope'u yeterlidir. Daha fazla güvenlik için sadece ihtiyacınız olan scope'ları seçin.

### Adım 3: Token'ı Kopyalayın

1. **Generate token** butonuna tıklayın
2. Token'ı **hemen kopyalayın** (bir daha gösterilmeyecek!)
3. Güvenli bir yere kaydedin

**⚠️ Önemli:** Token'ı asla public repository'lere commit etmeyin!

---

## ⚙️ Cursor'da Yapılandırma

### Adım 1: MCP Yapılandırma Dosyası

`.vscode/mcp.json` dosyası zaten güncellenmiş ve GitHub MCP server eklendi:

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": ""
      }
    }
  }
}
```

### Adım 2: Token'ı Ekleme

**Yöntem 1: Environment Variable (Önerilen)**

1. `.env.local` dosyası oluşturun (eğer yoksa):
   ```bash
   touch .env.local
   ```

2. Token'ı ekleyin:
   ```env
   GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
   ```

3. `.vscode/mcp.json` dosyasını güncelleyin:
   ```json
   {
     "servers": {
       "github": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-github"
         ],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
         }
       }
     }
   }
   ```

**Yöntem 2: Doğrudan mcp.json (Daha Az Güvenli)**

⚠️ **Uyarı:** Bu yöntem token'ı dosyaya yazar. `.gitignore`'da olduğundan emin olun!

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
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

1. Cursor → Settings → MCP Servers
2. `github` server'ının "Connected" durumunda olduğunu görün

---

## 🎮 Kullanım Örnekleri

### Repository Bilgileri

```
"GitHub repository'm hakkında bilgi ver"
"Portal repository'sinin son commit'lerini göster"
"Main branch'teki son değişiklikleri listele"
```

### Issue Yönetimi

```
"Yeni bir issue oluştur: 'Backend optimizasyonları tamamlandı'"
"Open issue'ları listele"
"Issue #123'ü kapat"
```

### Pull Request Yönetimi

```
"Açık PR'ları göster"
"PR #45'in detaylarını göster"
"Yeni bir PR oluştur: feature/backend-optimization"
```

### Branch Yönetimi

```
"Tüm branch'leri listele"
"feature/backend-optimization branch'ini oluştur"
"Main branch ile karşılaştır"
```

---

## ✨ Özellikler

### Repository İşlemleri
- ✅ Repository bilgilerini sorgulama
- ✅ Branch'leri listeleme ve yönetme
- ✅ Commit geçmişini inceleme
- ✅ File içeriklerini okuma

### Issue İşlemleri
- ✅ Issue oluşturma
- ✅ Issue'ları listeleme
- ✅ Issue'ları güncelleme
- ✅ Issue'ları kapatma

### Pull Request İşlemleri
- ✅ PR oluşturma
- ✅ PR'ları listeleme
- ✅ PR detaylarını görüntüleme
- ✅ PR'ları merge etme

### Code İşlemleri
- ✅ Code search
- ✅ File içeriklerini okuma
- ✅ Diff görüntüleme

---

## 🔧 Troubleshooting

### Problem: MCP Server Bağlanamıyor

**Çözüm 1: Token'ı Kontrol Edin**
- Token'ın geçerli olduğundan emin olun
- Token'ın süresi dolmamış olmalı
- Token'ın gerekli scope'ları içerdiğini kontrol edin

**Çözüm 2: Network Kontrolü**
- İnternet bağlantınızı kontrol edin
- Firewall/proxy ayarlarını kontrol edin

**Çözüm 3: Log'ları Kontrol Edin**
- Cursor → View → Output → "MCP" seçin
- Hata mesajlarını kontrol edin

### Problem: "Permission Denied" Hatası

**Çözüm:**
- Token'ın `repo` scope'una sahip olduğundan emin olun
- Private repository için token'ın erişim izni olduğunu kontrol edin

### Problem: Rate Limit Hatası

**Çözüm:**
- GitHub API rate limit'i aşıldı (saatlik 5000 istek)
- Bir süre bekleyin veya authenticated istekler için limit daha yüksektir

---

## 🔒 Güvenlik

### Token Güvenliği

1. **Token'ı Asla Commit Etmeyin**
   - `.env.local` dosyası `.gitignore`'da olmalı
   - `.vscode/mcp.json` içinde token varsa, dosya `.gitignore`'da olmalı

2. **Token Süresi**
   - Mümkünse kısa süreli token'lar kullanın (30 gün)
   - Süresi dolan token'ları yenileyin

3. **Minimum İzin Prensibi**
   - Sadece ihtiyacınız olan scope'ları seçin
   - Gereksiz izinler vermeyin

4. **Token Rotation**
   - Düzenli olarak token'ları yenileyin
   - Eski token'ları iptal edin

---

## 📚 Kaynaklar

- [GitHub MCP Server Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)

---

## ✅ Kurulum Checklist

- [ ] GitHub Personal Access Token oluşturuldu
- [ ] Token gerekli scope'ları içeriyor (`repo` minimum)
- [ ] `.vscode/mcp.json` dosyası güncellendi
- [ ] Token `.env.local` veya güvenli bir yerde saklandı
- [ ] `.env.local` `.gitignore`'da
- [ ] Cursor yeniden başlatıldı
- [ ] MCP server bağlantısı doğrulandı

---

**Kurulum Tarihi:** 2025-01-26  
**Son Güncelleme:** 2025-01-26


