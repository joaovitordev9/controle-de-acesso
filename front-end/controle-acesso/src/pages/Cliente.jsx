import { useEffect, useState } from "react";
import TabelaCliente from "../components/cliente/TabelaCliente";
import FormularioCliente from "../components/cliente/FormularioCliente";
import ModalConfirmarExclusao from "../components/cliente/ModalConfirmarExclusao";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPut, apiDelete } from "../services/api";

// Remove acentos e caixa para que a busca encontre "Joao" em "João".
const norm = (texto) =>
    (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const Clientes = function Clientes() {

    const [clientes, setClientes] = useState([]);
    const [clienteExcluindo, setClienteExcluindo] = useState(null);
    const [formularioAberto, setFormularioAberto] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [busca, setBusca] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");

    function mapearCliente(pessoa) {
        return {
            id: pessoa.id,
            nome: pessoa.nome,
            cpf: pessoa.cpf,
            telefone: pessoa.telefone,
            cidade: pessoa.cidade,
            codigoDaCota: pessoa.codigo_cota ?? "",
            categoria: pessoa.categoria,
        };
    }

    useEffect(() => {
        async function carregarClientes() {
            try {
                const pessoas = await apiGet("/pessoas");
                setClientes(pessoas.map(mapearCliente));
            } catch (erro) {
                setMensagemErro(erro.message);
            }
        }

        carregarClientes();
    }, []);

    const clientesFiltrados = clientes.filter(function (cliente) {
        const termo = norm(busca);
        const cpfBusca = busca.replace(/\D/g, "");
        const cpfCliente = (cliente.cpf ?? "").replace(/\D/g, "");

        return (
            norm(cliente.nome).includes(termo) ||
            (cpfBusca !== "" && cpfCliente.includes(cpfBusca)) ||
            String(cliente.codigoDaCota ?? "").includes(busca)
        );
    });

    async function salvarCliente(dados) {
        setMensagemErro("");

        const ehSocio = dados.categoria === "SOCIO";
        const editando = clienteEditando !== null;

        const corpoPessoa = {
            nome: dados.nome,
            cidade: dados.cidade,
            telefone: dados.telefone,
            cpf: dados.cpf,
            codigo_cota: dados.codigoDaCota ? String(dados.codigoDaCota) : null,
            categoria: dados.categoria,
        };

        const corpo = ehSocio
            ? {
                  ...corpoPessoa,
                  categoria: "SOCIO",
                  papel: dados.papel || "TITULAR",
                  diretor: Boolean(dados.diretor),
                  tem_convite_especial: Boolean(dados.temConviteEspecial),
                  qtd_convite_especial: Number(dados.qtdConviteEspecial) || 0,
              }
            : corpoPessoa;

        const recurso = ehSocio ? "socios" : "pessoas";

        try {
            const pessoa = editando
                ? await apiPut(`/${recurso}/${clienteEditando.id}`, corpo)
                : await apiPost(`/${recurso}`, corpo);

            const clienteAtualizado = mapearCliente(pessoa);

            if (editando) {
                setClientes((listaAtual) =>
                    listaAtual.map((cliente) =>
                        cliente.id === pessoa.id ? clienteAtualizado : cliente
                    )
                );
            } else {
                setClientes((listaAtual) => [...listaAtual, clienteAtualizado]);
            }

            setFormularioAberto(false);
            setClienteEditando(null);
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    function editarCliente(cliente) {
        setClienteEditando(cliente);
        setFormularioAberto(true);
    }

    function iniciarExclusao(cliente) {
        setClienteExcluindo(cliente);
    }

    function cancelarExclusao() {
        setClienteExcluindo(null);
    }

    async function confirmarExclusao(cliente) {
        setMensagemErro("");
        try {
            await apiDelete(`/pessoas/${cliente.id}`);

            setClientes((listaAtual) =>
                listaAtual.filter((item) => item.id !== cliente.id)
            );

            setClienteExcluindo(null);
        } catch (erro) {
            setMensagemErro(erro.message);
        }
    }

    function cancelarCadastro() {
        setFormularioAberto(false);
        setClienteEditando(null);
    }

    return (
        <main className="min-w-0 flex-1 p-8">
            <Dialog open={formularioAberto} onOpenChange={setFormularioAberto}>
                <DialogContent className="sm:max-w-2xl">
                    <FormularioCliente
                        cliente={clienteEditando}
                        onSalvar={salvarCliente}
                        onCancelar={cancelarCadastro}
                    />
                </DialogContent>
            </Dialog>

            <h1 className="mb-6 text-2xl font-semibold">
                Clientes
            </h1>

            {mensagemErro && (
                <p className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {mensagemErro}
                </p>
            )}

            <div className="flex items-center gap-4 border-b pb-4">
                <Input
                    className="h-10 w-110"
                    type="text"
                    placeholder="Buscar por nome, CPF ou código da cota..."
                    value={busca}
                    onChange={function (evento) {
                        setBusca(evento.target.value);
                    }}
                />

                <Button
                    className="h-10 whitespace-nowrap"
                    onClick={function () {
                        setClienteEditando(null);
                        setFormularioAberto(true);
                    }}
                >
                    + Cadastrar cliente
                </Button>
            </div>

            <TabelaCliente
                clientes={clientesFiltrados}
                onEditar={editarCliente}
                onExcluir={iniciarExclusao}
                onErro={setMensagemErro}
            />

            <ModalConfirmarExclusao
                cliente={clienteExcluindo}
                onConfirmar={confirmarExclusao}
                onCancelar={cancelarExclusao}
            />
        </main>

    )
}

export default Clientes
