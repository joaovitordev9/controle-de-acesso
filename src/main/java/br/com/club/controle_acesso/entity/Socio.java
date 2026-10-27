package br.com.club.controle_acesso.entity;

import br.com.club.controle_acesso.enums.PapelSocio;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("SOCIO")
@Getter
@Setter
public class Socio extends Pessoa {

    @ManyToOne
    @JoinColumn(name = "cota_id")
    private Cota cota;

    @Enumerated(EnumType.STRING)
    private PapelSocio papel;

    private boolean diretor;

}
