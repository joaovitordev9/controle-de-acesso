import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";


const entradas = [
    {
        id: 1,
        nome: "João da Silva",
        categoria: "Sócio",
        horario: "08:15",
    },
    {
        id: 2,
        nome: "Maria Oliveira",
        categoria: "Dependente",
        horario: "09:30",
    },
    {
        id: 3,
        nome: "Pedro Santos",
        categoria: "Visitante",
        horario: "10:45",
    },
    {
        id: 4,
        nome: "Ana Costa",
        categoria: "Sócio",
        horario: "11:20",
    },
    {
        id: 5,
        nome: "Lucas Ferreira",
        categoria: "Dependente",
        horario: "13:10",
    },
];

function Relatorio() {
    const today = new Date().toISOString().split("T")[0];

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
                        defaultValue={today}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                </div>

                <button
                    type="button"
                    className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                    Consultar
                </button>
            </div>

            {/* Total de entradas */}
            <div className="flex justify-between">
                <div className="rounded-xl border bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                        Total de entradas no dia
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {entradas.length}
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
                        15:00
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Horário com maior número de entradas
                    </p>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Horário de entrada</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {entradas.length > 0 ? (
                            entradas.map(function (entrada) {
                                return (
                                    <TableRow key={entrada.id}>
                                        <TableCell className="font-medium">
                                            {entrada.nome}
                                        </TableCell>

                                        <TableCell>
                                            {entrada.categoria}
                                        </TableCell>

                                        <TableCell>
                                            {entrada.horario}
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