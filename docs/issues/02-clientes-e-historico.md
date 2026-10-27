# Etapa 2 — Cadastro e gestão de clientes

## Issue 3 — Corrigir e completar a busca de clientes
**Labels:** `clientes`, `backend`, `frontend`, `bug`  
**Depende de:** erros padronizados

A busca atual está restrita aos dados carregados e o nome diferencia acentos. Melhorar busca e filtros para uso com listas maiores.

### Critérios de aceite
- Buscar `joao` encontra `João`, sem diferenciar maiúsculas/minúsculas.
- Busca aceita nome parcial, CPF com ou sem pontuação, telefone e código da cota.
- Resultados atualizam durante a digitação e não fazem uma requisição por tecla (debounce).
- Filtros podem ser combinados e a lista informa estado de carregamento, vazio e erro.
- A API suporta paginação para não exigir o carregamento de todos os clientes.

## Issue 4 — Corrigir o formulário de cadastro e edição de cliente
**Labels:** `clientes`, `frontend`, `bug`  
**Depende de:** erros padronizados

Revisar inicialização e validação do formulário. Os valores são inicializados uma vez; ao alternar entre cadastro e edição, há risco de campos antigos permanecerem. O seletor de categoria também precisa ser obrigatório.

### Critérios de aceite
- Abrir cadastro sempre começa com campos limpos.
- Abrir edição carrega os dados da pessoa selecionada.
- Categoria não pode ser enviada vazia e CPF é validado antes do envio.
- Botões de salvar/cancelar funcionam sem deixar formulário aberto com dados de outra pessoa.
- Erros retornados pela API aparecem junto ao formulário.

## Issue 5 — Evitar exclusão destrutiva de pessoas e preservar histórico
**Labels:** `clientes`, `backend`, `dados`  
**Depende de:** erros padronizados

A tela permite excluir pessoas, mas entradas antigas apontam para elas. Definir o ciclo de desativação/reativação para impedir perda ou quebra do histórico.

### Critérios de aceite
- Ações da interface não removem permanentemente uma pessoa com histórico.
- Pessoa inativa não pode receber novas entradas nem novas autorizações.
- Histórico de entrada continua consultável.
- A lista diferencia pessoas ativas e inativas e oferece reativação conforme regra do produto.
