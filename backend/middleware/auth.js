// Middleware untuk cek autentikasi
const isAuthenticated = (req, res, next) => {
  console.log('🔐 Auth check - isAuthenticated:', req.isAuthenticated());
  console.log('🔐 User:', req.user?.name, '- Role:', req.user?.role);
  
  if (req.isAuthenticated()) {
    console.log('✅ User authenticated:', req.user?.name);
    return next();
  }
  
  console.log('❌ Not authenticated');
  return res.status(401).json({
    success: false,
    message: 'Not authenticated. Please login first.'
  });
};

// Middleware untuk cek profil lengkap
const isProfileComplete = (req, res, next) => {
  console.log('📋 Profile check for user:', req.user?.name);
  console.log('📋 Profile data:', {
    umur: req.user?.umur,
    tinggiBadan: req.user?.tinggiBadan,
    beratBadan: req.user?.beratBadan,
    isProfileComplete: req.user?.isProfileComplete
  });

  if (!req.user) {
    console.log('❌ No user in request');
    return res.status(401).json({
      success: false,
      message: 'User not found in session'
    });
  }

  // Cek apakah profil lengkap
  if (!req.user.umur || !req.user.tinggiBadan || !req.user.beratBadan) {
    console.log('⚠️ Profile incomplete');
    return res.status(400).json({
      success: false,
      message: 'Profile not complete. Please complete your profile first.',
      redirect: '/edit-profile'
    });
  }

  console.log('✅ Profile complete');
  next();
};

// Middleware untuk cek role developer
const isDeveloper = (req, res, next) => {
  console.log('🔐 Developer check');
  console.log('   User:', req.user?.name);
  console.log('   Role:', req.user?.role);
  
  if (!req.user) {
    console.log('❌ No user in request');
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.role === 'developer') {
    console.log('✅ Developer access granted');
    return next();
  }
  
  console.log('❌ Access denied - Not a developer');
  return res.status(403).json({
    success: false,
    message: 'Access denied. Developer only.',
    currentRole: req.user.role
  });
};

// EXPORT SEMUA MIDDLEWARE
module.exports = {
  isAuthenticated,
  isProfileComplete,
  isDeveloper
};