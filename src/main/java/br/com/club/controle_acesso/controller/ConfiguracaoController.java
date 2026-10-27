package br.com.club.controle_acesso.controller;

import br.com.club.controle_acesso.service.ConfiguracaoService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/configuracoes")
public class ConfiguracaoController {

    private final ConfiguracaoService configuracaoService;

    public ConfiguracaoController(ConfiguracaoService configuracaoService) {
        this.configuracaoService = configuracaoService;
    }

    // Hora diária de renovação dos convites (0 a 23). Alterar aqui muda o prazo sem mexer no código.
    @GetMapping("/hora-renovacao")
    public Map<String, Integer> getHoraRenovacao() {
        return Map.of("hora", configuracaoService.getHoraRenovacao());
    }

    @PutMapping("/hora-renovacao")
    public Map<String, Integer> setHoraRenovacao(@RequestBody Map<String, Integer> corpo) {
        configuracaoService.setHoraRenovacao(corpo.getOrDefault("hora", 4));
        return Map.of("hora", configuracaoService.getHoraRenovacao());
    }
}
