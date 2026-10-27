package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.enums.Categoria;
import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class PessoaRequest {

    private String nome;
    private String cidade;
    private String telefone;
    private String cpf;
    private String codigo_cota;
    private Categoria categoria;

    public void preencherPessoa(Pessoa pessoa){
        pessoa.setNome(nome);
        pessoa.setCidade(cidade);
        pessoa.setTelefone(telefone);
        pessoa.setCpf(cpf);
        pessoa.setCodigo_cota(codigo_cota);
        pessoa.setCategoria(categoria);
    }

}
