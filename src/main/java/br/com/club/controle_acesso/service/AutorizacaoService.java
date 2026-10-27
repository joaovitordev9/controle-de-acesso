package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.dto.AutorizacaoRequest;
import br.com.club.controle_acesso.dto.AutorizacaoResponse;
import br.com.club.controle_acesso.dto.ChegadaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.entity.Autorizacao;
import br.com.club.controle_acesso.entity.Cota;
import br.com.club.controle_acesso.entity.Entrada;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.enums.SituacaoAutorizacao;
import br.com.club.controle_acesso.enums.TipoAutorizacao;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.AutorizacaoRepository;
import br.com.club.controle_acesso.repository.CotaRepository;
import br.com.club.controle_acesso.repository.EntradaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AutorizacaoService {

    private final AutorizacaoRepository autorizacaoRepository;
    private final CotaRepository cotaRepository;
    private final PessoaRepository pessoaRepository;
    private final EntradaRepository entradaRepository;
    private final ConfiguracaoService configuracaoService;

    public AutorizacaoService(AutorizacaoRepository autorizacaoRepository,
                              CotaRepository cotaRepository,
                              PessoaRepository pessoaRepository,
                              EntradaRepository entradaRepository,
                              ConfiguracaoService configuracaoService) {
        this.autorizacaoRepository = autorizacaoRepository;
        this.cotaRepository = cotaRepository;
        this.pessoaRepository = pessoaRepository;
        this.entradaRepository = entradaRepository;
        this.configuracaoService = configuracaoService;
    }

    @Transactional(readOnly = true)
    public List<AutorizacaoResponse> listarPendentes() {
        return autorizacaoRepository.findBySituacaoOrderByDataCriacaoDesc(SituacaoAutorizacao.PENDENTE)
                .stream()
                .map(AutorizacaoResponse::preencherAutorizacaoResponse)
                .toList();
    }

    // Criar autorização = apenas o aviso. NÃO ocupa convite nem cortesia.
    @Transactional
    public AutorizacaoResponse criar(AutorizacaoRequest request) {
        Cota cota = cotaRepository.findById(request.getCota_id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sócio/cota não encontrado"));

        Autorizacao autorizacao = new Autorizacao();
        autorizacao.setCota(cota);
        autorizacao.setNomeAutorizado(request.getNomeAutorizado());
        autorizacao.setSituacao(SituacaoAutorizacao.PENDENTE);
        autorizacao.setDataCriacao(LocalDateTime.now());

        if (request.getPessoa_id() != null) {
            Pessoa pessoa = pessoaRepository.findById(request.getPessoa_id())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));
            autorizacao.setPessoaAutorizada(pessoa);
        }

        autorizacao = autorizacaoRepository.save(autorizacao);
        return AutorizacaoResponse.preencherAutorizacaoResponse(autorizacao);
    }

    // Remove uma autorização pendente (não chegou). Confirmadas ficam no histórico.
    @Transactional
    public void remover(Long id) {
        Autorizacao autorizacao = autorizacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Autorização não encontrada"));
        if (autorizacao.getSituacao() == SituacaoAutorizacao.CONFIRMADA) {
            throw new RegraNegocioException("Autorização já confirmada não pode ser removida do histórico.");
        }
        autorizacaoRepository.delete(autorizacao);
    }

    /**
     * Confirma a entrada na portaria. É aqui que o convite/cortesia passa a ser ocupado,
     * até a próxima hora de renovação. Valida disponibilidade com lock para evitar uso duplicado.
     */
    @Transactional
    public EntradaResponse confirmarEntrada(Long id, ChegadaRequest request) {
        Autorizacao autorizacao = autorizacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "A autorização não foi encontrada ou não é mais válida."));

        if (autorizacao.getSituacao() != SituacaoAutorizacao.PENDENTE) {
            throw new RegraNegocioException("A autorização não foi encontrada ou não é mais válida.");
        }

        Pessoa pessoa = pessoaRepository.findById(request.getPessoa_id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));

        // Lock de escrita na cota para serializar confirmações simultâneas.
        Cota cota = cotaRepository.buscarParaAtualizacao(autorizacao.getCota().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cota não encontrada"));

        TipoAutorizacao tipo = request.getTipo();
        int concedidos = tipo == TipoAutorizacao.CORTESIA
                ? cota.getQtd_cortesias()
                : cota.getQtd_convites_especiais();

        LocalDateTime agora = LocalDateTime.now();
        long ativas = entradaRepository.contarUtilizacoesAtivas(cota.getId(), tipo, agora);

        if (ativas >= concedidos) {
            String beneficio = tipo == TipoAutorizacao.CORTESIA ? "cortesias" : "convites";
            throw new RegraNegocioException("Entrada bloqueada: o sócio não possui " + beneficio + " disponíveis.");
        }

        Entrada entrada = new Entrada();
        entrada.setPessoa(pessoa);
        entrada.setData_entrada(agora);
        entrada.setCota(cota);
        entrada.setTitular(cota.getTitular());
        entrada.setTipo_convite(tipo);
        entrada.setTermino_previsto(configuracaoService.calcularTermino(agora));
        entrada = entradaRepository.save(entrada);

        autorizacao.setSituacao(SituacaoAutorizacao.CONFIRMADA);
        autorizacao.setDataConfirmacao(agora);
        if (autorizacao.getPessoaAutorizada() == null) {
            autorizacao.setPessoaAutorizada(pessoa);
        }
        autorizacaoRepository.save(autorizacao);

        return EntradaResponse.PreencherEntrada(entrada);
    }
}
