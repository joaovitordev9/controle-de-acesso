package br.com.club.controle_acesso.dto;


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
}
