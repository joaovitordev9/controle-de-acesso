import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { apiGet, apiPost } from "../services/api";
import { CATEGORIAS, rotuloTipoConvite } from "../lib/dominio";

const norm = (texto) =>
    (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Badge para diferenciar convite especial (azul) de cortesia (âmbar).
const corBadge = (tipo) =>
    tipo === "CORTESIA"
        ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400"
        : "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-400";

function Convites() {
    const [emUso, setEmUso] = useState([]);
    const [cotas, setCotas] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [busca, setBusca] = useState("");
    const [entradaDireta, setEntradaDireta] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemOk, setMensagemOk] = useState("");

    async function carregar() {
        try {
            const [usos, listaCotas] = await Promise.all([
                apiGet("/entradas/em-uso"),
                apiGet("/cotas"),
            ]);
            setEmUso(usos);
            setCotas(listaCotas);
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    useEffect(() => {
        carregar();
        apiGet("/pessoas").then(setPessoas).catch(() => {});
    }, []);

    // Entrada direta: registra a chegada sem autorização prévia (busca pessoa + sócio + tipo).
    async function registrarEntradaDireta(cotaId, pessoaId, tipo, nomePessoa) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiPost("/entradas/direta", { cota_id: Number(cotaId), pessoa_id: pessoaId, tipo });
            setEntradaDireta(false);
            setMensagemOk(`Entrada registrada para ${nomePessoa}. O convite do sócio está em uso.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    async function liberar(uso) {
        setMensagemErro("");
        setMensagemOk("");
        try {
            await apiPost(`/entradas/${uso.id}/liberar`);
            setMensagemOk(`${uso.pessoa} foi removido do convite de ${uso.titular}.`);
            await carregar();
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    // Agrupa as utilizações ativas por cota (só aparece quem está usando agora).
    const porCota = emUso.reduce((acc, uso) => {
        const chave = uso.cota_id ?? `sem-${uso.id}`;
        (acc[chave] = acc[chave] || []).push(uso);
        return acc;
    }, {});

    const termo = norm(busca);
    const grupos = Object.values(porCota)
        .map((usos) => {
            const cota = cotas.find((c) => c.id === usos[0].cota_id);
            return { usos, cota, codigo: usos[0].codigo_cota, titular: usos[0].titular };
        })
        .filter((g) => {
            if (!termo) return true;
            if (norm(g.titular).includes(termo) || norm(g.codigo).includes(termo)) return true;
            return g.usos.some((u) => norm(u.pessoa).includes(termo));
        })
        .sort((a, b) => norm(a.titular).localeCompare(norm(b.titular)));

    return (
        <main className="min-w-0 flex-1 p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Convites em uso</h1>
                    <p className="text-sm text-muted-foreground">
                        Mostra quem está ocupando convites e cortesias neste momento. Some da lista quando o prazo encerra ou ao remover.
                    </p>
                </div>
                <Button onClick={() => { setMensagemErro(""); setMensagemOk(""); setEntradaDireta(true); }}>
                    + Entrada direta
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
                placeholder="Buscar por pessoa, sócio titular ou cota..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />

            {grupos.length === 0 ? (
                <div className="rounded-xl border p-8 text-center text-muted-foreground">
                    Nenhum convite ou cortesia em uso no momento.
                </div>
            ) : (
                <div className="space-y-4">
                    {grupos.map((g) => (
                        <div key={g.usos[0].cota_id ?? g.usos[0].id} className="overflow-hidden rounded-xl border">
                            <div className="flex flex-wrap items-center gap-10 border-b bg-muted/50 px-4 py-3">
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Titular</span>
                                        <span className="font-semibold">{g.titular}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Cota</span>
                                        <span className="font-semibold">{g.codigo}</span>
                                    </div>
                                </div>
                                {g.cota && (
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <span className={`rounded-md border px-2.5 py-1 ${corBadge("CONVITE_ESPECIAL")}`}>
                                            Convite especial:{" "}
                                            <strong>{g.cota.convites_especiais_utilizados}</strong> em uso de{" "}
                                            {g.cota.convites_especiais_total}
                                        </span>
                                        {g.cota.cortesias_total > 0 && (
                                            <span className={`rounded-md border px-2.5 py-1 ${corBadge("CORTESIA")}`}>
                                                Cortesia:{" "}
                                                <strong>{g.cota.cortesias_utilizadas}</strong> em uso de{" "}
                                                {g.cota.cortesias_total}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <ul className="divide-y">
                                {g.usos.map((uso) => (
                                    <li key={uso.id} className="flex flex-wrap items-center gap-10 px-4 py-3">
                                        <div className="flex w-56 flex-col">
                                            <span className="text-xs text-muted-foreground">Pessoa</span>
                                            <span className="font-medium">{uso.pessoa}</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Tipo</span>
                                            <span className={`mt-0.5 w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${corBadge(uso.tipo)}`}>
                                                {uso.tipo_rotulo || rotuloTipoConvite(uso.tipo)}
                                            </span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Entrou</span>
                                            <span className="text-sm">
                                                {uso.data_entrada
                                                    ? new Date(uso.data_entrada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                                                    : "—"}
                                            </span>
                                        </div>

                                        <Button variant="destructive" size="sm" className="ml-auto" onClick={() => liberar(uso)}>
                                            Remover do convite
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <DialogEntradaDireta
                aberto={entradaDireta}
                cotas={cotas}
                pessoas={pessoas}
                onCancelar={() => setEntradaDireta(false)}
                onConfirmar={registrarEntradaDireta}
                onPessoaCriada={(p) => setPessoas((atual) => [...atual, p])}
                onErro={setMensagemErro}
            />
        </main>
    );
}

// --- Modal: entrada direta (sem autorização): busca pessoa + sócio + tipo ---
function DialogEntradaDireta({ aberto, cotas, pessoas, onCancelar, onConfirmar, onPessoaCriada, onErro }) {
    const [buscaPessoa, setBuscaPessoa] = useState("");
    const [pessoaId, setPessoaId] = useState(null);
    const [modoCadastro, setModoCadastro] = useState(false);
    const [novo, setNovo] = useState({ nome: "", cpf: "", telefone: "", cidade: "", categoria: "CONVIDADO" });
    const [buscaSocio, setBuscaSocio] = useState("");
    const [cotaId, setCotaId] = useState(null);
    const [tipo, setTipo] = useState("CONVITE_ESPECIAL");

    useEffect(() => {
        if (aberto) {
            setBuscaPessoa(""); setPessoaId(null); setModoCadastro(false);
            setNovo({ nome: "", cpf: "", telefone: "", cidade: "", categoria: "CONVIDADO" });
            setBuscaSocio(""); setCotaId(null); setTipo("CONVITE_ESPECIAL");
        }
    }, [aberto]);

    const pessoaSelecionada = pessoas.find((p) => p.id === pessoaId);
    const cota = cotas.find((c) => c.id === cotaId);

    const conviteDisp = cota ? cota.convites_especiais_disponiveis : 0;
    const cortesiaDisp = cota ? cota.cortesias_disponiveis : 0;
    const temCortesia = cota ? cota.cortesias_total > 0 : false;
    const dispSelecionado = tipo === "CORTESIA" ? cortesiaDisp : conviteDisp;

    const pessoasFiltradas = pessoas.filter((p) => {
        const termo = norm(buscaPessoa);
        if (!termo) return true;
        return norm(p.nome).includes(termo) || (p.cpf ?? "").replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
    });

    const cotasFiltradas = cotas.filter((c) => {
        const termo = norm(buscaSocio);
        if (!termo) return true;
        return norm(c.titular).includes(termo) || norm(c.codigo).includes(termo);
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
        if (!pessoaId || !cotaId) return;
        onConfirmar(cotaId, pessoaId, tipo, pessoaSelecionada ? pessoaSelecionada.nome : "");
    }

    return (
        <Dialog open={aberto} onOpenChange={(a) => { if (!a) onCancelar(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Entrada direta</DialogTitle>
                    <DialogDescription>
                        Registra a chegada e consome o convite/cortesia do sócio, sem precisar de autorização prévia.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 1. Pessoa que chegou */}
                    {modoCadastro ? (
                        <form onSubmit={cadastrarPessoa} className="space-y-3 rounded-md border p-3">
                            <p className="text-sm font-medium">Cadastrar nova pessoa</p>
                            <div className="grid gap-2">
                                <Label htmlFor="ed-nome">Nome</Label>
                                <Input id="ed-nome" value={novo.nome} required onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="ed-cpf">CPF</Label>
                                    <Input id="ed-cpf" value={novo.cpf} required onChange={(e) => setNovo({ ...novo, cpf: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ed-tel">Telefone</Label>
                                    <Input id="ed-tel" value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="ed-cid">Cidade</Label>
                                    <Input id="ed-cid" value={novo.cidade} onChange={(e) => setNovo({ ...novo, cidade: e.target.value })} />
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
                            <Input placeholder="Buscar por nome ou CPF..." value={buscaPessoa} onChange={(e) => setBuscaPessoa(e.target.value)} />
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

                    {/* 2. Sócio titular (cota) */}
                    <div className="grid gap-2">
                        <Label>Sócio titular</Label>
                        {cota ? (
                            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                <span>{cota.titular} <span className="text-muted-foreground">({cota.codigo})</span></span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setCotaId(null)}>Trocar</Button>
                            </div>
                        ) : (
                            <>
                                <Input placeholder="Pesquisar sócio pelo nome ou cota..." value={buscaSocio}
                                    onChange={(e) => setBuscaSocio(e.target.value)} />
                                <div className="max-h-40 overflow-auto rounded-md border">
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

                    {/* 3. Tipo de benefício com saldo */}
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
                        {cota && dispSelecionado <= 0 && (
                            <p className="text-sm text-destructive">Sem saldo disponível para este tipo.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                    <Button type="button" onClick={confirmar} disabled={!pessoaId || !cotaId || dispSelecionado <= 0}>
                        Registrar entrada
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default Convites;
