package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.PessoaRequest;
import br.com.club.controle_acesso.dto.PessoaResponse;
import br.com.club.controle_acesso.entity.Categoria;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.repository.CategoriaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;
    private final CategoriaRepository categoriaRepository;

    public PessoaService(PessoaRepository pessoaRepository, CategoriaRepository categoriaRepository) {
        this.pessoaRepository = pessoaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<PessoaResponse> listarPessoas(){
        return pessoaRepository.findAll()
                .stream()
                .map(PessoaResponse::PreencherPessoaResponse)
                .toList();
    }

    public PessoaResponse cadastrarPessoa(PessoaRequest pessoaRequest){

        Pessoa pessoa = new Pessoa();

        pessoaRequest.preencherPessoa(pessoa);

        Categoria categoria = categoriaRepository
                .findById(pessoaRequest.getCategoria_id())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        pessoa.setCategoria(categoria);

        pessoa = pessoaRepository.save(pessoa);

        return PessoaResponse.PreencherPessoaResponse(pessoa);
    }

    public PessoaResponse alterarPessoa(Long id, PessoaRequest pessoaRequest){
        Pessoa pessoa = pessoaRepository.findById(id).orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));

        pessoaRequest.preencherPessoa(pessoa);

        Categoria categoria = categoriaRepository
                .findById(pessoaRequest.getCategoria_id())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        pessoa.setCategoria(categoria);

        pessoa = pessoaRepository.save(pessoa);

        return PessoaResponse.PreencherPessoaResponse(pessoa);
    }

    public void deletarPessoa(Long id){
        pessoaRepository.deleteById(id);
    }

}
