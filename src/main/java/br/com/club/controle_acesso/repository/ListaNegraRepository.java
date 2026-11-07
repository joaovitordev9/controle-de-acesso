package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.ListaNegra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListaNegraRepository extends JpaRepository<ListaNegra, Long> {

    Optional<ListaNegra> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    List<ListaNegra> findAllByOrderByDataBloqueioDesc();
}
