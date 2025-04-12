const mongoose = require('mongoose');
require('dotenv').config();

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI not found in environment variables. Please check your .env file.');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'bible_study_app'
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Export both the connectDB function and the mongoose instance
connectDB.mongoose = mongoose;
module.exports = connectDB; 