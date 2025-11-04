const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    
    // Log connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;

  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS Error: Cannot resolve MongoDB hostname');
      console.error('   Check your MONGODB_URI in .env file');
      console.error('   Make sure your internet connection is stable\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication Error');
      console.error('   Check username and password in MONGODB_URI\n');
    } else if (error.message.includes('timed out')) {
      console.error('\n💡 Timeout Error');
      console.error('   1. Check your internet connection');
      console.error('   2. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)');
      console.error('   3. Try using MongoDB Compass to test connection\n');
    }

    console.error('Exiting process...\n');
    process.exit(1);
  }
};

module.exports = connectDB();