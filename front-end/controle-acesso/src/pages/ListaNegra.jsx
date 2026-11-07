import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { LockOpen, Plus, ShieldBan, ShieldCheck } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "../services/api";

const norm = (texto) =>
    (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const digitos = (texto) => (texto ?? "").replace(/\D/g, "");

function formatarCpf(cpf) {
    const d = digitos(cpf);
    return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : cpf;
}

function ListaNegra() {
    const [registros, setRegistros] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [busca, setBusca] = useState("");
    const [adicionando, setAdicionando] = useState(false);
    const [desbloqueando, setDesbloqueando] = useState(null);
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemOk, setMensagemOk] = useState("");

    async function carregar() {
        try {
            const [lista, listaPessoas] = await Promise.all([apiGet("/lista-negra"), apiGet("/pessoas")]);
            setRegistros(lista);
            setPessoas(listaPessoas);
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    async function adicionar(corpo) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            const registro = await apiPost("/lista-negra", corpo);
            setAdicionando(false);
            setMensagemOk(`${registro.nome || formatarCpf(registro.cpf)} foi adicionado à Lista Negra.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    async function desbloquear(registro) {
        setMensagemErro("");
        setMensagemOk("");
        setDesbloqueando(null);
        try {
            await apiDelete(`/lista-negra/${registro.id}`);
            setMensagemOk(`${registro.nome || formatarCpf(registro.cpf)} saiu da Lista Negra.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
            await carregar(); // a lista pode estar desatualizada (ex.: outro PC já desbloqueou)
        }
    }

    const termo = norm(busca);
    const termoCpf = digitos(busca);
    const filtrados = registros.filter((r) =>
        !termo ||
        norm(r.nome).includes(termo) ||
        norm(r.motivo).includes(termo) ||
        (termoCpf !== "" && r.cpf.includes(termoCpf))
    );

    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <ShieldBan className="size-6 text-destructive" aria-hidden="true" />
                        Lista Negra
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pessoas que não podem entrar por convite ou cortesia. O bloqueio vale pelo CPF, mesmo para quem ainda não tem cadastro.
                    </p>
                </div>
                <Button variant="destructive" onClick={() => { setMensagemErro(""); setMensagemOk(""); setAdicionando(true); }}>
                    <Plus className="size-4" aria-hidden="true" />
                    Adicionar à Lista Negra
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
                placeholder="Buscar por nome, CPF ou motivo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />

            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Bloqueado em</TableHead>
                            <TableHead>Cadastro</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldCheck className="size-8 opacity-60" aria-hidden="true" />
                                        {busca ? "Nenhum resultado para a busca." : "Ninguém na Lista Negra."}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtrados.map((r) => (
                                <TableRow key={r.id} className="text-destructive">
                                    <TableCell className="font-semibold">{r.nome || "—"}</TableCell>
                                    <TableCell>{formatarCpf(r.cpf)}</TableCell>
                                    <TableCell className="whitespace-normal break-words">{r.motivo}</TableCell>
                                    <TableCell>
                                        {r.data_bloqueio ? new Date(r.data_bloqueio).toLocaleDateString("pt-BR") : "—"}
                                    </TableCell>
                                    <TableCell className="text-foreground">
                                        {r.pessoa_id ? "Cadastrado" : <span className="text-muted-foreground">Sem cadastro</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Button variant="outline" size="sm" onClick={() => setDesbloqueando(r)}>
                                                <LockOpen className="size-4" aria-hidden="true" />
                                                Desbloquear
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={Boolean(desbloqueando)} onOpenChange={(a) => { if (!a) setDesbloqueando(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Desbloquear</AlertDialogTitle>
                        <AlertDialogDescription>
                            {desbloqueando
                                ? `Tirar ${desbloqueando.nome || formatarCpf(desbloqueando.cpf)} da Lista Negra? A pessoa volta a poder entrar por convite ou cortesia.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => desbloquear(desbloqueando)}>
                            <LockOpen className="size-4" aria-hidden="true" />
                            Desbloquear
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DialogAdicionar
                aberto={adicionando}
                pessoas={pessoas}
                onCancelar={() => setAdicionando(false)}
                onConfirmar={adicionar}
            />
        </main>
    );
}

// --- Modal: bloquear pessoa cadastrada ou CPF avulso ---
function DialogAdicionar({ aberto, pessoas, onCancelar, onConfirmar }) {
    const [modo, setModo] = useState("cadastrada");
    const [buscaPessoa, setBuscaPessoa] = useState("");
    const [pessoaId, setPessoaId] = useState(null);
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [motivo, setMotivo] = useState("");

    useEffect(() => {
        if (aberto) {
            setModo("cadastrada"); setBuscaPessoa(""); setPessoaId(null);
            setNome(""); setCpf(""); setMotivo("");
        }
    }, [aberto]);

    const pessoaSelecionada = pessoas.find((p) => p.id === pessoaId);
    const termo = norm(buscaPessoa);
    const termoCpf = digitos(buscaPessoa);
    const pessoasFiltradas = pessoas.filter((p) =>
        !p.bloqueado && (
            !termo ||
            norm(p.nome).includes(termo) ||
            (termoCpf !== "" && digitos(p.cpf).includes(termoCpf))
        )
    );

    const cpfAvulsoValido = digitos(cpf).length === 11;
    const valido = motivo.trim() !== "" && (modo === "cadastrada" ? Boolean(pessoaId) : cpfAvulsoValido);

    function enviar(e) {
        e.preventDefault();
        if (!valido) return;
        onConfirmar(modo === "cadastrada"
            ? { pessoa_id: pessoaId, motivo: motivo.trim() }
            : { cpf, nome: nome.trim(), motivo: motivo.trim() });
    }

    return (
        <Dialog open={aberto} onOpenChange={(a) => { if (!a) onCancelar(); }}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={enviar} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Adicionar à Lista Negra</DialogTitle>
                        <DialogDescription>
                            A pessoa não poderá mais entrar por convite ou cortesia.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2">
                        <Button type="button" size="sm" variant={modo === "cadastrada" ? "default" : "outline"}
                            onClick={() => setModo("cadastrada")}>
                            Pessoa cadastrada
                        </Button>
                        <Button type="button" size="sm" variant={modo === "avulso" ? "default" : "outline"}
                            onClick={() => setModo("avulso")}>
                            CPF sem cadastro
                        </Button>
                    </div>

                    {modo === "cadastrada" ? (
                        pessoaSelecionada ? (
                            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                <span>{pessoaSelecionada.nome} <span className="text-muted-foreground">{pessoaSelecionada.cpf}</span></span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setPessoaId(null)}>Trocar</Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Pessoa</Label>
                                <Input placeholder="Buscar por nome ou CPF..." value={buscaPessoa}
                                    onChange={(e) => setBuscaPessoa(e.target.value)} />
                                <div className="max-h-40 overflow-auto rounded-md border">
                                    {pessoasFiltradas.length === 0 ? (
                                        <p className="p-3 text-sm text-muted-foreground">Nenhuma pessoa encontrada.</p>
                                    ) : (
                                        pessoasFiltradas.slice(0, 50).map((p) => (
                                            <button key={p.id} type="button"
                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => setPessoaId(p.id)}>
                                                <span>{p.nome}</span>
                                                <span className="text-muted-foreground">{p.cpf}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="ln-nome">Nome</Label>
                                <Input id="ln-nome" maxLength={255} value={nome} onChange={(e) => setNome(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ln-cpf">CPF</Label>
                                <Input id="ln-cpf" required maxLength={14} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                                {cpf && !cpfAvulsoValido && (
                                    <span className="text-xs text-destructive">O CPF precisa ter 11 dígitos.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="ln-motivo-novo">Motivo</Label>
                        <textarea
                            id="ln-motivo-novo"
                            required
                            maxLength={1000}
                            rows={3}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                        <Button type="submit" variant="destructive" disabled={!valido}>
                            <ShieldBan className="size-4" aria-hidden="true" />
                            Bloquear
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ListaNegra;
