package br.com.club.controle_acesso.enums;

public enum PapelSocio {
    TITULAR("Titular"),
    DEPENDENTE("Dependente");

    private final String descricao;

    PapelSocio(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
