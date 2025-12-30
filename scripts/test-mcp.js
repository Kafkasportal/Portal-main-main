#!/usr/bin/env node

/**
 * Test Render MCP Server connectivity
 */

const https = require('https');

const RENDER_API_KEY = process.env.RENDER_API_KEY || 'rnd_cuuDUZBE2PfSw4iG4Kb32xSagQHI';

// Test basic connectivity to Render API
const testRenderAPI = () => {
  console.log('🔍 Testing Render API connectivity...\n');

  const options = {
    hostname: 'api.render.com',
    path: '/v1/services',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RENDER_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`\n📊 Response:`);
        console.log(`- Found ${response.length || 0} services`);

        if (response.length > 0) {
          console.log('📋 Your services:');
          response.slice(0, 3).forEach((service, index) => {
            console.log(`  ${index + 1}. ${service.name} (${service.type}) - ${service.serviceDetails?.url || 'No URL'}`);
          });
          if (response.length > 3) {
            console.log(`  ... and ${response.length - 3} more`);
          }
        }

        console.log('\n✅ Render API is accessible! MCP integration should work.');
        console.log('\n💡 You can now use these commands in your AI assistant:');
        console.log('   - "Set my Render workspace to Kafkasportal"');
        console.log('   - "List my Render services"');
        console.log('   - "Show details for [service-name]"');

      } catch (error) {
        console.log('\n⚠️  Response received but not valid JSON:');
        console.log(data.substring(0, 200) + (data.length > 200 ? '...' : ''));
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Request failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Render API key is correct');
    console.log('3. Ensure the API key has proper permissions');
  });

  req.setTimeout(10000, () => {
    console.log('⏱️  Request timed out (10s)');
    req.abort();
  });

  req.end();
};

// Run the test
console.log('🧪 Render MCP Integration Test\n');
console.log(`🔑 Using API Key: ${RENDER_API_KEY.substring(0, 10)}...${RENDER_API_KEY.substring(RENDER_API_KEY.length - 4)}\n`);
testRenderAPI();