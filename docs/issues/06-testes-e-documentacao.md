# Etapa 6 — Qualidade e documentação

## Issue 17 — Adicionar testes automatizados para as regras críticas
**Labels:** `testes`, `backend`, `frontend`  
**Depende de:** funcionalidades correspondentes

Criar cobertura automatizada para busca, limites de autorização, entradas/saídas, relatórios e exportação.

### Critérios de aceite
- Testa pesquisa com e sem acentos e CPF com e sem pontuação.
- Testa autorização no limite e tentativa de exceder a cota.
- Testa entradas duplicadas, saída e reutilização de pulseira/autorização.
- Testa filtros combinados de período e categoria.
- Testa que a exportação corresponde aos filtros selecionados.

## Issue 18 — Criar documentação de execução e configuração
**Labels:** `documentação`, `infra`  
**Depende de:** configuração segura e funcionalidades principais

Documentar como preparar o banco, iniciar backend e frontend e operar as telas principais.

### Critérios de aceite
- Instruções permitem iniciar o projeto em ambiente de desenvolvimento limpo.
- Documenta configuração segura do banco sem credenciais no repositório.
- Explica fluxo de cadastro, entrada/saída, autorização e relatório.
- Lista requisitos e limitações conhecidos.
