package br.com.club.controle_acesso.repository;

import br.com.club.controle_acesso.entity.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    // Soma de unidades de um objeto que estão emprestadas agora (ainda não devolvidas).
    @Query("select coalesce(sum(e.quantidade), 0) from Emprestimo e " +
            "where e.objeto.id = :objetoId and e.dataDevolucao is null")
    int somarEmprestadoEmAberto(@Param("objetoId") Long objetoId);

    // Soma em aberto de TODOS os objetos numa query só (evita N+1 na listagem de objetos).
    @Query("select e.objeto.id as objetoId, coalesce(sum(e.quantidade), 0) as total " +
            "from Emprestimo e where e.dataDevolucao is null group by e.objeto.id")
    List<EmprestadoObjetoProjection> somarEmprestadoEmAbertoPorObjeto();

    // Empréstimos ainda em aberto (ordenados do mais recente ao mais antigo).
    List<Emprestimo> findByDataDevolucaoIsNullOrderByDataEmprestimoDesc();

    // Histórico completo (em aberto + devolvidos).
    List<Emprestimo> findAllByOrderByDataEmprestimoDesc();

    // Indica se o objeto possui alguma unidade emprestada (bloqueia remoção).
    boolean existsByObjetoIdAndDataDevolucaoIsNull(Long objetoId);

    // Vínculos de uma pessoa (usados ao excluir o cliente).
    long countByPessoaId(Long pessoaId);
    long countByPessoaIdAndDataDevolucaoIsNull(Long pessoaId);
    void deleteByPessoaId(Long pessoaId);
}
