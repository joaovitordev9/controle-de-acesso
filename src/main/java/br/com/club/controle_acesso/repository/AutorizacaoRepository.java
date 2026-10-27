package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Autorizacao;
import br.com.club.controle_acesso.enums.SituacaoAutorizacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AutorizacaoRepository extends JpaRepository<Autorizacao, Long> {

    List<Autorizacao> findBySituacaoOrderByDataCriacaoDesc(SituacaoAutorizacao situacao);
}
