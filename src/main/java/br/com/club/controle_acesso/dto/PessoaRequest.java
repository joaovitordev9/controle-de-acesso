package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Categoria;
import br.com.club.controle_acesso.entity.Pessoa;
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

    public void preencherPessoa(Pessoa pessoa){
        pessoa.setNome(nome);
        pessoa.setCidade(cidade);
        pessoa.setTelefone(telefone);
        pessoa.setCpf(cpf);
    }

}
