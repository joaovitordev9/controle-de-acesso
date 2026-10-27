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
    private String categoria_valor;
    private LocalDateTime data_entrada;
    private String titular;
    private String tipo_convite;

    public static EntradaResponse PreencherEntrada(Entrada entrada){

        EntradaResponse entradaResponse = new EntradaResponse();

        entradaResponse.setId(entrada.getId());
        entradaResponse.setData_entrada(entrada.getData_entrada());
        entradaResponse.setId_pessoa(entrada.getEntradaId());
        entradaResponse.setNome(entrada.getEntradaNome());
        entradaResponse.setCategoria(entrada.getCategoria());
        entradaResponse.setCategoria_valor(
                entrada.getPessoa().getCategoria() == null ? null : entrada.getPessoa().getCategoria().name());
        entradaResponse.setTitular(entrada.getTitularNome());
        entradaResponse.setTipo_convite(entrada.getTipo_convite() == null ? null : entrada.getTipo_convite().getDescricao());

        return entradaResponse;
    }
}
