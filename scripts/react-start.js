#!/usr/bin/env node

/**
 * React Start Script with proper signal handling
 * This script runs the React development server with improved
 * signal handling to ensure proper shutdown on Ctrl+C
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting React development server with enhanced signal handling...');

// Start the React development server
const reactProcess = spawn('node', 
  [path.join(process.cwd(), 'node_modules', 'react-scripts', 'scripts', 'start.js')], 
  { 
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: 'true',
      PORT: '3000',
      REACT_APP_PORT: '3000',
      // Prevent React from asking to use another port
      BROWSER: 'none',
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
    }
  }
);

// Forward signals to the React process
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}. Shutting down React server...`);
    reactProcess.kill(signal);
  });
});

// Handle child process exit
reactProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`React process terminated due to signal: ${signal}`);
    process.exit(0);
  } else {
    console.log(`React process exited with code: ${code}`);
    process.exit(code);
  }
});

// Handle any errors from the child process
reactProcess.on('error', (err) => {
  console.error('Failed to start React server:', err);
  process.exit(1);
}); 