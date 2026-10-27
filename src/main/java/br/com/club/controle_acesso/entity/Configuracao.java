package br.com.club.controle_acesso.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// Configuração centralizada do sistema (chave/valor). Ex.: hora de renovação dos convites.
@Entity
@Getter
@Setter
public class Configuracao {

    @Id
    private String chave;

    private String valor;

    public Configuracao() {
    }

    public Configuracao(String chave, String valor) {
        this.chave = chave;
        this.valor = valor;
    }
}
