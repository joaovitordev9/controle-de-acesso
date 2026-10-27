package br.com.club.controle_acesso.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CotaRequest {

    // Diretor => cota passa a ter 2 cortesias; senão 0.
    private boolean diretor;

    // Convite especial: 0 a 5.
    private int qtd_convite_especial;
}
