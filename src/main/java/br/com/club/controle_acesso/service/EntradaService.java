package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.EntradaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.entity.Entrada;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.repository.EntradaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;

@Service
public class EntradaService {

    private final EntradaRepository entradaRepository;
    private final PessoaRepository pessoaRepository;

    public EntradaService(EntradaRepository entradaRepository, PessoaRepository pessoaRepository) {
        this.entradaRepository = entradaRepository;
        this.pessoaRepository = pessoaRepository;
    }


    public EntradaResponse cadastrarEntrada(EntradaRequest entradaRequest){

        Pessoa pessoa = pessoaRepository.findById(entradaRequest.getPessoa_id()).orElseThrow(() -> new RuntimeException("Entrada não encontrada"));

        Entrada entrada = new Entrada();

        entrada.setPessoa(pessoa);

        entradaRepository.save(entrada);

        return EntradaResponse.PreencherEntrada(entrada);
    }

    public void deletarEntrada(Long id){
        entradaRepository.deleteById(id);
    }
}
