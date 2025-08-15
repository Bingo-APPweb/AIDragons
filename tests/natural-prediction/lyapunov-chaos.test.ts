// tests/natural-prediction/lyapunov-chaos.test.ts

import { LyapunovChaosDetector, lyapunovChaosDetector } from '../../src/natural-prediction/analyzers/lyapunov-chaos';
import { NATURAL_PREDICTION_CONFIG } from '../../src/natural-prediction/config';

describe('LyapunovChaosDetector', () => {
  let detector: LyapunovChaosDetector;
  
  // Test data: Série temporal de um sistema caótico (mapa logístico)
  function generateLogisticMap(x0: number, r: number, length: number): number[] {
    const series = [x0];
    for (let i = 1; i < length; i++) {
      const prev = series[i - 1];
      series.push(r * prev * (1 - prev));
    }
    return series;
  }
  
  // Série temporal periódica (seno)
  function generateSineWave(length: number, frequency: number = 0.1): number[] {
    return Array.from({ length }, (_, i) => Math.sin(2 * Math.PI * frequency * i));
  }
  
  // Série temporal aleatória
  function generateRandomSeries(length: number): number[] {
    return Array.from({ length }, () => Math.random());
  }
  
  beforeEach(() => {
    // Criar detector com configuração padrão
    detector = new LyapunovChaosDetector(NATURAL_PREDICTION_CONFIG.chaos);
  });
  
  describe('Detecção de Caos', () => {
    it('deve identificar corretamente um sistema caótico (mapa logístico com r=4)', () => {
      // Mapa logístico é caótico quando r ≈ 3.57-4.0
      const chaoticSeries = generateLogisticMap(0.1, 3.9, 1000);
      
      const result = detector.calculateLyapunovExponent(chaoticSeries);
      
      // Verificar que o sistema é caótico
      expect(result.isChaotic).toBe(true);
      expect(result.exponent).toBeGreaterThan(0);
      
      // Verificar que o nível de caos é suficientemente alto
      expect(['WEAKLY_CHAOTIC', 'CHAOTIC', 'STRONGLY_CHAOTIC']).toContain(result.chaosLevel);
      
      // Verificar que a dimensão fractal está dentro de uma faixa esperada
      expect(result.fractalDimension).toBeGreaterThan(0.5);
      expect(result.fractalDimension).toBeLessThan(2.0);
    });
    
    it('deve identificar corretamente um sistema periódico (seno)', () => {
      const periodicSeries = generateSineWave(1000);
      
      const result = detector.calculateLyapunovExponent(periodicSeries);
      
      // Sistema periódico deve ter expoente de Lyapunov negativo
      expect(result.isChaotic).toBe(false);
      expect(result.exponent).toBeLessThan(0);
      expect(result.chaosLevel).toBe('STABLE');
    });
    
    it('deve identificar corretamente um sistema aleatório', () => {
      const randomSeries = generateRandomSeries(1000);
      
      const result = detector.calculateLyapunovExponent(randomSeries);
      
      // Ruído puro geralmente tem expoente muito alto
      expect(result.isChaotic).toBe(true);
      expect(result.chaosLevel).toBe('STRONGLY_CHAOTIC');
      expect(result.fractalDimension).toBeGreaterThan(1.5);
    });
  });
  
  describe('Detecção de Bifurcações', () => {
    it('deve detectar pontos de bifurcação em uma série com mudança de regime', () => {
      // Criar série que muda de periódica para caótica
      const periodicPart = generateSineWave(500, 0.05);
      const chaoticPart = generateLogisticMap(0.1, 3.9, 500);
      const combinedSeries = [...periodicPart, ...chaoticPart];
      
      const result = detector.calculateLyapunovExponent(combinedSeries);
      
      // Deve encontrar pelo menos uma bifurcação
      expect(result.bifurcationPoints.length).toBeGreaterThan(0);
      
      // A principal bifurcação deve estar próxima do ponto de mudança (índice 500)
      const mainBifurcation = result.bifurcationPoints[0];
      expect(mainBifurcation.index).toBeGreaterThan(450);
      expect(mainBifurcation.index).toBeLessThan(550);
      expect(mainBifurcation.type).toBe('period-doubling');
    });
  });
  
  describe('Reconstrução do Espaço de Fase', () => {
    it('deve reconstruir corretamente o espaço de fase', () => {
      const series = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const dimension = 3;
      const delay = 2;
      
      // @ts-ignore - Acessando método privado para teste
      const phaseSpace = detector.reconstructPhaseSpace(series, dimension, delay);
      
      // Verificar dimensões
      expect(phaseSpace.length).toBe(series.length - (dimension - 1) * delay);
      expect(phaseSpace[0].length).toBe(dimension);
      
      // Verificar alguns valores
      expect(phaseSpace[0]).toEqual([1, 3, 5]);  // Com delay=2
      expect(phaseSpace[1]).toEqual([2, 4, 6]);
    });
  });
  
  describe('Classificação de Nível de Caos', () => {
    it('deve classificar corretamente diferentes níveis de caos', () => {
      // @ts-ignore - Acessando método privado para teste
      const classify = (exp: number) => detector.classifyChaosLevel(exp);
      
      expect(classify(-0.2)).toBe('STABLE');
      expect(classify(-0.05)).toBe('MARGINALLY_STABLE');
      expect(classify(0.05)).toBe('EDGE_OF_CHAOS');
      expect(classify(0.3)).toBe('WEAKLY_CHAOTIC');
      expect(classify(0.7)).toBe('CHAOTIC');
      expect(classify(1.5)).toBe('STRONGLY_CHAOTIC');
    });
  });
  
  describe('Instância Exportada', () => {
    it('deve exportar uma instância configurada', () => {
      // Verificar se a instância exportada usa a configuração padrão
      expect(lyapunovChaosDetector).toBeInstanceOf(LyapunovChaosDetector);
      
      // Verificar se a instância pode processar dados
      const series = generateSineWave(100);
      const result = lyapunovChaosDetector.calculateLyapunovExponent(series);
      
      expect(result).toHaveProperty('exponent');
      expect(result).toHaveProperty('isChaotic');
      expect(result).toHaveProperty('fractalDimension');
    });
  });
});
