import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const AnalysisConfigZ = z.object({
  // Core FFT parameters
  sampleRateHz: z.number().positive('Sample rate must be positive')
    .describe('Sample rate in Hz'),
  
  // Windowing
  windowType: z.enum(['hann', 'hamming', 'blackman', 'rectangular'])
    .default('hann')
    .describe('Type of window function to apply before FFT'),
  
  // FFT configuration
  fftSize: z.number().int().min(64).max(65536)
    .default(2048)
    .describe('Size of the FFT (must be a power of 2)'),
  
  // Peak detection
  minPeakHeight: z.number().min(0).default(0.1)
    .describe('Minimum peak height (0-1) relative to max magnitude'),
  minPeakDistance: z.number().int().min(1).default(5)
    .describe('Minimum number of samples between peaks'),
  
  // Advanced analysis
  noiseFloorMethod: z.enum(['welch', 'median', 'mean'])
    .default('median')
    .describe('Method for estimating the noise floor'),
  
  // Lyapunov exponent analysis
  lyapunov: z.object({
    method: z.enum(['rosenstein', 'kantz', 'wolf']).default('rosenstein'),
    embeddingDim: z.number().int().min(2).max(20).default(5),
    timeDelay: z.number().int().min(1).default(10),
    maxIterations: z.number().int().min(100).default(1000),
  }).default({}).describe('Lyapunov exponent calculation settings'),
  
  // Signal processing
  preemphasis: z.boolean().default(true)
    .describe('Apply pre-emphasis filter to enhance high frequencies'),
  
  // Performance tuning
  useWorker: z.boolean().default(false)
    .describe('Use Web Workers for parallel processing'),
  
}).strict();

export type AnalysisConfig = z.infer<typeof AnalysisConfigZ>;

export function parseConfig(input: unknown): AnalysisConfig {
  try {
    return AnalysisConfigZ.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Configuration error: ${fromZodError(error)}`);
    }
    throw error;
}

// Helper function to generate default config
export function getDefaultConfig(): AnalysisConfig {
  return AnalysisConfigZ.parse({});
}
