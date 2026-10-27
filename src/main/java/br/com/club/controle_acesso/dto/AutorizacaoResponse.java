package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Autorizacao;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AutorizacaoResponse {

    private Long id;
    private Long cota_id;
    private String codigo_cota;
    private String titular;
    private String nomeAutorizado;
    private Long pessoa_id;
    private String situacao;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataConfirmacao;

    public static AutorizacaoResponse preencherAutorizacaoResponse(Autorizacao autorizacao) {
        AutorizacaoResponse response = new AutorizacaoResponse();

        response.setId(autorizacao.getId());
        response.setCota_id(autorizacao.getCotaId());
        response.setCodigo_cota(autorizacao.getCotaCodigo());
        response.setTitular(autorizacao.getTitularNome());
        response.setNomeAutorizado(autorizacao.getNomeAutorizado());
        response.setPessoa_id(autorizacao.getPessoaAutorizadaId());
        response.setSituacao(autorizacao.getSituacao() == null ? null : autorizacao.getSituacao().name());
        response.setDataCriacao(autorizacao.getDataCriacao());
        response.setDataConfirmacao(autorizacao.getDataConfirmacao());

        return response;
    }
}
