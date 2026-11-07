package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.dto.ListaNegraRequest;
import br.com.club.controle_acesso.dto.ListaNegraResponse;
import br.com.club.controle_acesso.entity.ListaNegra;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.ListaNegraRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ListaNegraService {

    public static final int MAX_MOTIVO = 1000;
    public static final int MAX_NOME = 255;

    private final ListaNegraRepository listaNegraRepository;
    private final PessoaRepository pessoaRepository;

    public ListaNegraService(ListaNegraRepository listaNegraRepository, PessoaRepository pessoaRepository) {
        this.listaNegraRepository = listaNegraRepository;
        this.pessoaRepository = pessoaRepository;
    }

    /** CPF só com dígitos, para "123.456.789-00" e "12345678900" serem o mesmo. */
    public static String normalizarCpf(String cpf) {
        return cpf == null ? "" : cpf.replaceAll("\\D", "");
    }

    @Transactional(readOnly = true)
    public List<ListaNegraResponse> listar() {
        Map<String, Pessoa> pessoasPorCpf = new HashMap<>();
        for (Pessoa p : pessoaRepository.findAll()) {
            pessoasPorCpf.putIfAbsent(normalizarCpf(p.getCpf()), p);
        }
        return listaNegraRepository.findAllByOrderByDataBloqueioDesc()
                .stream()
                .map(r -> ListaNegraResponse.preencher(r, pessoasPorCpf.get(r.getCpf())))
                .toList();
    }

    @Transactional
    public ListaNegraResponse bloquear(ListaNegraRequest request) {
        Pessoa pessoa = null;
        String cpf;
        String nome;

        if (request.getPessoa_id() != null) {
            pessoa = pessoaRepository.findById(request.getPessoa_id())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));
            cpf = normalizarCpf(pessoa.getCpf());
            nome = pessoa.getNome();
        } else {
            cpf = normalizarCpf(request.getCpf());
            nome = request.getNome() == null ? null : request.getNome().trim();
        }

        if (pessoa != null && cpf.isEmpty()) {
            throw new RegraNegocioException("Esta pessoa não tem CPF no cadastro. Corrija o cadastro antes de adicionar à Lista Negra.");
        }
        if (pessoa == null && cpf.length() != 11) {
            throw new RegraNegocioException("Informe um CPF válido (11 dígitos) para adicionar à Lista Negra.");
        }
        if (nome != null && nome.length() > MAX_NOME) {
            throw new RegraNegocioException("O nome pode ter no máximo " + MAX_NOME + " caracteres.");
        }
        if (request.getMotivo() == null || request.getMotivo().isBlank()) {
            throw new RegraNegocioException("Informe o motivo do bloqueio.");
        }
        if (request.getMotivo().trim().length() > MAX_MOTIVO) {
            throw new RegraNegocioException("O motivo pode ter no máximo " + MAX_MOTIVO + " caracteres.");
        }
        if (listaNegraRepository.existsByCpf(cpf)) {
            throw new RegraNegocioException("Este CPF já está na Lista Negra.");
        }

        ListaNegra registro = new ListaNegra();
        registro.setCpf(cpf);
        registro.setNome(nome);
        registro.setMotivo(request.getMotivo().trim());
        registro.setDataBloqueio(LocalDateTime.now());
        try {
            // flush já aqui: se outro bloqueio do mesmo CPF entrou junto, a chave única avisa agora.
            registro = listaNegraRepository.saveAndFlush(registro);
        } catch (DataIntegrityViolationException e) {
            throw new RegraNegocioException("Este CPF já está na Lista Negra.");
        }

        if (pessoa == null) {
            pessoa = pessoaRepository.findAll().stream()
                    .filter(p -> normalizarCpf(p.getCpf()).equals(cpf))
                    .findFirst().orElse(null);
        }
        return ListaNegraResponse.preencher(registro, pessoa);
    }

    @Transactional
    public void desbloquear(Long id) {
        if (!listaNegraRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Registro da Lista Negra não encontrado");
        }
        listaNegraRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<ListaNegra> buscarPorCpf(String cpf) {
        String normalizado = normalizarCpf(cpf);
        if (normalizado.isEmpty()) return Optional.empty();
        return listaNegraRepository.findByCpf(normalizado);
    }

    /** Todos os bloqueios indexados por CPF, para enriquecer listagens sem uma consulta por pessoa. */
    @Transactional(readOnly = true)
    public Map<String, ListaNegra> mapaPorCpf() {
        return listaNegraRepository.findAll().stream()
                .collect(Collectors.toMap(ListaNegra::getCpf, Function.identity(), (a, b) -> a));
    }

    /**
     * Quem está na Lista Negra não pode ter o CPF trocado no cadastro
     * (senão bastaria editar o CPF para sair da lista).
     */
    public void validarTrocaDeCpf(String cpfAtual, String cpfNovo) {
        String atual = normalizarCpf(cpfAtual);
        if (atual.equals(normalizarCpf(cpfNovo))) return;
        if (!atual.isEmpty() && listaNegraRepository.existsByCpf(atual)) {
            throw new RegraNegocioException(
                    "Esta pessoa está na Lista Negra: o CPF não pode ser alterado. Desbloqueie na aba Lista Negra antes.");
        }
    }

    /** Impede a entrada por convite/cortesia de quem está na Lista Negra. */
    public void validarPodeEntrar(Pessoa pessoa) {
        buscarPorCpf(pessoa.getCpf()).ifPresent(registro -> {
            String motivo = registro.getMotivo() == null || registro.getMotivo().isBlank()
                    ? "" : " Motivo: " + registro.getMotivo();
            throw new RegraNegocioException(
                    "Entrada bloqueada: " + pessoa.getNome() + " está na Lista Negra." + motivo);
        });
    }
}
