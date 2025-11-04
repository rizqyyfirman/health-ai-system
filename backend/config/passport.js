const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// WHITELIST EMAIL DEVELOPER
// Ganti dengan email Google Anda!
const DEVELOPER_EMAILS = [
  'rizqyfirmansyah565@gmail.com',  // GANTI INI!
  'hafizhammr18@gmail.com',  // Tambahkan email lain jika perlu
  'pratamaayudistiraa@gmail.com'
];

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? 'https://https://fresh-areas-design.loca.lt/auth/google/callback'
      : '/auth/google/callback',  // Relative URL untuk dev
    proxy: true,  // TAMBAHKAN INI
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Cek apakah user sudah ada
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update data jika sudah ada
        user.name = profile.displayName;
        user.picture = profile.photos[0]?.value || user.picture;
        user.email = email;
        
        // Update role jika email ada di whitelist
        if (DEVELOPER_EMAILS.includes(email)) {
          user.role = 'developer';
        }
        
        await user.save();
      } else {
        // Buat user baru
        const role = DEVELOPER_EMAILS.includes(email) ? 'developer' : 'user';
        
        user = await User.create({
          googleId: profile.id,
          email: email,
          name: profile.displayName,
          picture: profile.photos[0]?.value || null,
          role: role
        });
        
        console.log(`✅ New ${role} registered:`, email);
      }

      return done(null, user);
    } catch (error) {
      console.error('Passport error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('🔐 Deserializing user:', id);
    
    // ALWAYS fetch fresh data from database
    const user = await User.findById(id).maxTimeMS(10000);
    
    if (!user) {
      console.log('❌ User not found in database');
      return done(new Error('User not found'), null);
    }
    
    console.log('✅ User deserialized:', {
      name: user.name,
      email: user.email,
      umur: user.umur,
      tinggiBadan: user.tinggiBadan,
      beratBadan: user.beratBadan,
      isProfileComplete: user.isProfileComplete
    });
    
    done(null, user);
  } catch (error) {
    console.error('❌ Deserialize error:', error.message);
    done(error, null);
  }
});

module.exports = passport;