#!/usr/bin/env node

/**
 * Netlify Build Script
 * 
 * This script prepares the application for deployment to Netlify by:
 * 1. Ensuring all dependencies are installed
 * 2. Running ESLint to catch issues
 * 3. Building the React app
 */

const { execSync } = require('child_process');
const path = require('path');

// Helper to run commands
const runCommand = (command, errorMessage) => {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n${errorMessage}\n`);
    process.exit(1);
  }
};

// Main build process
console.log('🚀 Starting Netlify build process...');

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Install dependencies if needed
console.log('📦 Checking for dependencies...');
runCommand('yarn install --frozen-lockfile', 'Failed to install dependencies');

// Run linting
console.log('🔍 Running ESLint...');
try {
  runCommand('yarn eslint src --ext .js,.jsx --max-warnings=0', 'ESLint found issues');
  console.log('✅ ESLint passed');
} catch (error) {
  console.log('⚠️ ESLint warnings found, but continuing build.');
}

// Build the React app with CI=false to prevent warnings from failing the build
console.log('🏗️ Building React app...');
runCommand('CI=false yarn react-scripts build', 'Failed to build React app');

console.log('✨ Build process completed successfully!');
process.exit(0); 