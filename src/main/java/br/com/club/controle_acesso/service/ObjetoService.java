package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.dto.ObjetoRequest;
import br.com.club.controle_acesso.dto.ObjetoResponse;
import br.com.club.controle_acesso.entity.Objeto;
import br.com.club.controle_acesso.exception.RecursoNaoEncontradoException;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.EmprestadoObjetoProjection;
import br.com.club.controle_acesso.repository.EmprestimoRepository;
import br.com.club.controle_acesso.repository.ObjetoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ObjetoService {

    private final ObjetoRepository objetoRepository;
    private final EmprestimoRepository emprestimoRepository;

    public ObjetoService(ObjetoRepository objetoRepository,
                         EmprestimoRepository emprestimoRepository) {
        this.objetoRepository = objetoRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<ObjetoResponse> listarObjetos() {
        // Uma query só traz o total emprestado de todos os objetos (em vez de 1 por objeto).
        Map<Long, Integer> emprestadoPorObjeto = new HashMap<>();
        for (EmprestadoObjetoProjection p : emprestimoRepository.somarEmprestadoEmAbertoPorObjeto()) {
            emprestadoPorObjeto.put(p.getObjetoId(), (int) p.getTotal());
        }

        return objetoRepository.findAll()
                .stream()
                .map(objeto -> ObjetoResponse.preencher(
                        objeto, emprestadoPorObjeto.getOrDefault(objeto.getId(), 0)))
                .toList();
    }

    public ObjetoResponse cadastrarObjeto(ObjetoRequest objetoRequest) {
        Objeto objeto = new Objeto();
        objetoRequest.preencherObjeto(objeto);
        objeto = objetoRepository.save(objeto);
        return ObjetoResponse.preencher(objeto, 0);
    }

    @Transactional
    public ObjetoResponse alterarObjeto(Long id, ObjetoRequest objetoRequest) {
        Objeto objeto = objetoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Objeto não encontrado"));

        int emprestada = emprestimoRepository.somarEmprestadoEmAberto(id);
        if (objetoRequest.getQuantidade_total() < emprestada) {
            throw new RegraNegocioException(
                    "A quantidade não pode ser menor que as " + emprestada + " unidade(s) emprestada(s).");
        }

        objetoRequest.preencherObjeto(objeto);
        objeto = objetoRepository.save(objeto);
        return ObjetoResponse.preencher(objeto, emprestada);
    }

    @Transactional
    public void deletarObjeto(Long id) {
        if (!objetoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Objeto não encontrado");
        }
        if (emprestimoRepository.existsByObjetoIdAndDataDevolucaoIsNull(id)) {
            throw new RegraNegocioException("Objeto com unidades emprestadas não pode ser removido.");
        }
        objetoRepository.deleteById(id);
    }
}
