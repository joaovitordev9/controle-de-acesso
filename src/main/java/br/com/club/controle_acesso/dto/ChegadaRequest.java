package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.enums.TipoAutorizacao;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Confirmação da entrada: a pessoa que chegou e o tipo de benefício escolhido pelo funcionário.
@Getter
@Setter
public class ChegadaRequest {

    @NotNull(message = "Informe a pessoa que está chegando.")
    private Long pessoa_id;

    @NotNull(message = "Escolha o tipo (convite ou cortesia).")
    private TipoAutorizacao tipo;
}
