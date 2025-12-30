#!/usr/bin/env node

/**
 * Post-build verification script for Render deployment
 * This script verifies that the Next.js build completed successfully
 * and the correct output directories exist
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Next.js build output...');

// Check if .next directory exists (required for standalone builds)
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
    console.error('❌ ERROR: .next directory not found!');
    console.error('This indicates the Next.js build failed or is incomplete.');
    process.exit(1);
}

// Check if standalone directory exists
const standaloneDir = path.join(nextDir, 'standalone');
if (!fs.existsSync(standaloneDir)) {
    console.error('❌ ERROR: .next/standalone directory not found!');
    console.error('This indicates the Next.js standalone build is not configured properly.');
    console.log('💡 Ensure next.config.ts has: output: "standalone"');
    process.exit(1);
}

// Check if server.js exists in standalone
const serverFile = path.join(standaloneDir, 'server.js');
if (!fs.existsSync(serverFile)) {
    console.error('❌ ERROR: .next/standalone/server.js not found!');
    console.error('This indicates the Next.js standalone build is incomplete.');
    process.exit(1);
}

// Log success and useful information
console.log('✅ Next.js build output verified successfully!');
console.log(`📁 Build directory: ${nextDir}`);
console.log(`🚀 Standalone directory: ${standaloneDir}`);
console.log(`💻 Server file: ${serverFile}`);

// List some build artifacts for debugging
try {
    const buildManifest = path.join(nextDir, 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
        console.log('📄 Build manifest found');
    }

    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
        console.log('📁 Static assets directory found');
    }

    const serverDir = path.join(nextDir, 'server');
    if (fs.existsSync(serverDir)) {
        console.log('⚙️ Server directory found');
    }

} catch (error) {
    console.warn('⚠️ Warning: Could not list all build artifacts:', error.message);
}

console.log('\n🎉 Build verification completed successfully!');
console.log('🚀 Ready for Next.js standalone deployment on Render');