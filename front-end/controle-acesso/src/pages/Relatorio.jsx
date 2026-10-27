import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { exportarCsv } from "../lib/exportarCsv";
import { CATEGORIAS, rotuloCategoria } from "../lib/dominio";

function dataLocalHoje() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function Relatorio() {
    const [entradas, setEntradas] = useState([]);
    const hoje = dataLocalHoje();

    // Filtros editáveis (formulário) e filtros aplicados (após "Consultar").
    const [inicioSelecionado, setInicioSelecionado] = useState(hoje);
    const [fimSelecionado, setFimSelecionado] = useState(hoje);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("TODAS");

    const [inicioFiltro, setInicioFiltro] = useState(hoje);
    const [fimFiltro, setFimFiltro] = useState(hoje);
    const [categoriaFiltro, setCategoriaFiltro] = useState("TODAS");

    const entradasFiltradas = entradas.filter((entrada) => {
        const dia = entrada.data_entrada?.slice(0, 10);
        if (!dia) return false;
        if (inicioFiltro && dia < inicioFiltro) return false;
        if (fimFiltro && dia > fimFiltro) return false;
        if (categoriaFiltro !== "TODAS" && entrada.categoria_valor !== categoriaFiltro) return false;
        return true;
    });

    const contagemPorHora = entradasFiltradas.reduce((contagem, entrada) => {
        const hora = entrada.data_entrada?.slice(11, 13);
        if (hora) contagem[hora] = (contagem[hora] || 0) + 1;
        return contagem;
    }, {});

    const horaPico = Object.entries(contagemPorHora).reduce(
        (maior, atual) => (!maior || atual[1] > maior[1] ? atual : maior),
        null
    );
    const horarioPico = horaPico ? `${Number(horaPico[0])}:00` : "Sem entradas";

    // Distribuição por categoria dentro do período filtrado.
    const porCategoria = entradasFiltradas.reduce((acc, entrada) => {
        const chave = entrada.categoria_valor || "SEM_CATEGORIA";
        acc[chave] = (acc[chave] || 0) + 1;
        return acc;
    }, {});
    const categoriasOrdenadas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);

    function aplicarFiltros() {
        setInicioFiltro(inicioSelecionado);
        setFimFiltro(fimSelecionado);
        setCategoriaFiltro(categoriaSelecionada);
    }

    function exportarRelatorio() {
        const colunas = [
            { cabecalho: "Nome", valor: (e) => e.nome },
            { cabecalho: "Categoria", valor: (e) => e.categoria },
            { cabecalho: "Data", valor: (e) => new Date(e.data_entrada).toLocaleDateString("pt-BR") },
            {
                cabecalho: "Horário",
                valor: (e) =>
                    new Date(e.data_entrada).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
            },
            { cabecalho: "Titular", valor: (e) => e.titular },
            { cabecalho: "Tipo de convite", valor: (e) => e.tipo_convite },
        ];
        exportarCsv(`entradas_${inicioFiltro}_a_${fimFiltro}.csv`, colunas, entradasFiltradas);
    }

    useEffect(() => {
        async function carregarEntradas() {
            try {
                const dados = await apiGet("/entradas");
                setEntradas(dados);
            } catch (erro) {
                console.error("Erro ao carregar entradas:", erro);
            }
        }
        carregarEntradas();
    }, []);

    const periodoMesmoDia = inicioFiltro === fimFiltro;

    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Relatório de entradas
                </h1>
                <p className="text-sm text-muted-foreground">
                    Consulte as entradas registradas no clube por período e categoria.
                </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1">
                    <label htmlFor="inicio" className="text-sm font-medium">De:</label>
                    <input
                        type="date"
                        id="inicio"
                        value={inicioSelecionado}
                        max={fimSelecionado || undefined}
                        onChange={(e) => setInicioSelecionado(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                </div>

                <div className="grid gap-1">
                    <label htmlFor="fim" className="text-sm font-medium">Até:</label>
                    <input
                        type="date"
                        id="fim"
                        value={fimSelecionado}
                        min={inicioSelecionado || undefined}
                        onChange={(e) => setFimSelecionado(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                </div>

                <div className="grid gap-1">
                    <label className="text-sm font-medium">Categoria:</label>
                    <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                        <SelectTrigger className="h-10 w-56"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODAS">Todas as categorias</SelectItem>
                            {CATEGORIAS.map((c) => (
                                <SelectItem key={c.valor} value={c.valor}>{c.rotulo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <button
                    type="button"
                    className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                    onClick={aplicarFiltros}
                >
                    Consultar
                </button>

                <button
                    type="button"
                    className="h-10 rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                    onClick={exportarRelatorio}
                    disabled={entradasFiltradas.length === 0}
                >
                    Exportar CSV
                </button>
            </div>

            {/* Cartões-resumo */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                <div className="rounded-xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">Total de entradas</p>
                    <p className="mt-2 text-3xl font-bold">{entradasFiltradas.length}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {categoriaFiltro === "TODAS" ? "Todas as categorias" : rotuloCategoria(categoriaFiltro)}
                        {periodoMesmoDia ? "" : " · no período selecionado"}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">Entradas por categoria</h2>
                    {categoriasOrdenadas.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">Sem entradas no período.</p>
                    ) : (
                        <ul className="mt-3 space-y-1.5">
                            {categoriasOrdenadas.map(([valor, qtd]) => (
                                <li key={valor} className="flex items-center justify-between text-sm">
                                    <span>{valor === "SEM_CATEGORIA" ? "Sem categoria" : rotuloCategoria(valor)}</span>
                                    <span className="font-medium">{qtd}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">Horário de pico</h2>
                    <p className="mt-2 text-3xl font-bold">{horarioPico}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Horário com maior número de entradas
                    </p>
                </div>

            </div>

            {/* Tabela */}
            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            {!periodoMesmoDia && <TableHead>Data</TableHead>}
                            <TableHead>Horário de entrada</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {entradasFiltradas.length > 0 ? (
                            entradasFiltradas.map((entrada) => (
                                <TableRow key={entrada.id}>
                                    <TableCell className="font-medium">{entrada.nome}</TableCell>
                                    <TableCell>{entrada.categoria}</TableCell>
                                    {!periodoMesmoDia && (
                                        <TableCell>
                                            {new Date(entrada.data_entrada).toLocaleDateString("pt-BR")}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {new Date(entrada.data_entrada).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={periodoMesmoDia ? 3 : 4}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhuma entrada registrada no período.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </main>
    );
}

export default Relatorio;
