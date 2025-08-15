// src/natural-prediction/analyzers/lyapunov-chaos.ts

import { ChaosSettings } from '../config';

/**
 * 🌀 Lyapunov Chaos Detector
 * 
 * Detects chaotic behavior in time series data using the Lyapunov exponent.
 * Based on the mathematical foundation of chaos theory.
 */

export type Vector = number[];
export type PhaseSpace = Vector[];

export interface LyapunovResult {
  exponent: number;          // Largest Lyapunov exponent
  isChaotic: boolean;        // True if system is chaotic (exponent > 0)
  predictabilityHorizon: number; // Time until predictions become unreliable
  fractalDimension: number;   // Correlation dimension
  bifurcationPoints: BifurcationPoint[]; // Points where system behavior changes
  chaosLevel: ChaosLevel;     // Classification of chaos level
}

export interface BifurcationPoint {
  index: number;
  type: 'period-doubling' | 'collapse' | 'transition';
  strength: number;
  timestamp: number;
}

type ChaosLevel = 
  | 'STABLE'              // exponent < -0.1
  | 'MARGINALLY_STABLE'   // -0.1 ≤ exponent < 0
  | 'EDGE_OF_CHAOS'       // 0 ≤ exponent < 0.1
  | 'WEAKLY_CHAOTIC'      // 0.1 ≤ exponent < 0.5
  | 'CHAOTIC'             // 0.5 ≤ exponent < 1.0
  | 'STRONGLY_CHAOTIC';   // exponent ≥ 1.0

export class LyapunovChaosDetector {
  private config: ChaosSettings;
  
  constructor(config?: Partial<ChaosSettings>) {
    this.config = {
      embeddingDimension: config?.embeddingDimension ?? 3,
      timeDelay: config?.timeDelay ?? 1,
      epsilon: config?.epsilon ?? 1e-8,
      minNeighbors: config?.minNeighbors ?? 5
    };
  }
  
  /**
   * Calcula o maior expoente de Lyapunov
   * λ > 0: Sistema caótico (tempestade se formando)
   * λ = 0: Limiar do caos
   * λ < 0: Sistema estável
   */
  calculateLyapunovExponent(
    timeSeries: number[],
    configOverride?: Partial<ChaosSettings>
  ): LyapunovResult {
    // Aplicar configurações sobrescritas, se fornecidas
    const effectiveConfig = configOverride ? { ...this.config, ...configOverride } : this.config;
    
    // 1. Reconstruir o espaço de fase
    const phaseSpace = this.reconstructPhaseSpace(
      timeSeries,
      effectiveConfig.embeddingDimension,
      effectiveConfig.timeDelay
    );
    
    // 2. Encontrar vizinhos próximos
    const neighbors = this.findNearestNeighbors(phaseSpace, effectiveConfig.minNeighbors);
    
    // 3. Calcular divergência de trajetórias próximas
    const lyapunovSum = this.calculateDivergence(phaseSpace, neighbors, effectiveConfig.epsilon);
    
    // 4. Normalizar pelo tempo para obter o expoente
    const lyapunovExponent = lyapunovSum / (timeSeries.length - effectiveConfig.embeddingDimension);
    
    // 5. Calcular dimensão fractal (Correlação)
    const fractalDimension = this.calculateCorrelationDimension(phaseSpace);
    
    // 6. Detectar bifurcações
    const bifurcations = this.detectBifurcations(timeSeries);
    
    return {
      exponent: lyapunovExponent,
      isChaotic: lyapunovExponent > 0,
      predictabilityHorizon: lyapunovExponent > 0 ? 1 / lyapunovExponent : Infinity,
      fractalDimension,
      bifurcationPoints: bifurcations,
      chaosLevel: this.classifyChaosLevel(lyapunovExponent)
    };
  }
  
  /**
   * Reconstrução do Espaço de Fase
   * Transforma série temporal 1D em trajetória multidimensional
   */
  private reconstructPhaseSpace(
    series: number[], 
    dimension: number, 
    delay: number
  ): PhaseSpace {
    const vectors: Vector[] = [];
    const vectorCount = series.length - (dimension - 1) * delay;
    
    for (let i = 0; i < vectorCount; i++) {
      const vector = new Array(dimension);
      for (let j = 0; j < dimension; j++) {
        vector[j] = series[i + j * delay];
      }
      vectors.push(vector);
    }
    
    return vectors;
  }
  
  /**
   * Encontra os k vizinhos mais próximos para cada ponto no espaço de fase
   */
  private findNearestNeighbors(
    phaseSpace: PhaseSpace,
    k: number
  ): number[][] {
    const neighbors: number[][] = [];
    
    for (let i = 0; i < phaseSpace.length; i++) {
      // Calcular distâncias para todos os outros pontos
      const distances = phaseSpace.map((point, j) => ({
        index: j,
        distance: this.euclideanDistance(phaseSpace[i], point)
      }));
      
      // Ordenar por distância (excluindo o próprio ponto)
      distances.sort((a, b) => a.distance - b.distance);
      
      // Pegar os k vizinhos mais próximos (excluindo o próprio ponto)
      neighbors.push(
        distances
          .filter((_, idx) => idx > 0) // Excluir o próprio ponto (distância zero)
          .slice(0, k)                 // Pegar os k mais próximos
          .map(d => d.index)           // Extrair apenas os índices
      );
    }
    
    return neighbors;
  }
  
  /**
   * Algoritmo de Wolf para cálculo do expoente de Lyapunov
   * Rastreia a divergência de trajetórias próximas
   */
  private calculateDivergence(
    phaseSpace: PhaseSpace, 
    neighbors: number[][],
    epsilon: number,
    evolutionSteps: number = 10
  ): number {
    let lyapunovSum = 0;
    let validPairs = 0;
    
    for (let i = 0; i < phaseSpace.length - evolutionSteps; i++) {
      if (neighbors[i].length === 0) continue;
      
      const point = phaseSpace[i];
      
      // Para cada vizinho próximo
      for (const neighborIdx of neighbors[i]) {
        if (neighborIdx >= phaseSpace.length - evolutionSteps) continue;
        
        const neighbor = phaseSpace[neighborIdx];
        
        // Distância inicial
        const d0 = this.euclideanDistance(point, neighbor);
        if (d0 < epsilon || d0 === 0) continue;
        
        // Distância após evolução
        const evolvedPoint = phaseSpace[i + evolutionSteps];
        const evolvedNeighbor = phaseSpace[neighborIdx + evolutionSteps];
        const dt = this.euclideanDistance(evolvedPoint, evolvedNeighbor);
        
        // Contribuição para o expoente
        if (dt > 0 && d0 > 0) {
          lyapunovSum += Math.log(dt / d0) / evolutionSteps;
          validPairs++;
        }
      }
    }
    
    return validPairs > 0 ? lyapunovSum / validPairs : 0;
  }
  
  /**
   * Detecção de Bifurcações
   * Identifica pontos onde o sistema muda qualitativamente
   */
  private detectBifurcations(series: number[]): BifurcationPoint[] {
    const bifurcations: BifurcationPoint[] = [];
    const windowSize = 50;
    
    for (let i = windowSize; i < series.length - windowSize; i += windowSize) {
      // Variância antes e depois da janela
      const before = series.slice(i - windowSize, i);
      const after = series.slice(i, i + windowSize);
      
      const varBefore = this.variance(before);
      const varAfter = this.variance(after);
      
      // Razão de variância
      const varRatio = varAfter / (varBefore || 1e-10);
      
      // Mudança significativa na variância = possível bifurcação
      if (varRatio > 2 || varRatio < 0.5) {
        const type = varRatio > 2 ? 'period-doubling' : 
                    (varRatio < 0.3 ? 'collapse' : 'transition');
                    
        bifurcations.push({
          index: i,
          type,
          strength: Math.abs(Math.log(varRatio)),
          timestamp: i // ou converter para tempo real se disponível
        });
      }
    }
    
    return bifurcations;
  }
  
  /**
   * Cálculo da Dimensão de Correlação
   * Mede a complexidade geométrica do atrator
   */
  private calculateCorrelationDimension(phaseSpace: PhaseSpace): number {
    const radii = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5];
    const correlations: number[] = [];
    
    for (const r of radii) {
      let count = 0;
      const n = Math.min(phaseSpace.length, 1000); // Amostra para desempenho
      
      // Integral de correlação C(r)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dist = this.euclideanDistance(phaseSpace[i], phaseSpace[j]);
          if (dist < r) count++;
        }
      }
      
      // Normalizar pelo número de pares
      correlations.push(count / ((n * (n - 1)) / 2));
    }
    
    // Dimensão = inclinação de log(C(r)) vs log(r)
    return this.calculateSlope(
      radii.map(Math.log),
      correlations.map(c => Math.log(c + 1e-10))
    );
  }
  
  // ===== Funções auxiliares =====
  
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
  
  private variance(array: number[]): number {
    const mean = array.reduce((a, b) => a + b) / array.length;
    return array.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / array.length;
  }
  
  private calculateSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return Math.abs(slope); // Retorna valor absoluto
  }
  
  /**
   * Classificação do nível de caos com base no expoente de Lyapunov
   */
  private classifyChaosLevel(exponent: number): ChaosLevel {
    if (exponent < -0.1) return 'STABLE';
    if (exponent < 0) return 'MARGINALLY_STABLE';
    if (exponent < 0.1) return 'EDGE_OF_CHAOS';
    if (exponent < 0.5) return 'WEAKLY_CHAOTIC';
    if (exponent < 1.0) return 'CHAOTIC';
    return 'STRONGLY_CHAOTIC';
  }
}

// Exportar instância padrão
import { NATURAL_PREDICTION_CONFIG } from '../config';
export const lyapunovChaosDetector = new LyapunovChaosDetector(NATURAL_PREDICTION_CONFIG.chaos);
