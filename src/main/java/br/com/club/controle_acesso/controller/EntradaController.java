package br.com.club.controle_acesso.controller;


import br.com.club.controle_acesso.dto.ConviteEmUsoResponse;
import br.com.club.controle_acesso.dto.EntradaDiretaRequest;
import br.com.club.controle_acesso.dto.EntradaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.service.EntradaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // Convites/cortesias que estão ocupados neste momento (aba Convites).
    @GetMapping("/em-uso")
    public List<ConviteEmUsoResponse> emUso(){
        return entradaService.listarEmUso();
    }

    @PostMapping
    public EntradaResponse cadastrar(@Valid @RequestBody EntradaRequest entradaRequest){
        return entradaService.cadastrarEntrada(entradaRequest);
    }

    // Entrada registrada direto na portaria (sem autorização prévia).
    @PostMapping("/direta")
    public EntradaResponse registrarDireta(@Valid @RequestBody EntradaDiretaRequest request){
        return entradaService.registrarEntradaDireta(request);
    }

    // Libera o convite/cortesia que a pessoa ocupa (remove do "em uso").
    @PostMapping("/{id}/liberar")
    public void liberar(@PathVariable Long id){
        entradaService.liberar(id);
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
