# =============================================================================
# KafkasDer CI/CD - GitHub Secrets Gereksinimi
# =============================================================================
# Bu dosya, CI/CD pipeline'ın çalışması için gerekli GitHub Secrets'ları listeler
# GitHub Repository → Settings → Secrets and variables → Actions
# =============================================================================

## 🔐 ZORUNLU SECRETS

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase proje URL'i
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public key
- `SUPABASE_PROJECT_REF`: Supabase proje referansı (migrations için)
- `SUPABASE_ACCESS_TOKEN`: Supabase CLI access token

### Sentry
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN
- `SENTRY_ORG`: Sentry organization slug
- `SENTRY_PROJECT`: Sentry project slug
- `SENTRY_AUTH_TOKEN`: Sentry auth token (source maps için)

### Render
- `RENDER_DEPLOY_HOOK_URL`: Render deploy webhook URL'i
- `RENDER_API_KEY`: Render API key

### StormMCP (İsteğe bağlı - MCP Health Check için)
- `STORMMCP_URL`: StormMCP gateway URL'i
- `STORMMCP_API_KEY`: StormMCP API key

### Code Coverage (İsteğe bağlı)
- `CODECOV_TOKEN`: Codecov token

## 📝 SECRETS EKLEME ADIMLARI

1. GitHub'da repository'ye gidin
2. Settings → Secrets and variables → Actions
3. "New repository secret" butonuna tıklayın
4. Name ve Value alanlarını doldurun
5. "Add secret" butonuna tıklayın

## 🔧 ENVIRONMENTS

Production environment için:
1. Settings → Environments → New environment
2. "production" adında environment oluşturun
3. Protection rules ekleyin (isteğe bağlı):
   - Required reviewers
   - Wait timer
   - Deployment branches (main only)

## ✅ KONTROL LİSTESİ

- [ ] NEXT_PUBLIC_SUPABASE_URL eklendi
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY eklendi
- [ ] SUPABASE_PROJECT_REF eklendi
- [ ] SUPABASE_ACCESS_TOKEN eklendi
- [ ] NEXT_PUBLIC_SENTRY_DSN eklendi
- [ ] SENTRY_ORG eklendi
- [ ] SENTRY_PROJECT eklendi
- [ ] SENTRY_AUTH_TOKEN eklendi
- [ ] RENDER_DEPLOY_HOOK_URL eklendi
- [ ] RENDER_API_KEY eklendi
- [ ] production environment oluşturuldu
