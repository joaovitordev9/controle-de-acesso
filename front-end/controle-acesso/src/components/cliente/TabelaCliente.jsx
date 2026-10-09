import "./TabelaCliente.css"

function TabelaClientes({clientes, onEditar, onExcluir}) {

    const registrarEntrada = (cliente) => {
        console.log("Registrar entrada:", cliente);
    };

    return (
        <div className="tabela-container">
            <table className="tabela-clientes">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Cidade</th>
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
                            <td className="coluna-cidade">{cliente.cidade}</td>
                            <td className="coluna-cota">{cliente.codigoDaCota}</td>
                            <td className="coluna-categoria">{cliente.categoria}</td>


                            <td className="coluna-acoes">
                                <div className="acoes-cliente">
                                    <button
                                        className="botao-acao botao-editar"
                                        onClick={() => onEditar(cliente)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="botao-acao botao-excluir"
                                        onClick={() => onExcluir(cliente)}
                                    >
                                        Excluir
                                    </button>

                                    <button
                                        className="botao-acao botao-entrada"
                                        onClick={() => registrarEntrada(cliente)}
                                    >
                                        Registrar entrada
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );


}

export default TabelaClientes;
