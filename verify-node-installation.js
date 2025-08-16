// Simple script to verify Node.js installation
console.log('=== Node.js Installation Check ===');

// Basic system info
console.log('\n[1/4] System Information:');
console.log(`- Node.js version: ${process.version}`);
console.log(`- Platform: ${process.platform} (${process.arch})`);
console.log(`- Current directory: ${process.cwd()}`);

// Check file system access
console.log('\n[2/4] Checking file system access...');
try {
  const fs = require('fs');
  const path = require('path');
  const testFile = path.join(process.cwd(), 'test-file.txt');
  
  // Test write access
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ Successfully wrote to file system');
  
  // Test read access
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ Successfully read from file system');
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ Successfully cleaned up test file');
} catch (error) {
  console.error('❌ Error accessing file system:', error.message);
}

// Check environment variables
console.log('\n[3/4] Checking environment variables...');
const envVars = ['PATH', 'NODE_PATH', 'NVM_HOME', 'NVM_SYMLINK'];
let hasMissingVars = false;

envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`⚠️  ${envVar}: Not set`);
    hasMissingVars = true;
  }
});

// Simple test function
console.log('\n[4/4] Running test function...');
try {
  const sum = (a, b) => a + b;
  const result = sum(1, 2);
  console.log(`✅ Test function executed successfully: 1 + 2 = ${result}`);
} catch (error) {
  console.error('❌ Error running test function:', error.message);
}

console.log('\n=== Check complete ===');
