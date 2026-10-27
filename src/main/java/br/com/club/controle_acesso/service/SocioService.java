package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.dto.SocioRequest;
import br.com.club.controle_acesso.dto.SocioResponse;
import br.com.club.controle_acesso.entity.Cota;
import br.com.club.controle_acesso.entity.Socio;
import br.com.club.controle_acesso.enums.PapelSocio;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.CotaRepository;
import br.com.club.controle_acesso.repository.PessoaRepository;
import br.com.club.controle_acesso.repository.SocioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SocioService {

    private static final int MAX_CORTESIAS_DIRETOR = 2;
    private static final int MAX_CONVITES_ESPECIAIS = 5;

    private final SocioRepository socioRepository;
    private final CotaRepository cotaRepository;
    private final PessoaRepository pessoaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public SocioService(SocioRepository socioRepository,
                        CotaRepository cotaRepository,
                        PessoaRepository pessoaRepository) {
        this.socioRepository = socioRepository;
        this.cotaRepository = cotaRepository;
        this.pessoaRepository = pessoaRepository;
    }

    @Transactional(readOnly = true)
    public List<SocioResponse> listarSocios() {
        return socioRepository.findAll()
                .stream()
                .map(SocioResponse::preencherSocioResponse)
                .toList();
    }

    @Transactional
    public SocioResponse cadastrarSocio(SocioRequest request) {
        Socio socio = new Socio();
        request.preencherSocio(socio);

        Cota cota = cotaRepository.findByCodigo(request.getCodigo_cota()).orElse(null);
        boolean cotaNova = cota == null;
        if (cotaNova) {
            cota = new Cota();
            cota.setCodigo(request.getCodigo_cota());
        }

        PapelSocio papel = resolverPapel(request, cota, null);
        socio.setPapel(papel);

        if (papel == PapelSocio.TITULAR) {
            aplicarCotasDoTitular(cota, request);
            socio.setDiretor(request.isDiretor());
        } else {
            socio.setDiretor(false);
        }

        cota = cotaRepository.save(cota);
        socio.setCota(cota);

        socio = socioRepository.save(socio);
        return SocioResponse.preencherSocioResponse(socio);
    }

    @Transactional
    public SocioResponse alterarSocio(Long id, SocioRequest request) {
        Socio socio = socioRepository.findById(id).orElse(null);

        // Conversão: um cliente comum passou a ser sócio (muda o discriminador da herança).
        if (socio == null) {
            if (!pessoaRepository.existsById(id)) {
                throw new RecursoNaoEncontradoException("Pessoa não encontrada");
            }
            entityManager.createNativeQuery(
                            "UPDATE pessoa SET tipo_pessoa = 'SOCIO', diretor = FALSE WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            entityManager.flush();
            entityManager.clear();
            socio = socioRepository.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Sócio não encontrado"));
        }

        request.preencherSocio(socio);

        Cota cota = cotaRepository.findByCodigo(request.getCodigo_cota()).orElse(null);
        boolean cotaNova = cota == null;
        if (cotaNova) {
            cota = new Cota();
            cota.setCodigo(request.getCodigo_cota());
        }

        PapelSocio papel = resolverPapel(request, cota, socio.getId());
        socio.setPapel(papel);

        if (papel == PapelSocio.TITULAR) {
            aplicarCotasDoTitular(cota, request);
            socio.setDiretor(request.isDiretor());
        } else {
            socio.setDiretor(false);
        }

        cota = cotaRepository.save(cota);
        socio.setCota(cota);

        socio = socioRepository.save(socio);
        return SocioResponse.preencherSocioResponse(socio);
    }

    // Se a cota já tem titular (que não seja este sócio), o sócio entra como dependente.
    private PapelSocio resolverPapel(SocioRequest request, Cota cota, Long idSocioAtual) {
        if (cota.getId() != null) {
            Socio titular = cota.getTitular();
            if (titular != null && !titular.getId().equals(idSocioAtual)) {
                return PapelSocio.DEPENDENTE;
            }
        }
        return request.getPapel() == null ? PapelSocio.TITULAR : request.getPapel();
    }

    private void aplicarCotasDoTitular(Cota cota, SocioRequest request) {
        cota.setQtd_cortesias(request.isDiretor() ? MAX_CORTESIAS_DIRETOR : 0);

        int convites = 0;
        if (request.isTem_convite_especial()) {
            convites = request.getQtd_convite_especial();
            if (convites < 1 || convites > MAX_CONVITES_ESPECIAIS) {
                throw new RegraNegocioException("A quantidade de convites deve ser de 1 a " + MAX_CONVITES_ESPECIAIS + ".");
            }
        }
        cota.setQtd_convites_especiais(convites);
    }
}
