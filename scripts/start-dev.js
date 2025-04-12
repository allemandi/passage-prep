#!/usr/bin/env node

/**
 * Development Environment Starter
 * This script runs both the React development server and Express API server
 * with proper signal handling to ensure clean shutdown on Ctrl+C
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('=== Starting Development Environment ==='));

// First, run the cleanup script to kill any lingering processes
console.log(chalk.yellow('Running cleanup to kill any processes on ports 3000/3001...'));
try {
  execSync('node ' + path.join(__dirname, 'cleanup.js'), { stdio: 'inherit' });
} catch (error) {
  console.error(chalk.red('Error during cleanup:'), error);
  // Continue anyway
}

// Create an array to store all child processes
const processes = [];

// Function to kill all processes
const killAllProcesses = () => {
  console.log(chalk.yellow('\nShutting down all processes...'));
  processes.forEach(proc => {
    if (!proc.killed) {
      proc.kill();
    }
  });
};

// Handle termination signals
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    console.log(chalk.red(`\nReceived ${signal}. Initiating shutdown...`));
    killAllProcesses();
    // Allow some time for graceful shutdown before forcing exit
    setTimeout(() => {
      console.log(chalk.red('Forcing exit...'));
      process.exit(0);
    }, 1000);
  });
});

// Start the React development server
console.log(chalk.cyan('Starting React development server...'));
const reactProcess = spawn('node', 
  [path.join(__dirname, 'react-start.js')], 
  { stdio: 'inherit' }
);
processes.push(reactProcess);

console.log(chalk.green('React development server started'));

// A small delay to make sure React starts first
setTimeout(() => {
  // Start the Express server
  console.log(chalk.cyan('Starting Express server...'));
  const serverProcess = spawn('node', 
    [path.join(__dirname, 'server-start.js')], 
    { stdio: 'inherit' }
  );
  processes.push(serverProcess);

  console.log(chalk.green('Express server started'));

  // Handle server process exit events
  serverProcess.on('exit', (code, signal) => {
    handleProcessExit('Express server', serverProcess, code, signal);
  });
}, 2000);

// Handle process exit events
const handleProcessExit = (name, proc, code, signal) => {
  if (signal) {
    console.log(chalk.yellow(`${name} was terminated by signal: ${signal}`));
  } else if (code !== 0) {
    console.error(chalk.red(`${name} exited with error code: ${code}`));
    // If one process exits with error, kill the other processes
    killAllProcesses();
    process.exit(1);
  } else {
    console.log(chalk.yellow(`${name} exited normally`));
    // If one process exits normally, kill the other processes too
    killAllProcesses();
    process.exit(0);
  }
};

reactProcess.on('exit', (code, signal) => {
  handleProcessExit('React development server', reactProcess, code, signal);
}); 