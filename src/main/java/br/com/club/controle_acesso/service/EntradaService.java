package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.EntradaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.entity.Entrada;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.repository.EntradaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntradaService {

    private final EntradaRepository entradaRepository;
    private final PessoaRepository pessoaRepository;

    public EntradaService(EntradaRepository entradaRepository, PessoaRepository pessoaRepository) {
        this.entradaRepository = entradaRepository;
        this.pessoaRepository = pessoaRepository;
    }

    public List<EntradaResponse> listarEntradas() {
        return entradaRepository.findAll()
                .stream()
                .map(EntradaResponse::PreencherEntrada)
                .toList();
    }

    public EntradaResponse cadastrarEntrada(EntradaRequest entradaRequest){

        Pessoa pessoa = pessoaRepository.findById(entradaRequest.getPessoa_id()).orElseThrow(() -> new RuntimeException("Entrada não encontrada"));

        Entrada entrada = new Entrada();

        entrada.setPessoa(pessoa);

        entrada = entradaRepository.save(entrada);

        return EntradaResponse.PreencherEntrada(entrada);
    }

    public EntradaResponse alterarEntrada(Long id, EntradaRequest entradaRequest){

        Pessoa pessoa = pessoaRepository.findById(entradaRequest.getPessoa_id()).orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
        Entrada entrada = entradaRepository.findById(id).orElseThrow(() -> new RuntimeException("Entrada não encontrada"));

        entrada.setPessoa(pessoa);

        entrada = entradaRepository.save(entrada);

        return EntradaResponse.PreencherEntrada(entrada);
    }

    public void deletarEntrada(Long id){
        entradaRepository.deleteById(id);
    }
}
