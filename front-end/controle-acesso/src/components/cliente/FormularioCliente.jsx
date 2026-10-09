
import { useState } from "react";
import "./FormularioCliente.css";

function FormularioCliente({ cliente, onSalvar, onCancelar }) {

    const [dados, setDados] = useState({
        nome: cliente ? cliente.nome || "" : "",
        cpf: cliente ? cliente.cpf || "" : "",
        telefone: cliente ? cliente.telefone || "" : "",
        email: cliente ? cliente.email || "" : "",
        codigoDaCota: cliente ? cliente.codigoDaCota || "" : "",
        categoria: cliente ? cliente.categoria || "Sócio" : "Sócio"
    });

    function atualizarCampo(evento) {
        const nomeCampo = evento.target.name;
        const valorCampo = evento.target.value;

        setDados({
            ...dados,
            [nomeCampo]: valorCampo
        });
    }

    function enviarFormulario(evento) {
        evento.preventDefault();
        console.log(dados);

        if (onSalvar) {
            onSalvar(dados);
        }
    }

    return (
        <div className="modal-fundo" onClick={onCancelar}>
            <div
                className="modal-conteudo"
                onClick={(evento) => evento.stopPropagation()}>

                <form className="formulario-cliente" onSubmit={enviarFormulario}>

                    <div className="formulario-cabecalho">
                        <h2>
                            {cliente ? "Editar cliente" : "Cadastrar cliente"}
                        </h2>

                        <p>
                            Preencha os dados para manter o cadastro atualizado.
                        </p>
                    </div>

                    <div className="campos-formulario">

                        <div className="campo-formulario campo-largo">
                            <label htmlFor="nome">Nome completo</label>

                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={dados.nome}
                                onChange={atualizarCampo}
                                placeholder="Ex.: João Silva"
                                required
                            />
                        </div>

                        <div className="campo-formulario">
                            <label htmlFor="cpf">CPF</label>

                            <input
                                type="text"
                                id="cpf"
                                name="cpf"
                                value={dados.cpf}
                                onChange={atualizarCampo}
                                placeholder="000.000.000-00"
                                required
                            />
                        </div>

                        <div className="campo-formulario">
                            <label htmlFor="telefone">Telefone</label>

                            <input
                                type="tel"
                                id="telefone"
                                name="telefone"
                                value={dados.telefone}
                                onChange={atualizarCampo}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="campo-formulario campo-largo">
                            <label htmlFor="cidade">Cidade</label>

                            <input
                                type="text"
                                id="cidade"
                                name="cidade"
                                value={dados.cidade}
                                onChange={atualizarCampo}
                                placeholder="Digite a cidade"
                            />
                        </div>


                        <div className="campo-formulario">
                            <label htmlFor="codigoDaCota">Código da cota</label>

                            <input
                                type="text"
                                id="codigoDaCota"
                                name="codigoDaCota"
                                value={dados.codigoDaCota}
                                onChange={atualizarCampo}
                                placeholder="Ex.: A15"
                            />
                        </div>

                        <div className="campo-formulario">
                            <label htmlFor="categoria">Categoria</label>

                            <select
                                id="categoria"
                                name="categoria"
                                value={dados.categoria}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="Sócio">Sócio</option>
                                <option value="Dependente">Dependente</option>
                                <option value="Visitante">Visitante</option>
                            </select>
                        </div>

                    </div>

                    <div className="acoes-formulario">
                        <button
                            type="button"
                            className="botao-cancelar"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="botao-salvar"
                        >
                            {cliente ? "Salvar alterações" : "Cadastrar pessoa"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormularioCliente;