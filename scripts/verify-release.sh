#!/bin/bash
set -e

echo "🔍 Verificando versões e dependências..."
node -v
npm -v

# 1) Instalação limpa e build
echo "\n🔧 Instalando dependências e construindo..."
npm ci
npm run build

# 2) Testes e cobertura
echo "\n🧪 Executando testes..."
npm test -- --coverage

# 3) Verificação de tamanho e API
echo "\n📊 Verificando orçamento de tamanho..."
npm run size

echo "\n🔍 Verificando API..."
npm run api:check

# 4) Teste de empacotamento
echo "\n📦 Testando empacotamento..."
node scripts/smoke-pack.mjs

# 5) Dry run da release
echo "\n🚀 Simulando release (dry-run)..."
npx semantic-release --dry-run

echo "\n✅ Verificação concluída! Tudo pronto para o release."
echo "\n📋 Verificações manuais necessárias:"
cat << EOF
1. Rulesets: Ativados no branch default com Secret Scanning Push Protection
2. Branch Protection: Apenas 'Gate (all checks aggregated)' como required
3. Secrets: NPM_TOKEN no Environment 'release', CODECOV_TOKEN no repositório
4. Equipes do CODEOWNERS (@bbf-core @bbf-ci @bbf-security @bbf-docs) existem e têm acesso de review
5. package.json:
   - version: "0.0.0-development"
   - publishConfig: { "access": "public", "provenance": true }
   - exports e types estão corretos
   - engines e license definidos
6. Codecov: Jest está gerando coverage/lcov.info

🎯 Micro-polimentos opcionais:
- Adicionar badge do Gate no README
- Linkar Discussions no ISSUE_TEMPLATE/config.yml
- Confirmar PR do Renovate mergeado

Execute 'npm run verify:release' para rodar estas verificações novamente.
EOF
