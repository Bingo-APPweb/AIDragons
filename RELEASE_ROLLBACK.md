# Release Rollback Runbook

## Quando usar
- API gate falhou pós-release
- Regressão de performance/tamanho
- Vulnerabilidade crítica

## Passos
1) Identifique a versão estável anterior:
   - `git tag --sort=-creatordate | head`
2) Reverter publish no npm (promover tag):
   - `npm dist-tag add bbf-tables@<prev> latest`
3) Abrir PR revert:
   - `git revert <merge_commit_sha>` e abrir PR com título `revert: <versão>`
4) Bloquear nova release automática (temporário):
   - em `Release` workflow, adicione `if: contains(github.event.head_commit.message, '[hold]') == false`
5) Post-mortem (24–48h):
   - Causa raiz, cobertura extra, novo teste E2E/prop específico
