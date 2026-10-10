import { useState } from "react";
import TabelaCliente from "../components/cliente/TabelaCliente";
import FormularioCliente from "../components/cliente/FormularioCliente";
import ModalConfirmarExclusao from "../components/cliente/ModalConfirmarExclusao";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Clientes = function Clientes() {
        
    const clientesIniciais = [
        {
            id: 1,
            nome: "Carlos Eduardo Martins",
            cpf: "123.456.789-09",
            telefone: "(37) 99123-4567",
            cidade: "Formiga",
            codigoDaCota: "A15",
            categoria: "Sócio"
        }
    ];
    const [clientes, setClientes] = useState( clientesIniciais);
    const [clienteExcluindo, setClienteExcluindo] = useState(null);
    const [formularioAberto, setFormularioAberto] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [busca, setBusca] = useState("");

    const clientesFiltrados = clientes.filter(function (cliente) {
        const cpfBusca = busca.replace(/\D/g, "");
        const cpfCliente = cliente.cpf.replace(/\D/g, "");
        
        return (
            cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
            (cpfBusca !== "" && cpfCliente.includes(cpfBusca)) ||
            cliente.codigoDaCota.includes(busca)
        );
    });


    function salvarCliente(dados) {
        if (clienteEditando === null) {
            // Cadastro de um novo cliente
            const novoCliente = {
                ...dados,
                id: Date.now()
            };

            setClientes(function (listaAtual) {
                return [...listaAtual, novoCliente];
            });

            console.log("Cliente cadastrado:", novoCliente);

        } else {
            // Edição de um cliente existente
            setClientes(function (listaAtual) {
                return listaAtual.map(function (cliente) {
                    if (cliente.id === clienteEditando.id) {
                        return {
                            ...cliente,
                            ...dados
                        };
                    }

                    return cliente;
                });
            });

            console.log("Cliente editado:", dados);
        }

        setFormularioAberto(false);
        setClienteEditando(null);
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

    function confirmarExclusao(cliente) {
        setClientes(function (listaAtual) {
            return listaAtual.filter(function (item) {
                return item.id !== cliente.id;
            });
        });

        setClienteExcluindo(null);
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