package br.com.club.controle_acesso.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// Empréstimo de vários objetos de uma vez para a mesma pessoa (ex.: bola + peteca).
@Getter
@Setter
public class EmprestimoLoteRequest {

    @NotNull(message = "A pessoa é obrigatória.")
    private Long pessoa_id;

    @NotEmpty(message = "Selecione pelo menos um objeto.")
    @Valid
    private List<Item> itens;

    @Getter
    @Setter
    public static class Item {
        @NotNull(message = "O objeto é obrigatório.")
        private Long objeto_id;

        @NotNull(message = "A quantidade é obrigatória.")
        @Min(value = 1, message = "A quantidade deve ser pelo menos 1.")
        private Integer quantidade;
    }
}
