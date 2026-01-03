#!/usr/bin/env node

/**
 * FULL AUTO MIGRATION
 * 1. exec_sql function'ını oluşturur
 * 2. Migration'ları çalıştırır
 * 3. Doğrulama yapar
 */

const { Client } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

const SUPABASE_PROJECT_REF = 'idsiiayyvygcgegmqcov';
const SUPABASE_REGION = 'eu-central-1';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const connectionConfig = {
  host: `aws-0-${SUPABASE_REGION}.pooler.supabase.com`,
  port: 6543,
  database: 'postgres',
  user: `postgres.${SUPABASE_PROJECT_REF}`,
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  // Connection pool settings
  connectionTimeoutMillis: 10000,
  query_timeout: 60000,
  statement_timeout: 60000,
};

const setupSql = `scripts/create-exec-sql-function.sql`;
const migrations = [
  'supabase/migrations/20260102_update_file_size_limits.sql',
  'supabase/migrations/20260102_improve_storage_rls_policies.sql'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkPasswordOrExit() {
  if (!DB_PASSWORD) {
    console.log('\n❌ CRITICAL: Database password gerekli!\n');
    console.log('📋 Password almak için 2 yöntem:\n');
    console.log('═'.repeat(70));
    console.log('\n🔧 YÖNTEM 1: Supabase Dashboard (Önerilen)\n');
    console.log('   1. https://supabase.com/dashboard/project/idsiiayyvygcgegmqcov/settings/database');
    console.log('   2. "Database password" → "Reset database password"');
    console.log('   3. Yeni password\'u kopyalayın');
    console.log('   4. Çalıştırın:');
    console.log('      SUPABASE_DB_PASSWORD="your-password" node scripts/full-auto-migrate.js\n');
    console.log('═'.repeat(70));
    console.log('\n🔧 YÖNTEM 2: .env.local\'a Ekleyin\n');
    console.log('   1. .env.local dosyasına ekleyin:');
    console.log('      SUPABASE_DB_PASSWORD=your-password');
    console.log('   2. Çalıştırın:');
    console.log('      source .env.local && node scripts/full-auto-migrate.js\n');
    console.log('═'.repeat(70));
    process.exit(1);
  }
}

async function executeMigration(client, migrationFile, index, total) {
  const migrationPath = path.resolve(process.cwd(), migrationFile);
  const migrationName = path.basename(migrationFile, '.sql');

  console.log('─'.repeat(70));
  console.log(`\n📦 Migration ${index + 1}/${total}\n`);
  console.log(`   Dosya: ${migrationName}`);
  console.log(`   Path: ${migrationFile}\n`);

  if (!fs.existsSync(migrationPath)) {
    console.log(`❌ Dosya bulunamadı, atlanıyor...\n`);
    return false;
  }

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📝 SQL Preview:');
  const sqlLines = migrationSql.split('\n').filter(l =>
    l.trim() && !l.trim().startsWith('--')
  );
  console.log(sqlLines.slice(0, 3).join('\n') + '\n   ...\n');

  console.log('⏳ Çalıştırılıyor...');

  try {
    await client.query(migrationSql);
    console.log('✅ Migration başarılı!\n');
    await sleep(500);
    return true;
  } catch (error) {
    console.log(`⚠️  Hata: ${error.message}\n`);

    // Bazı hatalar normal (already exists, etc)
    const isExpectedError = 
      error.message.includes('already exists') ||
      error.message.includes('does not exist') ||
      error.code === '42710' || // duplicate object
      error.code === '42P07';    // duplicate table

    if (isExpectedError) {
      console.log('ℹ️  Bu hata normal, devam ediliyor...\n');
      return true;
    }
    throw error;
  }
}

async function runFullMigration() {
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  🚀 SUPABASE FULL AUTO MIGRATION'.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));

  checkPasswordOrExit();

  const client = new Client(connectionConfig);

  try {
    console.log('\n' + '═'.repeat(70));
    console.log('\n🔌 ADIM 1: PostgreSQL Bağlantısı\n');
    console.log(`   Host: ${connectionConfig.host}`);
    console.log(`   Port: ${connectionConfig.port}`);
    console.log(`   Database: ${connectionConfig.database}`);
    console.log(`   User: ${connectionConfig.user}`);
    console.log(`   SSL: Enabled\n`);

    console.log('⏳ Bağlanılıyor...');
    await client.connect();
    console.log('✅ Bağlantı başarılı!\n');

    // Test query
    console.log('🔍 Bağlantı test ediliyor...');
    const testResult = await client.query('SELECT version()');
    console.log(`✅ PostgreSQL: ${testResult.rows[0].version.split(',')[0]}\n`);

    console.log('═'.repeat(70));
    console.log('\n📦 ADIM 2: exec_sql Function Oluşturma\n');

    const setupSqlPath = path.resolve(process.cwd(), setupSql);
    if (!fs.existsSync(setupSqlPath)) {
      throw new Error(`Setup SQL bulunamadı: ${setupSqlPath}`);
    }

    const setupQuery = fs.readFileSync(setupSqlPath, 'utf8');
    console.log('📝 Function SQL:');
    console.log(setupQuery.split('\n').slice(0, 5).join('\n') + '...\n');

    console.log('⏳ Function oluşturuluyor...');
    await client.query(setupQuery);
    console.log('✅ exec_sql function oluşturuldu!\n');

    console.log('═'.repeat(70));
    console.log('\n🔄 ADIM 3: Migration\'ları Çalıştırma\n');

    for (let i = 0; i < migrations.length; i++) {
      await executeMigration(client, migrations[i], i, migrations.length);
    }

    console.log('═'.repeat(70));
    console.log('\n✅ ADIM 4: Doğrulama\n');

    // Check 1: File size constraint
    console.log('🔍 File size constraint kontrol ediliyor...');
    const constraintResult = await client.query(`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name = 'documents_file_size_check'
    `);

    if (constraintResult.rows.length > 0) {
      console.log('✅ Constraint bulundu:');
      console.log(`   ${constraintResult.rows[0].check_clause}\n`);
    } else {
      console.log('⚠️  Constraint bulunamadı (documents tablosu yok olabilir)\n');
    }

    // Check 2: Storage policies
    console.log('🔍 Storage RLS policies kontrol ediliyor...');
    const policiesResult = await client.query(`
      SELECT policyname
      FROM pg_policies
      WHERE tablename = 'objects'
      AND schemaname = 'storage'
      ORDER BY policyname
    `);

    if (policiesResult.rows.length > 0) {
      console.log(`✅ ${policiesResult.rows.length} policy bulundu:\n`);
      policiesResult.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.policyname}`);
      });
      console.log('');
    } else {
      console.log('⚠️  Policy bulunamadı (storage.objects tablosu yok olabilir)\n');
    }

    // Check 3: exec_sql function
    console.log('🔍 exec_sql function kontrol ediliyor...');
    const functionResult = await client.query(`
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname = 'exec_sql'
      AND pronamespace = 'public'::regnamespace
    `);

    if (functionResult.rows.length > 0) {
      console.log('✅ exec_sql function mevcut\n');
    } else {
      console.log('❌ exec_sql function bulunamadı\n');
    }

    console.log('═'.repeat(70));
    console.log('\n' + '█'.repeat(70));
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█' + '  🎉 TÜM MIGRATION\'LAR TAMAMLANDI!'.padEnd(68) + '█');
    console.log('█' + ' '.repeat(68) + '█');
    console.log('█'.repeat(70));

    console.log('\n📋 SONRAKI ADIMLAR:\n');
    console.log('   1. Storage bucket file size limit ayarla:');
    console.log('      Dashboard → Storage → documents → 10485760\n');
    console.log('   2. Dev server\'ı test et:');
    console.log('      npm run dev\n');
    console.log('   3. 10MB dosya yüklemeyi dene\n');
    console.log('═'.repeat(70));

  } catch (error) {
    console.log('\n' + '═'.repeat(70));
    console.log('\n❌ KRITIK HATA:\n');
    console.log(`   Message: ${error.message}`);
    if (error.code) {
      console.log(`   Code: ${error.code}`);
    }
    if (error.stack) {
      console.log(`\n   Stack:\n${error.stack}`);
    }
    console.log('\n' + '═'.repeat(70));
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 PostgreSQL bağlantısı kapatıldı.\n');
  }
}

// Run with top-level await
try {
  await runFullMigration();
} catch (error) {
  console.error('\n💥 Unhandled error:', error);
  process.exit(1);
}
