import { Bench } from 'tinybench';
import { FFTWeakSignalDetector } from '../src/natural-prediction/core/fft-weak-signal';
import { AnalysisConfig, getDefaultConfig } from '../src/config/schema';

// Configuration for benchmarks
const CONFIG: AnalysisConfig = {
  sampleRateHz: 1024,
  fftSize: 2048,
  windowType: 'hann',
  minPeakHeight: 0.1,
  minPeakDistance: 5,
  noiseFloorMethod: 'median',
  lyapunov: {
    method: 'rosenstein',
    embeddingDim: 5,
    timeDelay: 10,
    maxIterations: 1000,
  },
  preemphasis: true,
  useWorker: false,
};

// Generate test signals
function generateTestSignals() {
  const sr = CONFIG.sampleRateHz;
  const N = 10 * sr; // 10 seconds of data
  
  // Clean signal
  const clean = Array.from({ length: N }, (_, i) => {
    const t = i / sr;
    return Math.sin(2 * Math.PI * 100 * t) + 0.5 * Math.sin(2 * Math.PI * 200 * t);
  });
  
  // Noisy signal (add 30% noise)
  const noisy = clean.map(x => x + 0.3 * (Math.random() * 2 - 1));
  
  return { clean, noisy };
}

async function runBenchmarks() {
  const bench = new Bench({
    time: 1000,     // Time in ms per benchmark
    warmupTime: 200, // Warmup time in ms
    iterations: 10,  // Number of iterations
  });
  
  const { clean, noisy } = generateTestSignals();
  const detector = new FFTWeakSignalDetector(CONFIG);
  
  // Benchmark FFT analysis
  bench
    .add('FFT analysis (clean signal)', () => {
      detector.detectWeakSignals(clean);
    })
    .add('FFT analysis (noisy signal)', () => {
      detector.detectWeakSignals(noisy);
    });
  
  // Run benchmarks
  console.log('Running benchmarks...');
  await bench.run();
  
  // Output results
  console.table(bench.table());
  
  // Save results to file
  const results = bench.tasks.map(task => ({
    name: task.name,
    hz: task.result?.hz || 0,
    p99: task.result?.p99 || 0,
    p995: task.result?.p995 || 0,
  }));
  
  return results;
}

// Run if this file is executed directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

export { runBenchmarks };
