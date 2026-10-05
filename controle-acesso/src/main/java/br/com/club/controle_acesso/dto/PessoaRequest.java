package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Categoria;
import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class PessoaRequest {

    private String nome;
    private String cidade;
    private String telefone;
    private String cpf;
    private Long categoria_id;

}
