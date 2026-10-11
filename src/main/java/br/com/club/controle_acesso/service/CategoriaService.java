package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.CategoriaRequest;
import br.com.club.controle_acesso.dto.CategoriaResponse;
import br.com.club.controle_acesso.entity.Categoria;
import br.com.club.controle_acesso.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaResponse> listarCategorias(){
        return categoriaRepository.findAll()
                .stream()
                .map(CategoriaResponse::preencherCategoriaResponse)
                .toList();
    }

    public CategoriaResponse cadastrarCategoria(CategoriaRequest categoriaRequest){
        Categoria categoria = new Categoria();

        categoriaRequest.preencherCategoria(categoria);

        categoria =  categoriaRepository.save(categoria);

        return CategoriaResponse.preencherCategoriaResponse(categoria);
    }

    public CategoriaResponse alterarCategoria(Long id, CategoriaRequest categoriaRequest){
        Categoria categoria = categoriaRepository.findById(id).orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        categoriaRequest.preencherCategoria(categoria);

        categoria = categoriaRepository.save(categoria);

        return CategoriaResponse.preencherCategoriaResponse(categoria);
    }

    public void deletarCategoria(Long id){
        categoriaRepository.deleteById(id);
    }


}
