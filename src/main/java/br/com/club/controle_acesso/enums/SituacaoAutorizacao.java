package br.com.club.controle_acesso.enums;

public enum SituacaoAutorizacao {
    PENDENTE,   // sócio liberou a pessoa, entrada ainda não confirmada (não ocupa convite)
    CONFIRMADA  // entrada confirmada na portaria; fica no histórico
}
