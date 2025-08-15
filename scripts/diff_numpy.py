import json
import numpy as np
import sys

def main():
    # Generate test signal matching the Node.js test
    N = 2048
    sr = 1024
    f = 123.5
    noise_level = 0.3
    
    # Create time array
    t = np.arange(N) / sr
    
    # Generate signal with noise
    signal = np.sin(2 * np.pi * f * t) + noise_level * (2 * np.random.random(N) - 1)
    
    # Compute FFT and find peak
    fft_result = np.fft.rfft(signal)
    freqs = np.fft.rfftfreq(N, d=1/sr)
    mag = np.abs(fft_result)
    
    # Find peak frequency (excluding DC component)
    peak_idx = np.argmax(mag[1:]) + 1  # Skip DC
    peak_hz = freqs[peak_idx]
    
    # Output results
    result = {
        "numpy_peak_hz": float(peak_hz),
        "numpy_peak_mag": float(mag[peak_idx]),
        "sample_rate_hz": sr,
        "fft_size": N,
        "signal_length": N
    }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
