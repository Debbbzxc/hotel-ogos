const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Do not crash the process immediately in development so the developer has time to configure .env
    console.error('Please configure your MONGODB_URI with the correct password in backend/.env');
  }
};

module.exports = connectDB;
