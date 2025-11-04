const { isAuthenticated, isProfileComplete, isDeveloper } = require('./middleware/auth');

console.log('Testing middleware imports...\n');

console.log('isAuthenticated:', typeof isAuthenticated);
console.log('isProfileComplete:', typeof isProfileComplete);
console.log('isDeveloper:', typeof isDeveloper);

if (
  typeof isAuthenticated === 'function' &&
  typeof isProfileComplete === 'function' &&
  typeof isDeveloper === 'function'
) {
  console.log('\n✅ All middleware functions imported successfully!');
} else {
  console.log('\n❌ Some middleware functions are missing!');
}