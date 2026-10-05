package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Entrada;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntradaRepository extends JpaRepository<Entrada, Long> {
}
