# Etapa 1 — Fundação e segurança

## Issue 1 — Remover credenciais do código e proteger configuração do banco
**Labels:** `segurança`, `backend`, `prioridade alta`  
**Depende de:** —

Mover URL, usuário e senha do banco para variáveis de ambiente e substituir a credencial que já foi armazenada no repositório.

### Critérios de aceite
- Nenhuma senha fica em arquivo versionado.
- A aplicação lê as credenciais do ambiente e informa claramente quando estiverem ausentes.
- A credencial anteriormente exposta é trocada no banco.
- Instruções locais explicam como configurar o acesso sem publicar segredos.

## Issue 2 — Padronizar erros da API e mensagens exibidas na interface
**Labels:** `backend`, `frontend`, `api`  
**Depende de:** —

Hoje alguns erros acabam apenas no console e há exceções genéricas no backend. Padronizar respostas e apresentar feedback compreensível nas telas.

### Critérios de aceite
- Erros de validação, cadastro duplicado, item inexistente e conflito têm respostas HTTP coerentes.
- Interface apresenta sucesso/erro em português e mantém os dados preenchidos quando uma operação falha.
- Respostas não exibem detalhes internos nem dados sensíveis.
