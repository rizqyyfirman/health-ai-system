require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 Testing MongoDB Connection...\n');
console.log('MONGODB_URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
console.log('Timeout: 30 seconds\n');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Connected');
  console.log('Host:', mongoose.connection.host);
  console.log('Database:', mongoose.connection.name);
  console.log('Ready state:', mongoose.connection.readyState);
  console.log('\n✅ Your MongoDB connection is working!\n');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ FAILED! Connection Error:');
  console.error('Error:', error.message);
  
  if (error.message.includes('ENOTFOUND')) {
    console.error('\n💡 Cannot resolve MongoDB hostname');
    console.error('   Solutions:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MONGODB_URI in .env is correct');
    console.error('   3. Try ping: ping cluster0.xxxxx.mongodb.net\n');
  } else if (error.message.includes('authentication')) {
    console.error('\n💡 Authentication failed');
    console.error('   Solutions:');
    console.error('   1. Check username in MONGODB_URI');
    console.error('   2. Check password in MONGODB_URI');
    console.error('   3. Reset password in MongoDB Atlas\n');
  } else if (error.message.includes('timed out')) {
    console.error('\n💡 Connection timed out');
    console.error('   Solutions:');
    console.error('   1. Whitelist your IP in MongoDB Atlas');
    console.error('   2. Allow 0.0.0.0/0 in Network Access');
    console.error('   3. Check firewall settings\n');
  }
  
  process.exit(1);
});

setTimeout(() => {
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Connection timeout after 30 seconds');
    console.error('\nTroubleshooting:');
    console.error('1. Is your internet working?');
    console.error('2. Can you access https://cloud.mongodb.com?');
    console.error('3. Is 0.0.0.0/0 whitelisted in MongoDB Atlas?');
    process.exit(1);
  }
}, 30000);