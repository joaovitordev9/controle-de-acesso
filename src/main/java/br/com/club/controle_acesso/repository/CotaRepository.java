package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Cota;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CotaRepository extends JpaRepository<Cota, Long> {

    Optional<Cota> findByCodigo(String codigo);

    // Carrega as cotas já com os sócios (evita N+1 ao montar a resposta).
    @Query("select distinct c from Cota c left join fetch c.socios")
    List<Cota> buscarTodasComSocios();

    // Carrega a cota com lock de escrita para checar o saldo sob concorrência.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cota c where c.id = :id")
    Optional<Cota> buscarParaAtualizacao(@Param("id") Long id);
}
