package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.PessoaRequest;
import br.com.club.controle_acesso.dto.PessoaResponse;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.entity.Socio;
import br.com.club.controle_acesso.enums.Categoria;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.repository.PessoaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public PessoaService(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
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

        pessoa = pessoaRepository.save(pessoa);

        return PessoaResponse.PreencherPessoaResponse(pessoa);
    }

    @Transactional
    public PessoaResponse alterarPessoa(Long id, PessoaRequest pessoaRequest){
        Pessoa pessoa = pessoaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));

        // Conversão: um sócio deixou de ser sócio (muda o discriminador e libera a cota).
        if (pessoa instanceof Socio && pessoaRequest.getCategoria() != Categoria.SOCIO) {
            entityManager.createNativeQuery(
                            "UPDATE pessoa SET tipo_pessoa = 'PESSOA', cota_id = NULL, papel = NULL, diretor = FALSE WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            entityManager.flush();
            entityManager.clear();
            pessoa = pessoaRepository.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));
        }

        pessoaRequest.preencherPessoa(pessoa);

        pessoa = pessoaRepository.save(pessoa);

        return PessoaResponse.PreencherPessoaResponse(pessoa);
    }

    public void deletarPessoa(Long id){
        pessoaRepository.deleteById(id);
    }

}
