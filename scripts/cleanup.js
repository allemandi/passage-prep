#!/usr/bin/env node

/**
 * Cleanup Script
 * 
 * This script kills any processes running on ports 3000 and 3001 
 * to ensure a clean environment before starting the development servers
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('Cleaning up any processes running on development ports...');

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

try {
  if (isWindows) {
    // Windows command to find and kill processes by port
    try {
      const findPort3000 = execSync('netstat -ano | findstr :3000').toString();
      if (findPort3000) {
        const lines = findPort3000.split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[4];
            console.log(`Killing process ${pid} on port 3000`);
            execSync(`taskkill /F /PID ${pid}`);
          }
        });
      }
    } catch (e) {
      // If the port is not in use, the command will fail - that's ok
      console.log('No processes running on port 3000');
    }

    try {
      const findPort3001 = execSync('netstat -ano | findstr :3001').toString();
      if (findPort3001) {
        const lines = findPort3001.split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[4];
            console.log(`Killing process ${pid} on port 3001`);
            execSync(`taskkill /F /PID ${pid}`);
          }
        });
      }
    } catch (e) {
      console.log('No processes running on port 3001');
    }
  } else if (isMac || isLinux) {
    // Mac/Linux command to find and kill processes by port
    try {
      console.log('Checking port 3000...');
      const findPort3000 = execSync(`lsof -i :3000 -t`).toString();
      if (findPort3000.trim()) {
        console.log(`Killing processes on port 3000: ${findPort3000.trim()}`);
        execSync(`kill -9 ${findPort3000.trim()}`);
      }
    } catch (e) {
      console.log('No processes running on port 3000');
    }

    try {
      console.log('Checking port 3001...');
      const findPort3001 = execSync(`lsof -i :3001 -t`).toString();
      if (findPort3001.trim()) {
        console.log(`Killing processes on port 3001: ${findPort3001.trim()}`);
        execSync(`kill -9 ${findPort3001.trim()}`);
      }
    } catch (e) {
      console.log('No processes running on port 3001');
    }
  } else {
    console.log('Unsupported platform for port cleanup');
  }

  console.log('Cleanup completed');
} catch (error) {
  console.error('Error during cleanup:', error);
} 