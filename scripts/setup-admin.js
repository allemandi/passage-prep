const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../models/Admin');

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'bible_study_app'
    });
    console.log('MongoDB connected successfully');

    // Check environment variables
    const adminUsername = process.env.ADMINUSER;
    const adminPassword = process.env.ADMINPASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('ADMINUSER and ADMINPASSWORD must be set in environment variables');
      process.exit(1);
    }

    // Check if admin with this username exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    
    if (!existingAdmin) {
      // Create new admin
      const newAdmin = new Admin({
        username: adminUsername,
        password: adminPassword // Will be hashed by the pre-save middleware
      });

      await newAdmin.save();
      console.log('Admin user created successfully');
    } else {
      // Update existing admin's password if needed
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('Admin credentials updated successfully');
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();