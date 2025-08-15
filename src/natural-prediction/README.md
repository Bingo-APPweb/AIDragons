# 🌊 Natural Prediction System

> Um sistema avançado de predição baseado em padrões naturais, projetado para detectar e prever eventos complexos em séries temporais.

## 🌟 Visão Geral

O **Natural Prediction System** é uma estrutura poderosa que combina múltiplas técnicas de análise de sinais para detectar padrões complexos em dados temporais. Inspirado em fenômenos naturais, o sistema é capaz de identificar padrões sutis que métodos tradicionais frequentemente perdem.

## 🧩 Componentes Principais

### 1. FFT Weak Signal Detector
Detecta sinais fracos em meio a ruído usando a Transformada Rápida de Fourier (FFT).
- Identifica componentes de frequência ocultos
- Calcula relação sinal-ruído (SNR)
- Detecta conteúdo infra-sônico

### 2. Lyapunov Chaos Detector
Analisa o comportamento caótico em séries temporais.
- Calcula o expoente de Lyapunov
- Identifica bifurcações e transições de fase
- Classifica níveis de caos

### 3. Standing Wave Analyzer
Detecta e analisa padrões de ondas estacionárias.
- Identifica nós e antinós
- Classifica tipos de ondas
- Detecta ressonâncias

### 4. Evolutionary Weight Optimizer
Otimiza a combinação de diferentes modelos usando algoritmos genéticos.
- Ajusta pesos automaticamente
- Adapta-se a diferentes padrões de dados
- Preserva diversidade genética

## 🚀 Como Usar

### Instalação

```bash
npm install
```

### Exemplo Básico

```typescript
import { naturalPredictionSystem } from './natural-prediction/integration/natural-system';

// Dados de exemplo (série temporal)
const timeSeriesData = [/* seus dados aqui */];

// Fazer uma previsão
const prediction = await naturalPredictionSystem.predict(timeSeriesData);

console.log('Previsão:', prediction.prediction);
console.log('Confiança:', prediction.confidence);
console.log('Alerta:', prediction.alerts.message);
```

### Configuração

Personalize o sistema através do arquivo de configuração:

```typescript
// src/natural-prediction/config.ts
export const NATURAL_PREDICTION_CONFIG = {
  // Configurações do FFT
  fft: {
    sampleRate: 1000,    // Hz
    windowSize: 1024,    // Tamanho da janela
    infrasonicThreshold: 20 // Frequência de corte para infra-som (Hz)
  },
  
  // Configurações de alerta
  alerts: {
    low: 0.3,      // Limite para alerta baixo
    medium: 0.5,   // Limite para alerta médio
    high: 0.7,     // Limite para alerta alto
    critical: 0.9  // Limite para alerta crítico
  },
  
  // Outras configurações...
};
```

## 📊 Saída do Sistema

O sistema retorna um objeto com as seguintes propriedades:

```typescript
{
  timestamp: number;          // Timestamp da previsão
  prediction: number;         // Valor de previsão (0-1)
  confidence: number;         // Nível de confiança (0-1)
  components: {              // Contribuição de cada componente
    fft: number;             // Análise espectral
    chaos: number;           // Análise de caos
    waves: number;           // Análise de ondas
  };
  weights: number[];         // Pesos otimizados [fft, chaos, waves]
  alerts: {                  // Informações de alerta
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    message: string;         // Mensagem descritiva
  };
  metadata: {
    executionTime: number;   // Tempo de execução em ms
    version: string;         // Versão do modelo
  };
}
```

## 🧪 Testes

Execute os testes para verificar o funcionamento do sistema:

```bash
# Executar todos os testes
npm test

# Testar componentes específicos
npm run test:fft
npm run test:chaos
npm run test:waves
npm run test:evolution
```

## 📚 Documentação Técnica

### Estrutura de Arquivos

```
src/natural-prediction/
├── analyzers/              # Analisadores especializados
│   ├── lyapunov-chaos.ts   # Detecção de caos
│   └── standing-waves.ts   # Análise de ondas
├── core/
│   └── fft-weak-signal.ts  # Detecção de sinais fracos
├── evolution/
│   └── weight-optimizer.ts # Otimização de pesos
├── integration/
│   └── natural-system.ts   # Sistema de predição principal
└── config.ts               # Configurações globais
```

### Algoritmos Implementados

1. **FFT (Cooley-Tukey)**
   - Janelamento de Hamming
   - Zero-padding
   - Detecção de harmônicos

2. **Expoente de Lyapunov**
   - Reconstrução do espaço de fase
   - Algoritmo de Wolf
   - Detecção de bifurcações

3. **Otimização Evolutiva**
   - Seleção por roleta
   - Cruzamento em ponto único
   - Mutação gaussiana
   - Preservação de elite

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/incrivel`)
# 🌊 Natural Prediction System

> Um sistema avançado de predição baseado em padrões naturais, projetado para detectar e prever eventos complexos em séries temporais.

## 🌟 Visão Geral

O **Natural Prediction System** é uma estrutura poderosa que combina múltiplas técnicas de análise de sinais para detectar padrões complexos em dados temporais. Inspirado em fenômenos naturais, o sistema é capaz de identificar padrões sutis que métodos tradicionais frequentemente perdem.

## 🧩 Componentes Principais

### 1. FFT Weak Signal Detector
Detecta sinais fracos em meio a ruído usando a Transformada Rápida de Fourier (FFT).
- Identifica componentes de frequência ocultos
- Calcula relação sinal-ruído (SNR)
- Detecta conteúdo infra-sônico

### 2. Lyapunov Chaos Detector
Analisa o comportamento caótico em séries temporais.
- Calcula o expoente de Lyapunov
- Identifica bifurcações e transições de fase
- Classifica níveis de caos

### 3. Standing Wave Analyzer
Detecta e analisa padrões de ondas estacionárias.
- Identifica nós e antinós
- Classifica tipos de ondas
- Detecta ressonâncias

### 4. Evolutionary Weight Optimizer
Otimiza a combinação de diferentes modelos usando algoritmos genéticos.
- Ajusta pesos automaticamente
- Adapta-se a diferentes padrões de dados
- Preserva diversidade genética

## 🚀 Como Usar

### Instalação

```bash
npm install
```

### Exemplo Básico

```typescript
import { naturalPredictionSystem } from './natural-prediction/integration/natural-system';

// Dados de exemplo (série temporal)
const timeSeriesData = [/* seus dados aqui */];

// Fazer uma previsão
const prediction = await naturalPredictionSystem.predict(timeSeriesData);

console.log('Previsão:', prediction.prediction);
console.log('Confiança:', prediction.confidence);
console.log('Alerta:', prediction.alerts.message);
```

### Configuração

Personalize o sistema através do arquivo de configuração:

```typescript
// src/natural-prediction/config.ts
export const NATURAL_PREDICTION_CONFIG = {
  // Configurações do FFT
  fft: {
    sampleRate: 1000,    // Hz
    windowSize: 1024,    // Tamanho da janela
    infrasonicThreshold: 20 // Frequência de corte para infra-som (Hz)
  },
  
  // Configurações de alerta
  alerts: {
    low: 0.3,      // Limite para alerta baixo
    medium: 0.5,   // Limite para alerta médio
    high: 0.7,     // Limite para alerta alto
    critical: 0.9  // Limite para alerta crítico
  },
  
  // Outras configurações...
};
```

## 📊 Saída do Sistema

O sistema retorna um objeto com as seguintes propriedades:

```typescript
{
  timestamp: number;          // Timestamp da previsão
  prediction: number;         // Valor de previsão (0-1)
  confidence: number;         // Nível de confiança (0-1)
  components: {              // Contribuição de cada componente
    fft: number;             // Análise espectral
    chaos: number;           // Análise de caos
    waves: number;           // Análise de ondas
  };
  weights: number[];         // Pesos otimizados [fft, chaos, waves]
  alerts: {                  // Informações de alerta
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
    message: string;         // Mensagem descritiva
  };
  metadata: {
    executionTime: number;   // Tempo de execução em ms
    version: string;         // Versão do modelo
  };
}
```

## 🧪 Testes

Execute os testes para verificar o funcionamento do sistema:

```bash
# Executar todos os testes
npm test

# Testar componentes específicos
npm run test:fft
npm run test:chaos
npm run test:waves
npm run test:evolution
```

## 📚 Documentação Técnica

### Estrutura de Arquivos

```
src/natural-prediction/
├── analyzers/              # Analisadores especializados
│   ├── lyapunov-chaos.ts   # Detecção de caos
│   └── standing-waves.ts   # Análise de ondas
├── core/
│   └── fft-weak-signal.ts  # Detecção de sinais fracos
├── evolution/
│   └── weight-optimizer.ts # Otimização de pesos
├── integration/
│   └── natural-system.ts   # Sistema de predição principal
└── config.ts               # Configurações globais
```

### Algoritmos Implementados

1. **FFT (Cooley-Tukey)**
   - Janelamento de Hamming
   - Zero-padding
   - Detecção de harmônicos

2. **Expoente de Lyapunov**
   - Reconstrução do espaço de fase
   - Algoritmo de Wolf
   - Detecção de bifurcações

3. **Otimização Evolutiva**
   - Seleção por roleta
   - Cruzamento em ponto único
   - Mutação gaussiana
   - Preservação de elite

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/incrivel`)
3. Commit suas mudanças (`git commit -m 'Adiciona funcionalidade incrível'`)
4. Faça push para a branch (`git push origin feature/incrivel`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato através das issues do repositório.

---

Desenvolvido com ❤️ por [Sua Empresa/Nome]
