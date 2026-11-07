package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.enums.TipoAutorizacao;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

// Entrada registrada direto na portaria, sem autorização prévia:
// escolhe-se a pessoa, a cota do sócio e o tipo de benefício.
@Getter
@Setter
public class EntradaDiretaRequest {

    @NotNull(message = "Informe a pessoa que está entrando.")
    private Long pessoa_id;

    @NotNull(message = "Informe a cota do sócio.")
    private Long cota_id;

    @NotNull(message = "Escolha o tipo (convite ou cortesia).")
    private TipoAutorizacao tipo;

    // Opcional: dia em que a pessoa sai (ocupa o convite até o fim desse dia).
    // Se não informado, usa o término automático (hora de renovação).
    private LocalDate data_saida;
}
