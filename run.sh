#!/bin/bash

# Setup trap for cleanup on exit
cleanup() {
  echo "Shutting down..."
  # Kill any background processes from this script
  pkill -P $$
  exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup INT TERM

# Install dependencies if they don't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  yarn install
fi

# Ensure the document directory exists in public
if [ ! -d "public/document" ]; then
  echo "Creating document directory..."
  mkdir -p public/document
  
  # Check if the document directory exists at the project root
  if [ -d "../document" ]; then
    echo "Copying CSV files from parent directory..."
    cp -r ../document/* public/document/
  else
    echo "Document directory not found at project root. You'll need to add the CSV files manually."
    
    # Create placeholder CSV files if needed
    echo "Theme,Question,Subcategory" > public/document/Questions.csv
    echo "Index,Book,Author,Context" > public/document/Books.csv
  fi
fi

# Check for missing document files
if [ ! -f "public/document/Questions.csv" ]; then
  echo "Questions.csv not found, creating placeholder..."
  echo "Theme,Question,Subcategory" > public/document/Questions.csv
fi

if [ ! -f "public/document/Books.csv" ]; then
  echo "Books.csv not found, creating placeholder..."
  echo "Index,Book,Author,Context" > public/document/Books.csv
fi

# Make script files executable
chmod +x run.sh
chmod +x scripts/*.js

# Run cleanup first to kill any existing processes
echo "Cleaning up any lingering processes..."
node scripts/cleanup.js

# Start the development environment
echo "Starting development environment with improved signal handling..."
exec node scripts/start-dev.js 