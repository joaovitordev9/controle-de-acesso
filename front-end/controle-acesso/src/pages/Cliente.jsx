import { useEffect, useState } from "react";
import TabelaCliente from "../components/cliente/TabelaCliente";
import FormularioCliente from "../components/cliente/FormularioCliente";
import ModalConfirmarExclusao from "../components/cliente/ModalConfirmarExclusao";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Clientes = function Clientes() {

    const [clientes, setClientes] = useState([]);
    const [clienteExcluindo, setClienteExcluindo] = useState(null);
    const [formularioAberto, setFormularioAberto] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [busca, setBusca] = useState("");

    useEffect(() => {
        async function carregarClientes() {
            try {
                const resposta = await fetch("http://localhost:8080/pessoas");

                if (!resposta.ok) {
                    throw new Error(`Erro ao carregar pessoas: ${resposta.status}`);
                }

                const pessoas = await resposta.json();

                setClientes(
                    pessoas.map((pessoa) => ({
                        id: pessoa.id,
                        nome: pessoa.nome,
                        cpf: pessoa.cpf,
                        telefone: pessoa.telefone,
                        cidade: pessoa.cidade,
                        codigoDaCota: pessoa.codigo_cota ?? "",
                        categoria: pessoa.categoria,
                    }))
                );
            } catch (erro) {
                console.error("Erro ao carregar clientes:", erro);
            }
        }

        carregarClientes();
    }, []);

    const clientesFiltrados = clientes.filter(function (cliente) {
        const cpfBusca = busca.replace(/\D/g, "");
        const cpfCliente = cliente.cpf.replace(/\D/g, "");
        
        return (
            cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
            (cpfBusca !== "" && cpfCliente.includes(cpfBusca)) ||
            String(cliente.codigoDaCota ?? "").includes(busca)
        );
    });

    async function salvarCliente(dados) {
        const dadosParaEnviar = {
            nome: dados.nome,
            cidade: dados.cidade,
            telefone: dados.telefone,
            cpf: dados.cpf,
            codigo_cota: Number(dados.codigoDaCota),
            categoria_id: Number(dados.categoria),
        };

        try {
            const editando = clienteEditando !== null;
            const url = editando
                ? `http://localhost:8080/pessoas/${clienteEditando.id}`
                : "http://localhost:8080/pessoas";

            const resposta = await fetch(url, {
                method: editando ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dadosParaEnviar),
            });

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao ${editando ? "editar" : "cadastrar"} pessoa: ${resposta.status}`
                );
            }

            const pessoa = await resposta.json();

            const clienteAtualizado = {
                id: pessoa.id,
                nome: pessoa.nome,
                cpf: pessoa.cpf,
                telefone: pessoa.telefone,
                cidade: pessoa.cidade,
                codigoDaCota: pessoa.codigo_cota,
                categoria: pessoa.categoria,
            };

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
            console.error("Erro ao salvar cliente:", erro);
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
        try {
            const resposta = await fetch(
                `http://localhost:8080/pessoas/${cliente.id}`,
                { method: "DELETE" }
            );

            if (!resposta.ok) {
                throw new Error(`Erro ao excluir pessoa: ${resposta.status}`);
            }

            setClientes((listaAtual) =>
                listaAtual.filter((item) => item.id !== cliente.id)
            );

            setClienteExcluindo(null);
        } catch (erro) {
            console.error("Erro ao excluir cliente:", erro);
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

            {/* {formularioAberto && (
                <FormularioCliente
                    cliente={clienteEditando}
                    onSalvar={salvarCliente}
                    onCancelar={cancelarCadastro}
                />
            )} */}

            <TabelaCliente
                clientes={clientesFiltrados}
                onEditar={editarCliente}
                onExcluir={iniciarExclusao}
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