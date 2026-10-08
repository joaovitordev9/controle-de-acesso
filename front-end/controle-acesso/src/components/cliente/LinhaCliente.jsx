function LinhaCliente({ cliente, onEditar, onExcluir, onRegistrarEntrada}) {

    return (
        <tr className="linha-cliente">
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

                <button onClick={() => onExcluir(cliente.id)}>
                    Excluir
                </button>

                <button onClick={() => onRegistrarEntrada(cliente)}>
                    Registrar Entrada
                </button>
            </td>
        </tr>
    );

}

export default LinhaCliente;