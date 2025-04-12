#!/bin/bash

echo "Bible Study App Server Verification"
echo "=================================="

# Check if the document directory exists
if [ ! -d "public/document" ]; then
  echo "ERROR: Document directory is missing!"
  echo "Creating document directory..."
  mkdir -p public/document
fi

# Check for Questions.csv
if [ ! -f "public/document/Questions.csv" ]; then
  echo "ERROR: Questions.csv is missing!"
  echo "Creating placeholder Questions.csv..."
  echo "Theme,Question,Subcategory" > public/document/Questions.csv
  echo "Faith,What is faith?,General" >> public/document/Questions.csv
fi

# Check for Books.csv
if [ ! -f "public/document/Books.csv" ]; then
  echo "ERROR: Books.csv is missing!"
  echo "Creating placeholder Books.csv..."
  echo "Index,Book,Author,Context" > public/document/Books.csv
  echo "1,Genesis,Moses,The beginning of everything" >> public/document/Books.csv
fi

# Check file permissions
chmod -R 755 public/document
echo "File permissions updated for document directory"

# Check for node_modules
if [ ! -d "node_modules" ]; then
  echo "ERROR: node_modules is missing!"
  echo "Running yarn install..."
  yarn install
fi

# Check if server is running
SERVER_PID=$(lsof -i:3001 -t)
if [ -z "$SERVER_PID" ]; then
  echo "Server is not running"
  echo "Starting server..."
  yarn server &
  sleep 2
else
  echo "Server is running (PID: $SERVER_PID)"
  
  # Test if server is responding
  echo "Testing server health..."
  RESPONSE=$(curl -s http://localhost:3001/api/health)
  if [[ $RESPONSE == *"OK"* ]]; then
    echo "Server health check passed!"
  else
    echo "Server health check failed!"
    echo "Restarting server..."
    kill $SERVER_PID
    yarn server &
    sleep 2
  fi
fi

echo ""
echo "Verification complete!"
echo "If you're having issues:"
echo "1. Make sure both the React app (port 3000) and server (port 3001) are running"
echo "2. Check that Questions.csv is writable (run: chmod 666 public/document/Questions.csv)"
echo "3. Try running the app with: ./run.sh"

echo ""
echo "To manually test question saving, you can run:"
echo "curl -X POST http://localhost:3001/api/save-question -H \"Content-Type: application/json\" -d '{\"file\":\"/document/Questions.csv\",\"newData\":{\"Theme\":\"Test\",\"Question\":\"Is this working?\",\"Subcategory\":\"General\"}}'" 