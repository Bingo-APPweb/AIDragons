// tests/natural-prediction/weight-optimizer.test.ts

import { 
  EvolutionaryWeightOptimizer, 
  createFitnessFunction,
  defaultWeightOptimizer
} from '../../src/natural-prediction/evolution/weight-optimizer';

describe('EvolutionaryWeightOptimizer', () => {
  // Dados de exemplo para teste
  const sampleData = [
    [1.0, 0.5, 0.2],
    [0.8, 0.7, 0.3],
    [0.3, 0.9, 0.8],
    [0.6, 0.4, 0.9]
  ];
  
  const targetValues = [0.9, 0.8, 0.7, 0.6];
  
  // Modelo de exemplo: combinação linear ponderada
  const linearModel = (weights: number[], features: number[]): number => {
    return features.reduce((sum, f, i) => sum + f * weights[i], 0);
  };
  
  describe('Otimização Básica', () => {
    it('deve encontrar pesos ótimos para um problema simples', () => {
      // Configuração simplificada para teste rápido
      const config = {
        populationSize: 50,
        maxGenerations: 50,
        eliteSize: 5,
        mutationRate: 0.1,
        crossoverRate: 0.8
      };
      
      const fitnessFn = createFitnessFunction(sampleData, targetValues, linearModel);
      const optimizer = new EvolutionaryWeightOptimizer(fitnessFn, config);
      
      // Executar otimização
      const result = optimizer.optimize(3); // 3 pesos para otimizar
      
      // Verificar resultados
      expect(result.bestWeights).toHaveLength(3);
      expect(result.bestFitness).toBeLessThan(0); // Fitness é o negativo do erro
      expect(result.fitnessHistory.length).toBeLessThanOrEqual(config.maxGenerations);
      
      // Verificar se os pesos somam aproximadamente 1 (já que são normalizados)
      const sum = result.bestWeights.reduce((s, w) => s + w, 0);
      expect(sum).toBeCloseTo(1, 5);
    });
    
    it('deve melhorar a aptidão ao longo das gerações', () => {
      const fitnessFn = (weights: number[]) => {
        // Função de teste simples com máximo em [0.5, 0.5]
        const x = weights[0];
        const y = weights[1] || 0;
        return -(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
      };
      
      const optimizer = new EvolutionaryWeightOptimizer(fitnessFn, {
        populationSize: 30,
        maxGenerations: 20
      });
      
      const result = optimizer.optimize(2);
      
      // A aptidão deve melhorar (aumentar) ao longo das gerações
      const fitnessImprovement = result.fitnessHistory[result.fitnessHistory.length - 1] - 
                               result.fitnessHistory[0];
      
      expect(fitnessImprovement).toBeGreaterThan(0);
      expect(result.bestWeights[0]).toBeCloseTo(0.5, 1);
      expect(result.bestWeights[1]).toBeCloseTo(0.5, 1);
    });
  });
  
  describe('Função de Fitness', () => {
    it('deve criar uma função de fitness corretamente', () => {
      const fitnessFn = createFitnessFunction(sampleData, targetValues, linearModel);
      
      // Testar com pesos aleatórios
      const weights1 = [0.3, 0.3, 0.4];
      const fitness1 = fitnessFn(weights1);
      
      // Fitness deve ser um número
      expect(typeof fitness1).toBe('number');
      
      // Fitness deve ser o negativo do erro quadrático médio
      let errorSum = 0;
      for (let i = 0; i < sampleData.length; i++) {
        const prediction = linearModel(weights1, sampleData[i]);
        errorSum += Math.pow(prediction - targetValues[i], 2);
      }
      const expectedFitness = -errorSum / sampleData.length;
      
      expect(fitness1).toBeCloseTo(expectedFitness, 10);
    });
    
    it('deve lidar com dados vazios', () => {
      const emptyFitnessFn = createFitnessFunction([], [], linearModel);
      const fitness = emptyFitnessFn([0.5, 0.5]);
      
      // Com dados vazios, deve retornar 0 (evitar divisão por zero)
      expect(fitness).toBe(0);
    });
  });
  
  describe('Diversidade Genética', () => {
    it('deve manter diversidade genética', () => {
      const fitnessFn = (weights: number[]) => {
        // Função com múltiplos máximos locais
        const x = weights[0];
        return -Math.abs(Math.sin(x * 10) * (1 - x));
      };
      
      const optimizer = new EvolutionaryWeightOptimizer(fitnessFn, {
        populationSize: 50,
        maxGenerations: 30,
        mutationRate: 0.2 // Taxa de mutação mais alta para manter diversidade
      });
      
      const result = optimizer.optimize(1);
      
      // A diversidade deve ser maior que zero
      expect(result.diversity).toBeGreaterThan(0);
    });
  });
  
  describe('Convergência', () => {
    it('deve detectar convergência prematura', () => {
      const fitnessFn = (weights: number[]) => {
        // Função simples com máximo em 0.5
        const x = weights[0];
        return -Math.pow(x - 0.5, 2);
      };
      
      const optimizer = new EvolutionaryWeightOptimizer(fitnessFn, {
        populationSize: 20,
        maxGenerations: 100,
        mutationRate: 0.01
      });
      
      const result = optimizer.optimize(1);
      
      // Deve convergir antes do número máximo de gerações
      expect(result.fitnessHistory.length).toBeLessThan(100);
      expect(result.convergence).toBeGreaterThan(0.5);
    });
  });
  
  describe('Instância Padrão', () => {
    it('deve exportar uma instância configurada', () => {
      expect(defaultWeightOptimizer).toBeInstanceOf(EvolutionaryWeightOptimizer);
      
      // Testar se a instância pode ser usada
      const fitnessFn = (weights: number[]) => 
        -weights.reduce((sum, w) => sum + Math.pow(w - 0.5, 2), 0);
      
      // @ts-ignore - Sobrescrever a função de fitness
      defaultWeightOptimizer.fitnessFn = fitnessFn;
      
      const result = defaultWeightOptimizer.optimize(3);
      
      expect(result.bestWeights).toHaveLength(3);
      expect(result.bestFitness).toBeLessThan(0);
    });
  });
  
  describe('Otimização com Restrições', () => {
    it('deve respeitar os limites dos pesos (0-1)', () => {
      const fitnessFn = (weights: number[]) => {
        // Penalizar pesos fora do intervalo [0,1]
        const penalty = weights.reduce((sum, w) => {
          if (w < 0) return sum + Math.abs(w);
          if (w > 1) return sum + (w - 1);
          return sum;
        }, 0);
        
        // Função objetivo + penalidade
        return -Math.pow(weights[0] - 0.7, 2) - penalty * 1000;
      };
      
      const optimizer = new EvolutionaryWeightOptimizer(fitnessFn, {
        populationSize: 50,
        maxGenerations: 30
      });
      
      const result = optimizer.optimize(2);
      
      // Verificar se todos os pesos estão no intervalo [0,1]
      result.bestWeights.forEach(w => {
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(1);
      });
      
      // O ótimo deve estar próximo de 0.7 para o primeiro peso
      expect(result.bestWeights[0]).toBeCloseTo(0.7, 1);
    });
  });
});
