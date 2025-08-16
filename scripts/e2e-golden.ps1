$ErrorActionPreference = "Stop"
Write-Host "▶ Golden Path"

# Generate test signal
node -e @"
const fs = require('fs');
const N = 2048;
const sr = 1024;
const f = 123.5;
const x = Array.from({length: N}, (_, n) => 
  Math.sin(2 * Math.PI * f * n / sr) + 0.3 * (Math.random() * 2 - 1)
);
fs.mkdirSync('.nps', { recursive: true });
fs.writeFileSync('.nps/signal.json', JSON.stringify({ sampleRateHz: sr, signal: x }));
"@

# Run the analysis
node -e @"
import('./dist/index.js').then(m => {
  if (!m.analyzeSignal) throw new Error('analyzeSignal not found in module exports');
  const fs = require('fs');
  const input = JSON.parse(fs.readFileSync('.nps/signal.json', 'utf8'));
  const result = m.analyzeSignal(input);
  fs.writeFileSync('.nps/out.json', JSON.stringify(result, null, 2));
  console.log('✅ Analysis complete');
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
"@

# Verify and show output
if (!(Test-Path ".nps/out.json")) { 
  Write-Error "No output file generated"; 
  exit 1 
}
Write-Host "✅ Output:"; 
Get-Content .nps/out.json | Select-Object -First 20
