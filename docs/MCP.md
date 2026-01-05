# MCP (Model Context Protocol) Entegrasyonu

Bu doküman, projedeki MCP (Model Context Protocol) entegrasyonunu açıklar.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Kurulum](#kurulum)
- [MCP Server'ları](#mcp-serverları)
- [Kullanım](#kullanım)
- [Sorun Giderme](#sorun-giderme)

---

## 🎯 Genel Bakış

Model Context Protocol (MCP), AI uygulamalarının dış veri kaynaklarına ve araçlara güvenli bir şekilde bağlanmasını sağlayan açık bir protokoldür. Bu proje aşağıdaki MCP server'larını kullanır:

### Aktif MCP Server'ları

1. **Supabase MCP** - Veritabanı işlemleri
2. **GitHub MCP** - Repository yönetimi ve PR işlemleri
3. **Filesystem MCP** - Dosya sistemi erişimi
4. **Sentry MCP** - Hata takibi ve monitoring

---

## 🚀 Kurulum

### 1. Gereksinimler

- Node.js 20+
- npm veya pnpm
- Geçerli environment değişkenleri

### 2. Environment Değişkenlerini Ayarlayın

`.env.local` dosyanızda aşağıdaki değişkenlerin tanımlı olduğundan emin olun:

```bash
# Supabase MCP için
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub MCP için
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Sentry MCP için (opsiyonel)
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
```

### 3. MCP Server'ları Yükleyin

MCP server'ları otomatik olarak `npx` ile çalıştırılır. Manuel yüklemek isterseniz:

```bash
# Tüm MCP server'larını global yükle
npm install -g @modelcontextprotocol/server-supabase
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-sentry
```

### 4. Konfigürasyonu Doğrulayın

```bash
# mcp.json dosyasının doğru formatta olduğunu kontrol edin
cat mcp.json | jq .
```

---

## 🔧 MCP Server'ları

### 1️⃣ Supabase MCP

**Amaç:** Veritabanı sorgulama, tablo yönetimi ve RLS işlemleri

**Yetenekler:**
- ✅ Veritabanı sorgulama (SELECT, INSERT, UPDATE, DELETE)
- ✅ Tablo şemaları görüntüleme
- ✅ RLS politikalarını listeleme
- ✅ Migration'ları yönetme

**Gerekli Environment Değişkenleri:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://idsiiayyvygcgegmqcov.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Örnek Kullanım:**
```typescript
// AI Agent tarafından otomatik olarak kullanılır
// Manuel kullanım gerekli değil
```

---

### 2️⃣ GitHub MCP

**Amaç:** Repository yönetimi, PR oluşturma ve issue takibi

**Yetenekler:**
- ✅ Pull Request oluşturma ve yönetme
- ✅ Issue oluşturma ve güncelleme
- ✅ Branch yönetimi
- ✅ Commit geçmişi görüntüleme
- ✅ Code review işlemleri

**Gerekli Environment Değişkenleri:**
```bash
GITHUB_TOKEN=ghp_your_personal_access_token
```

**GitHub Token Oluşturma:**

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" tıklayın
3. Aşağıdaki izinleri seçin:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `admin:org` → `read:org` (Read org data)
4. Token'ı kopyalayın ve `.env.local` dosyasına ekleyin

**Örnek Kullanım:**
```typescript
// AI Agent tarafından otomatik olarak kullanılır
// Webhook'lar üzerinden de tetiklenebilir
```

---

### 3️⃣ Filesystem MCP

**Amaç:** Proje dosyalarına güvenli erişim

**Yetenekler:**
- ✅ Dosya okuma
- ✅ Dosya yazma
- ✅ Dizin listeleme
- ✅ Dosya arama

**Konfigürasyon:**
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "${PROJECT_ROOT}"],
    "env": {
      "PROJECT_ROOT": "${PWD}"
    }
  }
}
```

**Güvenlik Notu:** Filesystem MCP yalnızca proje root dizini içinde çalışır.

---

### 4️⃣ Sentry MCP

**Amaç:** Hata takibi ve performans monitoring

**Yetenekler:**
- ✅ Hata listelerini görüntüleme
- ✅ Issue detaylarını okuma
- ✅ Performans metriklerini sorgulama
- ✅ Release'leri listeleme

**Gerekli Environment Değişkenleri:**
```bash
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=kafkasder-oc
SENTRY_PROJECT=javascript-nextjs
```

**Sentry Auth Token Oluşturma:**

1. Sentry Dashboard → Settings → Auth Tokens
2. "Create New Token" tıklayın
3. İzinleri seçin:
   - `project:read`
   - `project:releases`
   - `event:read`
4. Token'ı kopyalayın ve `.env.local` dosyasına ekleyin

---

## 💡 Kullanım

### AI Agent ile Kullanım

MCP server'ları AI agent'ler tarafından otomatik olarak kullanılır. Agent'ler, görevlerini yerine getirmek için uygun MCP server'ını seçer.

**Örnek Senaryolar:**

#### Senaryo 1: Veritabanı Sorgusu
```
Kullanıcı: "Son 10 bağışı göster"
Agent: Supabase MCP kullanarak donations tablosunu sorgular
```

#### Senaryo 2: Pull Request Oluşturma
```
Kullanıcı: "Bu değişiklikler için PR oluştur"
Agent: GitHub MCP kullanarak PR oluşturur
```

#### Senaryo 3: Hata Analizi
```
Kullanıcı: "Bugünkü hataları göster"
Agent: Sentry MCP kullanarak hataları listeler
```

### Manuel Test

MCP server'larını manuel test etmek için:

```bash
# Supabase MCP test
npx @modelcontextprotocol/server-supabase

# GitHub MCP test
npx @modelcontextprotocol/server-github

# Filesystem MCP test
npx @modelcontextprotocol/server-filesystem /Users/pc/conductor/workspaces/portal-main-main/minsk

# Sentry MCP test
npx @modelcontextprotocol/server-sentry
```

---

## 🔍 Sorun Giderme

### Problem: MCP server başlamıyor

**Çözüm:**
1. Environment değişkenlerinin doğru olduğundan emin olun
2. `mcp.json` dosyasının syntax hatası olmadığını kontrol edin
3. Node.js versiyonunun 20+ olduğunu doğrulayın

```bash
# Environment değişkenlerini kontrol et
echo $NEXT_PUBLIC_SUPABASE_URL
echo $GITHUB_TOKEN

# Node.js versiyonunu kontrol et
node --version
```

### Problem: Supabase MCP erişim hatası

**Çözüm:**
1. Service role key'in doğru olduğundan emin olun
2. Supabase project'in aktif olduğunu kontrol edin
3. RLS politikalarını gözden geçirin

```bash
# Supabase bağlantısını test et
curl https://your-project.supabase.co/rest/v1/
```

### Problem: GitHub MCP authentication hatası

**Çözüm:**
1. GitHub token'ın geçerli olduğundan emin olun
2. Token'ın doğru izinlere sahip olduğunu kontrol edin
3. Token'ın expire olmadığını doğrulayın

```bash
# GitHub token'ı test et
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### Problem: Filesystem MCP permission hatası

**Çözüm:**
1. Proje dizininin okuma/yazma izinlerine sahip olduğundan emin olun
2. `PROJECT_ROOT` environment değişkeninin doğru olduğunu kontrol edin

```bash
# Dizin izinlerini kontrol et
ls -la /Users/pc/conductor/workspaces/portal-main-main/minsk
```

---

## 📊 MCP Monitoring

### Kullanım İstatistikleri

MCP server'larının kullanım istatistiklerini görmek için:

```bash
# MCP loglarını görüntüle
tail -f logs/mcp-*.log

# Sentry üzerinden MCP hatalarını görüntüle
# https://sentry.io/organizations/kafkasder-oc/issues/
```

### Best Practices

1. **Güvenlik:**
   - MCP token'larını asla commit etmeyin
   - Environment değişkenlerini güvenli bir şekilde saklayın
   - Production'da minimum izinlerle çalışın

2. **Performans:**
   - MCP server'larını gerektiğinde kullanın
   - Gereksiz sorgulardan kaçının
   - Cache mekanizmalarını kullanın

3. **Monitoring:**
   - MCP hatalarını Sentry ile takip edin
   - Kullanım metriklerini düzenli olarak kontrol edin
   - Rate limit'lere dikkat edin

---

## 🔗 Faydalı Linkler

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [Supabase MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)
- [GitHub MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [MCP Specification](https://spec.modelcontextprotocol.io)

---

## 📝 Notlar

- MCP server'ları production ortamında otomatik olarak başlar
- Development ortamında manual başlatma gerekebilir
- Her MCP server'ın kendi rate limit'leri vardır
- MCP kullanımı için Anthropic Claude veya uyumlu bir AI model gereklidir

---

**Son Güncelleme:** 2025-01-05
**Versiyon:** 1.0.0
**Yazar:** KafkasDer Development Team
