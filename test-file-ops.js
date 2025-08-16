const fs = require('fs');
const path = require('path');

// Test file operations
console.log('Testing file operations...');
const testFile = path.join(__dirname, 'test-file.txt');

// Write to a file
try {
  fs.writeFileSync(testFile, 'Test content');
  console.log('✅ Successfully wrote to file');
  
  // Read from the file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ Successfully read from file. Content:', content);
  
  // Delete the file
  fs.unlinkSync(testFile);
  console.log('✅ Successfully deleted test file');
} catch (error) {
  console.error('❌ Error during file operations:', error.message);
}
