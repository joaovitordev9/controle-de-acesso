import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../ui/dialog";
import { CATEGORIAS, CATEGORIAS_COM_COTA } from "../../lib/dominio";
import { apiGet } from "../../services/api";

function FormularioCliente({ cliente, onSalvar, onCancelar }) {
    const editando = Boolean(cliente);

    const [dados, setDados] = useState({
        nome: cliente?.nome || "",
        cpf: cliente?.cpf || "",
        telefone: cliente?.telefone || "",
        cidade: cliente?.cidade || "",
        codigoDaCota: cliente?.codigoDaCota || "",
        categoria: cliente?.categoria || "",
        papel: "TITULAR",
        diretor: false,
        temConviteEspecial: false,
        qtdConviteEspecial: 1,
    });

    const [cotaInfo, setCotaInfo] = useState(null);
    const [mensagem, setMensagem] = useState("");

    const ehSocio = dados.categoria === "SOCIO";
    const temCampoCota = CATEGORIAS_COM_COTA.includes(dados.categoria);
    // A cota já tem titular que não é este cliente -> entra/é dependente.
    const cotaComOutroTitular = Boolean(cotaInfo && cotaInfo.titular_id && cotaInfo.titular_id !== cliente?.id);

    function atualizarCampo(nomeCampo, valorCampo) {
        setDados((atual) => ({ ...atual, [nomeCampo]: valorCampo }));
    }

    function aoMudarCampo(evento) {
        atualizarCampo(evento.target.name, evento.target.value);
    }

    async function carregarCota(codigo) {
        if (!codigo) { setCotaInfo(null); return; }
        try {
            const cota = await apiGet(`/cotas/codigo/${encodeURIComponent(codigo)}`);
            setCotaInfo(cota);
            if (cota.titular_id && cota.titular_id !== cliente?.id) {
                atualizarCampo("papel", "DEPENDENTE");
            } else {
                // Este cliente é (ou será) o titular: pré-carrega os convites da cota.
                atualizarCampo("papel", "TITULAR");
                atualizarCampo("diretor", Boolean(cota.diretor));
                atualizarCampo("temConviteEspecial", cota.convites_especiais_total > 0);
                atualizarCampo("qtdConviteEspecial", cota.convites_especiais_total > 0 ? cota.convites_especiais_total : 1);
            }
        } catch (erro) {
            if (erro.status === 404) setCotaInfo(null); // cota nova
            else setMensagem(erro.message);
        }
    }

    // Na edição de um sócio, carrega a cota atual para refletir papel e convites.
    useEffect(() => {
        if (editando && ehSocio && dados.codigoDaCota) {
            carregarCota(dados.codigoDaCota);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function enviarFormulario(evento) {
        evento.preventDefault();
        setMensagem("");

        if (!dados.categoria) {
            setMensagem("Selecione uma categoria.");
            return;
        }
        if (temCampoCota && !dados.codigoDaCota) {
            setMensagem("Informe o código da cota.");
            return;
        }

        if (onSalvar) onSalvar(dados);
    }

    return (
        <form onSubmit={enviarFormulario} className="space-y-6">

            <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                    {editando ? "Editar cliente" : "Cadastrar cliente"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                    Preencha os dados para manter o cadastro atualizado.
                </DialogDescription>
            </DialogHeader>

            {mensagem && (
                <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {mensagem}
                </p>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">

                <div className="col-span-2 grid gap-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input type="text" id="nome" name="nome" value={dados.nome} onChange={aoMudarCampo}
                        placeholder="Ex.: João Silva" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input type="text" id="cpf" name="cpf" value={dados.cpf} onChange={aoMudarCampo}
                        placeholder="000.000.000-00" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input type="tel" id="telefone" name="telefone" value={dados.telefone} onChange={aoMudarCampo}
                        placeholder="(00) 00000-0000" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input type="text" id="cidade" name="cidade" value={dados.cidade} onChange={aoMudarCampo}
                        placeholder="Digite a cidade" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                        value={dados.categoria}
                        onValueChange={(valor) => {
                            atualizarCampo("categoria", valor);
                            setCotaInfo(null);
                            if (valor === "SOCIO" && dados.codigoDaCota) carregarCota(dados.codigoDaCota);
                        }}
                    >
                        <SelectTrigger id="categoria" className="w-full">
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIAS.map((categoria) => (
                                <SelectItem key={categoria.valor} value={categoria.valor}>
                                    {categoria.rotulo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {temCampoCota && (
                    <div className="grid gap-2">
                        <Label htmlFor="codigoDaCota">Código da cota</Label>
                        <Input type="text" id="codigoDaCota" name="codigoDaCota"
                            value={dados.codigoDaCota} onChange={aoMudarCampo}
                            onBlur={() => { if (ehSocio) carregarCota(dados.codigoDaCota); }}
                            placeholder="Ex.: 1515" required />
                    </div>
                )}

                {ehSocio && (
                    <>
                        {cotaComOutroTitular ? (
                            <div className="col-span-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                A cota <strong>{dados.codigoDaCota}</strong> já tem titular
                                (<strong>{cotaInfo.titular}</strong>). Esta pessoa fica como <strong>dependente</strong>.
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="papel">Papel na cota</Label>
                                <Select value={dados.papel} onValueChange={(valor) => atualizarCampo("papel", valor)}>
                                    <SelectTrigger id="papel" className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TITULAR">Titular</SelectItem>
                                        <SelectItem value="DEPENDENTE">Dependente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {!cotaComOutroTitular && dados.papel === "TITULAR" && (
                            <div className="col-span-2 grid gap-3 rounded-md border p-3">
                                <p className="text-sm font-medium">Benefícios da cota</p>

                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={dados.diretor}
                                        onChange={(e) => atualizarCampo("diretor", e.target.checked)} />
                                    É diretor (direito a 2 cortesias)
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={dados.temConviteEspecial}
                                        onChange={(e) => atualizarCampo("temConviteEspecial", e.target.checked)} />
                                    Possui convites
                                </label>

                                {dados.temConviteEspecial && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="qtdConviteEspecial">Quantidade de convites (1 a 5)</Label>
                                        <Input type="number" min="1" max="5" step="1"
                                            id="qtdConviteEspecial" name="qtdConviteEspecial"
                                            value={dados.qtdConviteEspecial}
                                            onChange={(e) => atualizarCampo("qtdConviteEspecial", Number(e.target.value))}
                                            className="w-40" />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
                <DialogClose>
                    <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
                </DialogClose>
                <Button type="submit">
                    {editando ? "Salvar alterações" : "Cadastrar pessoa"}
                </Button>
            </div>

        </form>
    );
}

export default FormularioCliente;
