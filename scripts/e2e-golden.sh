#!/bin/bash
set -euo pipefail
echo "▶ Golden Path"

# Generate test signal
node - <<'NODE_SCRIPT'
const fs = require('fs');
const N = 2048;
const sr = 1024;
const f = 123.5;
const x = Array.from({length: N}, (_, n) => 
  Math.sin(2 * Math.PI * f * n / sr) + 0.3 * (Math.random() * 2 - 1)
);
fs.mkdirSync('.nps', { recursive: true });
fs.writeFileSync('.nps/signal.json', JSON.stringify({ sampleRateHz: sr, signal: x }));
NODE_SCRIPT

# Run the analysis
node - <<'NODE_SCRIPT'
import('./dist/index.js').then(async (m) => {
  if (!m.analyzeSignal) throw new Error('analyzeSignal not found in module exports');
  const fs = await import('fs/promises');
  const input = JSON.parse(await fs.readFile('.nps/signal.json', 'utf8'));
  const result = m.analyzeSignal(input);
  await fs.writeFile('.nps/out.json', JSON.stringify(result, null, 2));
  console.log('✅ Analysis complete');
}).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
NODE_SCRIPT

# Verify and show output
if [ ! -f ".nps/out.json" ]; then
  echo "❌ No output file generated"
  exit 1
fi

echo "✅ Output:"
head -n 20 .nps/out.json
