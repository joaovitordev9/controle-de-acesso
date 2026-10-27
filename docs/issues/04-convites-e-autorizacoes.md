# Etapa 4 — Convites e autorizações

## Issue 9 — Criar modelo de convites e cotas por sócio
**Labels:** `convites`, `backend`, `dados`, `prioridade alta`  
**Depende de:** proteção do histórico e erros padronizados

Implementar cadastro dos titulares e convites/cortesias, com quantidades, tipo, situação e validade. As cotas precisam ser definidas por titular e tipo de autorização.

### Critérios de aceite
- Sistema registra titular, tipo de convite/cortesia, quantidade autorizada e validade.
- Consulta informa total, utilizado e disponível por titular.
- Não é possível ultrapassar a quantidade concedida, inclusive em operações simultâneas.
- Encerramento mantém histórico e impede novos usos.

## Issue 10 — Criar API de autorizações de entrada
**Labels:** `autorizações`, `backend`, `prioridade alta`  
**Depende de:** modelo de convites e cotas

Permitir registrar um ou mais nomes autorizados por um titular, com tipo e situação da autorização.

### Critérios de aceite
- Autorização associa titular, pessoa/nome autorizado, tipo e situação.
- É possível incluir, editar e cancelar pessoas autorizadas.
- Inclusões respeitam o saldo de autorizações do titular.
- Operações inválidas informam o limite atual e não deixam contagem inconsistente.
- Sistema permite autorizações de outros tipos com justificativa registrada.

## Issue 11 — Vincular autorização ao registro de entrada
**Labels:** `autorizações`, `entradas`, `backend`  
**Depende de:** API de autorizações, entrada e saída, controle de pulseiras

Conectar a pessoa que chega à autorização correspondente e registrar a origem da entrada para consulta posterior.

### Critérios de aceite
- Recepção consegue localizar/criar a pessoa e vinculá-la à autorização.
- Entrada fica associada à autorização e ao titular que a concedeu.
- Autorização não pode ser usada acima do limite ou simultaneamente de forma inválida.
- Saída atualiza a situação da autorização e libera a quantidade para reutilização quando aplicável.
- Entrada/saída e vínculo não ficam parcialmente gravados em caso de erro.

## Issue 12 — Criar tela Autorizações
**Labels:** `frontend`, `autorizações`  
**Depende de:** API de autorizações e vínculo com entrada

Adicionar uma aba para criar e administrar autorizações.

### Critérios de aceite
- Seleção de titular mostra os tipos e quantidades disponíveis.
- Recepção pode incluir vários nomes dentro do limite e ver o saldo antes de confirmar.
- É possível editar ou remover pessoas autorizadas.
- Lista filtra por nome, titular, tipo e situação.
- Alterações atualizam o saldo e as telas relacionadas.

## Issue 13 — Criar tela Convites e consulta por titular
**Labels:** `frontend`, `convites`  
**Depende de:** modelo de convites e tela de autorizações

Adicionar uma aba para visualizar titulares, pessoas vinculadas e saldo de convites/cortesias.

### Critérios de aceite
- Mostra quem autorizou cada pessoa e quem está usando cada convite.
- Mostra quantidade total, utilizada e disponível por titular.
- Permite adicionar e remover pessoas vinculadas.
- Remover pessoa libera a quantidade conforme as regras de uso.
- Alterações aparecem também em Autorizações e Relatório.
