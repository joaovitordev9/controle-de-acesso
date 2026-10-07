package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
