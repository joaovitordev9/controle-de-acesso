package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.dto.AutorizacaoRequest;
import br.com.club.controle_acesso.dto.AutorizacaoResponse;
import br.com.club.controle_acesso.dto.ChegadaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.service.AutorizacaoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/autorizacoes")
public class AutorizacaoController {

    private final AutorizacaoService autorizacaoService;

    public AutorizacaoController(AutorizacaoService autorizacaoService) {
        this.autorizacaoService = autorizacaoService;
    }

    // Lista apenas as autorizações pendentes (as que ainda precisam ser processadas).
    @GetMapping
    public List<AutorizacaoResponse> listar() {
        return autorizacaoService.listarPendentes();
    }

    @PostMapping
    public AutorizacaoResponse cadastrar(@Valid @RequestBody AutorizacaoRequest autorizacaoRequest) {
        return autorizacaoService.criar(autorizacaoRequest);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        autorizacaoService.remover(id);
    }

    // Confirma a entrada na portaria (consome o convite/cortesia escolhido).
    @PostMapping("/{id}/chegada")
    public EntradaResponse confirmarChegada(@PathVariable Long id, @Valid @RequestBody ChegadaRequest chegadaRequest) {
        return autorizacaoService.confirmarEntrada(id, chegadaRequest);
    }
}
