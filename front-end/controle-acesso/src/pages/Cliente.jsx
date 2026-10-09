import { useState } from "react";
import TabelaCliente from "../components/cliente/TabelaCliente";
import FormularioCliente from "../components/cliente/FormularioCliente";
import ModalConfirmarExclusao from "../components/cliente/ModalConfirmarExclusao";

const Clientes = function Clientes() {
        
    const clientesIniciais = [
        {
            id: 1,
            nome: "Carlos Eduardo Martins",
            cpf: "123.456.789-09",
            telefone: "(37) 99123-4567",
            email: "carlos.martins@email.com",
            codigoDaCota: "A15",
            categoria: "Sócio"
        },
        {
            id: 2,
            nome: "Mariana Oliveira Santos",
            cpf: "987.654.321-00",
            telefone: "(37) 99234-5678",
            email: "mariana.santos@email.com",
            codigoDaCota: "B08",
            categoria: "Dependente"
        },
        {
            id: 3,
            nome: "Rafael Henrique Costa",
            cpf: "456.789.123-09",
            telefone: "(37) 99345-6789",
            email: "rafael.costa@email.com",
            codigoDaCota: "C22",
            categoria: "Visitante"
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
        <>
            {!formularioAberto && (
                <button onClick={function () {
                    setFormularioAberto(true);
                }}>
                    Cadastrar cliente
                </button>
            )}
            {formularioAberto && (
                <FormularioCliente
                    cliente={clienteEditando}
                    onSalvar={salvarCliente}
                    onCancelar={cancelarCadastro}
                />
            )}
            <div>
                <input
                    type="text"
                    placeholder="Buscar por cliente"
                    value={busca}
                    onChange={function (evento) {
                        setBusca(evento.target.value);
                    }}
                />
            </div>
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
        </>
    
    )
}

export default Clientes