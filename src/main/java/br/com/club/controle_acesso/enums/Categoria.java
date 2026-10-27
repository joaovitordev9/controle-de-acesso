package br.com.club.controle_acesso.enums;

public enum Categoria {
    SOCIO("Sócio"),
    CONVIDADO("Convidado"),
    NAUTICA("Náutica"),
    PRESTADOR_DE_SERVICO("Prestador de serviço"),
    DAY_USE("Day use"),
    RESTAURANTE("Restaurante"),
    CONVIDADO_SEM_FREQUENCIA("Convidado sem frequência"),
    CONVIDADO_COM_FREQUENCIA("Convidado com frequência");

    private final String descricao;

    Categoria(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
