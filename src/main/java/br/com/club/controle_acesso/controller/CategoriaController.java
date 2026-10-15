package br.com.club.controle_acesso.controller;


import br.com.club.controle_acesso.dto.CategoriaRequest;
import br.com.club.controle_acesso.dto.CategoriaResponse;
import br.com.club.controle_acesso.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<CategoriaResponse> listar(){
        return categoriaService.listarCategorias();
    }

    @PostMapping
    public CategoriaResponse cadastrar(@Valid @RequestBody CategoriaRequest categoriaRequest){
        return categoriaService.cadastrarCategoria(categoriaRequest);
    }

    @PutMapping("/{id}")
    public CategoriaResponse alterar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest categoriaRequest){
        return categoriaService.alterarCategoria(id,categoriaRequest);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id){
        categoriaService.deletarCategoria(id);
    }
}
