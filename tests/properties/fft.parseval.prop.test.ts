import fc from 'fast-check';
import { FFTWeakSignalDetector } from '../../src/natural-prediction/core/fft-weak-signal';
import { describe, test, expect } from '@jest/globals';

interface FrequencyBin {
  frequency: number;
  magnitude: number;
  phase: number;
}

const approxEq = (a: number, b: number, tol = 1e-6): boolean => 
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

describe('FFT Canonical Properties', () => {
  test('Parseval: energy in time domain ≈ energy in frequency domain', () => {
    fc.assert(
      fc.property(
        // Generate power of 2 lengths between 256 and 4096
        fc.integer({ min: 8, max: 12 }).map((n: number) => 2 ** n),
        // Generate noise level between 0 and 0.5
        fc.float({ min: 0, max: 0.5 }),
        (N: number, noise: number) => {
          const sr = 1024;
          const f = 123.5;
          
          // Generate test signal with noise
          const signal = Array.from(
            { length: N },
            (_, n: number) => Math.sin((2 * Math.PI * f * n) / sr) + noise * (Math.random() * 2 - 1)
          );
          
          // Calculate energy in time domain
          const energyTime = signal.reduce((sum: number, x: number) => sum + x * x, 0);
          
          // Get frequency domain representation
          const detector = new FFTWeakSignalDetector({ sampleRate: sr, windowSize: N });
          const { spectrum } = detector.detectWeakSignals(signal);
          
          // Calculate energy in frequency domain (Parseval's theorem)
          const frequencyBins = spectrum as unknown as FrequencyBin[];
          const energyFreq = frequencyBins.reduce((sum: number, bin: FrequencyBin) => 
            sum + bin.magnitude * bin.magnitude, 0) / N;
          
          // Verify energies are approximately equal (within 0.1% relative error)
          return approxEq(energyTime, energyFreq, 1e-3);
        }
      ),
      { numRuns: 20, endOnFailure: true }
    );
  });

  test('Phase shift does not affect magnitude spectrum', () => {
    const N = 2048;
    const sr = 1024;
    const f = 200;
    
    // Generate test signal
    const signal = Array.from(
      { length: N },
      (_, n: number) => Math.sin((2 * Math.PI * f * n) / sr)
    );
    
    // Create circular shift (delay) of 37 samples
    const shift = 37;
    const shiftedSignal = [...signal.slice(shift), ...signal.slice(0, shift)];
    
    // Analyze both signals
    const detector = new FFTWeakSignalDetector({ sampleRate: sr });
    const result1 = detector.detectWeakSignals(signal);
    const result2 = detector.detectWeakSignals(shiftedSignal);
    
    // Get magnitudes (sorted by frequency for comparison)
    const spectrum1 = result1.spectrum as unknown as FrequencyBin[];
    const spectrum2 = result2.spectrum as unknown as FrequencyBin[];
    
    const mag1 = spectrum1
      .map((bin: FrequencyBin) => bin.magnitude)
      .sort((a: number, b: number) => a - b);
      
    const mag2 = spectrum2
      .map((bin: FrequencyBin) => bin.magnitude)
      .sort((a: number, b: number) => a - b);
    
    // Verify magnitudes are identical (within floating point tolerance)
    const maxDiff = mag1.reduce((max: number, m1: number, i: number) => {
      const diff = Math.abs(m1 - (mag2[i] || 0));
      return Math.max(max, diff);
    }, 0);
    
    expect(maxDiff).toBeLessThan(1e-10);
  });
});
