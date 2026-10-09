import "./TabelaCliente.css"

function TabelaClientes({clientes, onEditar, onExcluir}) {

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
                    <tr key={cliente.id} className="linha-cliente">
                        <td className="coluna-nome">{cliente.nome}</td>
                        <td className="coluna-cpf">{cliente.cpf}</td>
                        <td className="coluna-telefone">{cliente.telefone}</td>
                        <td className="coluna-email">{cliente.email}</td>
                        <td className="coluna-cota">{cliente.codigoDaCota}</td>
                        <td className="coluna-categoria">{cliente.categoria}</td>
                        
                        <td className="coluna-acoes">
                            <button onClick={() => onEditar(cliente)}>
                                Editar
                            </button>

                            <button onClick={() => onExcluir(cliente)}>
                                Excluir
                            </button>

                            <button onClick={() => registrarEntrada(cliente)}>
                                Registrar Entrada
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );


}

export default TabelaClientes;
