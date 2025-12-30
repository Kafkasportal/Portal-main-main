#!/usr/bin/env node

/**
 * MCP (Model Context Protocol) Management Script for Kafkasder Panel
 * 
 * This script helps manage MCP server configurations for the project.
 * It supports multiple AI development environments including Cursor, VS Code, Claude Desktop, etc.
 */

const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

const projectRoot = join(__dirname, '..');

// Configuration templates for different MCP servers
const mcpConfigs = {
  cursor: {
    file: '.cursor/mcp.json',
    template: {
      mcpServers: {
        render: {
          url: 'https://mcp.render.com/mcp',
          headers: {
            'Authorization': 'Bearer ${RENDER_API_KEY}'
          }
        },
        github: {
          url: 'https://mcp.github.com',
          headers: {
            'Authorization': 'Bearer ${GITHUB_TOKEN}'
          }
        }
      }
    }
  },
  vscode: {
    file: '.vscode/settings.json',
    template: {
      'chat.mcp.discovery.enabled': {
        'claude-desktop': true,
        'windsurf': true,
        'cursor-global': true,
        'cursor-workspace': true
      },
      'chat.mcp.access': 'all',
      'chat.mcp.servers': {
        render: {
          url: 'https://mcp.render.com/mcp',
          headers: {
            'Authorization': 'Bearer ${RENDER_API_KEY}'
          }
        }
      }
    }
  }
};

// Environment variables required for MCP
const requiredEnvVars = [
  { name: 'RENDER_API_KEY', description: 'Render API Key for infrastructure management' },
  { name: 'GITHUB_TOKEN', description: 'GitHub Personal Access Token for repository management' },
  { name: 'RENDER_DEFAULT_WORKSPACE', description: 'Default Render workspace', optional: true }
];

/**
 * Check if required environment variables are set
 */
function checkEnvironment() {
  console.log('🔍 Checking MCP environment variables...\n');
  
  const envPath = join(projectRoot, '.env.local');
  let envContent = '';
  
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  }
  
  const missing = [];
  const warnings = [];
  
  for (const envVar of requiredEnvVars) {
    const isSet = process.env[envVar.name] || envContent.includes(`${envVar.name}=`);
    
    if (!isSet) {
      if (envVar.optional) {
        warnings.push(`⚠️  ${envVar.name} - ${envVar.description} (optional)`);
      } else {
        missing.push(`❌ ${envVar.name} - ${envVar.description}`);
      }
    } else {
      console.log(`✅ ${envVar.name} - Set`);
    }
  }
  
  if (warnings.length > 0) {
    console.log('\n📋 Optional variables:');
    warnings.forEach(warning => console.log(warning));
  }
  
  if (missing.length > 0) {
    console.log('\n❌ Missing required environment variables:');
    missing.forEach(missingVar => console.log(missingVar));
    console.log('\n💡 Add these to your .env.local file or system environment variables.');
    return false;
  }
  
  console.log('\n✅ All required MCP environment variables are configured!');
  return true;
}

/**
 * Initialize MCP configuration for a specific IDE
 */
function initMCP(ide) {
  if (!mcpConfigs[ide]) {
    console.error(`❌ Unknown IDE: ${ide}`);
    console.log(`Available IDEs: ${Object.keys(mcpConfigs).join(', ')}`);
    return false;
  }
  
  const config = mcpConfigs[ide];
  const configPath = join(projectRoot, config.file);
  const configDir = dirname(configPath);
  
  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
    console.log(`📁 Created directory: ${configDir}`);
  }
  
  // Handle existing VS Code settings
  if (ide === 'vscode' && existsSync(configPath)) {
    try {
      const existing = JSON.parse(readFileSync(configPath, 'utf8'));
      const merged = { ...existing, ...config.template };
      writeFileSync(configPath, JSON.stringify(merged, null, 2));
      console.log(`✅ Updated MCP configuration: ${config.file}`);
    } catch (error) {
      console.error(`❌ Error updating VS Code settings: ${error.message}`);
      return false;
    }
  } else {
    // Create new configuration
    writeFileSync(configPath, JSON.stringify(config.template, null, 2));
    console.log(`✅ Created MCP configuration: ${config.file}`);
  }
  
  return true;
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
🔧 MCP Management Script for Kafkasder Panel

Usage: node scripts/mcp.js <command> [options]

Commands:
  check     - Check if MCP environment variables are configured
  init      - Initialize MCP configuration for an IDE
            - Options: cursor, vscode
  help      - Show this help message

Examples:
  node scripts/mcp.js check
  node scripts/mcp.js init cursor
  node scripts/mcp.js init vscode

Environment Variables:
  RENDER_API_KEY            - Render API key for infrastructure management
  GITHUB_TOKEN             - GitHub Personal Access Token
  RENDER_DEFAULT_WORKSPACE - Default Render workspace (optional)

More info: docs/RENDER.md
`);
}

// Main execution
const command = process.argv[2];
const option = process.argv[3];

switch (command) {
  case 'check':
    checkEnvironment();
    break;
    
  case 'init':
    if (!option) {
      console.error('❌ Please specify an IDE: cursor, vscode');
      showUsage();
      process.exit(1);
    }
    if (checkEnvironment()) {
      initMCP(option);
    } else {
      console.log('\n💡 Fix environment variables first, then run the init command again.');
    }
    break;
    
  case 'help':
  case '--help':
  case '-h':
  default:
    showUsage();
    break;
}