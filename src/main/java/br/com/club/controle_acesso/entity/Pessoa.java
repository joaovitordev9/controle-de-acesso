package br.com.club.controle_acesso.entity;

import br.com.club.controle_acesso.enums.Categoria;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_pessoa")
@DiscriminatorValue("PESSOA")
@Getter
@Setter
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String cidade;
    private String telefone;
    private String codigo_cota;

    @Column(unique = true, nullable = false)
    private String cpf;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    public String getCategoriaNome() {
        return categoria == null ? "Sem categoria" : categoria.getDescricao();
    }

}
