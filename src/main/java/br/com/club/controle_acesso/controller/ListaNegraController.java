package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.dto.ListaNegraRequest;
import br.com.club.controle_acesso.dto.ListaNegraResponse;
import br.com.club.controle_acesso.service.ListaNegraService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lista-negra")
public class ListaNegraController {

    private final ListaNegraService listaNegraService;

    public ListaNegraController(ListaNegraService listaNegraService) {
        this.listaNegraService = listaNegraService;
    }

    @GetMapping
    public List<ListaNegraResponse> listar() {
        return listaNegraService.listar();
    }

    @PostMapping
    public ListaNegraResponse bloquear(@RequestBody ListaNegraRequest request) {
        return listaNegraService.bloquear(request);
    }

    @DeleteMapping("/{id}")
    public void desbloquear(@PathVariable Long id) {
        listaNegraService.desbloquear(id);
    }
}
