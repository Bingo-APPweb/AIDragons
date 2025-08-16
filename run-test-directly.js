const { exec } = require('child_process');
const fs = require('fs');

console.log('Running test directly...');

// Create a simple test file
const testFile = 'direct-test.js';
const testContent = `
// Simple test
test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});
`;

fs.writeFileSync(testFile, testContent);
console.log('Created test file:', testFile);

// Run the test
console.log('Running test with Jest...');
const jestProcess = exec('npx jest --no-cache', (error, stdout, stderr) => {
  console.log('Test output:');
  console.log(stdout);
  
  if (stderr) {
    console.error('Error output:');
    console.error(stderr);
  }
  
  if (error) {
    console.error('Test failed:', error);
  } else {
    console.log('Test completed successfully');
  }
  
  // Clean up
  try {
    fs.unlinkSync(testFile);
    console.log('Cleaned up test file');
  } catch (e) {
    console.error('Error cleaning up:', e.message);
  }
});

// Log output as it happens
jestProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

jestProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});
