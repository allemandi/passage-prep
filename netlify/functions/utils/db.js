const mongoose = require('mongoose');
require('dotenv').config();

// Cache database connection
let cachedDb = null;

// Connect to MongoDB
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Get the MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MongoDB URI not found in environment variables');
  }

  // Connect to the database
  const client = await mongoose.connect(MONGODB_URI, {
    dbName: 'bible_study_app',
    serverSelectionTimeoutMS: 5000
  });

  console.log('MongoDB connected successfully');
  
  cachedDb = client;
  return client;
}

module.exports = { connectToDatabase }; 