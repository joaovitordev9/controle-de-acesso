package br.com.club.controle_acesso.repository;

// Projeção da soma de unidades em aberto por objeto.
public interface EmprestadoObjetoProjection {
    Long getObjetoId();
    long getTotal();
}
