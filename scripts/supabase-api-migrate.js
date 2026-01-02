#!/usr/bin/env node

/**
 * Supabase API Migration Script
 * Management API kullanarak SQL çalıştırır
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://idsiiayyvygcgegmqcov.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0ODg2MywiZXhwIjoyMDgxOTI0ODYzfQ.Wv-s1d65uagiS6d0SCnfZKL3AGKQJelVWo13x5B4SZ4';

const migrations = [
  'supabase/migrations/20260102_update_file_size_limits.sql',
  'supabase/migrations/20260102_improve_storage_rls_policies.sql'
];

/**
 * Supabase REST API üzerinden SQL çalıştırır
 */
async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return await response.json();
}

/**
 * PostgREST kullanarak SQL çalıştırır (alternatif)
 */
async function executeViaPgRest(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`   ${statements.length} SQL statement bulundu\n`);

  const results = [];
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;

    console.log(`   [${i + 1}/${statements.length}] Çalıştırılıyor...`);

    try {
      // Her statement'ı ayrı çalıştır
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

      // Raw SQL execute etmeyi dene
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: stmt + ';'
      });

      if (error) {
        // RPC yoksa exception fırlat
        if (error.code === '42883') {
          throw new Error('exec_sql RPC function not found');
        }
        throw error;
      }

      results.push({ success: true, statement: i + 1 });
      console.log(`   ✅ Statement ${i + 1} başarılı`);
    } catch (err) {
      console.log(`   ⚠️  Statement ${i + 1}: ${err.message}`);
      results.push({ success: false, statement: i + 1, error: err.message });
    }
  }

  return results;
}

async function runMigrations() {
  console.log('\n🚀 Supabase API Migration\n');
  console.log('='.repeat(70));

  try {
    console.log('\n🔌 Supabase bağlantısı test ediliyor...');
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Auth: Service Role Key\n`);

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('beneficiaries')
      .select('id')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      console.log('❌ Bağlantı hatası:', testError.message);
      throw testError;
    }

    console.log('✅ Bağlantı başarılı!\n');

    // Migration'ları çalıştır
    for (let i = 0; i < migrations.length; i++) {
      const migrationFile = migrations[i];
      const migrationPath = path.resolve(process.cwd(), migrationFile);

      console.log('='.repeat(70));
      console.log(`\n📦 Migration ${i + 1}/${migrations.length}: ${path.basename(migrationFile)}\n`);

      if (!fs.existsSync(migrationPath)) {
        console.log(`❌ Dosya bulunamadı: ${migrationPath}`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');

      console.log('📝 SQL Preview:');
      const lines = sql.split('\n').filter(l => l.trim() && !l.trim().startsWith('--'));
      console.log(lines.slice(0, 3).join('\n') + '\n   ...\n');

      console.log('⚙️  Çalıştırılıyor...\n');

      try {
        const results = await executeViaPgRest(sql);

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        console.log(`\n   ✅ Başarılı: ${successCount}`);
        if (failCount > 0) {
          console.log(`   ⚠️  Hatalı: ${failCount}`);
        }

      } catch (error) {
        console.log(`\n❌ Migration hatası: ${error.message}\n`);

        if (error.message.includes('exec_sql RPC function not found')) {
          console.log('⚠️  UYARI: Supabase REST API ile DDL execute desteklenmiyor!\n');
          console.log('💡 Çözüm: PostgreSQL direkt bağlantı gerekli\n');
          console.log('🔧 Seçenekler:');
          console.log('   1. Database password alın ve auto-migrate.js kullanın');
          console.log('   2. exec_sql() RPC function oluşturun (admin gerekir)');
          console.log('   3. Supabase CLI kullanın: npx supabase db push\n');

          // exec_sql function oluşturma kodu göster
          console.log('📝 exec_sql function oluşturmak için:\n');
          console.log('   -- Dashboard SQL Editor\'de çalıştırın:');
          console.log('   CREATE OR REPLACE FUNCTION exec_sql(sql text)');
          console.log('   RETURNS void AS $$');
          console.log('   BEGIN');
          console.log('     EXECUTE sql;');
          console.log('   END;');
          console.log('   $$ LANGUAGE plpgsql SECURITY DEFINER;\n');

          return;
        }

        throw error;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 İŞLEM TAMAMLANDI!\n');
    console.log('='.repeat(70));

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('\n❌ HATA:', error.message);
    console.log('\n' + '='.repeat(70));
    process.exit(1);
  }
}

// Run
runMigrations().catch(console.error);
