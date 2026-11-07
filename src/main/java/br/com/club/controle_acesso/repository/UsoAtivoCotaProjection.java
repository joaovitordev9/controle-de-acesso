package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.enums.TipoAutorizacao;

// Projeção da contagem de convites/cortesias em uso, agrupada por cota e tipo.
public interface UsoAtivoCotaProjection {
    Long getCotaId();
    TipoAutorizacao getTipo();
    long getTotal();
}
