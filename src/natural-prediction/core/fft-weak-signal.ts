// src/natural-prediction/core/fft-weak-signal.ts

/**
 * 🌊 Fast Fourier Transform - Detecta frequências ocultas
 * Como pássaros detectam infrassom de tempestades a 2000km
 */

// Tipos de dados
type Complex = { real: number; imag: number };
export type FrequencyPeak = {
  frequency: number;
  magnitude: number;
  zScore: number;
  significance: string;
};

export type InfrasonicAnalysis = {
  energyRatio: number;
  detected: boolean;
  stormProbability: number;
};

export type WeakSignalAnalysis = {
  spectrum: number[];
  weakSignals: FrequencyPeak[];
  dominantFrequencies: number[];
  infrasonicContent: InfrasonicAnalysis;
  signalToNoiseRatio: number;
  anomalyScore: number;
};

export class FFTWeakSignalDetector {
  private sampleRate: number = 1000; // Hz
  private windowSize: number = 1024; // Potência de 2 para FFT
  
  constructor(config?: { sampleRate?: number; windowSize?: number }) {
    if (config?.sampleRate) this.sampleRate = config.sampleRate;
    if (config?.windowSize) this.windowSize = config.windowSize;
  }
  
  private fft(signal: Complex[]): Complex[] {
    const N = signal.length;
    // Caso base da recursão
    if (N <= 1) return signal;
    
    // Dividir em pares e ímpares
    const even = new Array(N/2);
    const odd = new Array(N/2);
    
    for (let i = 0; i < N/2; i++) {
      even[i] = signal[2*i];
      odd[i] = signal[2*i + 1];
    }
    
    // Recursão
    const fftEven = this.fft(even);
    const fftOdd = this.fft(odd);
    
    // Combinar resultados
    const result = new Array(N);
    for (let k = 0; k < N/2; k++) {
      const t = this.complexMultiply(
        this.polarToComplex(1, -2 * Math.PI * k / N),
        fftOdd[k]
      );
      
      result[k] = this.complexAdd(fftEven[k], t);
      result[k + N/2] = this.complexSubtract(fftEven[k], t);
    }
    
    return result;
  }
  
  /**
   * Detecta sinais fracos no espectro
   * (Como infrassom < 20Hz que humanos não ouvem)
   */
  detectWeakSignals(timeSeries: number[]): WeakSignalAnalysis {
    // Handle empty input
    if (!timeSeries || timeSeries.length === 0) {
      return {
        spectrum: [],
        weakSignals: [],
        dominantFrequencies: [],
        infrasonicContent: { energyRatio: 0, detected: false, stormProbability: 0 },
        signalToNoiseRatio: 0,
        anomalyScore: 0
      };
    }
    
    // Remove DC component (mean)
    const mean = timeSeries.reduce((a, b) => a + b, 0) / timeSeries.length;
    const zeroMean = timeSeries.map(v => v - mean);
    
    // Apply Hamming window
    const windowed = this.applyHammingWindow(zeroMean);
    
    // Convert to complex
    const complex = windowed.map(x => ({ real: x, imag: 0 }));
    
    // Apply FFT
    const spectrum = this.fft(complex);
    
    // Calculate magnitudes (skip DC bin)
    const magnitudes = spectrum.map(c => 
      Math.sqrt(c.real * c.real + c.imag * c.imag)
    );
    
    // Calculate SNR properly
    const nonDC = magnitudes.slice(1);
    if (nonDC.length === 0) {
      return this.emptyResult();
    }
    
    const peak = Math.max(...nonDC);
    const noise = nonDC.filter(m => m < peak * 0.5)
      .reduce((a, b) => a + b, 0) / Math.max(nonDC.length - 1, 1);
    
    const snr = noise > 0 ? peak / noise : (peak > 0 ? 100 : 0);
    
    // Calculate anomaly score
    const median = [...nonDC].sort((a, b) => a - b)[Math.floor(nonDC.length / 2)] || 0;
    const anomalyScore = median > 0 ? 
      Math.min(1, (peak / median - 1) / 10) : 
      (peak > 0 ? 1 : 0);
    
    // Identify weak signals
    const weakSignals = this.identifyWeakSignals(magnitudes);
    
    return {
      spectrum: magnitudes,
      weakSignals: weakSignals,
      dominantFrequencies: this.findDominantFrequencies(magnitudes),
      infrasonicContent: this.detectInfrasonic(magnitudes),
      signalToNoiseRatio: snr,
      anomalyScore: anomalyScore
    };
  }
  
  /**
   * Janela de Hamming - Reduz artefatos nas bordas
   * w(n) = 0.54 - 0.46 * cos(2πn/(N-1))
   */
  private applyHammingWindow(signal: number[]): number[] {
    const N = signal.length;
    return signal.map((value, n) => {
      const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1));
      return value * window;
    });
  }
  
  /**
   * Preenchimento com zeros para potência de 2
   */
  private zeroPad(signal: number[], targetLength: number): number[] {
    if (signal.length >= targetLength) return signal.slice(0, targetLength);
    
    const padded = [...signal];
    while (padded.length < targetLength) {
      padded.push(0);
    }
    return padded;
  }
  
  /**
   * Identifica sinais fracos mas significativos
   * (Como pássaros detectam mudanças sutis)
   */
  private identifyWeakSignals(magnitudes: number[]): FrequencyPeak[] {
    const mean = magnitudes.reduce((a, b) => a + b) / magnitudes.length;
    const stdDev = Math.sqrt(
      magnitudes.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / magnitudes.length
    );
    
    const peaks: FrequencyPeak[] = [];
    
    for (let i = 1; i < magnitudes.length - 1; i++) {
      // Detectar picos locais
      if (magnitudes[i] > magnitudes[i-1] && 
          magnitudes[i] > magnitudes[i+1]) {
        
        // Z-score para significância estatística
        const zScore = (magnitudes[i] - mean) / stdDev;
        
        // Sinais fracos: 1σ < magnitude < 3σ
        if (zScore > 1 && zScore < 3) {
          peaks.push({
            frequency: (i * this.sampleRate) / magnitudes.length,
            magnitude: magnitudes[i],
            zScore: zScore,
            significance: this.calculateSignificance(zScore)
          });
        }
      }
    }
    
    return peaks;
  }
  
  /**
   * Detecta conteúdo infrassônico (< 20Hz)
   * Tempestades geram 0.01-10Hz
   */
  private detectInfrasonic(magnitudes: number[]): InfrasonicAnalysis {
    const infrasonicRange = 20; // Hz
    const binWidth = this.sampleRate / magnitudes.length;
    const infrasonicBins = Math.floor(infrasonicRange / binWidth);
    
    let infrasonicEnergy = 0;
    for (let i = 0; i < infrasonicBins; i++) {
      infrasonicEnergy += magnitudes[i] * magnitudes[i];
    }
    
    const totalEnergy = magnitudes.reduce((sum, m) => sum + m * m, 0);
    const infrasonicRatio = infrasonicEnergy / totalEnergy;
    
    return {
      energyRatio: infrasonicRatio,
      detected: infrasonicRatio > 0.1, // 10% energia em infrassom
      stormProbability: Math.min(infrasonicRatio * 5, 1) // Escala 0-1
    };
  }
  
  /**
   * Encontra as frequências dominantes no espectro
   */
  private findDominantFrequencies(magnitudes: number[], count: number = 5): number[] {
    // Criar array de índices [0, 1, 2, ...]
    const indices = Array.from({ length: magnitudes.length }, (_, i) => i);
    
    // Ordenar índices por magnitude (decrescente)
    indices.sort((a, b) => magnitudes[b] - magnitudes[a]);
    
    // Retornar as 'count' maiores frequências
    return indices.slice(0, count).map(i => (i * this.sampleRate) / magnitudes.length);
  }
  
  /**
   * Calcula a relação sinal-ruído (SNR)
   */
  private calculateSNR(magnitudes: number[], peaks: FrequencyPeak[]): number {
    if (peaks.length === 0) return 0;
    
    const signalPower = peaks.reduce((sum, peak) => sum + peak.magnitude * peak.magnitude, 0);
    const totalPower = magnitudes.reduce((sum, m) => sum + m * m, 0);
    const noisePower = totalPower - signalPower;
    
    return 10 * Math.log10(signalPower / Math.max(noisePower, 1e-10));
  }
  
  /**
   * Calcula um escore de anomalia baseado nos sinais fracos e SNR
   */
  private calculateAnomalyScore(peaks: FrequencyPeak[], snr: number): number {
    if (peaks.length === 0) return 0;
    
    // Média dos z-scores dos picos
    const avgZScore = peaks.reduce((sum, peak) => sum + peak.zScore, 0) / peaks.length;
    
    // Normalizar SNR para 0-1 (assumindo SNR entre 0 e 100)
    const normalizedSNR = Math.min(snr / 100, 1);
    
    // Combinação de z-score e SNR com pesos ajustados
    return Math.min(avgZScore * 0.4 + normalizedSNR * 0.6, 1);
  }
  
  /**
   * Retorna um resultado vazio para casos de erro
   */
  private emptyResult(): WeakSignalAnalysis {
    return {
      spectrum: [],
      weakSignals: [],
      dominantFrequencies: [],
      infrasonicContent: { energyRatio: 0, detected: false, stormProbability: 0 },
      signalToNoiseRatio: 0,
      anomalyScore: 0
    };
  }
  
  /**
   * Classifica a significância com base no z-score
   */
  private calculateSignificance(zScore: number): string {
    if (zScore > 2.5) return 'high';
    if (zScore > 1.5) return 'medium';
    return 'low';
  }
  
  // ===== Funções auxiliares para números complexos =====
  
  private complexAdd(a: Complex, b: Complex): Complex {
    return {
      real: a.real + b.real,
      imag: a.imag + b.imag
    };
  }
  
  private complexSubtract(a: Complex, b: Complex): Complex {
    return {
      real: a.real - b.real,
      imag: a.imag - b.imag
    };
  }
  
  private complexMultiply(a: Complex, b: Complex): Complex {
    return {
      real: a.real * b.real - a.imag * b.imag,
      imag: a.real * b.imag + a.imag * b.real
    };
  }
  
  private polarToComplex(magnitude: number, phase: number): Complex {
    return {
      real: magnitude * Math.cos(phase),
      imag: magnitude * Math.sin(phase)
    };
  }
}

// Exportar uma instância padrão
export const fftWeakSignalDetector = new FFTWeakSignalDetector();
