package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.PessoaRequest;
import br.com.club.controle_acesso.dto.PessoaResponse;
import br.com.club.controle_acesso.dto.PessoaVinculosResponse;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.entity.Socio;
import br.com.club.controle_acesso.enums.Categoria;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.repository.AutorizacaoRepository;
import br.com.club.controle_acesso.repository.EmprestimoRepository;
import br.com.club.controle_acesso.repository.EntradaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;
    private final EntradaRepository entradaRepository;
    private final AutorizacaoRepository autorizacaoRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final ListaNegraService listaNegraService;

    @PersistenceContext
    private EntityManager entityManager;

    public PessoaService(PessoaRepository pessoaRepository,
                         EntradaRepository entradaRepository,
                         AutorizacaoRepository autorizacaoRepository,
                         EmprestimoRepository emprestimoRepository,
                         ListaNegraService listaNegraService) {
        this.pessoaRepository = pessoaRepository;
        this.entradaRepository = entradaRepository;
        this.autorizacaoRepository = autorizacaoRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.listaNegraService = listaNegraService;
    }

    public List<PessoaResponse> listarPessoas(){
        var bloqueios = listaNegraService.mapaPorCpf();
        return pessoaRepository.findAll()
                .stream()
                .map(p -> PessoaResponse.PreencherPessoaResponse(p,
                        bloqueios.get(ListaNegraService.normalizarCpf(p.getCpf()))))
                .toList();
    }

    public PessoaResponse cadastrarPessoa(PessoaRequest pessoaRequest){

        Pessoa pessoa = new Pessoa();

        pessoaRequest.preencherPessoa(pessoa);

        pessoa = pessoaRepository.save(pessoa);

        return responder(pessoa);
    }

    @Transactional
    public PessoaResponse alterarPessoa(Long id, PessoaRequest pessoaRequest){
        Pessoa pessoa = pessoaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));

        listaNegraService.validarTrocaDeCpf(pessoa.getCpf(), pessoaRequest.getCpf());

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

        return responder(pessoa);
    }

    private PessoaResponse responder(Pessoa pessoa) {
        return PessoaResponse.PreencherPessoaResponse(pessoa,
                listaNegraService.buscarPorCpf(pessoa.getCpf()).orElse(null));
    }

    // Resumo do que está vinculado à pessoa (para o front avisar antes de excluir).
    @Transactional(readOnly = true)
    public PessoaVinculosResponse contarVinculos(Long id){
        if (!pessoaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Pessoa não encontrada");
        }
        long entradas = entradaRepository.countByPessoaIdOrTitularId(id, id);
        long autorizacoes = autorizacaoRepository.contarPorPessoaAutorizada(id);
        long emprestimos = emprestimoRepository.countByPessoaId(id);
        long emprestimosEmAberto = emprestimoRepository.countByPessoaIdAndDataDevolucaoIsNull(id);
        return new PessoaVinculosResponse(entradas, autorizacoes, emprestimos, emprestimosEmAberto);
    }

    // Exclui a pessoa junto com tudo que aponta para ela (entradas, autorizações e empréstimos).
    // A confirmação "apagar tudo?" é feita no front; aqui a remoção é em cascata, numa transação só.
    @Transactional
    public void deletarPessoa(Long id){
        if (!pessoaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Pessoa não encontrada");
        }
        emprestimoRepository.deleteByPessoaId(id);
        entradaRepository.deleteByPessoaIdOrTitularId(id, id);
        autorizacaoRepository.apagarPorPessoaAutorizada(id);
        pessoaRepository.deleteById(id);
    }

}
