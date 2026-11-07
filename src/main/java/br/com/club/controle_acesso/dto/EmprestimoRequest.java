package br.com.club.controle_acesso.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmprestimoRequest {

    @NotNull(message = "O objeto é obrigatório.")
    private Long objeto_id;

    @NotNull(message = "A pessoa é obrigatória.")
    private Long pessoa_id;

    @NotNull(message = "A quantidade é obrigatória.")
    @Min(value = 1, message = "A quantidade deve ser pelo menos 1.")
    private Integer quantidade;
}
