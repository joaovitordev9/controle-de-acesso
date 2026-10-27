package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Entrada;
import br.com.club.controle_acesso.enums.TipoAutorizacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EntradaRepository extends JpaRepository<Entrada, Long> {

    // Conta utilizações ATIVAS de convite/cortesia de uma cota (término ainda no futuro).
    @Query("select count(e) from Entrada e where e.cota.id = :cotaId " +
            "and e.tipo_convite = :tipo and e.termino_previsto > :agora")
    long contarUtilizacoesAtivas(@Param("cotaId") Long cotaId,
                                 @Param("tipo") TipoAutorizacao tipo,
                                 @Param("agora") LocalDateTime agora);

    // Convites/cortesias que ainda estão ocupando a vaga (em uso agora).
    @Query("select e from Entrada e where e.tipo_convite is not null " +
            "and e.termino_previsto > :agora order by e.data_entrada desc")
    List<Entrada> buscarEmUso(@Param("agora") LocalDateTime agora);
}
