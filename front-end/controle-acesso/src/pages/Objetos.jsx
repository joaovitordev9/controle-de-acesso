import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { apiGet, apiPost, apiPut, apiDelete } from "../services/api";

const norm = (texto) =>
    (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Objetos() {
    const [objetos, setObjetos] = useState([]);
    const [busca, setBusca] = useState("");

    const [editando, setEditando] = useState(null); // objeto em edição, ou {} para novo
    const [excluindo, setExcluindo] = useState(null);

    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemOk, setMensagemOk] = useState("");

    async function carregar() {
        try {
            setObjetos(await apiGet("/objetos"));
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    const filtrados = objetos.filter((o) => {
        const termo = norm(busca);
        if (!termo) return true;
        return norm(o.nome).includes(termo);
    });

    async function salvar(dados) {
        setMensagemErro("");
        setMensagemOk("");
        const corpo = { nome: dados.nome.trim(), quantidade_total: Number(dados.quantidade_total) };
        try {
            if (dados.id) {
                await apiPut(`/objetos/${dados.id}`, corpo);
                setMensagemOk(`Objeto "${corpo.nome}" atualizado.`);
            } else {
                await apiPost("/objetos", corpo);
                setMensagemOk(`Objeto "${corpo.nome}" cadastrado.`);
            }
            setEditando(null);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    async function confirmarExclusao() {
        if (!excluindo) return;
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiDelete(`/objetos/${excluindo.id}`);
            setMensagemOk(`Objeto "${excluindo.nome}" removido.`);
            setExcluindo(null);
            await carregar();
        } catch (erro) {
            setExcluindo(null);
            setMensagemErro(erro.message);
        }
    }

    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Objetos</h1>
                <Button onClick={() => { setMensagemErro(""); setMensagemOk(""); setEditando({}); }}>
                    + Cadastrar objeto
                </Button>
            </div>

            {mensagemErro && (
                <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {mensagemErro}
                </p>
            )}
            {mensagemOk && (
                <p className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    {mensagemOk}
                </p>
            )}

            <Input
                className="sm:w-96"
                placeholder="Buscar objeto pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />

            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Objeto</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">Emprestados</TableHead>
                            <TableHead className="text-center">Disponíveis</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Nenhum objeto encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtrados.map((o) => (
                                <TableRow key={o.id}>
                                    <TableCell className="font-medium">{o.nome}</TableCell>
                                    <TableCell className="text-center">{o.quantidade_total}</TableCell>
                                    <TableCell className="text-center">{o.quantidade_emprestada}</TableCell>
                                    <TableCell className="text-center">{o.quantidade_disponivel}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="sm"
                                                onClick={() => { setMensagemErro(""); setMensagemOk(""); setEditando(o); }}>
                                                Editar
                                            </Button>
                                            <Button variant="destructive" size="sm"
                                                onClick={() => { setMensagemErro(""); setMensagemOk(""); setExcluindo(o); }}>
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

            <DialogObjeto objeto={editando} onCancelar={() => setEditando(null)} onSalvar={salvar} />

            <AlertDialog open={Boolean(excluindo)} onOpenChange={(a) => { if (!a) setExcluindo(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover objeto</AlertDialogTitle>
                        <AlertDialogDescription>
                            {excluindo ? `Tem certeza que deseja remover "${excluindo.nome}"?` : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarExclusao}>
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}

// --- Modal: cadastrar/editar objeto ---
function DialogObjeto({ objeto, onCancelar, onSalvar }) {
    const aberto = Boolean(objeto);
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("1");

    useEffect(() => {
        if (objeto) {
            setNome(objeto.nome || "");
            setQuantidade(objeto.quantidade_total != null ? String(objeto.quantidade_total) : "1");
        }
    }, [objeto]);

    function enviar(e) {
        e.preventDefault();
        if (!nome.trim()) return;
        onSalvar({ id: objeto.id, nome, quantidade_total: quantidade });
    }

    return (
        <Dialog open={aberto} onOpenChange={(a) => { if (!a) onCancelar(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{objeto && objeto.id ? "Editar objeto" : "Novo objeto"}</DialogTitle>
                    <DialogDescription>
                        Informe o nome do objeto e quantas unidades existem no estoque.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="obj-nome">Nome</Label>
                        <Input id="obj-nome" value={nome} required
                            onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Bola de vôlei" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="obj-qtd">Quantidade</Label>
                        <Input id="obj-qtd" type="number" min={0} value={quantidade} required
                            onChange={(e) => setQuantidade(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                        <Button type="submit" disabled={!nome.trim()}>Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default Objetos;
