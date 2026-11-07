package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Objeto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ObjetoRequest {

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    @NotNull(message = "A quantidade é obrigatória.")
    @Min(value = 0, message = "A quantidade não pode ser negativa.")
    private Integer quantidade_total;

    public void preencherObjeto(Objeto objeto) {
        objeto.setNome(nome);
        objeto.setQuantidadeTotal(quantidade_total);
    }
}
