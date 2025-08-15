const { exec } = require('child_process');

// Test basic command execution
console.log('Testing command execution...');

exec('echo Hello, World!', (error, stdout, stderr) => {
  console.log('Command output:');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
  if (error) {
    console.error('Error:', error);
  }
});
