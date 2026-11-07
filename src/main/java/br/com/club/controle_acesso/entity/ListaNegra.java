package br.com.club.controle_acesso.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Pessoa bloqueada de entrar por convite/cortesia. A chave é o CPF (só dígitos),
// então vale tanto para quem já está cadastrado quanto para um CPF avulso.
@Entity
@Table(name = "lista_negra")
@Getter
@Setter
public class ListaNegra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String cpf;

    private String nome;

    @Column(length = 1000)
    private String motivo;

    private LocalDateTime dataBloqueio;
}
