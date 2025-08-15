const fs = require('fs');
const path = require('path');

// Basic system info
console.log('=== System Information ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());

// Check file system access
try {
  const testFile = path.join(process.cwd(), 'test-file.txt');
  fs.writeFileSync(testFile, 'test content');
  console.log('\n✅ Successfully wrote to file system');
  fs.unlinkSync(testFile);
} catch (error) {
  console.error('\n❌ Error writing to file system:', error.message);
}

// Check environment variables
console.log('\n=== Environment Variables ===');
['PATH', 'NODE_PATH', 'NVM_HOME', 'NVM_SYMLINK'].forEach(envVar => {
  console.log(`${envVar}:`, process.env[envVar] || 'Not set');
});

// Simple test function
console.log('\n=== Running Test ===');
const sum = (a, b) => a + b;
console.log('1 + 2 =', sum(1, 2));

console.log('\n=== Test Complete ===');
