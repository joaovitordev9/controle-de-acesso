package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.PessoaRequest;
import br.com.club.controle_acesso.dto.PessoaResponse;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;

    public PessoaService(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    public PessoaResponse cadastrarPessoa(PessoaRequest pessoaRequest){

        Pessoa pessoa = new Pessoa();

        pessoaRequest.preencherPessoa(pessoa);

        pessoa = pessoaRepository.save(pessoa);

        return PessoaResponse.PreencherPessoaResponse(pessoa);
    }

    public PessoaResponse alterarPessoa(Long id, PessoaRequest pessoaRequest){
        Pessoa pessoa = pessoaRepository.findById(id).orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        pessoa.setNome(pessoaRequest.getNome());
        pessoa.setCidade(pessoaRequest.getCidade());
        pessoa.setTelefone(pessoaRequest.getTelefone());
        pessoa.setCpf(pessoaRequest.getCpf());

        pessoa = pessoaRepository.save(pessoa);

        return PessoaResponse.PreencherPessoaResponse(pessoa);
    }

    public void deletarPessoa(Long id){
        pessoaRepository.deleteById(id);
    }

}
