// Simple script to check if console output works
const fs = require('fs');

console.log('=== Console Output Test ===');
console.log('Current directory:', process.cwd());
console.log('Node.js version:', process.version);

// Try writing to a file to check file system access
const testFilePath = 'test-output.txt';
fs.writeFileSync(testFilePath, 'Test content', 'utf8');
console.log(`Test file written to: ${testFilePath}`);

// Try reading the file back
const content = fs.readFileSync(testFilePath, 'utf8');
console.log('File content:', content);

// Clean up
fs.unlinkSync(testFilePath);
console.log('Test file removed');

console.log('=== Test Complete ===');
