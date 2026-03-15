const mongoose = require('mongoose');
const Admin = require('../../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- DB Connection ---
let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MongoDB URI not found in environment variables');
    const client = await mongoose.connect(MONGODB_URI, {
        dbName: 'bible_study_app',
        serverSelectionTimeoutMS: 5000
    });
    cachedDb = client;
    return client;
}

async function loginHandler({ username, password }) {
    const admin = await Admin.findOne({ username });
    if (!admin) return { success: false, error: 'Invalid credentials' };
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return { success: false, error: 'Invalid credentials' };
    return { success: true };
}

module.exports = {
    connectToDatabase,
    loginHandler,
};
