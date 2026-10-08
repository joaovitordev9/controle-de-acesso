import LinhaCliente from "./LinhaCliente";

function TabelaClientes() {

    const clientes = [
        {
            id: 1,
            nome: "João Silva",
            cpf: "123.456.789-00",
            telefone: "(37) 99999-9999",
            email: "joao@gmail.com",
            codigoDaCota: "A15",
            categoria: "Sócio"
        },
        {
            id: 2,
            nome: "Maria Souza",
            cpf: "987.654.321-00",
            telefone: "(37) 98888-8888",
            email: "maria@gmail.com",
            codigoDaCota: "B08",
            categoria: "Visitante"
        }
    ];

    const editarCliente = (cliente) => {
        console.log("Editar:", cliente);
    };

    const excluirCliente = (id) => {
        console.log("Excluir:", id);
    };

    const registrarEntrada = (cliente) => {
        console.log("Registrar entrada:", cliente);
    };

    return (
        <table className="tabela-clientes">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Código da Cota</th>
                    <th>Categoria</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                {clientes.map(cliente => (
                    <LinhaCliente
                        key={cliente.id}
                        cliente={cliente}
                        onEditar={editarCliente}
                        onExcluir={excluirCliente}
                        onRegistrarEntrada={registrarEntrada}
                    />
                ))}
            </tbody>
        </table>
    );


}

export default TabelaClientes;
