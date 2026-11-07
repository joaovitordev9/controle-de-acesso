package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.ListaNegra;
import br.com.club.controle_acesso.entity.Pessoa;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ListaNegraResponse {

    private Long id;
    private String cpf;
    private String nome;
    private String motivo;
    private LocalDateTime data_bloqueio;
    // Pessoa cadastrada com este CPF (null = CPF avulso, ainda sem cadastro).
    private Long pessoa_id;

    public static ListaNegraResponse preencher(ListaNegra registro, Pessoa pessoa) {
        ListaNegraResponse response = new ListaNegraResponse();
        response.setId(registro.getId());
        response.setCpf(registro.getCpf());
        // Se a pessoa já está cadastrada, mostra o nome do cadastro.
        response.setNome(pessoa != null ? pessoa.getNome() : registro.getNome());
        response.setMotivo(registro.getMotivo());
        response.setData_bloqueio(registro.getDataBloqueio());
        response.setPessoa_id(pessoa == null ? null : pessoa.getId());
        return response;
    }
}
