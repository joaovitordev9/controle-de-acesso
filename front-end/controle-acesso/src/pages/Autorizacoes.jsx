import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { apiGet, apiPost, apiDelete } from "../services/api";
import { CATEGORIAS } from "../lib/dominio";

const norm = (texto) =>
    (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Autorizacoes() {
    const [autorizacoes, setAutorizacoes] = useState([]);
    const [cotas, setCotas] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [busca, setBusca] = useState("");

    const [criando, setCriando] = useState(false);
    const [confirmando, setConfirmando] = useState(null);

    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemOk, setMensagemOk] = useState("");

    async function carregar() {
        try {
            const [listaAut, listaCotas] = await Promise.all([
                apiGet("/autorizacoes"),
                apiGet("/cotas"),
            ]);
            setAutorizacoes(listaAut);
            setCotas(listaCotas);
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    useEffect(() => {
        carregar();
        apiGet("/pessoas").then(setPessoas).catch(() => {});
    }, []);

    const filtradas = autorizacoes.filter((a) => {
        const termo = norm(busca);
        if (!termo) return true;
        return norm(a.nomeAutorizado).includes(termo) || norm(a.titular).includes(termo);
    });

    async function criarAutorizacao(cotaId, nome) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiPost("/autorizacoes", { cota_id: Number(cotaId), nomeAutorizado: nome.trim() });
            setCriando(false);
            setMensagemOk(`Autorização criada para ${nome.trim()}.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    async function removerAutorizacao(autorizacao) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiDelete(`/autorizacoes/${autorizacao.id}`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    async function confirmarEntrada(autorizacaoId, pessoaId, tipo, nomePessoa) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiPost(`/autorizacoes/${autorizacaoId}/chegada`, { pessoa_id: pessoaId, tipo });
            setConfirmando(null);
            setMensagemOk(`Entrada confirmada para ${nomePessoa}. O convite do sócio está em uso.`);
            await carregar();
        } catch (erro) {
            // Mensagem de bloqueio vem do backend (ex.: sem convites disponíveis).
            setMensagemErro(erro.message);
        }
    }

    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Autorizações</h1>
                <Button onClick={() => { setMensagemErro(""); setMensagemOk(""); setCriando(true); }}>
                    + Nova autorização
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
                placeholder="Buscar por pessoa autorizada ou sócio titular..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />

            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Pessoa autorizada</TableHead>
                            <TableHead>Sócio titular</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtradas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    Nenhuma autorização pendente.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtradas.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell className="font-medium">{a.nomeAutorizado}</TableCell>
                                    <TableCell>{a.titular} <span className="text-muted-foreground">({a.codigo_cota})</span></TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" onClick={() => { setMensagemErro(""); setMensagemOk(""); setConfirmando(a); }}>
                                                Confirmar entrada
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => removerAutorizacao(a)}>
                                                Remover
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DialogCriar
                aberto={criando}
                cotas={cotas}
                onCancelar={() => setCriando(false)}
                onCriar={criarAutorizacao}
            />

            <DialogConfirmar
                autorizacao={confirmando}
                cota={confirmando ? cotas.find((c) => c.id === confirmando.cota_id) : null}
                pessoas={pessoas}
                onCancelar={() => setConfirmando(null)}
                onConfirmar={confirmarEntrada}
                onPessoaCriada={(p) => setPessoas((atual) => [...atual, p])}
                onErro={setMensagemErro}
            />
        </main>
    );
}

// --- Modal: criar autorização (nome + sócio titular pesquisável) ---
function DialogCriar({ aberto, cotas, onCancelar, onCriar }) {
    const [nome, setNome] = useState("");
    const [cotaId, setCotaId] = useState(null);
    const [buscaSocio, setBuscaSocio] = useState("");

    useEffect(() => {
        if (aberto) { setNome(""); setCotaId(null); setBuscaSocio(""); }
    }, [aberto]);

    const cotasFiltradas = cotas.filter((c) => {
        const termo = norm(buscaSocio);
        if (!termo) return true;
        return norm(c.titular).includes(termo) || norm(c.codigo).includes(termo);
    });
    const cotaEscolhida = cotas.find((c) => c.id === cotaId);

    function enviar(e) {
        e.preventDefault();
        if (!cotaId || !nome.trim()) return;
        onCriar(cotaId, nome);
    }

    return (
        <Dialog open={aberto} onOpenChange={(a) => { if (!a) onCancelar(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nova autorização</DialogTitle>
                    <DialogDescription>
                        O sócio liberou alguém para entrar. Isso ainda não consome convite.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nomeAut">Nome da pessoa autorizada</Label>
                        <Input id="nomeAut" value={nome} required
                            onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Maria Souza" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Sócio titular</Label>
                        {cotaEscolhida ? (
                            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                <span>{cotaEscolhida.titular} <span className="text-muted-foreground">({cotaEscolhida.codigo})</span></span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setCotaId(null)}>Trocar</Button>
                            </div>
                        ) : (
                            <>
                                <Input placeholder="Pesquisar sócio pelo nome..." value={buscaSocio}
                                    onChange={(e) => setBuscaSocio(e.target.value)} />
                                <div className="max-h-48 overflow-auto rounded-md border">
                                    {cotasFiltradas.length === 0 ? (
                                        <p className="p-3 text-sm text-muted-foreground">Nenhum sócio encontrado.</p>
                                    ) : (
                                        cotasFiltradas.map((c) => (
                                            <button key={c.id} type="button"
                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => setCotaId(c.id)}>
                                                <span>{c.titular}</span>
                                                <span className="text-muted-foreground">{c.codigo}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                        <Button type="submit" disabled={!cotaId || !nome.trim()}>Criar autorização</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Modal: confirmar entrada (resolve pessoa + escolhe tipo com saldo) ---
function DialogConfirmar({ autorizacao, cota, pessoas, onCancelar, onConfirmar, onPessoaCriada, onErro }) {
    const [busca, setBusca] = useState("");
    const [pessoaId, setPessoaId] = useState(null);
    const [modoCadastro, setModoCadastro] = useState(false);
    const [novo, setNovo] = useState({ nome: "", cpf: "", telefone: "", cidade: "", categoria: "CONVIDADO" });
    const [tipo, setTipo] = useState("CONVITE_ESPECIAL");

    useEffect(() => {
        if (autorizacao) {
            setBusca("");
            setPessoaId(autorizacao.pessoa_id || null);
            setModoCadastro(false);
            setNovo({ nome: autorizacao.nomeAutorizado || "", cpf: "", telefone: "", cidade: "", categoria: "CONVIDADO" });
            setTipo("CONVITE_ESPECIAL");
        }
    }, [autorizacao]);

    const aberto = Boolean(autorizacao);

    const conviteDisp = cota ? cota.convites_especiais_disponiveis : 0;
    const cortesiaDisp = cota ? cota.cortesias_disponiveis : 0;
    const temCortesia = cota ? cota.cortesias_total > 0 : false;

    const dispSelecionado = tipo === "CORTESIA" ? cortesiaDisp : conviteDisp;

    const pessoaSelecionada = pessoas.find((p) => p.id === pessoaId);

    const pessoasFiltradas = pessoas.filter((p) => {
        const termo = norm(busca);
        if (!termo) return true;
        return norm(p.nome).includes(termo) || (p.cpf ?? "").replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
    });

    async function cadastrarPessoa(e) {
        e.preventDefault();
        try {
            const pessoa = await apiPost("/pessoas", {
                nome: novo.nome, cpf: novo.cpf, telefone: novo.telefone,
                cidade: novo.cidade, categoria: novo.categoria, codigo_cota: null,
            });
            onPessoaCriada(pessoa);
            setPessoaId(pessoa.id);
            setModoCadastro(false);
        } catch (erro) {
            onErro(erro.message);
        }
    }

    function confirmar() {
        if (!pessoaId) return;
        const nome = pessoaSelecionada ? pessoaSelecionada.nome : (autorizacao.nomeAutorizado || "");
        onConfirmar(autorizacao.id, pessoaId, tipo, nome);
    }

    return (
        <Dialog open={aberto} onOpenChange={(a) => { if (!a) onCancelar(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Confirmar entrada</DialogTitle>
                    <DialogDescription>
                        {autorizacao ? `${autorizacao.nomeAutorizado} · titular ${autorizacao.titular}` : ""}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 1. Resolver pessoa */}
                    {modoCadastro ? (
                        <form onSubmit={cadastrarPessoa} className="space-y-3 rounded-md border p-3">
                            <p className="text-sm font-medium">Cadastrar nova pessoa</p>
                            <div className="grid gap-2">
                                <Label htmlFor="cf-nome">Nome</Label>
                                <Input id="cf-nome" value={novo.nome} required onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="cf-cpf">CPF</Label>
                                    <Input id="cf-cpf" value={novo.cpf} required onChange={(e) => setNovo({ ...novo, cpf: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cf-tel">Telefone</Label>
                                    <Input id="cf-tel" value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="cf-cid">Cidade</Label>
                                    <Input id="cf-cid" value={novo.cidade} onChange={(e) => setNovo({ ...novo, cidade: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Categoria</Label>
                                    <Select value={novo.categoria} onValueChange={(v) => setNovo({ ...novo, categoria: v })}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIAS.filter((c) => c.valor !== "SOCIO").map((c) => (
                                                <SelectItem key={c.valor} value={c.valor}>{c.rotulo}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setModoCadastro(false)}>Voltar</Button>
                                <Button type="submit">Salvar pessoa</Button>
                            </div>
                        </form>
                    ) : pessoaSelecionada ? (
                        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                            <span>{pessoaSelecionada.nome} <span className="text-muted-foreground">{pessoaSelecionada.cpf}</span></span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setPessoaId(null)}>Trocar</Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Pessoa que chegou</Label>
                            <Input placeholder="Buscar por nome ou CPF..." value={busca} onChange={(e) => setBusca(e.target.value)} />
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
                            <Button type="button" variant="outline" size="sm" onClick={() => setModoCadastro(true)}>
                                Cadastrar nova pessoa
                            </Button>
                        </div>
                    )}

                    {/* 2. Escolher tipo com saldo */}
                    <div className="grid gap-2">
                        <Label>Benefício utilizado</Label>
                        <Select value={tipo} onValueChange={setTipo}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CONVITE_ESPECIAL">Convite (disponíveis: {conviteDisp})</SelectItem>
                                {temCortesia && (
                                    <SelectItem value="CORTESIA">Cortesia (disponíveis: {cortesiaDisp})</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {dispSelecionado <= 0 && (
                            <p className="text-sm text-destructive">Sem saldo disponível para este tipo.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                    <Button type="button" onClick={confirmar} disabled={!pessoaId || dispSelecionado <= 0}>
                        Confirmar entrada
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default Autorizacoes;
