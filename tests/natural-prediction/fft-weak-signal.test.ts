// tests/natural-prediction/fft-weak-signal.test.ts

import { FFTWeakSignalDetector, type FrequencyPeak } from '../../src/natural-prediction/core/fft-weak-signal';

// Helper function to generate test signals
const generateSineWave = (frequency: number, sampleRate: number, duration: number, amplitude = 1.0): number[] => {
  const t = Array.from({ length: sampleRate * duration }, (_, i) => i / sampleRate);
  return t.map(x => amplitude * Math.sin(2 * Math.PI * frequency * x));
};

describe('FFTWeakSignalDetector', () => {
  const SAMPLE_RATE = 1000; // 1kHz
  const WINDOW_SIZE = 1024; // 1024-point FFT
  
  let detector: FFTWeakSignalDetector;
  
  beforeEach(() => {
    detector = new FFTWeakSignalDetector({
      sampleRate: SAMPLE_RATE,
      windowSize: WINDOW_SIZE
    });
  });
  
  describe('Basic FFT Functionality', () => {
    it('should detect a single frequency component', () => {
      // Create a clean 50Hz sine wave
      const frequency = 50; // Hz
      const signal = generateSineWave(frequency, SAMPLE_RATE, 1, 1.0);
      
      const result = detector.detectWeakSignals(signal);
      
      // Should find the 50Hz component within 1% tolerance
      const peak = result.weakSignals.find(
        p => Math.abs(p.frequency - frequency) < (frequency * 0.01)
      );
      
      expect(peak).toBeDefined();
      expect(peak?.magnitude).toBeCloseTo(1.0, 1);
    });
    
    it('should handle multiple frequency components', () => {
      // Create a signal with multiple frequency components
      const freqs = [10, 50, 100]; // Hz
      let signal = new Array(SAMPLE_RATE).fill(0);
      
      for (const freq of freqs) {
        const component = generateSineWave(freq, SAMPLE_RATE, 1, 1.0 / freqs.length);
        signal = signal.map((val, i) => val + component[i]);
      }
      
      const result = detector.detectWeakSignals(signal);
      
      // Should detect all frequency components
      for (const freq of freqs) {
        const hasFreq = result.weakSignals.some(
          p => Math.abs(p.frequency - freq) < (freq * 0.02) // 2% tolerance
        );
        expect(hasFreq).toBe(true);
      }
    });
  });
  
  describe('Noise Handling', () => {
    it('should detect signals in noisy environment', () => {
      // Create a weak 10Hz signal with strong noise
      const signal = generateSineWave(10, SAMPLE_RATE, 1, 0.1) // Weak signal
        .map(x => x + (Math.random() - 0.5) * 0.5); // Add noise
      
      const result = detector.detectWeakSignals(signal);
      
      // Should still detect the 10Hz component
      const has10Hz = result.weakSignals.some(
        p => Math.abs(p.frequency - 10) < 0.5
      );
      
      expect(has10Hz).toBe(true);
      expect(result.signalToNoiseRatio).toBeLessThan(1); // SNR should be low
    });
  });
  
  describe('Infrasonic Detection', () => {
    it('should detect infrasonic content below 20Hz', () => {
      // Create a signal with infrasonic content at 5Hz
      const signal = generateSineWave(5, SAMPLE_RATE, 1, 0.5) // Infrasonic
        .map((val, i) => val + 0.2 * Math.sin(2 * Math.PI * 50 * (i/SAMPLE_RATE))); // Normal
      
      const result = detector.detectWeakSignals(signal);
      
      // Should detect infrasonic content
      expect(result.infrasonicContent.detected).toBe(true);
      expect(result.infrasonicContent.energyRatio).toBeGreaterThan(0.1);
    });
    
    it('should calculate storm probability based on infrasonic content', () => {
      // Test with increasing infrasonic energy
      const testCases = [
        { amplitude: 0.1, expectedProb: 0.3 },
        { amplitude: 0.3, expectedProb: 0.5 },
        { amplitude: 0.7, expectedProb: 0.8 }
      ];
      
      for (const { amplitude, expectedProb } of testCases) {
        const signal = generateSineWave(8, SAMPLE_RATE, 2, amplitude);
        const result = detector.detectWeakSignals(signal);
        
        // Check if storm probability is in expected range
        const prob = result.infrasonicContent.stormProbability;
        expect(prob).toBeGreaterThanOrEqual(expectedProb - 0.2);
        expect(prob).toBeLessThanOrEqual(expectedProb + 0.2);
      }
    });
  });
  
  describe('Anomaly Detection', () => {
    it('should detect anomalous frequency components', () => {
      // Create a signal with normal and anomalous components
      const normalFreqs = [10, 20, 30];
      let signal = new Array(SAMPLE_RATE).fill(0);
      
      // Add normal frequency components
      for (const freq of normalFreqs) {
        signal = signal.map((val, i) => val + 
          Math.sin(2 * Math.PI * freq * (i/SAMPLE_RATE))
        );
      }
      
      // Add an anomalous component (unusual frequency)
      signal = signal.map((val, i) => 
        val + 0.3 * Math.sin(2 * Math.PI * 123.45 * (i/SAMPLE_RATE))
      );
      
      const result = detector.detectWeakSignals(signal);
      
      // Should detect the anomaly with a high score
      expect(result.anomalyScore).toBeGreaterThan(0.6);
    });
    
    it('should have higher anomaly score for more unusual signals', () => {
      // Create a normal signal
      const normalSignal = generateSineWave(50, SAMPLE_RATE, 1, 1.0);
      
      // Create an unusual signal with multiple anomalous components
      let unusualSignal = [...normalSignal];
      for (const freq of [123, 234, 345]) {
        unusualSignal = unusualSignal.map((val, i) => 
          val + 0.2 * Math.sin(2 * Math.PI * freq * (i/SAMPLE_RATE))
        );
      }
      
      const normalResult = detector.detectWeakSignals(normalSignal);
      const unusualResult = detector.detectWeakSignals(unusualSignal);
      
      // Unusual signal should have higher anomaly score
      expect(unusualResult.anomalyScore).toBeGreaterThan(normalResult.anomalyScore * 2);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle very short signals', () => {
      const shortSignal = [0, 0.1, 0.2, 0.1, 0];
      const result = detector.detectWeakSignals(shortSignal);
      
      // Should not throw errors and return valid results
      expect(result).toBeDefined();
      expect(result.spectrum.length).toBeGreaterThan(0);
    });
    
    it('should handle constant input (DC signal)', () => {
      const signal = new Array(SAMPLE_RATE).fill(1.0);
      const result = detector.detectWeakSignals(signal);
      
      // Should have no weak signals (only DC component)
      expect(result.weakSignals.length).toBe(0);
      
      // Should have very low anomaly score
      expect(result.anomalyScore).toBeLessThan(0.1);
      
      // Should have no infrasonic content detected
      expect(result.infrasonicContent.detected).toBe(false);
    });
    
    it('should handle empty input', () => {
      const result = detector.detectWeakSignals([]);
      
      expect(result.spectrum.length).toBe(0);
      expect(result.weakSignals.length).toBe(0);
      expect(result.signalToNoiseRatio).toBe(0);
      expect(result.anomalyScore).toBe(0);
      expect(result.infrasonicContent.detected).toBe(false);
      expect(result.infrasonicContent.energyRatio).toBe(0);
      expect(result.infrasonicContent.stormProbability).toBe(0);
    });
  });
  
  describe('Configuration', () => {
    it('should respect custom window sizes', () => {
      const customWindowSize = 2048;
      const customDetector = new FFTWeakSignalDetector({
        sampleRate: SAMPLE_RATE,
        windowSize: customWindowSize
      });
      
      const signal = generateSineWave(50, SAMPLE_RATE, 1, 1.0);
      const result = customDetector.detectWeakSignals(signal);
      
      // Spectrum should have windowSize/2 + 1 frequency bins
      expect(result.spectrum.length).toBe(customWindowSize / 2 + 1);
    });
    
    it('should handle different sample rates', () => {
      const highSampleRate = 2000; // 2kHz
      const highFreqDetector = new FFTWeakSignalDetector({
        sampleRate: highSampleRate,
        windowSize: WINDOW_SIZE
      });
      
      // Create a high frequency signal (800Hz)
      const highFreqSignal = generateSineWave(800, highSampleRate, 1, 1.0);
      const result = highFreqDetector.detectWeakSignals(highFreqSignal);
      
      // Should detect the high frequency component
      const has800Hz = result.weakSignals.some(
        p => Math.abs(p.frequency - 800) < 10 // Within 10Hz
      );
      
      expect(has800Hz).toBe(true);
    });
  });
});
