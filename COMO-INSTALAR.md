# Controle de Acesso — como instalar nos 2 PCs da recepção

O sistema tem **1 PC servidor** (guarda os dados) e os **demais PCs clientes**
(só usam). Todos rodam o **mesmo aplicativo** (`Controle de Acesso`), mudando
apenas para onde ele aponta.

```
PC 1 (SERVIDOR)                         PC 2 (CLIENTE)
MySQL + App (backend embutido)          App
porta 8485  <----------- WiFi -------->  aponta p/ IP do PC 1
(abrir o app já liga o servidor)
```

---

## Parte A — Gerar os arquivos (fazer 1 vez, em qualquer PC com Java + Node)

> **Antes do primeiro build**, ligue o **Modo de Desenvolvedor** do Windows:
> *Configurações → Privacidade e segurança → Para desenvolvedores → ligar
> "Modo de desenvolvedor"*. Sem isso, o gerador do instalador (electron-builder)
> falha com `Cannot create symbolic link ... O cliente não tem o privilégio
> necessário`. (Alternativa: rodar o `build-tudo.bat` como administrador.)

1. Dê **duplo clique em `build-tudo.bat`**.
   Ele gera dois resultados:
   - **Servidor:** `target\controle-acesso-0.0.1-SNAPSHOT.jar`
   - **Instalador do app:** dentro de `desktop\dist\` (um arquivo
     `Controle de Acesso Setup x.x.x.exe`)

Se der erro, leia a mensagem na tela (quase sempre é Java ou Node faltando).

> **Se o backend estiver rodando** (janela do `iniciar-servidor.bat` aberta),
> **feche-a antes** de rebuildar — senão o `clean` do Maven falha com
> `arquivo já está sendo usado por outro processo` (o `.jar` fica travado).

---

## Parte B — Configurar o PC SERVIDOR (PC 1)

1. **MySQL Server** instalado e rodando. **Não precisa** do MySQL Workbench
   (é só uma interface gráfica opcional). O banco `controle_acesso` é criado
   **automaticamente** no primeiro start (a URL usa `createDatabaseIfNotExist=true`
   e o `ddl-auto: update` cria as tabelas) — não precisa criá-lo na mão.
2. **Java 21** instalado (para rodar o `.jar`).
3. **Defina a senha do MySQL numa variável de ambiente** (ela NÃO fica mais no
   `application.yaml`). Abra o Prompt de Comando e rode:

   ```
   setx DB_PASSWORD "SUA_SENHA_DO_MYSQL"
   ```

   - Use a senha do usuário `root` do MySQL (no PC original era `0909`).
   - Se o usuário do MySQL não for `root`, defina também `setx DB_USERNAME "outro"`.
   - A variável só vale em **janelas novas** abertas depois do `setx` — feche e
     reabra o terminal / o `.bat`.
   - Sem essa variável o servidor **não liga** (erro
     `Could not resolve placeholder 'DB_PASSWORD'`).
4. **Libere o Firewall:** clique com o botão direito em
   **`liberar-firewall.bat` → Executar como administrador**. (Faz 1 vez.)
5. **Instale o app:** rode o `Controle de Acesso Setup ....exe` (de `desktop\dist\`).
6. Abra o app pelo ícone. Na primeira vez, escolha
   **"Este computador é o servidor"** → Salvar.
   - A partir daí, **abrir o app já liga o servidor sozinho** (o backend fica
     embutido no app). Aparece "Iniciando o servidor…" por alguns segundos e a
     tela abre. **Não precisa mais do `iniciar-servidor.bat`.**
   - O servidor **continua rodando em segundo plano mesmo se você fechar o app**,
     para não derrubar os PCs clientes. Ele só encerra ao desligar/reiniciar o PC
     (quando ligar o PC de novo, basta abrir o app uma vez).
7. **Descubra o IP deste PC** (vai precisar no PC 2):
   abra o Prompt de Comando, digite `ipconfig` e anote o **Endereço IPv4**
   (algo como `192.168.0.10`).

> **`iniciar-servidor.bat` agora é opcional** — serve só como alternativa manual
> (ex.: ligar o servidor sem abrir o app, ou diagnosticar com a janela de log
> visível). Se o app já tiver ligado o servidor, o `.bat` percebe que a porta
> 8485 está ocupada.

---

## Parte C — Configurar o PC CLIENTE (PC 2)

> Não precisa de MySQL, nem de Java, nem do `.jar`. Só o app.

1. Copie e rode o `Controle de Acesso Setup ....exe` neste PC.
2. Abra o app. Na primeira vez, escolha **"Conectar a outro computador"**
   e digite o **IP do PC 1** (ex.: `192.168.0.10`) → Salvar.
3. Pronto — a tela abre com os mesmos dados do servidor.

---

## Dicas / problemas comuns

- **Servidor fecha na hora com `Could not resolve placeholder 'DB_PASSWORD'`:**
  a variável de ambiente `DB_PASSWORD` não está definida (ou o terminal/`.bat`
  foi aberto antes do `setx`). Rode o `setx DB_PASSWORD "..."` (Parte B, passo 3)
  e abra uma **janela nova**.
- **"Não conecta" no PC 2:** confirme que o `iniciar-servidor.bat` está rodando
  no PC 1, que o firewall foi liberado (Parte B, passo 4) e que os dois PCs
  estão na **mesma rede WiFi**.
- **O IP mudou e parou de funcionar:** o roteador pode trocar o IP do PC 1.
  Peça para fixar (reserva de DHCP) o IP do PC servidor no roteador. Se mudar,
  reabra o app no PC 2 em **Arquivo → Configurar servidor** e corrija o IP.
- **Trocar o servidor depois:** no app, menu **Arquivo → Configurar servidor…**
  (ou `Ctrl+Shift+C`).
- **Atualizar o sistema:** rode `build-tudo.bat` de novo, substitua o `.jar` no
  PC 1 e reinstale o `.exe` nos PCs.
