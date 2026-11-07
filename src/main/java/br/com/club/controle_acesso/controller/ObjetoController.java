package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.dto.ObjetoRequest;
import br.com.club.controle_acesso.dto.ObjetoResponse;
import br.com.club.controle_acesso.service.ObjetoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/objetos")
public class ObjetoController {

    private final ObjetoService objetoService;

    public ObjetoController(ObjetoService objetoService) {
        this.objetoService = objetoService;
    }

    @GetMapping
    public List<ObjetoResponse> listar() {
        return objetoService.listarObjetos();
    }

    @PostMapping
    public ObjetoResponse cadastrar(@Valid @RequestBody ObjetoRequest objetoRequest) {
        return objetoService.cadastrarObjeto(objetoRequest);
    }

    @PutMapping("/{id}")
    public ObjetoResponse alterar(@PathVariable Long id, @Valid @RequestBody ObjetoRequest objetoRequest) {
        return objetoService.alterarObjeto(id, objetoRequest);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        objetoService.deletarObjeto(id);
    }
}
