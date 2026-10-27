package br.com.club.controle_acesso.dto;

import br.com.club.controle_acesso.entity.Socio;
import br.com.club.controle_acesso.enums.Categoria;
import br.com.club.controle_acesso.enums.PapelSocio;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SocioRequest {

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;
    private String cidade;
    private String telefone;
    @NotBlank(message = "O CPF é obrigatório.")
    private String cpf;

    // Código da cota a que o sócio pertence (obrigatório para sócio).
    @NotBlank(message = "O código da cota é obrigatório para sócio.")
    private String codigo_cota;

    private Categoria categoria;

    // Papel do sócio na cota; ignorado quando a cota já possui titular (vira dependente).
    private PapelSocio papel;

    // Diretor => a cota passa a ter 2 cortesias.
    private boolean diretor;

    // Convite especial: quando marcado, informa a quantidade (1 a 5).
    private boolean tem_convite_especial;
    private int qtd_convite_especial;

    public void preencherSocio(Socio socio) {
        socio.setNome(nome);
        socio.setCidade(cidade);
        socio.setTelefone(telefone);
        socio.setCpf(cpf);
        socio.setCodigo_cota(codigo_cota);
        socio.setCategoria(categoria == null ? Categoria.SOCIO : categoria);
        socio.setDiretor(diretor);
    }
}
