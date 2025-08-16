// src/natural-prediction/integration/natural-system.ts

import { NATURAL_PREDICTION_CONFIG } from "../config";
import type { AlertThresholdsT } from "../config";

type AlertLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

// Função única para classificar alertas
function classifyAlert(score: number, thresholds?: AlertThresholdsT): AlertLevel {
  const t = thresholds ?? NATURAL_PREDICTION_CONFIG.alerts;
  if (score >= t.critical) return "critical";
  if (score >= t.high)     return "high";
  if (score >= t.medium)   return "medium";
  if (score >= t.low)      return "low";
  return "none";
}

function toAlertLevel(value: string): AlertLevel {
  const v = value.toLowerCase();
  const validLevels: AlertLevel[] = ['none', 'low', 'medium', 'high', 'critical'];
  return validLevels.includes(v as AlertLevel) ? (v as AlertLevel) : 'none';
}

/**
 * 🌍 Sistema de Predição Natural
 * 
 * Integra múltiplos analisadores para prever eventos naturais e anomalias
 * baseado em padrões matemáticos encontrados na natureza.
 */

export interface NaturalPredictionResult {
  timestamp: number;                      // Timestamp da previsão
  prediction: number;                     // Valor de previsão (0-1)
  confidence: number;                     // Confiança da previsão (0-1)
  components: {
    fft: number;                         // Contribuição da análise espectral
    chaos: number;                       // Contribuição da análise de caos
    waves: number;                       // Contribuição da análise de ondas
  };
  weights: number[];                     // Pesos otimizados [fft, chaos, waves]
  alerts: {
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    message: string;
  };
  metadata: {
    executionTime: number;               // Tempo de execução em ms
    version: string;                     // Versão do modelo
  };
}

export interface NaturalSystemConfig {
  alertThresholds?: Partial<AlertThresholds>;
  weights?: number[];                    // Pesos iniciais [fft, chaos, waves]
  enableOptimization?: boolean;          // Se deve otimizar os pesos
  optimizationInterval?: number;         // Intervalo para reotimização (em chamadas)
}

/**
 * Classe principal do sistema de predição natural
 */
export class NaturalPredictionSystem {
  private fftDetector: FFTWeakSignalDetector;
  private currentWeights: number[];
  private callCount: number;
  private config: Required<NaturalSystemConfig>;
  
  constructor(config: NaturalSystemConfig = {}) {
    this.fftDetector = new FFTWeakSignalDetector({
      sampleRate: NATURAL_PREDICTION_CONFIG.fft.sampleRate,
      windowSize: NATURAL_PREDICTION_CONFIG.fft.windowSize
    });
    
    this.config = {
      weights: config.weights || [0.4, 0.3, 0.3], // Pesos iniciais
      enableOptimization: config.enableOptimization ?? true,
      optimizationInterval: config.optimizationInterval ?? 100,
      alertThresholds: {
        ...NATURAL_PREDICTION_CONFIG.alerts,
        ...(config.alertThresholds || {})
      }
    };
    
    this.currentWeights = [...this.config.weights];
    this.callCount = 0;
  }
  
  /**
   * Realiza uma previsão com base nos dados de entrada
   */
  public async predict(
    timeSeries: number[],
    historicalData?: {
      inputs: number[][];  // Dados históricos para otimização
      targets: number[];   // Valores alvo históricos
    }
  ): Promise<NaturalPredictionResult> {
    const startTime = Date.now();
    
    // 1. Executar análises em paralelo
    const [fftResult, chaosResult, waveResult] = await Promise.all([
      this.analyzeWithFFT(timeSeries),
      this.analyzeChaos(timeSeries),
      this.analyzeWaves(timeSeries)
    ]);
    
    // 2. Otimizar pesos se necessário
    if (this.config.enableOptimization && 
        historicalData && 
        (this.callCount % this.config.optimizationInterval === 0)) {
      await this.optimizeWeights(historicalData.inputs, historicalData.targets);
    }
    
    // 3. Calcular previsão ponderada
    const prediction = this.calculateWeightedPrediction([
      fftResult.score,
      chaosResult.score,
      waveResult.score
    ]);
    
    // 4. Calcular confiança (média ponderada das confianças)
    const confidence = this.calculateWeightedPrediction([
      fftResult.confidence,
      chaosResult.confidence,
      waveResult.confidence
    ]);
    
    // 5. Gerar alertas
    const alert = this.generateAlert(prediction, confidence);
    
    this.callCount++;
    
    return {
      timestamp: Date.now(),
      prediction,
      confidence,
      components: {
        fft: fftResult.score,
        chaos: chaosResult.score,
        waves: waveResult.score
      },
      weights: [...this.currentWeights],
      alerts: alert,
      metadata: {
        executionTime: Date.now() - startTime,
        version: '1.0.0'
      }
    };
  }
  
  /**
   * Atualiza os pesos manualmente
   */
  public updateWeights(weights: number[]): void {
    if (weights.length !== 3) {
      throw new Error('Expected 3 weights [fft, chaos, waves]');
    }
    
    // Normalizar para soma = 1
    const sum = weights.reduce((s, w) => s + w, 0);
    this.currentWeights = weights.map(w => w / sum);
  }
  
  /**
   * Obtém os pesos atuais
   */
  public getWeights(): number[] {
    return [...this.currentWeights];
  }
  
  // ===== Métodos de Análise =====
  
  private async analyzeWithFFT(timeSeries: number[]) {
    const result = this.fftDetector.detectWeakSignals(timeSeries);
    
    // Pontuação baseada na energia do sinal e anomalias
    const energyScore = Math.min(1, result.spectrum.reduce((s, x) => s + x, 0) / 100);
    const anomalyScore = result.anomalyScore;
    
    // Combinação de energia e anomalias
    const score = Math.min(1, energyScore * 0.7 + anomalyScore * 0.3);
    
    // Confiança baseada na relação sinal-ruído
    const confidence = Math.min(1, result.signalToNoiseRatio / 10);
    
    return { score, confidence };
  }
  
  private async analyzeChaos(timeSeries: number[]) {
    const result = lyapunovChaosDetector.calculateLyapunovExponent(timeSeries);
    
    // Pontuação baseada no expoente de Lyapunov
    let score = 0;
    if (result.exponent > 0) {
      // Sistema caótico - maior expoente = maior pontuação
      score = Math.min(1, result.exponent * 2);
    }
    
    // Confiança baseada na dimensão fractal
    const confidence = Math.min(1, result.fractalDimension / 2);
    
    return { score, confidence };
  }
  
  private async analyzeWaves(timeSeries: number[]) {
    const result = standingWaveAnalyzer.analyzeWavePattern(timeSeries);
    
    // Pontuação baseada no padrão de onda
    let score = 0;
    switch (result.wavePattern) {
      case 'STANDING_WAVE':
      case 'RESONANCE':
        score = 0.8 + (result.resonanceScore * 0.2);
        break;
      case 'BEAT_PATTERN':
        score = 0.6;
        break;
      case 'TRAVELING_WAVE':
        score = 0.4;
        break;
      default:
        score = 0.1;
    }
    
    // Confiança baseada na amplitude e ressonância
    const confidence = Math.min(1, 
      (result.amplitude * 0.7) + 
      (result.resonanceScore * 0.3)
    );
    
    return { score, confidence };
  }
  
  // ===== Métodos de Otimização =====
  
  private async optimizeWeights(
    historicalInputs: number[][], 
    historicalTargets: number[]
  ): Promise<void> {
    // Criar função de fitness para o otimizador
    const fitnessFunction = (weights: number[]): number => {
      let totalError = 0;
      
      for (let i = 0; i < historicalInputs.length; i++) {
        const input = historicalInputs[i];
        const target = historicalTargets[i];
        
        // Garantir que temos 3 componentes (fft, chaos, waves)
        const components = [...input];
        while (components.length < 3) components.push(0);
        
        // Calcular previsão com os pesos atuais
        const prediction = this.calculateWeightedPrediction(
          components.slice(0, 3),
          weights
        );
        
        // Erro quadrático
        totalError += Math.pow(prediction - target, 2);
      }
      
      // Queremos maximizar o negativo do erro (quanto menor o erro, melhor)
      return -totalError / historicalInputs.length;
    };
    
    // Configurar e executar o otimizador
    const optimizer = defaultWeightOptimizer;
    // @ts-ignore - Atualizar a função de fitness
    optimizer.fitnessFn = fitnessFunction;
    
    const result = await optimizer.optimize(3); // 3 pesos para otimizar
    
    // Atualizar pesos com o resultado da otimização
    this.currentWeights = result.bestWeights;
  }
  
  // ===== Métodos Auxiliares =====
  
  private calculateWeightedPrediction(
    scores: number[],
    weights: number[] = this.currentWeights
  ): number {
    // Garantir que temos pesos válidos
    const validWeights = weights && weights.length === scores.length 
      ? weights 
      : new Array(scores.length).fill(1 / scores.length);
    
    // Normalizar pesos para soma = 1
    const sum = validWeights.reduce((s, w) => s + Math.max(0, w), 0);
    const normalizedWeights = sum > 0 
      ? validWeights.map(w => Math.max(0, w) / sum)
      : new Array(scores.length).fill(1 / scores.length);
    
    // Calcular média ponderada
    let weightedSum = 0;
    for (let i = 0; i < scores.length; i++) {
      weightedSum += (scores[i] || 0) * normalizedWeights[i];
    }
    
    return Math.max(0, Math.min(1, weightedSum));
  }
  
  private generateAlert(
    prediction: number, 
    confidence: number
  ): { level: AlertLevel; message: string } {
    const base = NATURAL_PREDICTION_CONFIG.alerts;
    const thresholds = this.config.alertThresholds || base;
    
    // Ajustar limiares com base na confiança
    const scaled = {
      low: (thresholds.low || base.low || 0.3) * confidence,
      medium: (thresholds.medium || base.medium || 0.5) * confidence,
      high: (thresholds.high || base.high || 0.7) * confidence,
      critical: (thresholds.critical || base.critical || 0.9) * confidence
    };
    
    let alert = {
      level: 'none' as AlertLevel,
      message: 'Sem alertas ativos.'
    };
    
    if (prediction >= scaled.critical) {
      alert = {
        level: 'critical',
        message: 'Alerta Crítico: Evento extremamente provável!'
      };
    } else if (prediction >= scaled.high) {
      alert = {
        level: 'high',
        message: 'Alto Risco: Evento altamente provável.'
      };
    } else if (prediction >= scaled.medium) {
      alert = {
        level: 'medium',
        message: 'Risco Moderado: Evento possível.'
      };
    } else if (prediction >= scaled.low) {
      alert = {
        level: 'low',
        message: 'Baixo Risco: Evento pouco provável.'
      };
    }
    
    // Ensure the alert level is valid
    return {
      level: toAlertLevel(alert.level),
      message: alert.message
    };
  }
}

// Exportar instância padrão
export const naturalPredictionSystem = new NaturalPredictionSystem({
  weights: [0.4, 0.3, 0.3],
  enableOptimization: true,
  optimizationInterval: 100
});
