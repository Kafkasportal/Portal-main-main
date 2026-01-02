#!/bin/bash

# ============================================
# Supabase Migration Runner Script
# ============================================
# Bu script migration'ları Supabase Dashboard'a
# kolayca kopyalamanız için hazırlar
# ============================================

echo ""
echo "🗄️  SUPABASE MIGRATION RUNNER"
echo "============================================================"
echo ""

# Migration dosyalarını kontrol et
MIGRATION_DIR="supabase/migrations"
MIGRATION_1="$MIGRATION_DIR/20260102_update_file_size_limits.sql"
MIGRATION_2="$MIGRATION_DIR/20260102_improve_storage_rls_policies.sql"

if [ ! -f "$MIGRATION_1" ]; then
  echo "❌ Migration 1 bulunamadı: $MIGRATION_1"
  exit 1
fi

if [ ! -f "$MIGRATION_2" ]; then
  echo "❌ Migration 2 bulunamadı: $MIGRATION_2"
  exit 1
fi

echo "✅ Migration dosyaları bulundu"
echo ""
echo "📋 ADIM 1: Supabase Dashboard'a git"
echo "   https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/sql"
echo ""
echo "============================================================"
echo ""
echo "📦 MIGRATION 1: File Size Limits (10MB)"
echo ""
echo "Aşağıdaki SQL'i kopyalayın ve Dashboard SQL Editor'e yapıştırın:"
echo ""
echo "---[ SQL BAŞLANGIÇ ]---"
cat "$MIGRATION_1"
echo "---[ SQL BİTİŞ ]---"
echo ""
echo "============================================================"
echo ""
echo "🔐 MIGRATION 2: Storage RLS Policies"
echo ""
echo "Aşağıdaki SQL'i kopyalayın ve Dashboard SQL Editor'e yapıştırın:"
echo ""
echo "---[ SQL BAŞLANGIÇ ]---"
cat "$MIGRATION_2"
echo "---[ SQL BİTİŞ ]---"
echo ""
echo "============================================================"
echo ""
echo "✅ HER İKİ MIGRATION'I DA ÇALIŞTIRDIKTAN SONRA:"
echo ""
echo "   1. Storage bucket file size limit'i manuel ayarlayın:"
echo "      Dashboard → Storage → documents → Settings → 10485760"
echo ""
echo "   2. Test edin:"
echo "      npm run dev"
echo "      # 10MB dosya yüklemeyi deneyin"
echo ""
echo "============================================================"
echo ""
