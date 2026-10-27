package br.com.club.controle_acesso.entity;

import br.com.club.controle_acesso.enums.PapelSocio;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Cota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigo;

    // Cortesias: 2 quando o titular é diretor, 0 caso contrário.
    private int qtd_cortesias;

    // Convite especial: 0 a 5, informado no cadastro do titular.
    private int qtd_convites_especiais;

    @OneToMany(mappedBy = "cota")
    private List<Socio> socios = new ArrayList<>();

    @OneToMany(mappedBy = "cota")
    private List<Autorizacao> autorizacoes = new ArrayList<>();

    public Socio getTitular() {
        return socios.stream()
                .filter(socio -> socio.getPapel() == PapelSocio.TITULAR)
                .findFirst()
                .orElse(null);
    }

    public String getTitularNome() {
        Socio titular = getTitular();
        return titular == null ? "Sem titular" : titular.getNome();
    }
}
