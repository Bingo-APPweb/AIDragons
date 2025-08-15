# Maintainers

## Times & Responsabilidades
- **Core (@bbf-core)** — release, API pública, roadmap
- **Segurança (@bbf-security)** — incidentes, CVEs, scans
- **CI/CD (@bbf-ci)** — pipelines, ações, pacotes
- **Docs (@bbf-docs)** — README, site, examples

## Contatos
- Suporte geral: support@bbf-tables.com
- Segurança (coordenado por @bbf-security): security@bbf-tables.com (SLA: 72h)
- Emergência P0: abrir issue `Security Advisory` + e-mail para security@bbf-tables.com

## Processo de Release (resumo)
1. `main` verde (CI + size-limit + api-extractor)
2. Conventional Commits + merge (squash)
3. `semantic-release` publica NPM + GitHub Release
4. Docs & Pages atualizados automaticamente

## Acesso e Segurança

### Tokens de Acesso
| Recurso | Mantido por | Uso |
|---------|-------------|-----|
| `NPM_TOKEN` | @bbf-core | Publicação de pacotes |
| `CODECOV_TOKEN` | @bbf-ci | Relatórios de cobertura |
| `GH_TOKEN` | @bbf-ci | Automação do GitHub |

### Ambientes Protegidos
- `main` - Branch principal, proteção ativada
- `release/*` - Branches de release
- `gh-pages` - Branch de documentação

## Política de Contribuição

1. **Bugs**
   - Abrir issue com template
   - Branch: `fix/descricao-curta`
   - Testes obrigatórios

2. **Novas Funcionalidades**
   - Discussão prévia via GitHub Discussions
   - Branch: `feat/nome-da-funcionalidade`
   - Documentação obrigatória

3. **Revisão de Código**
   - Pelo menos 1 aprovação necessária
   - Codeowners ativado
   - Verificações de CI devem passar
