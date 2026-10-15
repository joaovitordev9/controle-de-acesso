package br.com.club.controle_acesso.controller;


import br.com.club.controle_acesso.dto.EntradaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.service.EntradaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/entradas")
public class EntradaController {

    private final EntradaService entradaService;

    public EntradaController(EntradaService entradaService) {
        this.entradaService = entradaService;
    }

    @GetMapping
    public List<EntradaResponse> listar(){
        return entradaService.listarEntradas();
    }

    @PostMapping
    public EntradaResponse cadastrar(@Valid @RequestBody EntradaRequest entradaRequest){
        return entradaService.cadastrarEntrada(entradaRequest);
    }

    @PutMapping("/{id}")
    public EntradaResponse alterar(@PathVariable Long id, @Valid @RequestBody EntradaRequest entradaRequest){
        return entradaService.alterarEntrada(id,entradaRequest);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id){
        entradaService.deletarEntrada(id);
    }
}
