package br.com.club.controle_acesso.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Criar autorização = apenas o aviso (nome + sócio titular). Não escolhe tipo nem consome convite.
@Getter
@Setter
public class AutorizacaoRequest {

    @NotNull(message = "Selecione o sócio titular.")
    private Long cota_id;

    @NotBlank(message = "Informe o nome da pessoa autorizada.")
    private String nomeAutorizado;

    // Opcional: vincular a uma pessoa já cadastrada.
    private Long pessoa_id;
}
