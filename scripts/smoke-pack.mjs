import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = (cmd, opts={}) => execSync(cmd, { stdio: "pipe", encoding: "utf8", ...opts });

const pkgFile = JSON.parse(run("node -p \"require('./package.json').name\""));
const tar = run("npm pack").trim().split("\n").pop(); // e.g. your-pkg-1.2.3.tgz
const tmp = mkdtempSync(join(tmpdir(), "smoke-"));

console.log("📦 Testing package:", tar);
console.log("📂 Temp directory:", tmp);

// Set up test project
run("npm init -y", { cwd: tmp });
run(`npm i --silent ../${tar}`, { cwd: tmp });

// Expected public API - update this based on your actual exports
const EXPECTED_EXPORTS = [
  // Core functionality
  "FFTWeakSignalDetector",
  "detectWeakSignals",
  "analyzeSignal",
  "findPeaks",
  
  // Types (if using TypeScript with declaration files)
  "FrequencyBin",
  "AnalysisResult",
  "Peak"
];

// Create test file
const test = `
import * as mod from '${pkgFile}';

// Check expected exports
const missing = ${JSON.stringify(EXPECTED_EXPORTS)}.filter(k => !(k in mod));
if (missing.length > 0) {
  console.error('❌ Missing exports:', missing);
  console.log('✅ Found exports:', Object.keys(mod).filter(k => EXPECTED_EXPORTS.includes(k)));
  process.exit(1);
}

// Basic functionality test
try {
  console.log('✅ All exports found:', Object.keys(mod));
  
  // Test basic instantiation if applicable
  if (mod.FFTWeakSignalDetector) {
    const detector = new mod.FFTWeakSignalDetector({ sampleRate: 1000 });
    console.log('✅ FFTWeakSignalDetector instantiated successfully');
  }
  
  console.log('✅ Smoke test passed!');
} catch (error) {
  console.error('❌ Runtime error:', error);
  process.exit(1);
}
`;

writeFileSync(join(tmp, "index.mjs"), test);

// Run the test
try {
  console.log("🚀 Running smoke test...");
  run("node index.mjs", { cwd: tmp, stdio: 'inherit' });
  console.log(`✅ ${pkgFile} smoke test passed!`);
} catch (error) {
  console.error("❌ Smoke test failed:", error);
  process.exit(1);
}
