# Etapa 3 — Entradas, saídas e pulseiras

## Issue 6 — Implementar entrada e saída de pessoas
**Labels:** `entradas`, `backend`, `prioridade alta`  
**Depende de:** erros padronizados, proteção do histórico

O endpoint atual apenas cria/edita/exclui entradas. Implementar ciclo de entrada e saída com validação para que uma pessoa não fique com duas entradas abertas.

### Critérios de aceite
- Entrada registra pessoa e horário; recebe também os dados necessários para a pulseira e origem do acesso.
- Saída fecha o registro existente sem apagar o histórico.
- Pessoa que já está dentro não consegue registrar nova entrada.
- Erros explicam por que a entrada foi recusada.

## Issue 7 — Adicionar controle de pulseiras por categoria e número
**Labels:** `entradas`, `backend`, `dados`  
**Depende de:** entrada e saída

Adicionar categoria e número da pulseira ao fluxo e impedir uso simultâneo duplicado.

### Critérios de aceite
- Entrada armazena categoria e número da pulseira.
- Uma pulseira ocupada não pode ser atribuída a outra entrada aberta.
- O mesmo número pode ser usado em categorias diferentes se a regra operacional permitir.
- Registrar saída libera a pulseira para novo uso.
- Validação funciona também quando duas recepcionistas registram ao mesmo tempo.

## Issue 8 — Criar consulta “Quem está dentro agora”
**Labels:** `frontend`, `entradas`  
**Depende de:** entrada e saída, controle de pulseiras

Criar uma tela operacional para consultar entradas abertas e registrar saídas.

### Critérios de aceite
- Lista mostra nome, pulseira, categoria e horário de entrada.
- Recepção consegue localizar rapidamente uma pessoa e registrar a saída.
- Dados são atualizados após entrada/saída e periodicamente enquanto a tela está aberta.
- Tela mostra estado vazio, erro e carregamento.
