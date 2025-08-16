// src/natural-prediction/core/fft-weak-signal-new.ts

interface WeakSignalAnalysis {
  spectrum: number[];
  weakSignals: Array<{ bin: number; mag: number }>;
  signalToNoiseRatio: number;
  anomalyScore: number;
  infrasonicEnergy: number;
}

// util: next power of 2
function nextPow2(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(Math.max(1, n))));
}

function applyHannWindow(x: number[]): number[] {
  const N = x.length;
  if (N === 0) return x;
  return x.map((v, n) => v * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1))));
}

// Simple DFT (sufficient for small N in tests)
function dftReal(signal: number[]): { re: Float64Array; im: Float64Array } {
  const N = signal.length;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    let sumRe = 0, sumIm = 0;
    const angFactor = (-2 * Math.PI * k) / N;
    for (let n = 0; n < N; n++) {
      const ang = angFactor * n;
      sumRe += signal[n] * Math.cos(ang);
      sumIm += signal[n] * Math.sin(ang);
    }
    re[k] = sumRe;
    im[k] = sumIm;
  }
  return { re, im };
}

export class FFTWeakSignalDetector {
  private sampleRate: number;
  
  constructor(config: { sampleRate?: number } = {}) {
    this.sampleRate = config.sampleRate || 1024; // Default to 1024 Hz
  }

  detectWeakSignals(data: number[]): WeakSignalAnalysis {
    // Edge cases
    if (!data || data.length === 0) {
      return { 
        spectrum: [], 
        weakSignals: [], 
        signalToNoiseRatio: 0, 
        anomalyScore: 0, 
        infrasonicEnergy: 0 
      };
    }

    // Zero-pad to next power of 2 + apply Hann window
    const N = nextPow2(data.length);
    const padded = new Array(N).fill(0);
    for (let i = 0; i < data.length; i++) {
      padded[i] = data[i];
    }
    const windowed = applyHannWindow(padded);

    // Perform FFT
    const { re, im } = dftReal(windowed);
    const mag = Array.from({ length: N }, (_, k) => Math.hypot(re[k], im[k]));

    // Calculate simple SNR (peak vs noise floor)
    const nyquist = Math.floor(N / 2);
    const mags = mag.slice(0, nyquist);
    const maxMag = Math.max(...mags);
    const meanNoise = mags.reduce((a, b) => a + b, 0) / Math.max(1, mags.length);
    const snr = meanNoise > 0 ? maxMag / meanNoise : 0;

    // Find weak signals: bins > (2 * mean)
    const weakSignals = mags
      .map((m, k) => ({ bin: k, mag: m }))
      .filter(({ mag: m }) => m > 2 * meanNoise);

    // Calculate infrasonic energy (<20 Hz)
    const binFreq = (k: number) => (k * this.sampleRate) / N;
    const infrasonicEnergy = mags
      .map((m, k) => ({ m, k }))
      .filter(({ k }) => binFreq(k) < 20)
      .reduce((sum, { m }) => sum + m, 0);

    // Simple anomaly score: normalized peak
    const anomalyScore = maxMag > 0 
      ? Math.min(1, (maxMag - meanNoise) / (maxMag + meanNoise)) 
      : 0;

    return {
      spectrum: mags,
      weakSignals,
      signalToNoiseRatio: snr,
      anomalyScore,
      infrasonicEnergy,
    };
  }
}
