package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Configuracao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracaoRepository extends JpaRepository<Configuracao, String> {
}
