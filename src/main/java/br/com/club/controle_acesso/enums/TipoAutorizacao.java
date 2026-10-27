package br.com.club.controle_acesso.enums;

public enum TipoAutorizacao {
    CORTESIA("Cortesia"),
    CONVITE_ESPECIAL("Convite especial");

    private final String descricao;

    TipoAutorizacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
