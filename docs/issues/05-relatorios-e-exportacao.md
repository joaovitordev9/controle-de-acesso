# Etapa 5 — Relatórios e exportação

## Issue 14 — Criar consulta de relatório por período e categoria
**Labels:** `relatórios`, `backend`, `prioridade alta`  
**Depende de:** entrada/saída, controle de pulseiras, vínculo de autorização

O relatório atual funciona para uma única data e filtra somente no navegador. Criar consulta na API com intervalo de datas e categoria.

### Critérios de aceite
- Permite consultar uma data específica ou intervalo entre datas.
- Permite selecionar uma ou mais categorias.
- Filtros de data e categoria podem ser combinados.
- Resultados incluem pessoa, horário, tipo de entrada e titular responsável quando houver.
- Datas inicial/final são tratadas de forma consistente com o fuso do sistema.

## Issue 15 — Exportar lista de pessoas respeitando os filtros
**Labels:** `relatórios`, `backend`, `exportação`  
**Depende de:** consulta de relatório por período e categoria

Adicionar exportação das pessoas registradas em uma data ou intervalo.

### Critérios de aceite
- Exportação inclui identificação da pessoa e tipo/origem da entrada.
- Exportação respeita período e categorias selecionados.
- Pessoas que entraram mais de uma vez são representadas conforme a regra definida para o relatório.
- Arquivo pode ser aberto em planilha sem perda de acentos e com colunas identificáveis.

## Issue 16 — Atualizar a tela Relatório com filtros e exportação
**Labels:** `frontend`, `relatórios`  
**Depende de:** consulta de relatório e exportação

Substituir o filtro local de uma data por filtros conectados à API e botões de exportação.

### Critérios de aceite
- Tela oferece data única, período e seleção de categorias.
- É possível combinar os filtros antes de consultar.
- Tabela e totais são atualizados conforme os critérios escolhidos.
- Botão de exportação gera o mesmo conjunto exibido na tela.
- Mensagens de carregamento, lista vazia e erro são exibidas claramente.
