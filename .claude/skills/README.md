# KafkasDer Panel - Claude Code Skills

Bu dizin, KafkasDer Panel projesi için Claude Code skill'lerini içerir. Skill'ler, Claude Code ile çalışırken tekrarlanan görevleri standartlaştırmak ve hızlandırmak için kullanılır.

## Mevcut Skill'ler

### 📚 project-info.md
Proje hakkında genel bilgiler, teknoloji yığını, proje yapısı ve kod standartları.

**Ne zaman kullanılır:**
- Proje yapısını öğrenmek için
- Teknoloji tercihlerini anlamak için
- Kod standartlarını kontrol etmek için
- Yeni geliştiricilerin onboarding'i için

**Örnek kullanım:**
```
Claude, proje yapısını açıkla
```

### 🎨 add-component.md
React komponenti ekleme rehberi, template'ler ve best practice'ler.

**Ne zaman kullanılır:**
- Yeni UI komponenti eklerken
- shadcn/ui bileşeni eklerken
- Form komponenti oluştururken
- Client/Server component seçiminde

**Örnek kullanım:**
```
Claude, yeni bir kullanıcı kartı komponenti ekle
Claude, shadcn/ui table bileşenini ekle
```

### 🗄️ add-supabase-service.md
Supabase servis fonksiyonları ekleme rehberi, CRUD template'leri ve örnekler.

**Ne zaman kullanılır:**
- Yeni Supabase servisi eklerken
- CRUD işlemleri oluştururken
- Storage işlemleri için
- RPC fonksiyonları çağrılırken

**Örnek kullanım:**
```
Claude, ürünler için CRUD servisleri ekle
Claude, dosya yükleme fonksiyonu ekle
```

## Skill Kullanımı

### Claude Code ile Skill Kullanma

Skill'ler otomatik olarak Claude Code tarafından yüklenir. Sadece görevinizi açıklayın, Claude uygun skill'i kullanarak size yardımcı olur.

**Örnek:**
```
# Otomatik skill seçimi
Kullanıcı: "Yeni bir etkinlik listesi komponenti ekle"
Claude: add-component.md skill'ini kullanarak component oluşturur

Kullanıcı: "Etkinlikler için CRUD işlemleri ekle"
Claude: add-supabase-service.md skill'ini kullanarak servis oluşturur
```

### Manuel Skill Referansı

Specific bir skill'e referans vermek isterseniz:

```
Claude, add-component.md skill'ine göre bir button komponenti oluştur
```

## Skill Geliştirme

### Yeni Skill Ekleme

1. `.claude/skills/` dizininde yeni bir `.md` dosyası oluşturun
2. Açıklayıcı bir başlık ve içerik ekleyin
3. Template'ler ve örnekler dahil edin
4. README.md'ye yeni skill'i ekleyin

### Skill Template

```markdown
# [Skill Name]

[Skill açıklaması]

## Ne Zaman Kullanılır

- [Kullanım senaryosu 1]
- [Kullanım senaryosu 2]

## Template

[Code veya yapı template'i]

## Örnekler

[Gerçek örnekler]

## Best Practices

[En iyi pratikler]

## Checklist

- [ ] [Kontrol maddesi 1]
- [ ] [Kontrol maddesi 2]

## Kaynaklar

- [İlgili dokümantasyon linkleri]
```

## Önerilen Workflow

### 1. Yeni Feature Geliştirme

```
1. project-info.md ile proje yapısını kontrol et
2. add-component.md ile gerekli bileşenleri oluştur
3. add-supabase-service.md ile backend servisleri ekle
4. Test et ve commit et
```

### 2. Bug Fix

```
1. project-info.md ile ilgili bölümü bul
2. Mevcut kodu incele
3. Fix'i uygula (ilgili skill kullanarak)
4. Test et ve commit et
```

### 3. Refactoring

```
1. Mevcut kodu oku
2. project-info.md standartlarını kontrol et
3. İlgili skill'leri kullanarak refactor et
4. Test et ve commit et
```

## Tips & Tricks

### Hızlı Referans

**Component eklemek için:**
```
Claude, [component-name] için bir React komponenti oluştur
```

**Supabase servisi eklemek için:**
```
Claude, [entity-name] için CRUD servisleri ekle
```

**Proje bilgisi için:**
```
Claude, [feature] nasıl implemente edilmiş?
```

### Kombinasyon Kullanımı

Birden fazla skill'i birlikte kullanabilirsiniz:

```
Claude, etkinlikler için hem komponenti hem de Supabase servislerini oluştur
```

Claude otomatik olarak her iki skill'i de kullanarak:
1. Supabase servislerini oluşturur (add-supabase-service.md)
2. React komponentini oluşturur (add-component.md)
3. Servisleri komponent içinde kullanır

## Proje Standartları Hatırlatıcısı

Tüm skill'ler aşağıdaki proje standartlarını takip eder:

✅ **TypeScript**: Tüm kod TypeScript ile yazılır
✅ **Türkçe**: Yorumlar ve UI metinleri Türkçe
✅ **İngilizce**: Değişken ve fonksiyon isimleri İngilizce
✅ **Type Safety**: Her şey type-safe olmalı
✅ **Error Handling**: Her fonksiyonda error handling
✅ **JSDoc**: Public fonksiyonlar JSDoc ile dokümante edilmeli
✅ **Testing**: Kritik fonksiyonlar test edilmeli

## Katkıda Bulunma

Yeni skill eklemek veya mevcut skill'leri geliştirmek için:

1. Skill'i `.claude/skills/` dizinine ekleyin
2. README.md'yi güncelleyin
3. Pull request oluşturun

## Sorun Giderme

### Skill Çalışmıyor

1. Dosyanın `.claude/skills/` dizininde olduğunu kontrol edin
2. Dosya adının `.md` uzantılı olduğunu kontrol edin
3. Markdown formatının doğru olduğunu kontrol edin

### Skill Güncellemesi

Skill'leri güncelledikten sonra Claude otomatik olarak yeni versiyonu kullanacaktır.

## İletişim

Skill'ler hakkında sorularınız için:
- Proje README.md'sini inceleyin
- Proje dokümantasyonunu okuyun (`docs/` dizini)
- Issue oluşturun

## Lisans

Bu skill'ler KafkasDer Panel projesi ile aynı lisans altındadır.
