// Simple test to verify basic JavaScript functionality
const sum = (a, b) => a + b;

console.log('Running test...');
console.log('1 + 2 =', sum(1, 2));

if (sum(1, 2) === 3) {
  console.log('✅ Test passed!');
  process.exit(0);
} else {
  console.error('❌ Test failed!');
  process.exit(1);
}
