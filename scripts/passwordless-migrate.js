#!/usr/bin/env node

/**
 * PASSWORDLESS MIGRATION
 * Supabase HTTP SQL API kullanarak migration yapar
 * Service Role Key ile çalışır, database password gerekmez
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_REF = 'idsiiayyvygcgegmqcov';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc2lpYXl5dnlnY2dlZ21xY292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0ODg2MywiZXhwIjoyMDgxOTI0ODYzfQ.Wv-s1d65uagiS6d0SCnfZKL3AGKQJelVWo13x5B4SZ4';

/**
 * HTTP request helper
 */
function makeRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const reqOptions = {
      ...options,
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Supabase SQL API - SQL execute eder
 */
async function executeSqlViaApi(sql) {
  console.log('🔧 SQL API deneniyor (Supabase Labs özelliği)...\n');

  try {
    const response = await makeRequest(
      `${SUPABASE_URL}/rest/v1/rpc/query_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        }
      },
      { sql: sql }
    );

    return JSON.parse(response.data);
  } catch (error) {
    throw new Error(`SQL API failed: ${error.message}`);
  }
}

/**
 * Alternative: Supabase Management API
 * Requires Management API key (farklı key)
 */
async function executeSqlViaManagementApi(sql) {
  const MANAGEMENT_API_KEY = process.env.SUPABASE_MANAGEMENT_API_KEY;

  if (!MANAGEMENT_API_KEY) {
    throw new Error('Management API key not found');
  }

  console.log('🔧 Management API deneniyor...\n');

  try {
    const response = await makeRequest(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MANAGEMENT_API_KEY}`
        }
      },
      { query: sql }
    );

    return JSON.parse(response.data);
  } catch (error) {
    throw new Error(`Management API failed: ${error.message}`);
  }
}

/**
 * Web-based SQL executor
 * Opens browser for user to manually execute
 */
function openBrowserSqlEditor() {
  const exec = require('child_process').exec;
  const dashboardUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql`;

  console.log(`\n🌐 Browser açılıyor: ${dashboardUrl}\n`);

  // Platform'a göre browser aç
  const platform = process.platform;
  let command;

  switch (platform) {
    case 'darwin':
      command = `open "${dashboardUrl}"`;
      break;
    case 'win32':
      command = `start "${dashboardUrl}"`;
      break;
    default:
      command = `xdg-open "${dashboardUrl}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log('⚠️  Browser açılamadı, manuel olarak açın:');
      console.log(`   ${dashboardUrl}\n`);
    }
  });
}

const migrations = [
  'supabase/migrations/20260102_update_file_size_limits.sql',
  'supabase/migrations/20260102_improve_storage_rls_policies.sql'
];

async function runPasswordlessMigration() {
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  🔓 PASSWORDLESS AUTO MIGRATION'.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));

  console.log('\n═'.repeat(70));
  console.log('\n💡 NASIL ÇALIŞIR:\n');
  console.log('   Bu script 3 yöntem dener:\n');
  console.log('   1️⃣  Supabase SQL API (Rest API)');
  console.log('   2️⃣  Supabase Management API');
  console.log('   3️⃣  Browser-based (Manuel kopyala-yapıştır)\n');
  console.log('═'.repeat(70));

  // Tüm migration SQL'lerini oku
  const migrationContents = [];

  for (const migrationFile of migrations) {
    const migrationPath = path.resolve(process.cwd(), migrationFile);

    if (!fs.existsSync(migrationPath)) {
      console.log(`\n⚠️  Dosya bulunamadı: ${migrationFile}`);
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    migrationContents.push({
      file: migrationFile,
      name: path.basename(migrationFile, '.sql'),
      sql: sql
    });
  }

  console.log(`\n📦 ${migrationContents.length} migration bulundu\n`);

  // Yöntem 1: SQL API dene
  console.log('═'.repeat(70));
  console.log('\n🔧 YÖNTEM 1: Supabase SQL API\n');

  let apiSuccess = false;

  for (const migration of migrationContents) {
    console.log(`📦 ${migration.name}...`);

    try {
      await executeSqlViaApi(migration.sql);
      console.log('✅ Başarılı!\n');
      apiSuccess = true;
    } catch (error) {
      console.log(`❌ Hata: ${error.message}\n`);
      apiSuccess = false;
      break;
    }
  }

  if (apiSuccess) {
    console.log('\n🎉 Tüm migration\'lar API ile başarılı!\n');
    console.log('═'.repeat(70));
    return;
  }

  // Yöntem 2: Management API dene
  console.log('═'.repeat(70));
  console.log('\n🔧 YÖNTEM 2: Supabase Management API\n');

  if (process.env.SUPABASE_MANAGEMENT_API_KEY) {
    let mgmtSuccess = false;

    for (const migration of migrationContents) {
      console.log(`📦 ${migration.name}...`);

      try {
        await executeSqlViaManagementApi(migration.sql);
        console.log('✅ Başarılı!\n');
        mgmtSuccess = true;
      } catch (error) {
        console.log(`❌ Hata: ${error.message}\n`);
        mgmtSuccess = false;
        break;
      }
    }

    if (mgmtSuccess) {
      console.log('\n🎉 Tüm migration\'lar Management API ile başarılı!\n');
      console.log('═'.repeat(70));
      return;
    }
  } else {
    console.log('⚠️  Management API key bulunamadı, atlanıyor...\n');
  }

  // Yöntem 3: Browser-based (fallback)
  console.log('═'.repeat(70));
  console.log('\n🌐 YÖNTEM 3: Browser-Based (Yarı-Otomatik)\n');
  console.log('   API erişimi yok, browser\'da açılacak.\n');

  console.log('📋 ADIMLAR:\n');
  console.log('   1. Browser SQL Editor açılacak');
  console.log('   2. Her migration için SQL gösterilecek');
  console.log('   3. Kopyala → Yapıştır → Run\n');

  // readline ile kullanıcıdan onay al
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  for (let i = 0; i < migrationContents.length; i++) {
    const migration = migrationContents[i];

    console.log('─'.repeat(70));
    console.log(`\n📦 Migration ${i + 1}/${migrationContents.length}: ${migration.name}\n`);

    console.log('📝 SQL:\n');
    console.log('─'.repeat(70));
    console.log(migration.sql);
    console.log('─'.repeat(70));

    await new Promise(resolve => {
      rl.question('\n✅ SQL kopyalandı mı? [y/n] ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          if (i === 0) {
            // İlk migration için browser aç
            openBrowserSqlEditor();
          }
          resolve();
        } else {
          console.log('❌ İptal edildi.');
          process.exit(0);
        }
      });
    });
  }

  rl.close();

  console.log('\n═'.repeat(70));
  console.log('\n🎉 TÜM MIGRATION SQL\'LERİ GÖSTERİLDİ!\n');
  console.log('   Dashboard SQL Editor\'de çalıştırıldıysa migration tamamdır.\n');
  console.log('═'.repeat(70));
}

// Run
runPasswordlessMigration().catch(error => {
  console.error('\n💥 Unhandled error:', error);
  process.exit(1);
});
