const { exec } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 5000;

console.log('🔍 Checking port', PORT, '...');

const isWindows = os.platform() === 'win32';

const killCommand = isWindows
  ? `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do @taskkill /PID %a /F`
  : `lsof -ti:${PORT} | xargs kill -9`;

// Kill process di port
exec(killCommand, (error, stdout, stderr) => {
  if (error && !error.message.includes('not found')) {
    console.log('⚠️ No process to kill or already clean');
  } else {
    console.log('✅ Port', PORT, 'cleared');
  }

  // Start server
  console.log('🚀 Starting server...\n');
  
  const server = require('./server.js');
});