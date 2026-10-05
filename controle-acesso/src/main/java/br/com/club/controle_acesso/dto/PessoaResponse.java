package br.com.club.controle_acesso.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PessoaResponse {

    private Long id;
    private String nome;
    private String cidade;
    private String telefone;
    private String cpf;
    private String categoria;
}
