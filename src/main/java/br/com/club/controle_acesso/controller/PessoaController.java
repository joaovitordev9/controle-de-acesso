package br.com.club.controle_acesso.controller;


import br.com.club.controle_acesso.dto.PessoaRequest;
import br.com.club.controle_acesso.dto.PessoaResponse;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.service.PessoaService;
import jakarta.validation.Valid;
import lombok.Getter;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {


    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @GetMapping
    public List<PessoaResponse> listar(){
        return pessoaService.listarPessoas();
    }

    @PostMapping
    public PessoaResponse cadastrar(@Valid @RequestBody PessoaRequest pessoaRequest){
        return pessoaService.cadastrarPessoa(pessoaRequest);
    }

    @PutMapping("/{id}")
    public PessoaResponse alterar(@PathVariable Long id, @Valid @RequestBody PessoaRequest pessoaRequest){
        return pessoaService.alterarPessoa(id,pessoaRequest);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id){
        pessoaService.deletarPessoa(id);
    }
}
