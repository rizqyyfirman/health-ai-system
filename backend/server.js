require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ============================================
// 1. DATABASE CONNECTION
// ============================================
require('./config/database');

// ============================================
// 2. MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  rolling: true, // TAMBAHKAN INI - refresh session on every request
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ============================================
// 3. PASSPORT AUTHENTICATION
// ============================================
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

console.log('✅ Passport initialized');

// ============================================
// 4. MQTT CLIENT
// ============================================
const mqttClient = require('./services/mqttClient');

mqttClient.setDataCallback((data) => {
  console.log('📊 MQTT callback:', data);
});

console.log('✅ MQTT client initialized');

// ============================================
// 5. SOCKET.IO
// ============================================
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
  }
});

global.io = io;

io.on('connection', (socket) => {
  console.log('✅ Socket client connected:', socket.id);

  const latestData = mqttClient.getLatestData();
  if (latestData) {
    socket.emit('sensor-data', latestData);
    console.log('📤 Sent latest data to client');
  }

  socket.on('disconnect', () => {
    console.log('❌ Socket client disconnected:', socket.id);
  });
});

console.log('✅ Socket.IO initialized');

// ============================================
// 6. STATIC FILES
// ============================================
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================
// 7. AUTH ROUTES (MUST BE BEFORE OTHER ROUTES!)
// ============================================
app.use('/auth', require('./routes/auth'));
console.log('✅ Auth routes registered: /auth/*');

// ============================================
// 8. API ROUTES
// ============================================
app.use('/api/users', require('./routes/users'));
app.use('/api/health', require('./routes/health'));
app.use('/api/profile', require('./routes/profile'));

console.log('✅ API routes registered:');
console.log('   - /api/users');
console.log('   - /api/health');
console.log('   - /api/profile');

// ============================================
// 9. PAGE ROUTES
// ============================================

// Root - Login page
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - AI Health Monitor</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #8b9aee 0%, #9370c9 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        body::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: backgroundMove 20s linear infinite;
        }
        @keyframes backgroundMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        .login-container {
          background: white;
          padding: 60px 50px;
          border-radius: 30px;
          text-align: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.3);
          max-width: 480px;
          width: 100%;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo {
          font-size: 80px;
          margin-bottom: 20px;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        h1 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 32px;
          font-weight: 800;
        }
        .subtitle {
          color: #6b7280;
          margin-bottom: 40px;
          font-size: 15px;
          line-height: 1.6;
        }
        .btn-google {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 18px 40px;
          border: none;
          border-radius: 15px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-google:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }
        .features {
          margin-top: 40px;
          text-align: left;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 25px;
          border-radius: 20px;
          border: 2px solid #bae6fd;
        }
        .features h3 {
          font-size: 15px;
          color: #0c4a6e;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .features ul {
          list-style: none;
          padding: 0;
        }
        .features li {
          font-size: 13px;
          color: #075985;
          padding: 10px 0;
          padding-left: 30px;
          position: relative;
          line-height: 1.5;
        }
        .features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #0ea5e9;
          font-weight: bold;
          font-size: 18px;
        }
        .google-icon { width: 24px; height: 24px; }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="logo">🏥</div>
        <h1>AI Health Monitor</h1>
        <p class="subtitle">Sistem Monitoring Kesehatan Cerdas<br>dengan Teknologi Artificial Intelligence</p>
        
        <a href="/auth/google" class="btn-google">
          <svg class="google-icon" viewBox="0 0 24 24" fill="white">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </a>

        <div class="features">
          <h3>✨ Fitur Unggulan:</h3>
          <ul>
            <li>Real-time monitoring Vital Sign dilengkapi dengan GPS tracking</li>
            <li>Membantu mendiagnosa dengan menggunakan Artificial Intelligent</li>
            <li>Referensi jurnal medis peer-reviewed</li>
            <li>Peta sebaran penyakit interaktif untuk Developer</li>
            <li>Riwayat pemeriksaan lengkap dengan analisis</li>
            <li>Rekomendasi kesehatan yang personal</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Dashboard - REDIRECT BERDASARKAN ROLE
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/?error=not_authenticated');
  }

  // Developer → dashboard khusus
  if (req.user.role === 'developer') {
    return res.sendFile(path.join(__dirname, '../frontend/developer-dashboard.html'));
  }

  // User biasa → dashboard user
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// HAPUS route /map karena sudah integrated di developer dashboard

// Edit Profile
app.get('/edit-profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/?error=not_authenticated');
  }
  res.sendFile(path.join(__dirname, '../frontend/edit-profile.html'));
});

// ============================================
// 10. 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// ============================================
// 11. ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// 12. START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 Login Page:', `http://localhost:${PORT}`);
  console.log('🔗 Dashboard:', `http://localhost:${PORT}/dashboard`);
  console.log('🔗 Map:', `http://localhost:${PORT}/map`);
  console.log('🚀 ================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mqttClient.disconnect();
    process.exit(0);
  });
});