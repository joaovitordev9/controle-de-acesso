package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Entrada;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Uma utilização de convite/cortesia que ainda está ativa (ocupando a vaga).
@Getter
@Setter
public class ConviteEmUsoResponse {

    private Long id;
    private Long pessoa_id;
    private String pessoa;
    private String titular;
    private Long cota_id;
    private String codigo_cota;
    private String tipo;          // valor do enum (ex.: CONVITE_ESPECIAL)
    private String tipo_rotulo;   // descrição amigável (ex.: Convite especial)
    private LocalDateTime data_entrada;
    private LocalDateTime termino_previsto;

    public static ConviteEmUsoResponse preencher(Entrada entrada) {
        ConviteEmUsoResponse response = new ConviteEmUsoResponse();

        response.setId(entrada.getId());
        response.setPessoa_id(entrada.getEntradaId());
        response.setPessoa(entrada.getEntradaNome());
        response.setTitular(entrada.getTitularNome());

        if (entrada.getCota() != null) {
            response.setCota_id(entrada.getCota().getId());
            response.setCodigo_cota(entrada.getCota().getCodigo());
        }

        if (entrada.getTipo_convite() != null) {
            response.setTipo(entrada.getTipo_convite().name());
            response.setTipo_rotulo(entrada.getTipo_convite().getDescricao());
        }

        response.setData_entrada(entrada.getData_entrada());
        response.setTermino_previsto(entrada.getTermino_previsto());

        return response;
    }
}
