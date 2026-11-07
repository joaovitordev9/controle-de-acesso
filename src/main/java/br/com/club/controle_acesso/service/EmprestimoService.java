package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.dto.EmprestimoLoteRequest;
import br.com.club.controle_acesso.dto.EmprestimoRequest;
import br.com.club.controle_acesso.dto.EmprestimoResponse;
import br.com.club.controle_acesso.entity.Emprestimo;
import br.com.club.controle_acesso.entity.Objeto;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.EmprestimoRepository;
import br.com.club.controle_acesso.repository.ObjetoRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final ObjetoRepository objetoRepository;
    private final PessoaRepository pessoaRepository;

    public EmprestimoService(EmprestimoRepository emprestimoRepository,
                             ObjetoRepository objetoRepository,
                             PessoaRepository pessoaRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.objetoRepository = objetoRepository;
        this.pessoaRepository = pessoaRepository;
    }

    // Empréstimos ainda em aberto (objetos emprestados agora).
    public List<EmprestimoResponse> listarEmAberto() {
        return emprestimoRepository.findByDataDevolucaoIsNullOrderByDataEmprestimoDesc()
                .stream()
                .map(EmprestimoResponse::preencher)
                .toList();
    }

    // Histórico completo (em aberto + devolvidos).
    public List<EmprestimoResponse> listarHistorico() {
        return emprestimoRepository.findAllByOrderByDataEmprestimoDesc()
                .stream()
                .map(EmprestimoResponse::preencher)
                .toList();
    }

    @Transactional
    public EmprestimoResponse emprestar(EmprestimoRequest request) {
        Objeto objeto = objetoRepository.findById(request.getObjeto_id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Objeto não encontrado"));

        Pessoa pessoa = pessoaRepository.findById(request.getPessoa_id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));

        int total = objeto.getQuantidadeTotal() == null ? 0 : objeto.getQuantidadeTotal();
        int emprestada = emprestimoRepository.somarEmprestadoEmAberto(objeto.getId());
        int disponivel = total - emprestada;

        if (request.getQuantidade() > disponivel) {
            throw new RegraNegocioException(
                    "Quantidade indisponível: há apenas " + disponivel + " unidade(s) disponível(is).");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setObjeto(objeto);
        emprestimo.setPessoa(pessoa);
        emprestimo.setQuantidade(request.getQuantidade());
        emprestimo.setDataEmprestimo(LocalDateTime.now());
        emprestimo = emprestimoRepository.save(emprestimo);

        return EmprestimoResponse.preencher(emprestimo);
    }

    // Empresta vários objetos de uma vez para a mesma pessoa (ex.: bola + peteca).
    // Tudo ou nada: se faltar estoque de qualquer objeto, nenhum é emprestado.
    @Transactional
    public List<EmprestimoResponse> emprestarLote(EmprestimoLoteRequest request) {
        Pessoa pessoa = pessoaRepository.findById(request.getPessoa_id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));

        // Soma o pedido por objeto (o mesmo objeto pode vir repetido em itens diferentes).
        Map<Long, Integer> pedidoPorObjeto = new HashMap<>();
        for (EmprestimoLoteRequest.Item item : request.getItens()) {
            pedidoPorObjeto.merge(item.getObjeto_id(), item.getQuantidade(), Integer::sum);
        }

        List<Emprestimo> novos = new ArrayList<>();
        LocalDateTime agora = LocalDateTime.now();

        for (Map.Entry<Long, Integer> pedido : pedidoPorObjeto.entrySet()) {
            Objeto objeto = objetoRepository.findById(pedido.getKey())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Objeto não encontrado"));

            int total = objeto.getQuantidadeTotal() == null ? 0 : objeto.getQuantidadeTotal();
            int disponivel = total - emprestimoRepository.somarEmprestadoEmAberto(objeto.getId());

            if (pedido.getValue() > disponivel) {
                throw new RegraNegocioException(
                        "Quantidade indisponível para \"" + objeto.getNome() + "\": há apenas "
                                + disponivel + " unidade(s) disponível(is).");
            }

            Emprestimo emprestimo = new Emprestimo();
            emprestimo.setObjeto(objeto);
            emprestimo.setPessoa(pessoa);
            emprestimo.setQuantidade(pedido.getValue());
            emprestimo.setDataEmprestimo(agora);
            novos.add(emprestimo);
        }

        return emprestimoRepository.saveAll(novos).stream()
                .map(EmprestimoResponse::preencher)
                .toList();
    }

    @Transactional
    public EmprestimoResponse devolver(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empréstimo não encontrado"));

        if (emprestimo.getDataDevolucao() != null) {
            throw new RegraNegocioException("Este empréstimo já foi devolvido.");
        }

        emprestimo.setDataDevolucao(LocalDateTime.now());
        emprestimo = emprestimoRepository.save(emprestimo);

        return EmprestimoResponse.preencher(emprestimo);
    }
}
