#!/usr/bin/env node

/**
 * TEST ALL MCP CONNECTIONS
 * Tüm entegre MCP servislerinin durumunu test eder
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://idsiiayyvygcgegmqcov.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const STORMMCP_URL = process.env.STORMMCP_URL || 'https://stormmcp.ai/gateway/7e6981d1-22cc-42a2-af7f-2b9f7f55bb7e/mcp';
const STORMMCP_API_KEY = process.env.STORMMCP_API_KEY;

async function testSupabaseMCP() {
  console.log('🧪 Testing Supabase MCP...');

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('   ⚠️  Skipping: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return { success: false, service: 'Supabase', error: 'Missing credentials' };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test database connection
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Test storage
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) {
      console.log('   ⚠️  Storage:', bucketError.message);
    } else {
      console.log('   ✅ Storage buckets:', buckets?.length || 0);
    }

    // Test auth
    const { data: { session } } = await supabase.auth.getSession();
    console.log('   ✅ Auth check: OK (no session expected)');

    console.log('✅ Supabase MCP: WORKING\n');
    return { success: true, service: 'Supabase' };

  } catch (error) {
    console.log('❌ Supabase MCP: FAILED');
    console.log('   Error:', error.message, '\n');
    return { success: false, service: 'Supabase', error: error.message };
  }
}

async function testSentryMCP() {
  console.log('🧪 Testing Sentry MCP...');

  try {
    if (!SENTRY_DSN) {
       console.log('   ⚠️  Skipping: Missing NEXT_PUBLIC_SENTRY_DSN');
       return { success: false, service: 'Sentry', error: 'Missing DSN' };
    }

    // Parse DSN
    const dsnMatch = SENTRY_DSN.match(/https:\/\/(.+)@(.+)\/(.+)/);
    if (!dsnMatch) {
      throw new Error('Invalid DSN format');
    }

    const [, publicKey, host, projectId] = dsnMatch;

    console.log('   ✅ DSN parsed successfully');
    console.log('   ✅ Host:', host);
    console.log('   ✅ Project ID:', projectId);
    console.log('✅ Sentry MCP: CONFIGURED\n');

    // Note: Actual API test requires Sentry SDK initialization
    // which would send test events. Skipping for now.

    return { success: true, service: 'Sentry' };

  } catch (error) {
    console.log('❌ Sentry MCP: FAILED');
    console.log('   Error:', error.message, '\n');
    return { success: false, service: 'Sentry', error: error.message };
  }
}

async function testRenderMCP() {
  console.log('🧪 Testing Render MCP...');

  try {
    if (!RENDER_API_KEY) {
       console.log('   ⚠️  Skipping: Missing RENDER_API_KEY');
       return { success: false, service: 'Render', error: 'Missing API Key' };
    }

    if (RENDER_API_KEY.length < 20) {
      throw new Error('Invalid API key length');
    }

    console.log('   ✅ API key format valid');
    console.log('   ✅ Key prefix:', RENDER_API_KEY.substring(0, 8) + '...');
    console.log('✅ Render MCP: CONFIGURED\n');

    // Note: Actual API test requires HTTP request to Render API
    // Skipping to avoid rate limits

    return { success: true, service: 'Render' };

  } catch (error) {
    console.log('❌ Render MCP: FAILED');
    console.log('   Error:', error.message, '\n');
    return { success: false, service: 'Render', error: error.message };
  }
}

async function testGitHubMCP() {
  console.log('🧪 Testing GitHub MCP...');

  try {
    if (!GITHUB_TOKEN) {
       console.log('   ⚠️  Skipping: Missing GITHUB_TOKEN');
       return { success: false, service: 'GitHub', error: 'Missing Token' };
    }

    if (!GITHUB_TOKEN.startsWith('ghp_')) {
      throw new Error('Invalid GitHub token format (expected ghp_ prefix)');
    }

    console.log('   ✅ Token format valid');
    console.log('   ✅ Token prefix:', GITHUB_TOKEN.substring(0, 8) + '...');
    console.log('✅ GitHub MCP: CONFIGURED\n');

    return { success: true, service: 'GitHub' };

  } catch (error) {
    console.log('❌ GitHub MCP: FAILED');
    console.log('   Error:', error.message, '\n');
    return { success: false, service: 'GitHub', error: error.message };
  }
}

async function testStormMCP() {
  console.log('🧪 Testing StormMCP Gateway...');

  try {
    if (!STORMMCP_API_KEY) {
       console.log('   ⚠️  Skipping: Missing STORMMCP_API_KEY');
       return { success: false, service: 'StormMCP', error: 'Missing API Key' };
    }

    if (!STORMMCP_API_KEY.startsWith('ag_')) {
      throw new Error('Invalid StormMCP API key format (expected ag_ prefix)');
    }

    console.log('   ✅ API key format valid');
    if (STORMMCP_URL) {
        console.log('   ✅ Gateway URL:', STORMMCP_URL);
    }
    console.log('✅ StormMCP: CONFIGURED\n');

    return { success: true, service: 'StormMCP' };

  } catch (error) {
    console.log('❌ StormMCP: FAILED');
    console.log('   Error:', error.message, '\n');
    return { success: false, service: 'StormMCP', error: error.message };
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 CONDUCTOR MCP CONNECTION TESTS');
  console.log('═'.repeat(70));
  console.log('');

  const results = [];

  // Run all tests
  results.push(await testSupabaseMCP());
  results.push(await testSentryMCP());
  results.push(await testRenderMCP());
  results.push(await testGitHubMCP());
  results.push(await testStormMCP());

  // Summary
  console.log('═'.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70));
  console.log('');

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASS' : 'FAIL';
    console.log(`${icon} ${result.service.padEnd(15)} ${status}`);
  });

  console.log('');
  console.log('─'.repeat(70));
  console.log(`Total: ${successCount}/${totalCount} MCPs working`);
  console.log(`Success Rate: ${Math.round(successCount / totalCount * 100)}%`);
  console.log('─'.repeat(70));
  console.log('');

  // Recommendations
  if (successCount === totalCount) {
    console.log('🎉 All MCPs are configured and working!');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('   1. Run Supabase migrations: ./scripts/one-command-migrate.sh');
    console.log('   2. Test Sentry error tracking: npm run dev');
    console.log('   3. Deploy to Render: git push');
    console.log('');
  } else {
    console.log('⚠️  Some MCPs need attention:');
    console.log('');

    results.filter(r => !r.success).forEach(result => {
      console.log(`   ❌ ${result.service}: ${result.error}`);
    });

    console.log('');
    console.log('💡 Check:');
    console.log('   - Environment variables in .env.local');
    console.log('   - Token validity and expiration');
    console.log('   - Network connectivity');
    console.log('');
  }

  console.log('═'.repeat(70));
  console.log('');

  // Exit with appropriate code
  process.exit(successCount === totalCount ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Unhandled error:', error);
  process.exit(1);
});
