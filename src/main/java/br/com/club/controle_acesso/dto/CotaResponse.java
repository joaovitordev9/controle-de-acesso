package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Cota;
import br.com.club.controle_acesso.entity.Socio;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CotaResponse {

    private Long id;
    private String codigo;
    private Long titular_id;
    private String titular;
    private boolean diretor;

    private int cortesias_total;
    private long cortesias_utilizadas;
    private long cortesias_disponiveis;

    private int convites_especiais_total;
    private long convites_especiais_utilizados;
    private long convites_especiais_disponiveis;

    private List<SocioResponse> socios;

    public static CotaResponse preencherCotaResponse(Cota cota, long cortesiasUsadas, long convitesUsados) {
        CotaResponse response = new CotaResponse();

        response.setId(cota.getId());
        response.setCodigo(cota.getCodigo());

        Socio titular = cota.getTitular();
        response.setTitular_id(titular == null ? null : titular.getId());
        response.setTitular(cota.getTitularNome());
        response.setDiretor(titular != null && titular.isDiretor());

        response.setCortesias_total(cota.getQtd_cortesias());
        response.setCortesias_utilizadas(cortesiasUsadas);
        response.setCortesias_disponiveis(cota.getQtd_cortesias() - cortesiasUsadas);

        response.setConvites_especiais_total(cota.getQtd_convites_especiais());
        response.setConvites_especiais_utilizados(convitesUsados);
        response.setConvites_especiais_disponiveis(cota.getQtd_convites_especiais() - convitesUsados);

        response.setSocios(cota.getSocios().stream()
                .map(SocioResponse::preencherSocioResponse)
                .toList());

        return response;
    }
}
