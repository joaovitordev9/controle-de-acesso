package br.com.club.controle_acesso;

import br.com.club.controle_acesso.dto.*;
import br.com.club.controle_acesso.entity.Entrada;
import br.com.club.controle_acesso.enums.Categoria;
import br.com.club.controle_acesso.enums.PapelSocio;
import br.com.club.controle_acesso.enums.TipoAutorizacao;
import br.com.club.controle_acesso.exception.RegraNegocioException;
import br.com.club.controle_acesso.repository.*;
import br.com.club.controle_acesso.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class RegrasNegocioTest {

    @Autowired SocioService socioService;
    @Autowired PessoaService pessoaService;
    @Autowired AutorizacaoService autorizacaoService;
    @Autowired CotaService cotaService;
    @Autowired ConfiguracaoService configuracaoService;
    @Autowired ListaNegraService listaNegraService;
    @Autowired EntradaService entradaService;

    @Autowired EntradaRepository entradaRepository;
    @Autowired AutorizacaoRepository autorizacaoRepository;
    @Autowired PessoaRepository pessoaRepository;
    @Autowired CotaRepository cotaRepository;
    @Autowired ListaNegraRepository listaNegraRepository;

    private final AtomicInteger seq = new AtomicInteger();

    @BeforeEach
    void limpar() {
        entradaRepository.deleteAll();
        autorizacaoRepository.deleteAll();
        pessoaRepository.deleteAll();
        cotaRepository.deleteAll();
        listaNegraRepository.deleteAll();
    }

    // ---------- helpers ----------

    private String unico(String prefixo) {
        return prefixo + seq.incrementAndGet() + "-" + System.nanoTime();
    }

    /** Cria um sócio titular e devolve o id da cota. */
    private Long criarTitular(String codigo, boolean diretor, int convites) {
        SocioRequest req = new SocioRequest();
        req.setNome("Titular " + codigo);
        req.setCpf(unico("cpf"));
        req.setCodigo_cota(codigo);
        req.setCategoria(Categoria.SOCIO);
        req.setPapel(PapelSocio.TITULAR);
        req.setDiretor(diretor);
        req.setTem_convite_especial(convites > 0);
        req.setQtd_convite_especial(convites);
        SocioResponse resp = socioService.cadastrarSocio(req);
        return resp.getCota_id();
    }

    private Long criarPessoa(String nome) {
        PessoaRequest req = new PessoaRequest();
        req.setNome(nome);
        req.setCpf(unico("cpf"));
        req.setCategoria(Categoria.CONVIDADO);
        return pessoaService.cadastrarPessoa(req).getId();
    }

    private Long criarAutorizacao(Long cotaId, String nome) {
        AutorizacaoRequest req = new AutorizacaoRequest();
        req.setCota_id(cotaId);
        req.setNomeAutorizado(nome);
        return autorizacaoService.criar(req).getId();
    }

    private EntradaResponse confirmar(Long autId, Long pessoaId, TipoAutorizacao tipo) {
        ChegadaRequest req = new ChegadaRequest();
        req.setPessoa_id(pessoaId);
        req.setTipo(tipo);
        return autorizacaoService.confirmarEntrada(autId, req);
    }

    private CotaResponse saldo(Long cotaId) {
        return cotaService.buscarPorId(cotaId);
    }

    // ---------- testes ----------

    @Test
    @DisplayName("Criar autorização não consome convite")
    void criarAutorizacaoNaoConsome() {
        Long cota = criarTitular(unico("C"), false, 2);
        criarAutorizacao(cota, "Visitante");

        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(2);
        assertThat(autorizacaoService.listarPendentes()).hasSize(1);
    }

    @Test
    @DisplayName("Confirmar entrada ocupa exatamente um convite e registra o término")
    void confirmarConsomeUmConvite() {
        Long cota = criarTitular(unico("C"), false, 2);
        Long aut = criarAutorizacao(cota, "Visitante");
        Long pessoa = criarPessoa("Visitante");

        EntradaResponse entrada = confirmar(aut, pessoa, TipoAutorizacao.CONVITE_ESPECIAL);

        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(1);
        Entrada salva = entradaRepository.findById(entrada.getId()).orElseThrow();
        assertThat(salva.getTermino_previsto()).isAfter(LocalDateTime.now());
        assertThat(autorizacaoService.listarPendentes()).isEmpty(); // saiu dos pendentes
    }

    @Test
    @DisplayName("Esgotar os convites bloqueia a próxima entrada e não deixa saldo negativo")
    void esgotarBloqueia() {
        Long cota = criarTitular(unico("C"), false, 1);
        Long a1 = criarAutorizacao(cota, "P1");
        Long a2 = criarAutorizacao(cota, "P2");

        confirmar(a1, criarPessoa("P1"), TipoAutorizacao.CONVITE_ESPECIAL);

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> confirmar(a2, criarPessoa("P2"), TipoAutorizacao.CONVITE_ESPECIAL));
        assertThat(ex.getMessage()).contains("não possui convites");

        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(0); // nunca negativo
    }

    @Test
    @DisplayName("Cortesia é controlada separadamente do convite")
    void cortesiaSeparadaDoConvite() {
        Long cota = criarTitular(unico("C"), true, 2); // diretor: 2 cortesias + 2 convites
        Long aut = criarAutorizacao(cota, "Visitante");

        confirmar(aut, criarPessoa("Visitante"), TipoAutorizacao.CORTESIA);

        CotaResponse s = saldo(cota);
        assertThat(s.getCortesias_disponiveis()).isEqualTo(1);
        assertThat(s.getConvites_especiais_disponiveis()).isEqualTo(2); // convites intactos
    }

    @Test
    @DisplayName("Uma autorização confirmada não pode ser confirmada de novo")
    void naoConfirmaDuasVezes() {
        Long cota = criarTitular(unico("C"), false, 2);
        Long aut = criarAutorizacao(cota, "Visitante");
        Long pessoa = criarPessoa("Visitante");

        confirmar(aut, pessoa, TipoAutorizacao.CONVITE_ESPECIAL);

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> confirmar(aut, pessoa, TipoAutorizacao.CONVITE_ESPECIAL));
        assertThat(ex.getMessage()).contains("não é mais válida");
    }

    @Test
    @DisplayName("Convite é liberado automaticamente quando o prazo termina, preservando o histórico")
    void liberacaoPorPrazo() {
        Long cota = criarTitular(unico("C"), false, 2);
        Long aut = criarAutorizacao(cota, "Visitante");
        EntradaResponse entrada = confirmar(aut, criarPessoa("Visitante"), TipoAutorizacao.CONVITE_ESPECIAL);

        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(1);

        // Simula o fim do prazo: término no passado.
        Entrada salva = entradaRepository.findById(entrada.getId()).orElseThrow();
        salva.setTermino_previsto(LocalDateTime.now().minusHours(1));
        entradaRepository.save(salva);

        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(2); // liberou
        assertThat(entradaRepository.findById(entrada.getId())).isPresent();        // histórico mantido
    }

    @Test
    @DisplayName("Diretor recebe 2 cortesias e editar o cadastro não duplica")
    void diretorDuasCortesiasSemDuplicar() {
        String codigo = unico("C");
        Long cota = criarTitular(codigo, true, 0);
        assertThat(saldo(cota).getCortesias_total()).isEqualTo(2);

        // Edita o mesmo titular novamente como diretor -> continua 2 (não soma).
        Long titularId = saldo(cota).getTitular_id();
        SocioRequest edicao = new SocioRequest();
        edicao.setNome("Titular editado");
        edicao.setCpf(unico("cpf"));
        edicao.setCodigo_cota(codigo);
        edicao.setCategoria(Categoria.SOCIO);
        edicao.setPapel(PapelSocio.TITULAR);
        edicao.setDiretor(true);
        socioService.alterarSocio(titularId, edicao);

        assertThat(saldo(cota).getCortesias_total()).isEqualTo(2);
    }

    @Test
    @DisplayName("Cliente pode mudar de categoria (convidado <-> sócio) preservando o cadastro")
    void mudancaDeCategoria() {
        Long id = criarPessoa("Fulano");
        assertThat(pessoaRepository.findById(id).orElseThrow().getCategoria()).isEqualTo(Categoria.CONVIDADO);

        // Convidado -> Sócio
        SocioRequest viraSocio = new SocioRequest();
        viraSocio.setNome("Fulano");
        viraSocio.setCpf(unico("cpf"));
        viraSocio.setCodigo_cota(unico("C"));
        viraSocio.setCategoria(Categoria.SOCIO);
        viraSocio.setPapel(PapelSocio.TITULAR);
        socioService.alterarSocio(id, viraSocio);
        assertThat(socioService.listarSocios()).anyMatch(s -> s.getId().equals(id));

        // Sócio -> Convidado
        PessoaRequest viraConvidado = new PessoaRequest();
        viraConvidado.setNome("Fulano");
        viraConvidado.setCpf(unico("cpf"));
        viraConvidado.setCategoria(Categoria.CONVIDADO);
        pessoaService.alterarPessoa(id, viraConvidado);
        assertThat(socioService.listarSocios()).noneMatch(s -> s.getId().equals(id));
        assertThat(pessoaRepository.findById(id).orElseThrow().getCategoria()).isEqualTo(Categoria.CONVIDADO);
    }

    @Test
    @DisplayName("Segundo sócio da mesma cota entra como dependente automaticamente")
    void segundoSocioViraDependente() {
        String codigo = unico("C");
        criarTitular(codigo, false, 2);

        SocioRequest dep = new SocioRequest();
        dep.setNome("Dependente");
        dep.setCpf(unico("cpf"));
        dep.setCodigo_cota(codigo);
        dep.setCategoria(Categoria.SOCIO);
        dep.setPapel(PapelSocio.TITULAR); // pede titular, mas já há um -> vira dependente
        SocioResponse resp = socioService.cadastrarSocio(dep);

        assertThat(resp.getPapel()).isEqualTo("DEPENDENTE");
    }

    @Test
    @DisplayName("calcularTermino devolve a próxima ocorrência da hora de renovação")
    void calcularTerminoProximaRenovacao() {
        configuracaoService.setHoraRenovacao(4);

        assertThat(configuracaoService.calcularTermino(LocalDateTime.of(2026, 1, 1, 14, 0)))
                .isEqualTo(LocalDateTime.of(2026, 1, 2, 4, 0));
        assertThat(configuracaoService.calcularTermino(LocalDateTime.of(2026, 1, 1, 2, 0)))
                .isEqualTo(LocalDateTime.of(2026, 1, 1, 4, 0));
        assertThat(configuracaoService.calcularTermino(LocalDateTime.of(2026, 1, 1, 4, 0)))
                .isEqualTo(LocalDateTime.of(2026, 1, 2, 4, 0)); // exatamente 04:00 -> próximo dia
    }

    @Test
    @DisplayName("Confirmações simultâneas não ocupam o mesmo convite além da disponibilidade")
    void confirmacoesSimultaneasNaoUltrapassam() throws Exception {
        Long cota = criarTitular(unico("C"), false, 1); // apenas 1 convite
        Long a1 = criarAutorizacao(cota, "P1");
        Long a2 = criarAutorizacao(cota, "P2");
        Long p1 = criarPessoa("P1");
        Long p2 = criarPessoa("P2");

        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch largada = new CountDownLatch(1);
        AtomicInteger sucessos = new AtomicInteger();

        Future<?> f1 = pool.submit(() -> {
            await(largada);
            try { confirmar(a1, p1, TipoAutorizacao.CONVITE_ESPECIAL); sucessos.incrementAndGet(); }
            catch (Exception ignored) { }
        });
        Future<?> f2 = pool.submit(() -> {
            await(largada);
            try { confirmar(a2, p2, TipoAutorizacao.CONVITE_ESPECIAL); sucessos.incrementAndGet(); }
            catch (Exception ignored) { }
        });

        largada.countDown();
        f1.get(10, TimeUnit.SECONDS);
        f2.get(10, TimeUnit.SECONDS);
        pool.shutdown();

        assertThat(sucessos.get()).isEqualTo(1); // exatamente uma entrada entrou
        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(0);
        assertThat(saldo(cota).getConvites_especiais_utilizados()).isEqualTo(1); // não ultrapassou o concedido
    }

    private static void await(CountDownLatch latch) {
        try { latch.await(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    // ---------- lista negra ----------

    private ListaNegraResponse bloquearPessoa(Long pessoaId) {
        ListaNegraRequest req = new ListaNegraRequest();
        req.setPessoa_id(pessoaId);
        req.setMotivo("Briga na piscina");
        return listaNegraService.bloquear(req);
    }

    private EntradaDiretaRequest entradaDireta(Long cotaId, Long pessoaId) {
        EntradaDiretaRequest req = new EntradaDiretaRequest();
        req.setCota_id(cotaId);
        req.setPessoa_id(pessoaId);
        req.setTipo(TipoAutorizacao.CONVITE_ESPECIAL);
        return req;
    }

    @Test
    @DisplayName("Pessoa na lista negra não entra por autorização nem por entrada direta")
    void listaNegraBloqueiaEntrada() {
        Long cota = criarTitular(unico("C"), false, 2);
        Long pessoa = criarPessoa("Barrado");
        bloquearPessoa(pessoa);

        Long aut = criarAutorizacao(cota, "Barrado");
        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> confirmar(aut, pessoa, TipoAutorizacao.CONVITE_ESPECIAL));
        assertThat(ex.getMessage()).contains("Lista Negra").contains("Briga na piscina");

        assertThrows(RegraNegocioException.class,
                () -> entradaService.registrarEntradaDireta(entradaDireta(cota, pessoa)));

        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(2); // nada consumido
    }

    @Test
    @DisplayName("CPF avulso bloqueado vale para quem for cadastrado depois, com ou sem pontuação")
    void listaNegraCpfAvulso() {
        ListaNegraRequest req = new ListaNegraRequest();
        req.setCpf("123.456.789-00");
        req.setNome("Fulano");
        req.setMotivo("Proibido pela diretoria");
        ListaNegraResponse registro = listaNegraService.bloquear(req);
        assertThat(registro.getCpf()).isEqualTo("12345678900");
        assertThat(registro.getPessoa_id()).isNull();

        PessoaRequest pr = new PessoaRequest();
        pr.setNome("Fulano de Tal");
        pr.setCpf("12345678900");
        pr.setCategoria(Categoria.CONVIDADO);
        PessoaResponse pessoa = pessoaService.cadastrarPessoa(pr);
        assertThat(pessoa.isBloqueado()).isTrue();
        assertThat(pessoa.getMotivo_bloqueio()).isEqualTo("Proibido pela diretoria");
        assertThat(listaNegraService.listar().get(0).getPessoa_id()).isEqualTo(pessoa.getId());

        Long cota = criarTitular(unico("C"), false, 1);
        assertThrows(RegraNegocioException.class,
                () -> entradaService.registrarEntradaDireta(entradaDireta(cota, pessoa.getId())));
    }

    @Test
    @DisplayName("Desbloquear libera a entrada; CPF repetido na lista dá erro")
    void listaNegraDesbloquearEDuplicado() {
        Long cota = criarTitular(unico("C"), false, 1);
        Long pessoa = criarPessoa("Arrependido");
        ListaNegraResponse registro = bloquearPessoa(pessoa);

        RegraNegocioException dup = assertThrows(RegraNegocioException.class, () -> bloquearPessoa(pessoa));
        assertThat(dup.getMessage()).contains("já está na Lista Negra");

        listaNegraService.desbloquear(registro.getId());
        assertThat(pessoaService.listarPessoas().stream()
                .filter(p -> p.getId().equals(pessoa)).findFirst().orElseThrow().isBloqueado()).isFalse();

        entradaService.registrarEntradaDireta(entradaDireta(cota, pessoa));
        assertThat(saldo(cota).getConvites_especiais_disponiveis()).isEqualTo(0);
    }

    // ---------- lista negra: casos-limite ----------

    @Test
    @DisplayName("[LN] Botão Registrar entrada (POST /entradas) também respeita a Lista Negra")
    void ln_entradaSimplesBloqueada() {
        Long pessoa = criarPessoa("Barrado");
        bloquearPessoa(pessoa);
        EntradaRequest req = new EntradaRequest();
        req.setPessoa_id(pessoa);
        assertThrows(RegraNegocioException.class, () -> entradaService.cadastrarEntrada(req));
    }

    @Test
    @DisplayName("[LN] Excluir a pessoa não tira o CPF da Lista Negra; recadastro volta bloqueado")
    void ln_excluirPessoaMantemBloqueio() {
        PessoaRequest pr = new PessoaRequest();
        pr.setNome("Some e volta");
        pr.setCpf("987.654.321-00");
        pr.setCategoria(Categoria.CONVIDADO);
        Long id = pessoaService.cadastrarPessoa(pr).getId();
        bloquearPessoa(id);

        pessoaService.deletarPessoa(id);
        assertThat(listaNegraService.listar()).hasSize(1);
        assertThat(listaNegraService.listar().get(0).getPessoa_id()).isNull();

        pr.setCpf("98765432100");
        assertThat(pessoaService.cadastrarPessoa(pr).isBloqueado()).isTrue();
    }

    @Test
    @DisplayName("[LN] Trocar o CPF de quem está bloqueado não pode burlar a Lista Negra")
    void ln_trocarCpfNaoBurla() {
        Long id = criarPessoa("Espertinho");
        bloquearPessoa(id);
        PessoaRequest edicao = new PessoaRequest();
        edicao.setNome("Espertinho");
        edicao.setCpf("11122233344");
        edicao.setCategoria(Categoria.CONVIDADO);

        assertThrows(RegraNegocioException.class, () -> pessoaService.alterarPessoa(id, edicao));
    }

    @Test
    @DisplayName("[LN] CPF avulso inválido (vazio, curto, letras) é recusado")
    void ln_cpfAvulsoInvalido() {
        for (String cpf : new String[]{null, "", "   ", "abc", "123"}) {
            ListaNegraRequest req = new ListaNegraRequest();
            req.setCpf(cpf);
            req.setMotivo("x");
            assertThrows(RegraNegocioException.class, () -> listaNegraService.bloquear(req), "cpf=" + cpf);
        }
    }

    @Test
    @DisplayName("[LN] Motivo vazio ou longo demais é recusado com mensagem clara")
    void ln_motivoInvalido() {
        Long pessoa = criarPessoa("Sem motivo");
        for (String motivo : new String[]{null, "", "    ", "a".repeat(1001)}) {
            ListaNegraRequest req = new ListaNegraRequest();
            req.setPessoa_id(pessoa);
            req.setMotivo(motivo);
            RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> listaNegraService.bloquear(req));
            assertThat(ex.getMessage()).containsIgnoringCase("motivo");
        }
        ListaNegraRequest ok = new ListaNegraRequest();
        ok.setPessoa_id(pessoa);
        ok.setMotivo("a".repeat(1000));
        listaNegraService.bloquear(ok);
    }

    @Test
    @DisplayName("[LN] Bloquear pessoa inexistente e desbloquear duas vezes dão erro tratado")
    void ln_idsInexistentes() {
        ListaNegraRequest req = new ListaNegraRequest();
        req.setPessoa_id(999999L);
        req.setMotivo("x");
        assertThrows(br.com.club.controle_acesso.exception.RecursoNaoEncontradoException.class,
                () -> listaNegraService.bloquear(req));

        ListaNegraResponse r = bloquearPessoa(criarPessoa("Duas vezes"));
        listaNegraService.desbloquear(r.getId());
        assertThrows(br.com.club.controle_acesso.exception.RecursoNaoEncontradoException.class,
                () -> listaNegraService.desbloquear(r.getId()));
    }

    @Test
    @DisplayName("[LN] Duas pessoas bloqueando o mesmo CPF ao mesmo tempo: só um registro, sem erro 500")
    void ln_bloqueioConcorrente() throws Exception {
        Long pessoa = criarPessoa("Concorrente");
        int n = 8;
        ExecutorService pool = Executors.newFixedThreadPool(n);
        CountDownLatch largada = new CountDownLatch(1);
        AtomicInteger ok = new AtomicInteger();
        AtomicInteger regraNegocio = new AtomicInteger();
        AtomicInteger outros = new AtomicInteger();
        for (int i = 0; i < n; i++) {
            pool.submit(() -> {
                await(largada);
                try { bloquearPessoa(pessoa); ok.incrementAndGet(); }
                catch (RegraNegocioException e) { regraNegocio.incrementAndGet(); }
                catch (Exception e) { outros.incrementAndGet(); }
            });
        }
        largada.countDown();
        pool.shutdown();
        assertThat(pool.awaitTermination(30, TimeUnit.SECONDS)).isTrue();

        assertThat(ok.get()).isEqualTo(1);
        assertThat(outros.get()).as("erros não tratados").isZero();
        assertThat(listaNegraRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("[LN] Mesmo CPF com e sem pontuação conta como duplicado")
    void ln_duplicadoFormatosDiferentes() {
        ListaNegraRequest a = new ListaNegraRequest();
        a.setCpf("555.666.777-88"); a.setMotivo("x");
        listaNegraService.bloquear(a);
        ListaNegraRequest b = new ListaNegraRequest();
        b.setCpf(" 55566677788 "); b.setMotivo("y");
        assertThrows(RegraNegocioException.class, () -> listaNegraService.bloquear(b));
    }

    @Test
    @DisplayName("[LN] Listagem de pessoas traz o bloqueio e não quebra com CPF repetido em formatos diferentes")
    void ln_listagemComCpfsParecidos() {
        PessoaRequest p1 = new PessoaRequest();
        p1.setNome("Formatado"); p1.setCpf("222.333.444-55"); p1.setCategoria(Categoria.CONVIDADO);
        pessoaService.cadastrarPessoa(p1);
        PessoaRequest p2 = new PessoaRequest();
        p2.setNome("Sem pontos"); p2.setCpf("22233344455"); p2.setCategoria(Categoria.CONVIDADO);
        pessoaService.cadastrarPessoa(p2);

        ListaNegraRequest req = new ListaNegraRequest();
        req.setCpf("22233344455"); req.setMotivo("x");
        listaNegraService.bloquear(req);

        assertThat(pessoaService.listarPessoas()).allMatch(PessoaResponse::isBloqueado);
        assertThat(listaNegraService.listar()).hasSize(1);
    }
}
