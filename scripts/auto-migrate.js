#!/usr/bin/env node

/**
 * Supabase Auto Migration Script
 * PostgreSQL direkt bağlantı ile migration'ları otomatik çalıştırır
 */

const { Client } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

// Supabase connection parameters
const SUPABASE_PROJECT_REF = 'idsiiayyvygcgegmqcov';
const SUPABASE_REGION = 'eu-central-1';

// Environment variables'dan password al
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

// Connection string oluştur
const connectionConfig = {
  host: `aws-0-${SUPABASE_REGION}.pooler.supabase.com`,
  port: 6543,
  database: 'postgres',
  user: `postgres.${SUPABASE_PROJECT_REF}`,
  password: DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};

const migrations = [
  'supabase/migrations/20260102_update_file_size_limits.sql',
  'supabase/migrations/20260102_improve_storage_rls_policies.sql'
];

function checkPasswordOrExit() {
  if (!DB_PASSWORD) {
    console.log('\n❌ HATA: Database password bulunamadı!\n');
    console.log('🔑 Password almak için:\n');
    console.log('1. Supabase Dashboard → Settings → Database');
    console.log('2. "Database password" bölümünden reset edin');
    console.log('3. Password\'u kopyalayın\n');
    console.log('💡 Çalıştırma:\n');
    console.log('   SUPABASE_DB_PASSWORD="your-password" node scripts/auto-migrate.js\n');
    console.log('='.repeat(70));
    process.exit(1);
  }
}

async function executeMigration(client, migrationFile, index, total) {
  const migrationPath = path.resolve(process.cwd(), migrationFile);

  console.log('='.repeat(70));
  console.log(`\n📦 Migration ${index + 1}/${total}: ${path.basename(migrationFile)}\n`);

  if (!fs.existsSync(migrationPath)) {
    console.log(`❌ Dosya bulunamadı: ${migrationPath}`);
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📝 SQL Preview:');
  console.log(sql.split('\n').slice(0, 5).join('\n') + '...\n');

  try {
    console.log('⚙️  Çalıştırılıyor...');
    await client.query(sql);
    console.log('✅ Migration başarılı!');
    return true;
  } catch (error) {
    console.log('❌ Migration hatası:', error.message);

    if (error.code) {
      console.log('   Error Code:', error.code);
    }
    if (error.position) {
      console.log('   Position:', error.position);
    }

    // Constraint zaten varsa devam et
    if (error.code === '42710' || error.message.includes('already exists')) {
      console.log('⚠️  Already exists - devam ediliyor...');
      return true;
    }
    throw error;
  }
}

async function runMigrations() {
  console.log('\n🚀 Supabase Auto Migration\n');
  console.log('='.repeat(70));

  checkPasswordOrExit();

  const client = new Client(connectionConfig);

  try {
    console.log('\n🔌 PostgreSQL bağlantısı kuruluyor...');
    console.log(`   Host: ${connectionConfig.host}`);
    console.log(`   Database: ${connectionConfig.database}`);
    console.log(`   User: ${connectionConfig.user}`);

    await client.connect();
    console.log('✅ Bağlantı başarılı!\n');

    // Migration'ları çalıştır
    for (let i = 0; i < migrations.length; i++) {
      await executeMigration(client, migrations[i], i, migrations.length);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 TÜM MIGRATION\'LAR TAMAMLANDI!\n');

    // Verification
    console.log('🔍 Doğrulama:\n');

    // Check constraint
    const constraintCheck = await client.query(`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name = 'documents_file_size_check'
    `);

    if (constraintCheck.rows.length > 0) {
      console.log('✅ File size constraint:');
      console.log(`   ${constraintCheck.rows[0].check_clause}`);
    }

    // Check policies
    const policiesCheck = await client.query(`
      SELECT policyname
      FROM pg_policies
      WHERE tablename = 'objects'
      AND schemaname = 'storage'
      ORDER BY policyname
    `);

    if (policiesCheck.rows.length > 0) {
      console.log('\n✅ Storage RLS Policies:');
      policiesCheck.rows.forEach(row => {
        console.log(`   - ${row.policyname}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n💡 SONRAKI ADIMLAR:\n');
    console.log('1. Storage bucket file size limit\'i ayarlayın:');
    console.log('   Dashboard → Storage → documents → Settings → 10485760\n');
    console.log('2. Test edin:');
    console.log('   npm run dev\n');
    console.log('='.repeat(70));

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('\n❌ HATA:', error.message);
    console.log('\n' + '='.repeat(70));
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Bağlantı kapatıldı.\n');
  }
}

// Run with top-level await
try {
  await runMigrations();
} catch (error) {
  console.error(error);
  process.exit(1);
}
