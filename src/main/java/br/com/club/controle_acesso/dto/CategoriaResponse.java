package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Categoria;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoriaResponse {

    private Long id;
    private String nome;

    public static CategoriaResponse preencherCategoriaResponse(Categoria categoria){
        CategoriaResponse categoriaResponse = new CategoriaResponse();

        categoriaResponse.setNome(categoria.getNome());
        categoriaResponse.setId(categoria.getId());

        return categoriaResponse;
    }
}
