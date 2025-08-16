// Simple script to check Node.js environment
console.log('=== Node.js Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PATH:', process.env.PATH ? 'Set' : 'Not set');

// Test file system access
const fs = require('fs');
try {
  const files = fs.readdirSync('.');
  console.log('\nFiles in current directory:', files.length, 'items');
} catch (err) {
  console.error('Error reading directory:', err.message);
}

// Test module loading
try {
  const path = require('path');
  console.log('\nPath module loaded successfully');
  console.log('Current file:', path.basename(__filename));
} catch (err) {
  console.error('Error loading path module:', err.message);
}
