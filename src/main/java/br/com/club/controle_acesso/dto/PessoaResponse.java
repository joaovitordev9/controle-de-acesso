package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Pessoa;
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
    private String codigo_cota;
    // Nome do enum (ex.: "SOCIO") para o front preencher o select; o rótulo é resolvido no front.
    private String categoria;

    public static PessoaResponse PreencherPessoaResponse(Pessoa pessoa){

        PessoaResponse response = new PessoaResponse();

        response.setId(pessoa.getId());
        response.setNome(pessoa.getNome());
        response.setCidade(pessoa.getCidade());
        response.setTelefone(pessoa.getTelefone());
        response.setCpf(pessoa.getCpf());
        response.setCategoria(pessoa.getCategoria() == null ? null : pessoa.getCategoria().name());
        response.setCodigo_cota(pessoa.getCodigo_cota());

        return response;
    }
}
