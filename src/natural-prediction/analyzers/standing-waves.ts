// src/natural-prediction/analyzers/standing-waves.ts

import { WaveAnalysisSettings } from '../config';
import { FFTWeakSignalDetector } from '../core/fft-weak-signal';

/**
 * 🌊 Standing Wave Analyzer
 * 
 * Detecta e analisa padrões de ondas estacionárias em séries temporais.
 * Baseado nos princípios da física de ondas e ressonância.
 */

export interface StandingWaveResult {
  detected: boolean;                    // Se ondas estacionárias foram detectadas
  amplitude: number;                    // Amplitude média das ondas
  frequency: number;                    // Frequência dominante (Hz)
  nodes: number[];                      // Posições dos nós (pontos de amplitude zero)
  antinodes: number[];                  // Posições dos antinós (pontos de amplitude máxima)
  resonanceScore: number;               // Pontuação de ressonância (0-1)
  interferencePattern: InterferenceType; // Tipo de padrão de interferência
  energyDistribution: EnergyBand[];     // Distribuição de energia por faixa de frequência
  wavePattern: WavePattern;             // Padrão de onda identificado
}

export interface EnergyBand {
  minFreq: number;  // Frequência mínima da banda (Hz)
  maxFreq: number;  // Frequência máxima da banda (Hz)
  energy: number;   // Energia normalizada (0-1)
  peakFreq: number; // Frequência de pico dentro da banda
}

export type InterferenceType = 
  | 'CONSTRUCTIVE'     // Interferência construtiva (amplificação)
  | 'DESTRUCTIVE'      // Interferência destrutiva (cancelamento)
  | 'MIXED'            // Padrão misto
  | 'NONE';            // Sem interferência significativa

export type WavePattern =
  | 'STANDING_WAVE'    // Onda estacionária clássica
  | 'TRAVELING_WAVE'   // Onda progressiva
  | 'BEAT_PATTERN'     // Batimento (ondas de frequências próximas)
  | 'RESONANCE'        // Ressonância pura
  | 'CHAOTIC'          // Padrão caótico
  | 'NO_PATTERN';      // Nenhum padrão identificado

interface WaveComponent {
  amplitude: number;
  frequency: number;
  phase: number;
}

/**
 * Analisador de Ondas Estacionárias
 * 
 * Detecta padrões de ondas estacionárias em séries temporais,
 * identificando nós, antinós e padrões de interferência.
 */
export class StandingWaveAnalyzer {
  private config: WaveAnalysisSettings;
  private fftDetector: FFTWeakSignalDetector;
  
  constructor(config?: Partial<WaveAnalysisSettings>) {
    this.config = {
      samplingRate: config?.samplingRate ?? 1000,    // Hz
      resonanceThreshold: config?.resonanceThreshold ?? 0.8,
      minWaveAmplitude: config?.minWaveAmplitude ?? 0.1
    };
    
    this.fftDetector = new FFTWeakSignalDetector({
      sampleRate: this.config.samplingRate,
      windowSize: 1024
    });
  }
  
  /**
   * Analisa uma série temporal em busca de padrões de ondas estacionárias
   */
  public analyzeWavePattern(timeSeries: number[]): StandingWaveResult {
    if (timeSeries.length < 4) {
      return this.getDefaultResult();
    }
    
    // 1. Análise espectral para identificar componentes de frequência
    const spectralAnalysis = this.analyzeSpectrum(timeSeries);
    
    // 2. Detecção de ressonância
    const resonanceScore = this.calculateResonanceScore(spectralAnalysis);
    
    // 3. Identificação de nós e antinós
    const { nodes, antinodes } = this.findNodesAndAntinodes(timeSeries);
    
    // 4. Análise de interferência
    const interferencePattern = this.analyzeInterference(spectralAnalysis);
    
    // 5. Classificação do padrão de onda
    const wavePattern = this.classifyWavePattern(
      spectralAnalysis, 
      nodes, 
      antinodes, 
      resonanceScore
    );
    
    // 6. Calcular amplitude e frequência médias
    const amplitude = this.calculateAverageAmplitude(timeSeries);
    const frequency = spectralAnalysis.length > 0 
      ? spectralAnalysis[0].frequency 
      : 0;
    
    return {
      detected: wavePattern !== 'NO_PATTERN',
      amplitude,
      frequency,
      nodes,
      antinodes,
      resonanceScore,
      interferencePattern,
      energyDistribution: this.calculateEnergyDistribution(spectralAnalysis),
      wavePattern
    };
  }
  
  /**
   * Realiza análise espectral da série temporal
   */
  private analyzeSpectrum(timeSeries: number[]): WaveComponent[] {
    // Usar o detector FFT já implementado
    const result = this.fftDetector.detectWeakSignals(timeSeries);
    
    // Converter para componentes de onda
    return result.spectrum
      .map((magnitude, index) => ({
        amplitude: magnitude,
        frequency: index * (this.config.samplingRate / 2) / (result.spectrum.length - 1),
        phase: 0 // Fase não é calculada pela FFT básica
      }))
      .filter(comp => comp.amplitude > this.config.minWaveAmplitude)
      .sort((a, b) => b.amplitude - a.amplitude);
  }
  
  /**
   * Calcula um escore de ressonância com base na distribuição de energia
   */
  private calculateResonanceScore(components: WaveComponent[]): number {
    if (components.length === 0) return 0;
    
    // Calcular energia total
    const totalEnergy = components.reduce(
      (sum, comp) => sum + Math.pow(comp.amplitude, 2), 0
    );
    
    if (totalEnergy === 0) return 0;
    
    // Encontrar o componente dominante
    const dominant = components[0];
    const dominantEnergy = Math.pow(dominant.amplitude, 2);
    
    // Razão entre a energia do componente dominante e a energia total
    const dominanceRatio = dominantEnergy / totalEnergy;
    
    // Verificar harmônicos (múltiplos inteiros da frequência fundamental)
    let harmonicScore = 0;
    if (components.length > 1) {
      const fundamentalFreq = dominant.frequency;
      let harmonicCount = 0;
      
      for (let i = 1; i < Math.min(components.length, 5); i++) {
        const ratio = components[i].frequency / fundamentalFreq;
        // Verificar se a frequência é aproximadamente um múltiplo inteiro
        if (Math.abs(Math.round(ratio) - ratio) < 0.1) {
          harmonicScore += 0.2; // Aumentar pontuação para cada harmônico
        }
      }
    }
    
    // Pontuação final (0-1)
    return Math.min(1, dominanceRatio + harmonicScore);
  }
  
  /**
   * Identifica nós (pontos de amplitude zero) e antinós (pontos de amplitude máxima)
   */
  private findNodesAndAntinodes(
    timeSeries: number[], 
    threshold: number = 0.1
  ): { nodes: number[]; antinodes: number[] } {
    const nodes: number[] = [];
    const antinodes: number[] = [];
    
    // Encontrar o valor máximo para normalização
    const maxAmplitude = Math.max(...timeSeries.map(Math.abs));
    if (maxAmplitude === 0) return { nodes, antinodes };
    
    // Normalizar a série
    const normalized = timeSeries.map(x => x / maxAmplitude);
    
    // Encontrar nós (próximos de zero)
    for (let i = 1; i < normalized.length - 1; i++) {
      // Verificar se é um nó (mudança de sinal ou próximo de zero)
      if (Math.abs(normalized[i]) < threshold) {
        // Verificar se é um mínimo local
        if (normalized[i-1] * normalized[i+1] < 0) {
          nodes.push(i);
        }
      }
      
      // Verificar se é um antinó (máximo local)
      if (normalized[i] > normalized[i-1] && normalized[i] > normalized[i+1] && 
          normalized[i] > (1 - threshold)) {
        antinodes.push(i);
      }
    }
    
    return { nodes, antinodes };
  }
  
  /**
   * Analisa o padrão de interferência com base nos componentes espectrais
   */
  private analyzeInterference(components: WaveComponent[]): InterferenceType {
    if (components.length < 2) return 'NONE';
    
    // Verificar se há componentes com fases opostas (interferência destrutiva)
    let destructiveCount = 0;
    let constructiveCount = 0;
    
    // Para simplificar, vamos considerar a amplitude relativa
    const sortedByAmp = [...components].sort((a, b) => b.amplitude - a.amplitude);
    const maxAmp = sortedByAmp[0].amplitude;
    
    // Contar componentes com amplitude significativa
    const significantComponents = sortedByAmp.filter(c => c.amplitude > maxAmp * 0.1);
    
    if (significantComponents.length === 1) return 'NONE';
    
    // Se houver múltiplos componentes com amplitudes similares, pode ser interferência
    const ampRatio = significantComponents[1].amplitude / maxAmp;
    
    if (ampRatio > 0.7) {
      return 'MIXED';
    } else if (ampRatio > 0.3) {
      return 'CONSTRUCTIVE';
    }
    
    return 'NONE';
  }
  
  /**
   * Classifica o padrão de onda com base nas características identificadas
   */
  private classifyWavePattern(
    components: WaveComponent[],
    nodes: number[],
    antinodes: number[],
    resonanceScore: number
  ): WavePattern {
    // Sem componentes significativos
    if (components.length === 0) return 'NO_PATTERN';
    
    // Ressonância pura
    if (resonanceScore > this.config.resonanceThreshold) {
      return 'RESONANCE';
    }
    
    // Padrão de ondas estacionárias (nós e antinós espaçados regularmente)
    if (nodes.length >= 2 && antinodes.length >= 1) {
      // Verificar se os nós estão espaçados regularmente
      const nodeSpacings = this.calculateSpacings(nodes);
      const nodeRegularity = this.calculateRegularityScore(nodeSpacings);
      
      if (nodeRegularity > 0.8) {
        return 'STANDING_WAVE';
      }
    }
    
    // Padrão de batimento (dois componentes de frequência próximos)
    if (components.length >= 2) {
      const [f1, f2] = components.slice(0, 2).map(c => c.frequency);
      const beatFreq = Math.abs(f1 - f2);
      
      if (beatFreq < Math.min(f1, f2) * 0.1) { // Frequências muito próximas
        return 'BEAT_PATTERN';
      }
    }
    
    // Padrão caótico (muitos componentes com amplitudes similares)
    if (components.length > 5) {
      const avgAmplitude = components.reduce((sum, c) => sum + c.amplitude, 0) / components.length;
      const variance = components.reduce(
        (sum, c) => sum + Math.pow(c.amplitude - avgAmplitude, 2), 0
      ) / components.length;
      
      if (variance < 0.1 * avgAmplitude) {
        return 'CHAOTIC';
      }
    }
    
    // Se nenhum padrão específico for identificado, assume-se que é uma onda progressiva
    return 'TRAVELING_WAVE';
  }
  
  /**
   * Calcula a distribuição de energia por faixa de frequência
   */
  private calculateEnergyDistribution(
    components: WaveComponent[]
  ): EnergyBand[] {
    if (components.length === 0) return [];
    
    // Definir bandas de frequência (em Hz)
    const bands = [
      { min: 0, max: 5, label: 'Infrassom' },
      { min: 5, max: 20, label: 'Baixa' },
      { min: 20, max: 100, label: 'Média' },
      { min: 100, max: Infinity, label: 'Alta' }
    ];
    
    // Calcular energia em cada banda
    const totalEnergy = components.reduce(
      (sum, comp) => sum + Math.pow(comp.amplitude, 2), 0
    );
    
    if (totalEnergy === 0) return [];
    
    return bands.map(band => {
      const bandComponents = components.filter(
        c => c.frequency >= band.min && c.frequency < band.max
      );
      
      const energy = bandComponents.reduce(
        (sum, comp) => sum + Math.pow(comp.amplitude, 2), 0
      );
      
      const peakComp = [...bandComponents].sort((a, b) => b.amplitude - a.amplitude)[0];
      
      return {
        minFreq: band.min,
        maxFreq: band.max,
        energy: energy / totalEnergy, // Normalizar
        peakFreq: peakComp ? peakComp.frequency : 0
      };
    }).filter(band => band.energy > 0.01); // Filtrar bandas insignificantes
  }
  
  // ===== Métodos auxiliares =====
  
  private calculateAverageAmplitude(timeSeries: number[]): number {
    if (timeSeries.length === 0) return 0;
    
    const sum = timeSeries.reduce((s, x) => s + Math.abs(x), 0);
    return sum / timeSeries.length;
  }
  
  private calculateSpacings(points: number[]): number[] {
    const spacings: number[] = [];
    
    for (let i = 1; i < points.length; i++) {
      spacings.push(points[i] - points[i-1]);
    }
    
    return spacings;
  }
  
  private calculateRegularityScore(spacings: number[]): number {
    if (spacings.length < 2) return 0;
    
    const mean = spacings.reduce((s, x) => s + x, 0) / spacings.length;
    const variance = spacings.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / spacings.length;
    const stdDev = Math.sqrt(variance);
    
    // Quanto menor o desvio padrão em relação à média, mais regular é o espaçamento
    const cv = stdDev / mean; // Coeficiente de variação
    return Math.max(0, 1 - cv); // 1 para perfeitamente regular, 0 para aleatório
  }
  
  private getDefaultResult(): StandingWaveResult {
    return {
      detected: false,
      amplitude: 0,
      frequency: 0,
      nodes: [],
      antinodes: [],
      resonanceScore: 0,
      interferencePattern: 'NONE',
      energyDistribution: [],
      wavePattern: 'NO_PATTERN'
    };
  }
}

// Exportar instância padrão
import { NATURAL_PREDICTION_CONFIG } from '../config';

export const standingWaveAnalyzer = new StandingWaveAnalyzer(
  NATURAL_PREDICTION_CONFIG.waves
);
