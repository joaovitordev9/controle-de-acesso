import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

function Relatorio() {
    const [entradas, setEntradas] = useState([]);
    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    const [dataSelecionada, setDataSelecionada] = useState(dataHoje);
    const [dataFiltro, setDataFiltro] = useState(dataHoje);

    const entradasFiltradas = entradas.filter(
        (entrada) => entrada.data_entrada?.slice(0, 10) === dataFiltro
    );
    const contagemPorHora = entradasFiltradas.reduce((contagem, entrada) => {
        const hora = entrada.data_entrada?.slice(11, 13);

        if (hora) {
            contagem[hora] = (contagem[hora] || 0) + 1;
        }

        return contagem;
    }, {});

    const horaPico = Object.entries(contagemPorHora).reduce(
        (maior, atual) => (!maior || atual[1] > maior[1] ? atual : maior),
        null
    );

    const horarioPico = horaPico
        ? `${Number(horaPico[0])}:00`
        : "Sem entradas";

    useEffect(() => {
        async function carregarEntradas() {
            try {
                const resposta = await fetch("http://localhost:8080/entradas");

                if (!resposta.ok) {
                    throw new Error(`Erro ao carregar entradas: ${resposta.status}`);
                }

                const dados = await resposta.json();
                setEntradas(dados);
            } catch (erro) {
                console.error("Erro ao carregar entradas:", erro);
            }
        }

        carregarEntradas();
    }, []);


    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Relatório de entradas
                </h1>

                <p className="text-sm text-muted-foreground">
                    Consulte as entradas registradas no clube.
                </p>
            </div>

            {/* Filtro de data */}
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label
                        htmlFor="data"
                        className="text-sm font-medium"
                    >
                        Data do relatório:
                    </label>

                    <input
                        type="date"
                        id="data"
                        value={dataSelecionada}
                        onChange={(evento) => setDataSelecionada(evento.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                </div>

                <button
                    type="button"
                    className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                    onClick={() => setDataFiltro(dataSelecionada)}
                >
                    Consultar
                </button>
            </div>

            {/* Total de entradas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                {/* Total de entradas */}
                <div className="rounded-xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Total de entradas
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {entradasFiltradas.length}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Pessoas registradas na data selecionada
                    </p>
                </div>

                {/* Gráfico de pizza */}
                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">
                        Entradas por categoria
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Distribuição de pessoas no clube
                    </p>

                    {/* Gráfico aqui */}
                </div>

                {/* Horário de pico */}
                <div className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">
                        Horário de pico
                    </h2>

                    <p className="mt-2 text-3xl font-bold">
                        {horarioPico}
                    </p>

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
                            <TableHead>Horário de entrada</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {entradasFiltradas.length > 0 ? (
                            entradasFiltradas.map(function (entrada) {
                                return (
                                    <TableRow key={entrada.id}>
                                        <TableCell className="font-medium">
                                            {entrada.nome}
                                        </TableCell>

                                        <TableCell>
                                            {entrada.categoria}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(entrada.data_entrada).toLocaleTimeString("pt-BR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhuma entrada registrada nessa data.
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