package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.ListaNegra;
import br.com.club.controle_acesso.entity.Socio;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SocioResponse {

    private Long id;
    private String nome;
    private String cidade;
    private String telefone;
    private String cpf;
    private String codigo_cota;
    private String categoria;
    private String papel;
    private boolean diretor;
    private Long cota_id;
    private boolean bloqueado;
    private String motivo_bloqueio;
    private Long lista_negra_id;

    public static SocioResponse preencherSocioResponse(Socio socio, ListaNegra bloqueio) {
        SocioResponse response = preencherSocioResponse(socio);
        if (bloqueio != null) {
            response.setBloqueado(true);
            response.setMotivo_bloqueio(bloqueio.getMotivo());
            response.setLista_negra_id(bloqueio.getId());
        }
        return response;
    }

    public static SocioResponse preencherSocioResponse(Socio socio) {
        SocioResponse response = new SocioResponse();

        response.setId(socio.getId());
        response.setNome(socio.getNome());
        response.setCidade(socio.getCidade());
        response.setTelefone(socio.getTelefone());
        response.setCpf(socio.getCpf());
        response.setCodigo_cota(socio.getCodigo_cota());
        response.setCategoria(socio.getCategoria() == null ? null : socio.getCategoria().name());
        response.setPapel(socio.getPapel() == null ? null : socio.getPapel().name());
        response.setDiretor(socio.isDiretor());
        response.setCota_id(socio.getCota() == null ? null : socio.getCota().getId());

        return response;
    }
}
