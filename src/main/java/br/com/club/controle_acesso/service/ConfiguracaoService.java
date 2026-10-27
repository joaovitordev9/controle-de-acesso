package br.com.club.controle_acesso.service;

import br.com.club.controle_acesso.entity.Configuracao;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.ConfiguracaoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Configuração centralizada do sistema.
 *
 * O prazo de ocupação do convite é definido por uma HORA DE RENOVAÇÃO diária
 * (padrão 04:00). Uma entrada confirmada ocupa o convite até a próxima ocorrência
 * dessa hora. Ex.: entrou às 14h de hoje -> término às 04h de amanhã.
 *
 * Para alterar o horário, mude o valor da chave "hora_renovacao_convite" na tabela
 * `configuracao` (0 a 23). Não há valores fixos espalhados pelo código.
 */
@Service
public class ConfiguracaoService {

    public static final String CHAVE_HORA_RENOVACAO = "hora_renovacao_convite";
    private static final int HORA_PADRAO = 4;

    private final ConfiguracaoRepository configuracaoRepository;

    public ConfiguracaoService(ConfiguracaoRepository configuracaoRepository) {
        this.configuracaoRepository = configuracaoRepository;
    }

    @PostConstruct
    public void inicializar() {
        if (!configuracaoRepository.existsById(CHAVE_HORA_RENOVACAO)) {
            configuracaoRepository.save(new Configuracao(CHAVE_HORA_RENOVACAO, String.valueOf(HORA_PADRAO)));
        }
    }

    public int getHoraRenovacao() {
        return configuracaoRepository.findById(CHAVE_HORA_RENOVACAO)
                .map(configuracao -> {
                    try {
                        return Integer.parseInt(configuracao.getValor());
                    } catch (NumberFormatException e) {
                        return HORA_PADRAO;
                    }
                })
                .orElse(HORA_PADRAO);
    }

    public void setHoraRenovacao(int hora) {
        if (hora < 0 || hora > 23) {
            throw new RegraNegocioException("A hora de renovação deve ser de 0 a 23.");
        }
        configuracaoRepository.save(new Configuracao(CHAVE_HORA_RENOVACAO, String.valueOf(hora)));
    }

    /**
     * Próxima ocorrência da hora de renovação, estritamente após {@code inicio}.
     * Esse valor é gravado em cada utilização, então mudar a hora depois não altera
     * utilizações já registradas (apenas as próximas).
     */
    public LocalDateTime calcularTermino(LocalDateTime inicio) {
        int hora = getHoraRenovacao();
        LocalDateTime termino = inicio.toLocalDate().atTime(hora, 0);
        if (!termino.isAfter(inicio)) {
            termino = termino.plusDays(1);
        }
        return termino;
    }
}
