package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.dto.SocioRequest;
import br.com.club.controle_acesso.dto.SocioResponse;
import br.com.club.controle_acesso.service.SocioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/socios")
public class SocioController {

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    @GetMapping
    public List<SocioResponse> listar() {
        return socioService.listarSocios();
    }

    @PostMapping
    public SocioResponse cadastrar(@Valid @RequestBody SocioRequest socioRequest) {
        return socioService.cadastrarSocio(socioRequest);
    }

    @PutMapping("/{id}")
    public SocioResponse alterar(@PathVariable Long id, @Valid @RequestBody SocioRequest socioRequest) {
        return socioService.alterarSocio(id, socioRequest);
    }
}
