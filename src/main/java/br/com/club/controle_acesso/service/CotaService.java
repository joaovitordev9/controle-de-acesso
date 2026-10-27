package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.dto.CotaRequest;
import br.com.club.controle_acesso.dto.CotaResponse;
import br.com.club.controle_acesso.entity.Cota;
import br.com.club.controle_acesso.entity.Socio;
import br.com.club.controle_acesso.enums.TipoAutorizacao;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.CotaRepository;
import br.com.club.controle_acesso.repository.EntradaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CotaService {

    private static final int MAX_CORTESIAS_DIRETOR = 2;
    private static final int MAX_CONVITES_ESPECIAIS = 5;

    private final CotaRepository cotaRepository;
    private final EntradaRepository entradaRepository;

    public CotaService(CotaRepository cotaRepository, EntradaRepository entradaRepository) {
        this.cotaRepository = cotaRepository;
        this.entradaRepository = entradaRepository;
    }

    @Transactional(readOnly = true)
    public List<CotaResponse> listarCotas() {
        return cotaRepository.findAll()
                .stream()
                .map(this::montarResposta)
                .toList();
    }

    @Transactional(readOnly = true)
    public CotaResponse buscarPorCodigo(String codigo) {
        Cota cota = cotaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cota não encontrada"));
        return montarResposta(cota);
    }

    @Transactional(readOnly = true)
    public CotaResponse buscarPorId(Long id) {
        Cota cota = cotaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cota não encontrada"));
        return montarResposta(cota);
    }

    @Transactional
    public CotaResponse atualizarCota(Long id, CotaRequest request) {
        Cota cota = cotaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cota não encontrada"));

        int novasCortesias = request.isDiretor() ? MAX_CORTESIAS_DIRETOR : 0;
        int novosConvites = request.getQtd_convite_especial();

        if (novosConvites < 0 || novosConvites > MAX_CONVITES_ESPECIAIS) {
            throw new RegraNegocioException("O convite deve ser de 0 a " + MAX_CONVITES_ESPECIAIS + ".");
        }

        LocalDateTime agora = LocalDateTime.now();
        long cortesiasUsadas = entradaRepository.contarUtilizacoesAtivas(id, TipoAutorizacao.CORTESIA, agora);
        long convitesUsados = entradaRepository.contarUtilizacoesAtivas(id, TipoAutorizacao.CONVITE_ESPECIAL, agora);

        if (novasCortesias < cortesiasUsadas) {
            throw new RegraNegocioException("Há " + cortesiasUsadas + " cortesia(s) em uso nesta cota.");
        }
        if (novosConvites < convitesUsados) {
            throw new RegraNegocioException("Há " + convitesUsados + " convite(s) em uso nesta cota.");
        }

        cota.setQtd_cortesias(novasCortesias);
        cota.setQtd_convites_especiais(novosConvites);

        Socio titular = cota.getTitular();
        if (titular != null) {
            titular.setDiretor(request.isDiretor());
        }

        cota = cotaRepository.save(cota);
        return montarResposta(cota);
    }

    private CotaResponse montarResposta(Cota cota) {
        LocalDateTime agora = LocalDateTime.now();
        long cortesiasUsadas = entradaRepository.contarUtilizacoesAtivas(cota.getId(), TipoAutorizacao.CORTESIA, agora);
        long convitesUsados = entradaRepository.contarUtilizacoesAtivas(cota.getId(), TipoAutorizacao.CONVITE_ESPECIAL, agora);
        return CotaResponse.preencherCotaResponse(cota, cortesiasUsadas, convitesUsados);
    }
}
