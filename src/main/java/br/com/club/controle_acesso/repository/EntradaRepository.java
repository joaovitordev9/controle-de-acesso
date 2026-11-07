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

    // Indica se a pessoa já está ocupando ALGUM convite/cortesia neste momento
    // (não pode ser colocada em outro até o término ou até ser liberada).
    @Query("select count(e) > 0 from Entrada e where e.pessoa.id = :pessoaId " +
            "and e.tipo_convite is not null and e.termino_previsto > :agora")
    boolean pessoaEmUso(@Param("pessoaId") Long pessoaId, @Param("agora") LocalDateTime agora);

    // Uso ativo de TODAS as cotas numa query só (evita N+1 na listagem de cotas).
    @Query("select e.cota.id as cotaId, e.tipo_convite as tipo, count(e) as total " +
            "from Entrada e where e.tipo_convite is not null and e.termino_previsto > :agora " +
            "group by e.cota.id, e.tipo_convite")
    List<UsoAtivoCotaProjection> contarUtilizacoesAtivasPorCota(@Param("agora") LocalDateTime agora);

    // Entradas vinculadas a uma pessoa (como visitante ou como titular) — usadas ao excluir o cliente.
    long countByPessoaIdOrTitularId(Long pessoaId, Long titularId);
    void deleteByPessoaIdOrTitularId(Long pessoaId, Long titularId);
}
