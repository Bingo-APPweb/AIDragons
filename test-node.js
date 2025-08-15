// Simple test to verify Node.js is working
console.log('=== Node.js Test ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test basic JavaScript
const sum = (a, b) => a + b;
console.log('1 + 2 =', sum(1, 2));

// Test file system access
const fs = require('fs');
try {
  const testFile = 'test-file.txt';
  fs.writeFileSync(testFile, 'test content');
  console.log('Successfully wrote to file');
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('File content:', content);
  fs.unlinkSync(testFile);
  console.log('Test file removed');
} catch (error) {
  console.error('File system error:', error.message);
}

console.log('=== Test Complete ===');
