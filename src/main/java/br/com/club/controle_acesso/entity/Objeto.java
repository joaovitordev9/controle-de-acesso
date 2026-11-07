package br.com.club.controle_acesso.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// Objeto emprestável do clube (bola, peteca, raquete, etc.). Nome livre + estoque.
@Entity
@Getter
@Setter
public class Objeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    // Quantidade total em estoque; o disponível é calculado descontando o que está emprestado.
    private Integer quantidadeTotal;
}
