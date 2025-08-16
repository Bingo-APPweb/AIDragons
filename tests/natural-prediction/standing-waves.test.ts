// tests/natural-prediction/standing-waves.test.ts

import { 
  StandingWaveAnalyzer, 
  standingWaveAnalyzer,
  type StandingWaveResult,
  type WavePattern
} from '../../src/natural-prediction/analyzers/standing-waves';

describe('StandingWaveAnalyzer', () => {
  let analyzer: StandingWaveAnalyzer;
  
  // Gerar uma onda senoidal pura
  function generateSineWave(
    length: number, 
    frequency: number = 1, 
    amplitude: number = 1.0,
    sampleRate: number = 1000
  ): number[] {
    return Array.from(
      { length }, 
      (_, i) => amplitude * Math.sin(2 * Math.PI * frequency * (i / sampleRate))
    );
  }
  
  // Gerar uma onda estacionária
  function generateStandingWave(
    length: number,
    frequency: number = 1,
    nodes: number = 2,
    amplitude: number = 1.0,
    sampleRate: number = 1000
  ): number[] {
    return Array.from(
      { length },
      (_, i) => {
        const x = (i / length) * nodes * Math.PI;
        return amplitude * Math.sin(x) * Math.cos(2 * Math.PI * frequency * (i / sampleRate));
      }
    );
  }
  
  // Gerar padrão de batimento
  function generateBeatPattern(
    length: number,
    freq1: number = 10,
    freq2: number = 12,
    amplitude: number = 1.0,
    sampleRate: number = 1000
  ): number[] {
    return Array.from(
      { length },
      (_, i) => {
        const t = i / sampleRate;
        return amplitude * (
          Math.sin(2 * Math.PI * freq1 * t) + 
          Math.sin(2 * Math.PI * freq2 * t)
        ) / 2;
      }
    );
  }
  
  beforeEach(() => {
    analyzer = new StandingWaveAnalyzer({
      samplingRate: 1000,
      resonanceThreshold: 0.7,
      minWaveAmplitude: 0.01
    });
  });
  
  describe('Detecção de Ondas Estacionárias', () => {
    it('deve detectar corretamente uma onda estacionária simples', () => {
      const wave = generateStandingWave(1000, 5, 2);
      const result = analyzer.analyzeWavePattern(wave);
      
      expect(result.detected).toBe(true);
      expect(result.wavePattern).toBe('STANDING_WAVE');
      expect(result.nodes.length).toBeGreaterThan(1);
      expect(result.antinodes.length).toBeGreaterThan(0);
      expect(result.resonanceScore).toBeGreaterThan(0.5);
    });
    
    it('deve identificar nós e antinós corretamente', () => {
      // Onda estacionária com 3 nós (incluindo as extremidades)
      const wave = generateStandingWave(1000, 3, 3);
      const result = analyzer.analyzeWavePattern(wave);
      
      // Deve encontrar pelo menos 2 nós (os internos)
      expect(result.nodes.length).toBeGreaterThanOrEqual(2);
      
      // Verificar se os nós estão aproximadamente nos lugares certos
      const expectedNodePositions = [333, 666]; // Posições aproximadas
      const nodePositions = result.nodes.filter((_, i) => i > 0 && i < result.nodes.length - 1);
      
      expectedNodePositions.forEach((expectedPos, i) => {
        if (i < nodePositions.length) {
          const actualPos = nodePositions[i];
          expect(Math.abs(actualPos - expectedPos)).toBeLessThan(50); // Tolerância de 5%
        }
      });
    });
  });
  
  describe('Análise de Padrões de Onda', () => {
    it('deve identificar corretamente um padrão de batimento', () => {
      const beatWave = generateBeatPattern(1000, 10, 12);
      const result = analyzer.analyzeWavePattern(beatWave);
      
      expect(result.wavePattern).toBe('BEAT_PATTERN');
      expect(result.interferencePattern).toBe('CONSTRUCTIVE');
    });
    
    it('deve identificar uma onda progressiva simples', () => {
      const sineWave = generateSineWave(1000, 5);
      const result = analyzer.analyzeWavePattern(sineWave);
      
      expect(result.wavePattern).toBe('TRAVELING_WAVE');
      expect(result.detected).toBe(true);
      expect(result.frequency).toBeCloseTo(5, 1);
    });
    
    it('deve detectar ressonância quando houver um componente dominante', () => {
      // Onda com um componente de frequência dominante
      const wave = [];
      for (let i = 0; i < 1000; i++) {
        // Componente dominante + ruído
        wave.push(
          Math.sin(i * 0.1) + 0.1 * Math.sin(i * 0.5) + 0.05 * (Math.random() - 0.5)
        );
      }
      
      const result = analyzer.analyzeWavePattern(wave);
      
      // Deve ser classificado como ressonância devido ao componente dominante
      expect(result.wavePattern).toBe('RESONANCE');
      expect(result.resonanceScore).toBeGreaterThan(0.7);
    });
  });
  
  describe('Análise Espectral', () => {
    it('deve calcular corretamente a distribuição de energia', () => {
      // Onda com componentes em diferentes faixas de frequência
      const wave = [];
      for (let i = 0; i < 1000; i++) {
        wave.push(
          0.7 * Math.sin(i * 0.05) +  // Baixa frequência
          0.3 * Math.sin(i * 0.5)     // Média frequência
        );
      }
      
      const result = analyzer.analyzeWavePattern(wave);
      
      // Deve ter energia nas bandas de baixa e média frequência
      const lowBand = result.energyDistribution.find(b => b.maxFreq <= 20);
      const midBand = result.energyDistribution.find(
        b => b.minFreq >= 20 && b.maxFreq <= 100
      );
      
      expect(lowBand).toBeDefined();
      expect(midBand).toBeDefined();
      
      // A energia deve estar principalmente na banda de baixa frequência
      expect(lowBand!.energy).toBeGreaterThan(midBand!.energy);
    });
  });
  
  describe('Casos Extremos', () => {
    it('deve lidar com entrada vazia', () => {
      const result = analyzer.analyzeWavePattern([]);
      
      expect(result.detected).toBe(false);
      expect(result.wavePattern).toBe('NO_PATTERN');
      expect(result.nodes).toHaveLength(0);
      expect(result.antinodes).toHaveLength(0);
    });
    
    it('deve lidar com sinal constante', () => {
      const constantSignal = new Array(1000).fill(1.0);
      const result = analyzer.analyzeWavePattern(constantSignal);
      
      expect(result.detected).toBe(false);
      expect(result.wavePattern).toBe('NO_PATTERN');
      expect(result.amplitude).toBe(1.0);
    });
    
    it('deve lidar com ruído branco', () => {
      const noise = Array.from({ length: 1000 }, () => Math.random() * 2 - 1);
      const result = analyzer.analyzeWavePattern(noise);
      
      // O ruído deve ser classificado como caótico ou sem padrão
      expect([
        'CHAOTIC', 
        'NO_PATTERN', 
        'TRAVELING_WAVE'
      ]).toContain(result.wavePattern);
      
      expect(result.resonanceScore).toBeLessThan(0.3);
    });
  });
  
  describe('Instância Padrão', () => {
    it('deve exportar uma instância configurada', () => {
      expect(standingWaveAnalyzer).toBeInstanceOf(StandingWaveAnalyzer);
      
      // Testar a instância com uma onda de teste
      const wave = generateStandingWave(1000, 5, 2);
      const result = standingWaveAnalyzer.analyzeWavePattern(wave);
      
      expect(result).toHaveProperty('detected');
      expect(result).toHaveProperty('wavePattern');
      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('antinodes');
    });
  });
});
