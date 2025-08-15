/**
 * Basic Usage Example for Natural Prediction System
 * 
 * This example demonstrates how to use the Natural Prediction System
 * to analyze time series data and detect anomalies.
 */

import { FFTWeakSignalDetector } from '../src/natural-prediction/core/fft-weak-signal';
import { LyapunovChaosDetector } from '../src/natural-prediction/analyzers/lyapunov-chaos';
import { StandingWaveAnalyzer } from '../src/natural-prediction/analyzers/standing-waves';
import { EvolutionaryWeightOptimizer } from '../src/natural-prediction/evolution/weight-optimizer';
import { NaturalSystem } from '../src/natural-prediction/integration/natural-system';

// Sample configuration
const config = {
  sampleRateHz: 2048,
  fftSize: 4096,
  window: 'hann' as const,
  lyapunov: {
    method: 'rosenstein' as const,
    embeddingDim: 3,
    delay: 1,
  },
  evolution: {
    populationSize: 50,
    maxGenerations: 100,
    mutationRate: 0.1,
  },
};

// Create analyzer instances
const fftDetector = new FFTWeakSignalDetector({
  sampleRateHz: config.sampleRateHz,
  fftSize: config.fftSize,
  windowType: config.window,
});

const chaosDetector = new LyapunovChaosDetector({
  embeddingDimension: config.lyapunov.embeddingDim,
  timeDelay: config.lyapunov.delay,
  method: config.lyapunov.method,
});

const waveAnalyzer = new StandingWaveAnalyzer({
  sampleRateHz: config.sampleRateHz,
  fftSize: config.fftSize,
});

// Initialize the weight optimizer
const weightOptimizer = new EvolutionaryWeightOptimizer({
  populationSize: config.evolution.populationSize,
  maxGenerations: config.evolution.maxGenerations,
  mutationRate: config.evolution.mutationRate,
});

// Create the main system
const nps = new NaturalSystem({
  fftDetector,
  chaosDetector,
  waveAnalyzer,
  weightOptimizer,
});

/**
 * Generate sample time series data (sine wave with noise)
 */
function generateSampleData(length: number, frequency: number, noiseLevel = 0.1): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    const value = Math.sin((2 * Math.PI * frequency * i) / config.sampleRateHz);
    const noise = (Math.random() - 0.5) * noiseLevel;
    data.push(value + noise);
  }
  return data;
}

// Main function
async function main() {
  console.log('🚀 Starting Natural Prediction System example...');
  
  // Generate sample data
  const sampleData = generateSampleData(10000, 50); // 50Hz signal
  
  console.log('📊 Analyzing time series data...');
  
  // Process the data
  const result = await nps.analyze(sampleData);
  
  // Print results
  console.log('\n📈 Analysis Results:');
  console.log('-------------------');
  console.log(`Prediction Score: ${result.prediction.toFixed(4)}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
  console.log('\nComponent Contributions:');
  console.log(`- FFT Analysis: ${(result.components.fft * 100).toFixed(2)}%`);
  console.log(`- Chaos Analysis: ${(result.components.chaos * 100).toFixed(2)}%`);
  console.log(`- Wave Analysis: ${(result.components.waves * 100).toFixed(2)}%`);
  
  if (result.alerts.level !== 'none') {
    console.log(`\n🚨 Alert: ${result.alerts.message}`);
  }
  
  console.log('\n✅ Example completed!');
}

// Run the example
main().catch(console.error);
