package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.dto.CotaResponse;
import br.com.club.controle_acesso.service.CotaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cotas")
public class CotaController {

    private final CotaService cotaService;

    public CotaController(CotaService cotaService) {
        this.cotaService = cotaService;
    }

    @GetMapping
    public List<CotaResponse> listar() {
        return cotaService.listarCotas();
    }

    @GetMapping("/{id}")
    public CotaResponse buscarPorId(@PathVariable Long id) {
        return cotaService.buscarPorId(id);
    }

    @GetMapping("/codigo/{codigo}")
    public CotaResponse buscarPorCodigo(@PathVariable String codigo) {
        return cotaService.buscarPorCodigo(codigo);
    }
}
