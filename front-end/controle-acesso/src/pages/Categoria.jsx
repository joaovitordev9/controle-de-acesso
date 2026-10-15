import {Dialog, DialogTrigger, DialogContent, DialogDescription,
    DialogTitle, DialogHeader, DialogFooter} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell,} from "@/components/ui/table";
import { useEffect, useState } from "react";

function Categorias() {
    const [formularioAberto, setFormularioAberto] = useState(false);
    const [categoriaExcluindo, setCategoriaExcluindo] = useState(null);
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [busca, setBusca] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [nomeCategoria, setNomeCategoria] = useState("");

    useEffect(() => {
        async function carregarCategorias() {
            try {
                const resposta = await fetch("http://localhost:8080/categorias");

                if (!resposta.ok) {
                    throw new Error(`Erro ao carregar categorias: ${resposta.status}`);
                }

                const categoriasDoBanco = await resposta.json();
                setCategorias(categoriasDoBanco);
            } catch (erro) {
                console.error("Erro ao carregar categorias:", erro);
            }
        }

        carregarCategorias();
    }, []);

    const categoriasFiltradas = categorias.filter((categoria) =>
        categoria.nome.toLowerCase().includes(busca.trim().toLowerCase())
    );

    function editarCategoria(categoria) {
        setCategoriaEditando(categoria);
        setNomeCategoria(categoria.nome);
        setFormularioAberto(true);
    }

    function iniciarExclusao(categoria) {
        setCategoriaExcluindo(categoria);
    }

    function cancelarCadastro() {
        setFormularioAberto(false);
        setCategoriaEditando(null);
        setNomeCategoria("");
    }

    async function salvarCategoria(evento) {
        evento.preventDefault();

        const nome = nomeCategoria.trim();
        if (!nome) return;

        if (categoriaEditando) {
            try {
                const resposta = await fetch(
                    `http://localhost:8080/categorias/${categoriaEditando.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ nome }),
                    }
                );

                if (!resposta.ok) {
                    throw new Error(`Erro ao editar categoria: ${resposta.status}`);
                }

                const categoriaAtualizada = await resposta.json();

                setCategorias((lista) =>
                    lista.map((categoria) =>
                        categoria.id === categoriaAtualizada.id
                            ? categoriaAtualizada
                            : categoria
                    )
                );

                cancelarCadastro();
            } catch (erro) {
                console.error("Erro ao editar categoria:", erro);
            }

            return;
        }
    }

    function cancelarExclusao() {
        setCategoriaExcluindo(null);
    }

    function confirmarExclusao() {
        setCategorias((lista) =>
            lista.filter((categoria) => categoria.id !== categoriaExcluindo.id)
        );
        cancelarExclusao();
    }

    return (
        <main className="min-w-0 flex-1 p-8">
            <h1 className="text-2xl font-semibold">Categorias</h1>

            <p className="mt-1 text-sm text-muted-foreground">
                Gerencie as categorias usadas nos cadastros.
            </p>

            <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                    className="sm:w-80"
                    placeholder="Buscar categoria..."
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                />

                <Button
                    className="whitespace-nowrap"
                    onClick={() => setFormularioAberto(true)}
                >
                    Nova categoria
                </Button>
            </div>

            <Dialog open={formularioAberto} onOpenChange={setFormularioAberto}>
                <DialogContent>
                    <form onSubmit={salvarCategoria} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>
                                {categoriaEditando ? "Editar categoria" : "Nova categoria"}
                            </DialogTitle>
                            <DialogDescription>
                                Informe o nome da categoria.
                            </DialogDescription>
                        </DialogHeader>

                        <Input
                            value={nomeCategoria}
                            onChange={(evento) => setNomeCategoria(evento.target.value)}
                            placeholder="Nome da categoria"
                            aria-label="Nome da categoria"
                            required
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={cancelarCadastro}>
                                Cancelar
                            </Button>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="overflow-hidden rounded-xl border">
                <Table className="table-fixed">
                    <colgroup>
                        <col className="w-2/3" />
                        <col className="w-1/3" />
                    </colgroup>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categoriasFiltradas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                    {busca ? "Nenhuma categoria encontrada." : "Nenhuma categoria cadastrada."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categoriasFiltradas.map((categoria) => (
                                <TableRow key={categoria.id}>
                                    <TableCell>{categoria.nome}</TableCell>

                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => editarCategoria(categoria)}
                                            >
                                                Editar
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => iniciarExclusao(categoria)}
                                            >
                                                Excluir
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <AlertDialog
                open={Boolean(categoriaExcluindo)}
                onOpenChange={(aberto) => {
                    if (!aberto) cancelarExclusao();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                        <AlertDialogDescription>
                            A categoria “{categoriaExcluindo?.nome}” será removida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarExclusao}>
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}

export default Categorias;