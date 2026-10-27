// Gera e baixa um CSV compatível com Excel (pt-BR): BOM UTF-8 + separador ";".
// O BOM faz o Excel reconhecer acentos; o ";" faz o Excel em português separar
// o conteúdo em colunas (com "," ele jogaria tudo em uma coluna só).
//
// colunas: [{ cabecalho, valor: (linha) => string }]
export function exportarCsv(nomeArquivo, colunas, linhas) {
    const escapar = (v) => {
        const s = v == null ? "" : String(v);
        return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const cabecalho = colunas.map((c) => escapar(c.cabecalho)).join(";");
    const corpo = linhas.map((linha) =>
        colunas.map((c) => escapar(c.valor(linha))).join(";")
    );
    const conteudo = "﻿" + [cabecalho, ...corpo].join("\r\n");

    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
