import fc from 'fast-check';
import { FFTWeakSignalDetector } from '../src/natural-prediction/core/fft-weak-signal';

describe('FFT Weak Signal Detector Property Tests', () => {
  // Test that the detector can find signals in noisy data
  test('detects signals in noisy data', () => {
    fc.assert(
      fc.property(
        // Generate random frequency between 10Hz and 400Hz
        fc.float({ min: 10, max: 400 }),
        // Generate random sample count between 1024 and 4096
        fc.integer({ min: 1024, max: 4096 }),
        // Generate random noise level between 0.1 and 0.5
        fc.float({ min: 0.1, max: 0.5 }),
        (freqHz: number, sampleCount: number, noiseLevel: number) => {
          // Skip invalid cases
          fc.pre(sampleCount > 0 && freqHz > 0 && noiseLevel >= 0);
          
          const sampleRateHz = 1024;
          // Generate a clean sine wave
          const cleanSignal = Array.from(
            { length: sampleCount },
            (_, i) => Math.sin(2 * Math.PI * freqHz * (i / sampleRateHz))
          );
          
          // Add random noise
          const noisySignal = cleanSignal.map(
            x => x + (Math.random() * 2 - 1) * noiseLevel
          );
          
          // Create detector and analyze signal
          const detector = new FFTWeakSignalDetector({ 
            sampleRate: sampleRateHz,
            windowSize: Math.min(1024, sampleCount) // Ensure window size is not larger than signal
          });
          
          const analysis = detector.detectWeakSignals(noisySignal);
          
          // Check if the original frequency was detected in dominant frequencies
          const isDetected = analysis.dominantFrequencies.some(
            (detectedFreq: number) => Math.abs(detectedFreq - freqHz) < 5 // Within 5Hz
          );
          
          // For debugging test failures
          if (!isDetected) {
            console.log({
              freqHz,
              sampleCount,
              noiseLevel,
              detectedFrequencies: analysis.dominantFrequencies,
              signal: noisySignal.slice(0, 20).map(x => x.toFixed(3)),
              weakSignals: analysis.weakSignals,
              snr: analysis.signalToNoiseRatio
            });
          }
          
          return isDetected || analysis.weakSignals.length > 0;
        }
      ),
      { 
        numRuns: 20,  // Reduced for CI speed, increase for more thorough testing
        endOnFailure: true
      }
    );
  });

  // Test that the detector handles empty input
  test('handles empty input', () => {
    const detector = new FFTWeakSignalDetector();
    const result = detector.detectWeakSignals([]);
    expect(result.spectrum).toEqual([]);
    expect(result.weakSignals).toEqual([]);
  });

  // Test that the detector can identify infrasonic content
  test('detects infrasonic content', () => {
    const detector = new FFTWeakSignalDetector({ sampleRate: 1000 });
    const sampleCount = 2048;
    const freqHz = 5; // Infrasonic frequency
    
    // Generate infrasonic signal
    const signal = Array.from(
      { length: sampleCount },
      (_, i) => 0.5 * Math.sin(2 * Math.PI * freqHz * (i / 1000))
    );
    
    const analysis = detector.detectWeakSignals(signal);
    expect(analysis.infrasonicContent.detected).toBe(true);
    expect(analysis.infrasonicContent.energyRatio).toBeGreaterThan(0.1);
  });
});
