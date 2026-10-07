package br.com.club.controle_acesso.entity;

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

    public String getEntradaNome(){
        return pessoa.getNome();
    }

    public Long getEntradaId(){
        return pessoa.getId();
    }
    public String getCategoria(){
        return pessoa.getCategoriaNome();
    }




}
