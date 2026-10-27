package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Socio;
import br.com.club.controle_acesso.enums.PapelSocio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocioRepository extends JpaRepository<Socio, Long> {

    List<Socio> findByCotaId(Long cotaId);

    boolean existsByCotaIdAndPapel(Long cotaId, PapelSocio papel);
}
