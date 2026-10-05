package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Entrada;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EntradaRequest {
    private Long pessoa_id;
}
