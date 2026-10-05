package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Entrada;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EntradaResponse {

    private Long id;
    private Long id_pessoa;
    private String nome;
    private String categoria;
    private LocalDateTime data_entrada;

    public static EntradaResponse PreencherEntrada(Entrada entrada){

        EntradaResponse entradaResponse = new EntradaResponse();

        entradaResponse.setId_pessoa(entrada.getEntradaId());
        entradaResponse.setNome(entrada.getEntradaNome());
        entradaResponse.setCategoria(entrada.getCategoria());

        return entradaResponse;
    }
}
