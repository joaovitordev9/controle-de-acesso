package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Objeto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObjetoRepository extends JpaRepository<Objeto, Long> {
}
