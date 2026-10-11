package br.com.club.controle_acesso.dto;


import br.com.club.controle_acesso.entity.Categoria;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoriaRequest {

    private String nome;

    public void preencherCategoria(Categoria categoria){
        categoria.setNome(nome);
    }
}
