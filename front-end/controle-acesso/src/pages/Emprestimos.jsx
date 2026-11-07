import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiGet, apiPost } from "../services/api";

const norm = (texto) =>
    (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function formatarData(valor) {
    if (!valor) return "—";
    const data = new Date(valor);
    return isNaN(data.getTime()) ? "—" : data.toLocaleString("pt-BR");
}

function Emprestimos() {
    const [emAberto, setEmAberto] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [objetos, setObjetos] = useState([]);
    const [pessoas, setPessoas] = useState([]);

    const [abaHistorico, setAbaHistorico] = useState(false);
    const [emprestando, setEmprestando] = useState(false);

    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemOk, setMensagemOk] = useState("");

    async function carregar() {
        try {
            const [listaAberto, listaObjetos, listaHist] = await Promise.all([
                apiGet("/emprestimos/em-aberto"),
                apiGet("/objetos"),
                apiGet("/emprestimos"),
            ]);
            setEmAberto(listaAberto);
            setObjetos(listaObjetos);
            setHistorico(listaHist);
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    useEffect(() => {
        carregar();
        apiGet("/pessoas").then(setPessoas).catch(() => {});
    }, []);

    async function emprestar(pessoaId, itens, nomePessoa) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiPost("/emprestimos/lote", {
                pessoa_id: Number(pessoaId),
                itens: itens.map((i) => ({ objeto_id: Number(i.objeto_id), quantidade: Number(i.quantidade) })),
            });
            setEmprestando(false);
            setMensagemOk(`${itens.length} objeto(s) emprestado(s) para ${nomePessoa}.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    async function devolver(emprestimo) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiPost(`/emprestimos/${emprestimo.id}/devolver`);
            setMensagemOk(`Devolução registrada: ${emprestimo.objeto_nome}.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Empréstimos</h1>
                <Button onClick={() => { setMensagemErro(""); setMensagemOk(""); setEmprestando(true); }}>
                    + Emprestar objetos
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

            <div className="flex gap-2 border-b">
                <Button variant={abaHistorico ? "ghost" : "secondary"} className="rounded-b-none"
                    onClick={() => setAbaHistorico(false)}>
                    Emprestados agora
                </Button>
                <Button variant={abaHistorico ? "secondary" : "ghost"} className="rounded-b-none"
                    onClick={() => setAbaHistorico(true)}>
                    Histórico
                </Button>
            </div>

            {!abaHistorico ? (
                <div className="overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead>Objeto</TableHead>
                                <TableHead>Quem pegou</TableHead>
                                <TableHead className="text-center">Qtd.</TableHead>
                                <TableHead>Emprestado em</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {emAberto.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Nenhum objeto emprestado no momento.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                emAberto.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell className="font-medium">{e.objeto_nome}</TableCell>
                                        <TableCell>{e.pessoa_nome}</TableCell>
                                        <TableCell className="text-center">{e.quantidade}</TableCell>
                                        <TableCell>{formatarData(e.data_emprestimo)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Button size="sm" onClick={() => devolver(e)}>
                                                    Registrar devolução
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead>Objeto</TableHead>
                                <TableHead>Quem pegou</TableHead>
                                <TableHead className="text-center">Qtd.</TableHead>
                                <TableHead>Emprestado em</TableHead>
                                <TableHead>Devolvido em</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historico.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhum empréstimo registrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                historico.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell className="font-medium">{e.objeto_nome}</TableCell>
                                        <TableCell>{e.pessoa_nome}</TableCell>
                                        <TableCell className="text-center">{e.quantidade}</TableCell>
                                        <TableCell>{formatarData(e.data_emprestimo)}</TableCell>
                                        <TableCell>{formatarData(e.data_devolucao)}</TableCell>
                                        <TableCell className="text-center">
                                            {e.status === "DEVOLVIDO" ? (
                                                <span className="text-green-700 dark:text-green-400">Devolvido</span>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-400">Emprestado</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <DialogEmprestar
                aberto={emprestando}
                objetos={objetos}
                pessoas={pessoas}
                onCancelar={() => setEmprestando(false)}
                onEmprestar={emprestar}
            />
        </main>
    );
}

// --- Modal: emprestar (um cliente + vários objetos de uma vez) ---
function DialogEmprestar({ aberto, objetos, pessoas, onCancelar, onEmprestar }) {
    const [pessoaId, setPessoaId] = useState(null);
    const [buscaPessoa, setBuscaPessoa] = useState("");
    const [itens, setItens] = useState([]); // [{ objeto_id, nome, quantidade, max }]

    useEffect(() => {
        if (aberto) {
            setPessoaId(null);
            setBuscaPessoa("");
            setItens([]);
        }
    }, [aberto]);

    const pessoaEscolhida = pessoas.find((p) => p.id === pessoaId);

    const pessoasFiltradas = pessoas.filter((p) => {
        const termo = norm(buscaPessoa);
        if (!termo) return true;
        return norm(p.nome).includes(termo) || (p.cpf ?? "").replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
    });

    // Objetos que ainda dá pra adicionar: têm estoque livre e não estão no carrinho.
    const disponiveisParaAdicionar = objetos.filter(
        (o) => o.quantidade_disponivel > 0 && !itens.some((i) => i.objeto_id === o.id)
    );

    function adicionarObjeto(o) {
        setItens((atual) => [...atual, { objeto_id: o.id, nome: o.nome, quantidade: 1, max: o.quantidade_disponivel }]);
    }
    function alterarQuantidade(objetoId, valor) {
        setItens((atual) => atual.map((i) => (i.objeto_id === objetoId ? { ...i, quantidade: valor } : i)));
    }
    function removerItem(objetoId) {
        setItens((atual) => atual.filter((i) => i.objeto_id !== objetoId));
    }

    const itensValidos = itens.length > 0 && itens.every((i) => {
        const n = Number(i.quantidade);
        return n >= 1 && n <= i.max;
    });
    const podeEnviar = Boolean(pessoaId) && itensValidos;

    function enviar(e) {
        e.preventDefault();
        if (!podeEnviar) return;
        onEmprestar(pessoaId, itens, pessoaEscolhida ? pessoaEscolhida.nome : "");
    }

    return (
        <Dialog open={aberto} onOpenChange={(a) => { if (!a) onCancelar(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Emprestar objetos</DialogTitle>
                    <DialogDescription>
                        Escolha o cliente e adicione um ou mais objetos (ex.: bola e peteca).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="space-y-4">
                    {/* Cliente */}
                    <div className="grid gap-2">
                        <Label>Cliente</Label>
                        {pessoaEscolhida ? (
                            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                <span>{pessoaEscolhida.nome} <span className="text-muted-foreground">{pessoaEscolhida.cpf}</span></span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setPessoaId(null)}>Trocar</Button>
                            </div>
                        ) : (
                            <>
                                <Input placeholder="Buscar cliente por nome ou CPF..." value={buscaPessoa}
                                    onChange={(e) => setBuscaPessoa(e.target.value)} />
                                <div className="max-h-40 overflow-auto rounded-md border">
                                    {pessoasFiltradas.length === 0 ? (
                                        <p className="p-3 text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
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
                            </>
                        )}
                    </div>

                    {/* Objetos escolhidos (carrinho) */}
                    <div className="grid gap-2">
                        <Label>Objetos a emprestar</Label>
                        {itens.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum objeto adicionado ainda.</p>
                        ) : (
                            <div className="space-y-2">
                                {itens.map((i) => (
                                    <div key={i.objeto_id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                        <span className="flex-1">{i.nome}
                                            <span className="text-muted-foreground"> ({i.max} disp.)</span>
                                        </span>
                                        <Input type="number" min={1} max={i.max} value={i.quantidade}
                                            className="h-8 w-20"
                                            onChange={(e) => alterarQuantidade(i.objeto_id, e.target.value)} />
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removerItem(i.objeto_id)}>
                                            Remover
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Adicionar objeto */}
                    <div className="grid gap-2">
                        <Label>Adicionar objeto</Label>
                        <div className="max-h-40 overflow-auto rounded-md border">
                            {disponiveisParaAdicionar.length === 0 ? (
                                <p className="p-3 text-sm text-muted-foreground">Nenhum objeto disponível para adicionar.</p>
                            ) : (
                                disponiveisParaAdicionar.map((o) => (
                                    <button key={o.id} type="button"
                                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                                        onClick={() => adicionarObjeto(o)}>
                                        <span>{o.nome}</span>
                                        <span className="text-muted-foreground">+ {o.quantidade_disponivel} disp.</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                        <Button type="submit" disabled={!podeEnviar}>Emprestar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default Emprestimos;
