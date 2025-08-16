# fix-all-errors.ps1
Write-Host "🐉 DRAGON FIX SCRIPT - Iniciando correções..." -ForegroundColor Cyan

# 1. CRIAR PASTAS NECESSÁRIAS
Write-Host "📁 Criando estrutura de pastas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src\types" | Out-Null
New-Item -ItemType Directory -Force -Path "protocols" | Out-Null

# 2. FIX CONFIG.TS - Renomear interfaces
Write-Host "🔧 Corrigindo config.ts..." -ForegroundColor Yellow
$configPath = "src\natural-prediction\config.ts"
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    
    # Renomear interfaces para evitar duplicatas
    $configContent = $configContent -replace 'export interface FFTSettings', 'export interface FFTOptions'
    $configContent = $configContent -replace 'export interface ChaosSettings', 'export interface ChaosOptions'
    $configContent = $configContent -replace 'export interface EvolutionSettings', 'export interface EvolutionOptions'
    $configContent = $configContent -replace 'export interface WaveAnalysisSettings', 'export interface WaveAnalysisOptions'
    $configContent = $configContent -replace 'export interface AlertThresholds', 'export interface AlertThresholdsOptions'
    
    Set-Content -Path $configPath -Value $configContent
}

# 3. CRIAR TYPES.TS
Write-Host "📝 Criando arquivos de tipos..." -ForegroundColor Yellow
@"
// protocols/types.ts
export type TwinId = string;

export interface TwinEvent<T = unknown> {
  type: string;
  source: { id: TwinId };
  target?: { id: TwinId };
  payload?: T;
  timestamp: number;
}

export interface TwinConnection {
  id: string;
  source: TwinId;
  target: TwinId;
  status: 'connected' | 'disconnected';
}
"@ | Out-File -FilePath "protocols\types.ts" -Encoding utf8

# 4. CRIAR MATHJS.D.TS
@"
declare module 'mathjs' {
  export function fft(signal: number[]): number[][];
  export function complex(real: number, imag: number): any;
  export const pi: number;
  export const e: number;
}
"@ | Out-File -FilePath "src\types\mathjs.d.ts" -Encoding utf8

Write-Host "✅ Correções aplicadas!" -ForegroundColor Green
