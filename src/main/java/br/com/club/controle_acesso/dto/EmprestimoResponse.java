package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Emprestimo;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EmprestimoResponse {

    private Long id;
    private Long objeto_id;
    private String objeto_nome;
    private Long pessoa_id;
    private String pessoa_nome;
    private Integer quantidade;
    private LocalDateTime data_emprestimo;
    private LocalDateTime data_devolucao;
    private String status; // EMPRESTADO enquanto em aberto; DEVOLVIDO após a devolução.

    public static EmprestimoResponse preencher(Emprestimo emprestimo) {
        EmprestimoResponse response = new EmprestimoResponse();

        response.setId(emprestimo.getId());

        if (emprestimo.getObjeto() != null) {
            response.setObjeto_id(emprestimo.getObjeto().getId());
            response.setObjeto_nome(emprestimo.getObjetoNome());
        }
        if (emprestimo.getPessoa() != null) {
            response.setPessoa_id(emprestimo.getPessoa().getId());
            response.setPessoa_nome(emprestimo.getPessoaNome());
        }

        response.setQuantidade(emprestimo.getQuantidade());
        response.setData_emprestimo(emprestimo.getDataEmprestimo());
        response.setData_devolucao(emprestimo.getDataDevolucao());
        response.setStatus(emprestimo.getDataDevolucao() == null ? "EMPRESTADO" : "DEVOLVIDO");

        return response;
    }
}
