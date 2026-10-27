package br.com.club.controle_acesso.entity;

import br.com.club.controle_acesso.enums.TipoAutorizacao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Setter
@Getter
@Entity
public class Entrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pessoa_id")
    private Pessoa pessoa;


    private LocalDateTime data_entrada;

    // Quando a entrada vem de um convite: guardamos titular, cota, tipo e o término
    // previsto da ocupação (a utilização ocupa o convite até essa data/hora).
    @ManyToOne
    @JoinColumn(name = "titular_id")
    private Socio titular;

    @ManyToOne
    @JoinColumn(name = "cota_id")
    private Cota cota;

    @Enumerated(EnumType.STRING)
    private TipoAutorizacao tipo_convite;

    private LocalDateTime termino_previsto;

    public String getEntradaNome(){
        return pessoa.getNome();
    }

    public Long getEntradaId(){
        return pessoa.getId();
    }
    public String getCategoria(){
        return pessoa.getCategoriaNome();
    }

    public String getTitularNome(){
        return titular == null ? null : titular.getNome();
    }







}
