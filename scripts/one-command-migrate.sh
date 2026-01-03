#!/bin/bash

# ============================================
# ONE COMMAND MIGRATION
# Supabase CLI kullanarak tek komutta migration
# ============================================

set -e

echo ""
echo "██████████████████████████████████████████████████████████████████████"
echo "█                                                                    █"
echo "█  🚀 ONE COMMAND AUTO MIGRATION                                     █"
echo "█                                                                    █"
echo "██████████████████████████████████████████████████████████████████████"
echo ""

PROJECT_REF="idsiiayyvygcgegmqcov"
SUPABASE_CONFIG=".supabase"

# Check if project is already linked
if [ -d "$SUPABASE_CONFIG" ] && [ -f "$SUPABASE_CONFIG/config.toml" ]; then
  echo "✅ Supabase project zaten linked"
  echo ""
else
  echo "🔗 Supabase project linking..."
  echo ""
  echo "⚠️  Database password gerekli:"
  echo "   1. https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
  echo "   2. 'Database password' → 'Reset database password'"
  echo "   3. Yeni password'u kopyalayın"
  echo "   4. Aşağıya yapıştırın"
  echo ""

  npx supabase link --project-ref "$PROJECT_REF"

  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Link başarısız. Password doğru mu kontrol edin."
    echo ""
    exit 1
  fi

  echo ""
  echo "✅ Project başarıyla linked!"
  echo ""
fi

echo "══════════════════════════════════════════════════════════════════════"
echo ""
echo "📦 Migration'lar çalıştırılıyor..."
echo ""

# Push all migrations
npx supabase db push

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Migration başarısız!"
  echo ""
  echo "💡 Troubleshooting:"
  echo "   - Password expired olabilir, tekrar reset edin"
  echo "   - Migration zaten çalıştırılmış olabilir (normal)"
  echo "   - Dashboard'da manuel kontrol edin"
  echo ""
  exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ MIGRATION TAMAMLANDI!"
echo ""
echo "🔍 Doğrulama:"
echo ""

# Test connection
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
if [ -z "$ANON_KEY" ]; then
  echo "   ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not set, skipping test"
else
  node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://$PROJECT_REF.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('documents')
    .select('id')
    .limit(1);

  if (error && error.code !== 'PGRST116') {
    console.log('   ⚠️  documents tablosu: ' + error.message);
  } else {
    console.log('   ✅ Database bağlantısı OK');
  }

  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('   ✅ Storage buckets: ' + (buckets?.length || 0));
}

test().catch(e => console.log('   ❌ Test hatası:', e.message));
  " 2>/dev/null || echo "   ⚠️  Node.js test atlandı"
fi

echo ""
echo "══════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 SONRAKI ADIMLAR:"
echo ""
echo "   1. Storage bucket file size limit ayarla (manuel):"
echo "      Dashboard → Storage → documents → Settings → 10485760"
echo ""
echo "   2. Dev server test et:"
echo "      npm run dev"
echo ""
echo "   3. 10MB dosya yüklemeyi dene"
echo ""
echo "══════════════════════════════════════════════════════════════════════"
echo ""
