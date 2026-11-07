package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Autorizacao;
import br.com.club.controle_acesso.enums.SituacaoAutorizacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AutorizacaoRepository extends JpaRepository<Autorizacao, Long> {

    List<Autorizacao> findBySituacaoOrderByDataCriacaoDesc(SituacaoAutorizacao situacao);

    // Autorizações que apontam para uma pessoa cadastrada — usadas ao excluir o cliente.
    // JPQL explícito para navegar pessoaAutorizada.id sem ambiguidade do nome derivado.
    @Query("select count(a) from Autorizacao a where a.pessoaAutorizada.id = :pessoaId")
    long contarPorPessoaAutorizada(@Param("pessoaId") Long pessoaId);

    @Modifying
    @Query("delete from Autorizacao a where a.pessoaAutorizada.id = :pessoaId")
    void apagarPorPessoaAutorizada(@Param("pessoaId") Long pessoaId);
}
