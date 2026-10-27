package br.com.club.controle_acesso.entity;

import br.com.club.controle_acesso.enums.SituacaoAutorizacao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Aviso de que o sócio liberou alguém para entrar. NÃO ocupa convite enquanto pendente.
@Entity
@Getter
@Setter
public class Autorizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cota_id")
    private Cota cota;

    // Pessoa autorizada: pode já estar cadastrada (pessoaAutorizada) ou ser apenas o nome.
    @ManyToOne
    @JoinColumn(name = "pessoa_autorizada_id")
    private Pessoa pessoaAutorizada;

    private String nomeAutorizado;

    @Enumerated(EnumType.STRING)
    private SituacaoAutorizacao situacao;

    private LocalDateTime dataCriacao;

    private LocalDateTime dataConfirmacao;

    @Version
    private Long version;

    public String getCotaCodigo() {
        return cota == null ? null : cota.getCodigo();
    }

    public Long getCotaId() {
        return cota == null ? null : cota.getId();
    }

    public String getTitularNome() {
        return cota == null ? null : cota.getTitularNome();
    }

    public String getNomeAutorizado() {
        if (pessoaAutorizada != null) {
            return pessoaAutorizada.getNome();
        }
        return nomeAutorizado;
    }

    public Long getPessoaAutorizadaId() {
        return pessoaAutorizada == null ? null : pessoaAutorizada.getId();
    }
}
