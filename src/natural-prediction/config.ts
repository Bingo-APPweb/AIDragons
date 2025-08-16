// src/natural-prediction/config.ts

/**
 * Configuration for the Natural Prediction System
 * Centralized configuration for all components
 */

export interface FFTSettings {
  sampleRate: number;      // Hz
  windowSize: number;      // Samples (power of 2)
  infrasonicThreshold: number; // Hz
}

export interface ChaosSettings {
  embeddingDimension: number;
  timeDelay: number;
  epsilon: number;
  minNeighbors: number;
}

export interface EvolutionSettings {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  eliteSize: number;
  maxGenerations: number;
}

export interface WaveAnalysisSettings {
  samplingRate: number;
  resonanceThreshold: number;
  minWaveAmplitude: number;
}

export interface AlertThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// Main configuration object
export const NATURAL_PREDICTION_CONFIG = {
  // FFT Configuration
  fft: {
    sampleRate: 1000,      // Hz
    windowSize: 1024,      // Samples (power of 2)
    infrasonicThreshold: 20 // Hz
  },
  
  // Lyapunov Chaos Detection
  chaos: {
    embeddingDimension: 3,
    timeDelay: 1,
    epsilon: 1e-8,
    minNeighbors: 5
  },
  
  // Evolutionary Algorithm
  evolution: {
    populationSize: 100,
    mutationRate: 0.01,
    crossoverRate: 0.7,
    eliteSize: 10,
    maxGenerations: 1000
  },
  
  // Wave Analysis
  waves: {
    samplingRate: 1000,    // Hz
    resonanceThreshold: 0.8,
    minWaveAmplitude: 0.1
  },
  
  // Alert Thresholds (0-1)
  alerts: {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    critical: 0.9
  },
  
  // System Settings
  system: {
    maxProcessingTime: 5000, // ms
    logLevel: 'info',       // 'debug' | 'info' | 'warn' | 'error'
    savePredictions: true,
    predictionHistorySize: 1000
  }
} as const;

// Type exports for better type safety
export type NaturalPredictionConfig = typeof NATURAL_PREDICTION_CONFIG;
export type FFTSettingsT = typeof NATURAL_PREDICTION_CONFIG.fft;
export type ChaosSettingsT = typeof NATURAL_PREDICTION_CONFIG.chaos;
export type EvolutionSettingsT = typeof NATURAL_PREDICTION_CONFIG.evolution;
export type WaveAnalysisSettingsT = typeof NATURAL_PREDICTION_CONFIG.waves;
export type AlertThresholdsT = typeof NATURAL_PREDICTION_CONFIG.alerts;
