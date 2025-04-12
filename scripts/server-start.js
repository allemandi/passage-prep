#!/usr/bin/env node

/**
 * Express Server Start Script with proper signal handling
 * This script runs the Express server with improved
 * signal handling to ensure proper shutdown on Ctrl+C
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Express server with enhanced signal handling...');

// Start the Express server
const serverProcess = spawn('node', 
  [path.join(process.cwd(), 'server.js')], 
  { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3001',
      // Force port to be 3001
      FORCE_COLOR: 'true'
    }
  }
);

// Forward signals to the server process
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}. Shutting down Express server...`);
    serverProcess.kill(signal);
  });
});

// Handle child process exit
serverProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Express server terminated due to signal: ${signal}`);
    process.exit(0);
  } else {
    console.log(`Express server exited with code: ${code}`);
    process.exit(code);
  }
});

// Handle any errors from the child process
serverProcess.on('error', (err) => {
  console.error('Failed to start Express server:', err);
  process.exit(1);
}); 