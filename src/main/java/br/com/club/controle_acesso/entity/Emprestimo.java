package br.com.club.controle_acesso.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Empréstimo de unidades de um objeto para uma pessoa cadastrada.
// Enquanto dataDevolucao é null, o empréstimo está em aberto (ainda emprestado).
@Entity
@Getter
@Setter
@Table(indexes = {
        // Acelera a soma de unidades emprestadas por objeto (estoque disponível).
        @Index(name = "idx_emprestimo_objeto_devolucao", columnList = "objeto_id, data_devolucao"),
        // Acelera a contagem de empréstimos em aberto por pessoa.
        @Index(name = "idx_emprestimo_pessoa_devolucao", columnList = "pessoa_id, data_devolucao")
})
public class Emprestimo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "objeto_id")
    private Objeto objeto;

    @ManyToOne
    @JoinColumn(name = "pessoa_id")
    private Pessoa pessoa;

    private Integer quantidade;

    private LocalDateTime dataEmprestimo;

    private LocalDateTime dataDevolucao;

    public String getObjetoNome() {
        return objeto == null ? null : objeto.getNome();
    }

    public String getPessoaNome() {
        return pessoa == null ? null : pessoa.getNome();
    }
}
