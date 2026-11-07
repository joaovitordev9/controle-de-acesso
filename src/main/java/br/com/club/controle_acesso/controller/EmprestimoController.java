package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.dto.EmprestimoLoteRequest;
import br.com.club.controle_acesso.dto.EmprestimoRequest;
import br.com.club.controle_acesso.dto.EmprestimoResponse;
import br.com.club.controle_acesso.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    // Histórico completo (em aberto + devolvidos).
    @GetMapping
    public List<EmprestimoResponse> listar() {
        return emprestimoService.listarHistorico();
    }

    // Objetos emprestados neste momento (ainda não devolvidos).
    @GetMapping("/em-aberto")
    public List<EmprestimoResponse> emAberto() {
        return emprestimoService.listarEmAberto();
    }

    @PostMapping
    public EmprestimoResponse emprestar(@Valid @RequestBody EmprestimoRequest emprestimoRequest) {
        return emprestimoService.emprestar(emprestimoRequest);
    }

    // Empresta vários objetos de uma vez para a mesma pessoa.
    @PostMapping("/lote")
    public List<EmprestimoResponse> emprestarLote(@Valid @RequestBody EmprestimoLoteRequest loteRequest) {
        return emprestimoService.emprestarLote(loteRequest);
    }

    // Registra a devolução do empréstimo.
    @PostMapping("/{id}/devolver")
    public EmprestimoResponse devolver(@PathVariable Long id) {
        return emprestimoService.devolver(id);
    }
}
