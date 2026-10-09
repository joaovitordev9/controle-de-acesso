import "./ModalConfirmarExclusao.css";

function ModalConfirmarExclusao({ cliente, onConfirmar, onCancelar }) {
    if (!cliente) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-excluir-cliente">

                <div className="modal-icone-excluir">
                    <span>!</span>
                </div>

                <h2>Excluir cliente?</h2>

                <p className="modal-mensagem">
                    Tem certeza de que deseja excluir este cliente?
                </p>

                <div className="modal-cliente-info">
                    <strong>{cliente.nome}</strong>
                    <span>CPF: {cliente.cpf}</span>
                    <span>Código da cota: {cliente.codigoDaCota}</span>
                </div>

                <p className="modal-aviso">
                    Essa ação não poderá ser desfeita.
                </p>

                <div className="modal-acoes">
                    <button
                        type="button"
                        className="botao-cancelar"
                        onClick={onCancelar}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="botao-excluir"
                        onClick={function () {
                            onConfirmar(cliente);
                        }}
                    >
                        Excluir cliente
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ModalConfirmarExclusao;