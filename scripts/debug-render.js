#!/usr/bin/env node

/**
 * Render Environment Debug Script
 * This script logs information about the build environment to help debug deployment issues
 */

console.log('🔍 Render Environment Debug Information');
console.log('=====================================');

// Log environment information
console.log('📦 Node Version:', process.version);
console.log('🏃 Platform:', process.platform);
console.log('📂 Working Directory:', process.cwd());

// Log environment variables that might affect build
console.log('\n🔧 Build Environment Variables:');
const relevantEnvVars = [
    'NODE_ENV',
    'RENDER',
    'RENDER_SERVICE_TYPE',
    'RENDER_SERVICE_NAME',
    'RENDER_GIT_COMMIT',
    'RENDER_GIT_BRANCH',
    'CI',
    'BUILD_DIR',
    'PUBLISH_DIR',
    'NEXT_PUBLIC_APP_NAME'
];

relevantEnvVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  ${varName}: ${value || 'undefined'}`);
});

// Check for Next.js configuration
console.log('\n📄 Next.js Configuration Check:');
try {
    const nextConfigPath = './next.config.ts';
    const fs = require('fs');
    if (fs.existsSync(nextConfigPath)) {
        console.log('✅ next.config.ts found');
        // Read and check for output configuration
        const content = fs.readFileSync(nextConfigPath, 'utf8');
        if (content.includes("output: 'standalone'")) {
            console.log('✅ Standalone output mode configured');
        } else {
            console.log('⚠️ Standalone output mode not found in config');
        }
    } else {
        console.log('❌ next.config.ts not found');
    }
} catch (error) {
    console.log('❌ Error checking Next.js config:', error.message);
}

// Check for package.json and build scripts
console.log('\n📦 Package.json Check:');
try {
    const packageJsonPath = './package.json';
    const fs = require('fs');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log('✅ package.json found');
        console.log('  Name:', packageJson.name);
        console.log('  Build Script:', packageJson.scripts?.build || 'undefined');
        console.log('  Start Script:', packageJson.scripts?.start || 'undefined');
    } else {
        console.log('❌ package.json not found');
    }
} catch (error) {
    console.log('❌ Error checking package.json:', error.message);
}

// Check current directory structure
console.log('\n📁 Directory Structure:');
try {
    const fs = require('fs');
    const files = fs.readdirSync('./');
    console.log('Root directory contents:');
    files.forEach(file => {
        const stats = fs.statSync(file);
        const type = stats.isDirectory() ? '📁' : '📄';
        console.log(`  ${type} ${file}`);
    });
} catch (error) {
    console.log('❌ Error reading directory:', error.message);
}

console.log('\n🎯 Expected Behavior for Next.js Standalone:');
console.log('  - Build should create .next/ directory');
console.log('  - Start command should run "next start"');
console.log('  - No publishDirectory should be configured');
console.log('  - Service type should be "web" with runtime "node"');

console.log('\n🐛 Troubleshooting Tips:');
console.log('  1. Verify service is configured as "web" type, not "static"');
console.log('  2. Remove any publishDirectory setting from Render dashboard');
console.log('  3. Ensure buildCommand is "npm ci && npm run build"');
console.log('  4. Ensure startCommand is "npm start"');

console.log('\n✨ Debug information collection complete!');