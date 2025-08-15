import { FFTWeakSignalDetector } from './fft-weak-signal';
test('FFTWeakSignalDetector loads', () => {
  const d = new FFTWeakSignalDetector({ sampleRate: 1000, windowSize: 1024 });
  expect(d).toBeTruthy();
});
