package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Cota;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CotaRepository extends JpaRepository<Cota, Long> {

    Optional<Cota> findByCodigo(String codigo);

    // Carrega a cota com lock de escrita para checar o saldo sob concorrência.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cota c where c.id = :id")
    Optional<Cota> buscarParaAtualizacao(@Param("id") Long id);
}
