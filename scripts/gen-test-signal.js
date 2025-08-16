// This script generates a test signal and saves it to a file for cross-verification
const fs = require('fs');
const path = require('path');

function generateTestSignal() {
  const N = 2048;  // FFT size
  const sr = 1024;  // Sample rate (Hz)
  const f = 123.5;  // Test frequency (Hz)
  const noiseLevel = 0.3;  // Noise amplitude
  
  // Generate the test signal
  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / sr;
    const clean = Math.sin(2 * Math.PI * f * t);
    const noise = (Math.random() * 2 - 1) * noiseLevel;
    return clean + noise;
  });
  
  // Save to a file that can be read by both Node.js and Python
  const output = {
    signal,
    metadata: { sampleRate: sr, frequency: f, noiseLevel, length: N }
  };
  
  const outputPath = path.join(__dirname, '..', 'test-signal.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Test signal saved to ${outputPath}`);
  
  return output;
}

// If run directly, generate the signal
if (require.main === module) {
  generateTestSignal();
}

module.exports = { generateTestSignal };
