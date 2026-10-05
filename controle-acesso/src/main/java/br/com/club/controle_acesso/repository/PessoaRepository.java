package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
}
