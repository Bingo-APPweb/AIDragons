// src/natural-prediction/evolution/weight-optimizer.ts

import { EvolutionSettings } from '../config';

type FitnessFunction = (weights: number[]) => number;
type Individual = {
  genes: number[];
  fitness: number;
};

/**
 * 🧬 Evolutionary Weight Optimizer
 * 
 * Otimiza pesos para combinar diferentes modelos de previsão usando
 * algoritmos genéticos inspirados na seleção natural.
 * 
 * Baseado nos princípios de:
 * 1. Seleção Natural (sobrevivência dos mais aptos)
 * 2. Recombinação Genética (crossover)
 * 3. Mutação (variação genética)
 * 4. Elitismo (preservação dos melhores indivíduos)
 */

export interface OptimizationResult {
  bestWeights: number[];
  bestFitness: number;
  fitnessHistory: number[];
  convergence: number; // 0-1, quão rápido convergiu
  diversity: number;   // Diversidade genética final
  stats: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
}

export class EvolutionaryWeightOptimizer {
  private config: Required<EvolutionSettings>;
  private fitnessFn: FitnessFunction;
  private population: Individual[] = [];
  
  constructor(
    fitnessFunction: FitnessFunction,
    config?: Partial<EvolutionSettings>
  ) {
    this.fitnessFn = fitnessFunction;
    this.config = {
      populationSize: config?.populationSize ?? 100,
      mutationRate: config?.mutationRate ?? 0.01,
      crossoverRate: config?.crossoverRate ?? 0.7,
      eliteSize: config?.eliteSize ?? 10,
      maxGenerations: config?.maxGenerations ?? 1000,
    };
  }
  
  /**
   * Inicializa a população com pesos aleatórios
   */
  private initializePopulation(weightsCount: number): void {
    this.population = [];
    
    for (let i = 0; i < this.config.populationSize; i++) {
      const genes = Array(weightsCount)
        .fill(0)
        .map(() => Math.random());
      
      // Normalizar para soma = 1
      const sum = genes.reduce((s, g) => s + g, 0);
      const normalizedGenes = genes.map(g => g / sum);
      
      this.population.push({
        genes: normalizedGenes,
        fitness: 0
      });
    }
  }
  
  /**
   * Avalia a aptidão de todos os indivíduos
   */
  private evaluatePopulation(): void {
    for (const individual of this.population) {
      individual.fitness = this.fitnessFn(individual.genes);
    }
    
    // Ordenar por aptidão (maior primeiro)
    this.population.sort((a, b) => b.fitness - a.fitness);
  }
  
  /**
   * Seleciona pais usando roleta viciada
   */
  private selectParents(): [Individual, Individual] {
    // Converter aptidões para probabilidades (maior aptidão = maior chance)
    const totalFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0);
    const probabilities = this.population.map(ind => ind.fitness / totalFitness);
    
    // Selecionar dois pais diferentes
    const parent1 = this.selectByRoulette(probabilities);
    let parent2;
    
    do {
      parent2 = this.selectByRoulette(probabilities);
    } while (parent1 === parent2);
    
    return [this.population[parent1], this.population[parent2]];
  }
  
  /**
   * Seleção por roleta
   */
  private selectByRoulette(probabilities: number[]): number {
    let random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      sum += probabilities[i];
      if (random <= sum) return i;
    }
    
    return probabilities.length - 1; // Fallback
  }
  
  /**
   * Crossover (recombinação) de dois pais
   */
  private crossover(parent1: Individual, parent2: Individual): [number[], number[]] {
    if (Math.random() > this.config.crossoverRate) {
      // Sem crossover, retorna cópias dos pais
      return [[...parent1.genes], [...parent2.genes]];
    }
    
    // Ponto de corte aleatório
    const point = Math.floor(Math.random() * parent1.genes.length);
    
    // Filhos com partes trocadas
    const child1 = [
      ...parent1.genes.slice(0, point),
      ...parent2.genes.slice(point)
    ];
    
    const child2 = [
      ...parent2.genes.slice(0, point),
      ...parent1.genes.slice(point)
    ];
    
    return [child1, child2];
  }
  
  /**
   * Aplica mutação a um gene
   */
  private mutate(genes: number[]): void {
    for (let i = 0; i < genes.length; i++) {
      if (Math.random() < this.config.mutationRate) {
        // Mutação: pequena perturbação gaussiana
        genes[i] = Math.max(0, Math.min(1, genes[i] + (Math.random() * 0.2 - 0.1)));
      }
    }
    
    // Re-normalizar para soma = 1
    const sum = genes.reduce((s, g) => s + g, 0);
    if (sum > 0) {
      for (let i = 0; i < genes.length; i++) {
        genes[i] /= sum;
      }
    }
  }
  
  /**
   * Cria uma nova geração
   */
  private createNewGeneration(): void {
    const newPopulation: Individual[] = [];
    
    // Preservar elite (melhores indivíduos)
    for (let i = 0; i < this.config.eliteSize; i++) {
      if (i < this.population.length) {
        newPopulation.push({ ...this.population[i] });
      }
    }
    
    // Criar filhos até completar a população
    while (newPopulation.length < this.config.populationSize) {
      // Selecionar pais
      const [parent1, parent2] = this.selectParents();
      
      // Cruzar
      const [child1, child2] = this.crossover(parent1, parent2);
      
      // Mutar
      this.mutate(child1);
      this.mutate(child2);
      
      // Adicionar à nova população
      newPopulation.push({ genes: child1, fitness: 0 });
      if (newPopulation.length < this.config.populationSize) {
        newPopulation.push({ genes: child2, fitness: 0 });
      }
    }
    
    this.population = newPopulation;
  }
  
  /**
   * Calcula a diversidade da população
   */
  private calculateDiversity(): number {
    if (this.population.length <= 1) return 0;
    
    const geneCount = this.population[0].genes.length;
    let diversity = 0;
    
    // Para cada posição gênica
    for (let g = 0; g < geneCount; g++) {
      // Calcular média para este gene
      let sum = 0;
      for (const ind of this.population) {
        sum += ind.genes[g];
      }
      const mean = sum / this.population.length;
      
      // Calcular variância
      let variance = 0;
      for (const ind of this.population) {
        variance += Math.pow(ind.genes[g] - mean, 2);
      }
      variance /= this.population.length;
      
      diversity += Math.sqrt(variance);
    }
    
    return diversity / geneCount; // Média das diversidades por gene
  }
  
  /**
   * Executa a otimização evolutiva
   */
  public optimize(weightsCount: number): OptimizationResult {
    // Inicializar população
    this.initializePopulation(weightsCount);
    
    const fitnessHistory: number[] = [];
    let bestFitness = -Infinity;
    let bestWeights: number[] = [];
    let generation = 0;
    let convergence = 0;
    let noImprovementCount = 0;
    const maxNoImprovement = Math.ceil(this.config.maxGenerations * 0.1); // 10% das gerações
    
    // Loop evolutivo
    while (generation < this.config.maxGenerations && noImprovementCount < maxNoImprovement) {
      // Avaliar população
      this.evaluatePopulation();
      
      // Registrar estatísticas
      const currentBest = this.population[0].fitness;
      fitnessHistory.push(currentBest);
      
      // Atualizar melhor solução
      if (currentBest > bestFitness) {
        bestFitness = currentBest;
        bestWeights = [...this.population[0].genes];
        noImprovementCount = 0;
      } else {
        noImprovementCount++;
      }
      
      // Verificar convergência
      if (generation > 10) {
        const recentImprovement = Math.abs(
          (fitnessHistory[generation] - fitnessHistory[generation - 5]) /
          fitnessHistory[generation - 5]
        );
        
        if (recentImprovement < 0.001) {
          convergence = 1 - (noImprovementCount / maxNoImprovement);
          if (noImprovementCount >= maxNoImprovement) break;
        }
      }
      
      // Criar nova geração
      this.createNewGeneration();
      generation++;
    }
    
    // Calcular estatísticas finais
    const finalFitnesses = this.population.map(ind => ind.fitness);
    const mean = finalFitnesses.reduce((a, b) => a + b, 0) / finalFitnesses.length;
    const std = Math.sqrt(
      finalFitnesses.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / finalFitnesses.length
    );
    
    return {
      bestWeights,
      bestFitness,
      fitnessHistory,
      convergence: convergence || 1, // Se convergiu antes do tempo, considera 1
      diversity: this.calculateDiversity(),
      stats: {
        mean,
        std,
        min: Math.min(...finalFitnesses),
        max: bestFitness
      }
    };
  }
}

// Função utilitária para criar uma função de fitness com base em dados históricos
export function createFitnessFunction(
  historicalData: number[][],  // Cada linha é um vetor de características
  targetValues: number[],      // Valores alvo para cada amostra
  model: (weights: number[], features: number[]) => number // Função do modelo
): FitnessFunction {
  return (weights: number[]) => {
    let errorSum = 0;
    let count = 0;
    
    for (let i = 0; i < historicalData.length; i++) {
      const features = historicalData[i];
      const target = targetValues[i];
      
      try {
        const prediction = model(weights, features);
        const error = Math.pow(prediction - target, 2); // Erro quadrático
        errorSum += error;
        count++;
      } catch (e) {
        // Ignorar erros, mas podemos querer logá-los em produção
        console.warn(`Erro ao avaliar amostra ${i}:`, e);
      }
    }
    
    // Retornar o negativo do erro médio (quanto maior, melhor)
    // Adicionar um pequeno valor para evitar divisão por zero
    return -errorSum / (count || 1);
  };
}

// Exportar instância padrão
import { NATURAL_PREDICTION_CONFIG } from '../config';

export const defaultWeightOptimizer = new EvolutionaryWeightOptimizer(
  () => 0, // Será sobrescrito
  NATURAL_PREDICTION_CONFIG.evolution
);
