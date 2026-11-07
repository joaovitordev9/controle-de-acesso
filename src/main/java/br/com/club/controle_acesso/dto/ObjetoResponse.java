package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Objeto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ObjetoResponse {

    private Long id;
    private String nome;
    private Integer quantidade_total;
    private Integer quantidade_emprestada;
    private Integer quantidade_disponivel;

    public static ObjetoResponse preencher(Objeto objeto, int emprestada) {
        ObjetoResponse response = new ObjetoResponse();

        int total = objeto.getQuantidadeTotal() == null ? 0 : objeto.getQuantidadeTotal();

        response.setId(objeto.getId());
        response.setNome(objeto.getNome());
        response.setQuantidade_total(total);
        response.setQuantidade_emprestada(emprestada);
        response.setQuantidade_disponivel(total - emprestada);

        return response;
    }
}
