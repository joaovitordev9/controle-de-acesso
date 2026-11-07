package br.com.club.controle_acesso.dto;

import lombok.Getter;
import lombok.Setter;

// Bloqueio de uma pessoa cadastrada (pessoa_id) ou de um CPF avulso (cpf + nome).
@Getter
@Setter
public class ListaNegraRequest {

    private Long pessoa_id;
    private String cpf;
    private String nome;
    private String motivo;
}
