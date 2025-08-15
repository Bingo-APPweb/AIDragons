// tests/natural-prediction/natural-system.test.ts

import { 
  NaturalPredictionSystem, 
  naturalPredictionSystem,
  type NaturalPredictionResult
} from '../../src/natural-prediction/integration/natural-system';

// Dados de exemplo para testes
const generateTestData = (length: number, pattern: 'sine' | 'chaotic' | 'random' = 'sine') => {
  const data: number[] = [];
  
  switch (pattern) {
    case 'sine':
      // Onda senoidal pura
      for (let i = 0; i < length; i++) {
        data.push(Math.sin(i * 0.1));
      }
      break;
      
    case 'chaotic':
      // Dados caóticos (mapa logístico)
      let x = 0.5;
      const r = 3.8; // Parâmetro caótico
      
      for (let i = 0; i < length; i++) {
        x = r * x * (1 - x);
        data.push(x);
      }
      break;
      
    case 'random':
      // Dados aleatórios
      for (let i = 0; i < length; i++) {
        data.push(Math.random() * 2 - 1); // Entre -1 e 1
      }
      break;
  }
  
  return data;
};

describe('NaturalPredictionSystem', () => {
  let system: NaturalPredictionSystem;
  
  beforeEach(() => {
    // Criar uma nova instância para cada teste
    system = new NaturalPredictionSystem({
      weights: [0.4, 0.3, 0.3],
      enableOptimization: false
    });
  });
  
  describe('Previsão Básica', () => {
    it('deve retornar uma previsão para dados de entrada', async () => {
      const testData = generateTestData(1000, 'sine');
      const result = await system.predict(testData);
      
      // Verificar estrutura básica do resultado
      expect(result).toHaveProperty('prediction');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('weights');
      expect(result).toHaveProperty('alerts');
      
      // Verificar se os valores estão dentro dos limites esperados
      expect(result.prediction).toBeGreaterThanOrEqual(0);
      expect(result.prediction).toBeLessThanOrEqual(1);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      // Verificar componentes
      expect(result.components.fft).toBeDefined();
      expect(result.components.chaos).toBeDefined();
      expect(result.components.waves).toBeDefined();
      
      // Verificar pesos
      expect(result.weights).toHaveLength(3);
      const sumWeights = result.weights.reduce((s, w) => s + w, 0);
      expect(sumWeights).toBeCloseTo(1, 5); // Soma deve ser ~1
    });
    
    it('deve gerar alertas apropriados com base na previsão', async () => {
      // Testar com diferentes níveis de previsão
      const testCases = [
        { prediction: 0.9, expectedLevel: 'critical' },
        { prediction: 0.7, expectedLevel: 'high' },
        { prediction: 0.5, expectedLevel: 'medium' },
        { prediction: 0.2, expectedLevel: 'low' },
        { prediction: 0.05, expectedLevel: 'none' }
      ];
      
      for (const testCase of testCases) {
        // @ts-ignore - Teste de método privado
        const alert = system.generateAlert(testCase.prediction, 0.8);
        expect(alert.level).toBe(testCase.expectedLevel);
      }
    });
  });
  
  describe('Otimização de Pesos', () => {
    it('deve otimizar os pesos com base em dados históricos', async () => {
      // Criar dados históricos sintéticos
      const historicalInputs: number[][] = [];
      const historicalTargets: number[] = [];
      
      // Gerar 100 amostras de treinamento
      for (let i = 0; i < 100; i++) {
        const pattern = i % 3 === 0 ? 'sine' : (i % 3 === 1 ? 'chaotic' : 'random');
        const data = generateTestData(100, pattern as any);
        
        // Calcular características (features)
        const fftScore = Math.random() * 0.5; // Valor simulado
        const chaosScore = pattern === 'chaotic' ? 0.8 : 0.2;
        const waveScore = pattern === 'sine' ? 0.9 : 0.2;
        
        // Alvo: 1 para padrões periódicos, 0 para aleatórios
        const target = pattern === 'random' ? 0 : 1;
        
        historicalInputs.push([fftScore, chaosScore, waveScore]);
        historicalTargets.push(target);
      }
      
      // Habilitar otimização
      const optSystem = new NaturalPredictionSystem({
        enableOptimization: true,
        optimizationInterval: 1 // Otimizar a cada chamada
      });
      
      // Executar previsão com otimização
      const testData = generateTestData(100, 'sine');
      const result = await optSystem.predict(testData, {
        inputs: historicalInputs,
        targets: historicalTargets
      });
      
      // Verificar se os pesos foram ajustados
      const initialWeights = [0.4, 0.3, 0.3];
      const optimizedWeights = result.weights;
      
      // Verificar se os pesos mudaram (não podemos garantir a direção)
      const weightsChanged = optimizedWeights.some(
        (w, i) => Math.abs(w - initialWeights[i]) > 0.1
      );
      
      expect(weightsChanged).toBe(true);
    });
  });
  
  describe('Manipulação de Pesos', () => {
    it('deve permitir atualizar e recuperar pesos manualmente', () => {
      const newWeights = [0.6, 0.2, 0.2];
      
      // Atualizar pesos
      system.updateWeights(newWeights);
      
      // Verificar se os pesos foram atualizados
      const currentWeights = system.getWeights();
      expect(currentWeights).toEqual(newWeights);
      
      // Verificar normalização
      const sum = currentWeights.reduce((s, w) => s + w, 0);
      expect(sum).toBeCloseTo(1, 5);
    });
    
    it('deve normalizar pesos inválidos', () => {
      // Testar com pesos que não somam 1
      system.updateWeights([1, 1, 1]);
      
      const normalizedWeights = system.getWeights();
      const sum = normalizedWeights.reduce((s, w) => s + w, 0);
      
      expect(sum).toBeCloseTo(1, 5);
      expect(normalizedWeights[0]).toBeCloseTo(1/3, 5);
      expect(normalizedWeights[1]).toBeCloseTo(1/3, 5);
      expect(normalizedWeights[2]).toBeCloseTo(1/3, 5);
    });
  });
  
  describe('Instância Padrão', () => {
    it('deve exportar uma instância configurada', async () => {
      expect(naturalPredictionSystem).toBeInstanceOf(NaturalPredictionSystem);
      
      // Testar a instância com dados de teste
      const testData = generateTestData(500, 'chaotic');
      const result = await naturalPredictionSystem.predict(testData);
      
      // Verificar estrutura básica
      expect(result).toHaveProperty('prediction');
      expect(result).toHaveProperty('confidence');
      expect(result.components).toBeDefined();
      expect(result.weights).toHaveLength(3);
    });
  });
  
  describe('Desempenho', () => {
    it('deve processar grandes conjuntos de dados em tempo razoável', async () => {
      const largeData = generateTestData(10000, 'sine');
      const startTime = Date.now();
      
      const result = await system.predict(largeData);
      const executionTime = Date.now() - startTime;
      
      // Verificar se a execução foi bem-sucedida
      expect(result).toBeDefined();
      
      // Verificar tempo de execução (menos de 2 segundos para 10.000 pontos)
      // Isso pode precisar de ajuste com base no hardware
      console.log(`Tempo de execução para 10.000 pontos: ${executionTime}ms`);
      expect(executionTime).toBeLessThan(2000);
    });
  });
});
