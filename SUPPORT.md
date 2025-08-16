# Suporte BBF-Tables

## SLA & Horário de Atendimento
- Fuso: Europe/Berlin (CET/CEST)
- Janela padrão: Seg–Sex, 09:00–18:00
- Plantão (P0): 24x7 por rodízio do time de segurança

### Matriz de Severidade
| Severidade | Exemplo                                                | Tempo de resposta | Meta de correção |
|-----------:|--------------------------------------------------------|-------------------|------------------|
| **P0**     | Queda total, vazamento crítico, supply-chain ativo    | **1h**            | **24h**          |
| **P1**     | Degradação severa, falha de API estável               | 4h                | 72h              |
| **P2**     | Bug funcional sem impacto crítico                      | 2 dias úteis      | Próxima minor    |
| **P3**     | Melhoria/Docs/baixa prioridade                         | 7 dias            | Roadmap          |

### Canais
- Suporte: **support@bbf-tables.com**
- Segurança (privado): **security@bbf-tables.com**
- Discussões: [GitHub Discussions](https://github.com/bbf-tables/bbf-tables/discussions)

## Versões Suportadas
- **Últimas 3 versões principais**
- **Node.js**: 18.x, 20.x, 22.x (LTS)
- **Navegadores**: 2 últimas versões estáveis de Chrome, Firefox, Safari e Edge

## Como Reportar um Bug
1. **Verifique se já existe** uma issue aberta
2. Use o template de bug do GitHub
3. Inclua:
   - Versão do BBF-Tables
   - Ambiente (`npx envinfo --system --binaries`)
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots/logs (se aplicável)

## Perguntas Frequentes

### Quando devo abrir uma issue vs. discussão?
- **Issue**: Bugs, melhorias ou novas funcionalidades
- **Discussion**: Como fazer X? Melhores práticas

### Como faço para propor uma nova funcionalidade?
1. Abra uma discussão para validar a ideia
2. Após alinhamento, abra uma issue com a label `enhancement`

### Onde encontro a documentação completa?
Acesse [Documentação Oficial](https://github.com/bbf-tables/bbf-tables#readme) para guias detalhados.
