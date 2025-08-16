// Simple test runner to verify Jest functionality
const { exec } = require('child_process');
const path = require('path');

console.log('=== Test Runner ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Platform:', process.platform);

// Create a simple test file
const testFile = path.join(__dirname, 'temp-test.js');
const testCode = `
// Simple test
const sum = (a, b) => a + b;

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
`;

require('fs').writeFileSync(testFile, testCode);
console.log('\nCreated test file:', testFile);

// Run the test with Jest
console.log('\nRunning test with Jest...');
const jestPath = path.join(__dirname, 'node_modules', '.bin', 'jest');
const jest = exec(`"${jestPath}" ${testFile} --no-cache`, (error, stdout, stderr) => {
  console.log('\nTest output:');
  console.log(stdout);
  
  if (error) {
    console.error('Error running test:', error);
  }
  
  if (stderr) {
    console.error('Test errors:', stderr);
  }
  
  // Clean up
  try {
    require('fs').unlinkSync(testFile);
  } catch (e) {
    console.error('Error cleaning up:', e.message);
  }
});

jest.stdout.on('data', (data) => {
  console.log(data.toString());
});

jest.stderr.on('data', (data) => {
  console.error(data.toString());
});
