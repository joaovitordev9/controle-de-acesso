package br.com.club.controle_acesso.dto;

import lombok.Getter;
import lombok.Setter;

// Resumo do que está vinculado a uma pessoa, para confirmar a exclusão no front.
@Getter
@Setter
public class PessoaVinculosResponse {

    private long entradas;
    private long autorizacoes;
    private long emprestimos;
    private long emprestimos_em_aberto;
    private long total;

    public PessoaVinculosResponse(long entradas, long autorizacoes, long emprestimos, long emprestimos_em_aberto) {
        this.entradas = entradas;
        this.autorizacoes = autorizacoes;
        this.emprestimos = emprestimos;
        this.emprestimos_em_aberto = emprestimos_em_aberto;
        this.total = entradas + autorizacoes + emprestimos;
    }
}
