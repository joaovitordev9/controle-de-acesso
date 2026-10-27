package br.com.club.controle_acesso.service;


import br.com.club.controle_acesso.dto.ConviteEmUsoResponse;
import br.com.club.controle_acesso.dto.EntradaDiretaRequest;
import br.com.club.controle_acesso.dto.EntradaRequest;
import br.com.club.controle_acesso.dto.EntradaResponse;
import br.com.club.controle_acesso.entity.Cota;
import br.com.club.controle_acesso.entity.Entrada;
import br.com.club.controle_acesso.entity.Pessoa;
import br.com.club.controle_acesso.enums.TipoAutorizacao;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.CotaRepository;
import br.com.club.controle_acesso.repository.EntradaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EntradaService {

    private final EntradaRepository entradaRepository;
    private final PessoaRepository pessoaRepository;
    private final CotaRepository cotaRepository;
    private final ConfiguracaoService configuracaoService;

    public EntradaService(EntradaRepository entradaRepository,
                          PessoaRepository pessoaRepository,
                          CotaRepository cotaRepository,
                          ConfiguracaoService configuracaoService) {
        this.entradaRepository = entradaRepository;
        this.pessoaRepository = pessoaRepository;
        this.cotaRepository = cotaRepository;
        this.configuracaoService = configuracaoService;
    }

    public List<EntradaResponse> listarEntradas() {
        return entradaRepository.findAll()
                .stream()
                .map(EntradaResponse::PreencherEntrada)
                .toList();
    }

    // Convites/cortesias que ainda estão em uso (ocupando a vaga neste momento).
    @Transactional(readOnly = true)
    public List<ConviteEmUsoResponse> listarEmUso() {
        return entradaRepository.buscarEmUso(LocalDateTime.now())
                .stream()
                .map(ConviteEmUsoResponse::preencher)
                .toList();
    }

    public EntradaResponse cadastrarEntrada(EntradaRequest entradaRequest){

        Pessoa pessoa = pessoaRepository.findById(entradaRequest.getPessoa_id()).orElseThrow(() -> new RuntimeException("Entrada não encontrada"));

        Entrada entrada = new Entrada();

        entrada.setPessoa(pessoa);

        entrada.setData_entrada(LocalDateTime.now());

        entrada = entradaRepository.save(entrada);

        return EntradaResponse.PreencherEntrada(entrada);
    }

    /**
     * Registra uma entrada direto na portaria, sem autorização prévia: ocupa o
     * convite/cortesia da cota informada, com o mesmo controle de saldo e lock
     * usado na confirmação de autorizações.
     */
    @Transactional
    public EntradaResponse registrarEntradaDireta(EntradaDiretaRequest request) {
        Pessoa pessoa = pessoaRepository.findById(request.getPessoa_id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada"));

        // Lock de escrita na cota para serializar entradas simultâneas.
        Cota cota = cotaRepository.buscarParaAtualizacao(request.getCota_id())
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

        return EntradaResponse.PreencherEntrada(entrada);
    }

    public EntradaResponse alterarEntrada(Long id, EntradaRequest entradaRequest){

        Pessoa pessoa = pessoaRepository.findById(entradaRequest.getPessoa_id()).orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
        Entrada entrada = entradaRepository.findById(id).orElseThrow(() -> new RuntimeException("Entrada não encontrada"));

        entrada.setPessoa(pessoa);

        entrada = entradaRepository.save(entrada);

        return EntradaResponse.PreencherEntrada(entrada);
    }

    /**
     * Libera o convite/cortesia que a pessoa está ocupando (remove do "em uso"):
     * encerra a ocupação agora, mantendo o registro da entrada no histórico.
     */
    @Transactional
    public void liberar(Long id) {
        Entrada entrada = entradaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrada não encontrada"));
        entrada.setTermino_previsto(LocalDateTime.now());
        entradaRepository.save(entrada);
    }

    public void deletarEntrada(Long id){
        entradaRepository.deleteById(id);
    }
}
