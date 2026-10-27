// Processo principal do Electron.
// Responsabilidades:
//  - Guardar/ler o endereço do servidor (config.json na pasta de dados do usuário).
//  - Na primeira execução (ou sem endereço), abrir a tela de configuração.
//  - Abrir a janela do aplicativo carregando o React embutido (pasta renderer/),
//    injetando o endereço do servidor para a camada de API usar.

const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const net = require("net");
const { spawn } = require("child_process");

const PORTA_BACKEND = 8485;

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

function lerConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function salvarConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (e) {
    console.error("Falha ao salvar config:", e);
  }
}

let janelaPrincipal = null;
let janelaSetup = null;

function abrirSetup() {
  if (janelaSetup) {
    janelaSetup.focus();
    return;
  }
  janelaSetup = new BrowserWindow({
    width: 600,
    height: 720,
    resizable: false,
    center: true,
    title: "Configurar servidor",
    autoHideMenuBar: true,
    webPreferences: {
      // Tela local e confiável: habilitamos node só para o formulário simples.
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  janelaSetup.setMenuBarVisibility(false);
  janelaSetup.loadFile(path.join(__dirname, "setup.html"));
  janelaSetup.on("closed", () => {
    janelaSetup = null;
  });
}

async function abrirPrincipal(apiUrl, aguardarServidorLocal = false) {
  janelaPrincipal = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    title: "Controle de Acesso",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: false,
      // O preload lê este argumento e expõe em window.__API_URL__
      additionalArguments: ["--api-url=" + apiUrl],
    },
  });

  janelaPrincipal.maximize();
  janelaPrincipal.show();

  janelaPrincipal.on("closed", () => {
    janelaPrincipal = null;
  });

  // No PC servidor, mostra "Iniciando o servidor…" e só carrega a tela quando a
  // porta do backend responder (evita o "Failed to fetch" enquanto o backend sobe).
  if (aguardarServidorLocal) {
    janelaPrincipal.loadURL(telaCarregando());
    await esperarPorta(PORTA_BACKEND, 90000);
    if (!janelaPrincipal) return; // app foi fechado durante a espera
  }

  janelaPrincipal.loadFile(path.join(__dirname, "renderer", "index.html"));
}

// Este PC é o servidor quando o endereço aponta para a própria máquina.
function ehModoServidor(apiUrl) {
  return /\/\/(localhost|127\.0\.0\.1)([:/]|$)/i.test(apiUrl || "");
}

// Testa se já existe alguém escutando na porta (ex.: servidor já ligado pelo .bat).
function portaAtiva(porta) {
  return new Promise((resolve) => {
    const socket = net.connect(porta, "127.0.0.1");
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    const naoAtiva = () => {
      socket.destroy();
      resolve(false);
    };
    socket.once("timeout", naoAtiva);
    socket.once("error", naoAtiva);
  });
}

// Espera a porta responder, até o tempo limite (para só carregar a tela quando o servidor estiver pronto).
async function esperarPorta(porta, timeoutMs) {
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    if (await portaAtiva(porta)) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

// Caminho do jar do backend: embutido no app (produção) ou na pasta target (dev).
function caminhoJar() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "server", "controle-acesso.jar");
  }
  return path.join(__dirname, "..", "target", "controle-acesso-0.0.1-SNAPSHOT.jar");
}

// Sobe o backend automaticamente no PC servidor. Fica rodando mesmo se o app fechar
// (detached + unref), para não derrubar os PCs clientes.
async function iniciarBackendLocal() {
  if (await portaAtiva(PORTA_BACKEND)) return; // já está no ar
  const jar = caminhoJar();
  if (!fs.existsSync(jar)) {
    console.error("Jar do servidor não encontrado:", jar);
    return;
  }
  const opts = {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    cwd: path.dirname(jar),
  };
  // javaw não abre janela de console; se não existir, cai para java.
  const filho = spawn("javaw", ["-jar", jar], opts);
  filho.on("error", (e) => {
    if (e && e.code === "ENOENT") {
      const alt = spawn("java", ["-jar", jar], opts);
      alt.on("error", (e2) => console.error("Falha ao iniciar o servidor (java):", e2));
      alt.unref();
    } else {
      console.error("Falha ao iniciar o servidor (javaw):", e);
    }
  });
  filho.unref();
}

// Tela simples de "carregando" enquanto o servidor local sobe.
function telaCarregando() {
  const html = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><style>
    html,body{height:100%;margin:0;font-family:"Segoe UI",system-ui,sans-serif;
    background:linear-gradient(160deg,#0f172a,#111f3b);color:#e2e8f0;
    display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px}
    .sp{width:46px;height:46px;border:4px solid #334155;border-top-color:#3b82f6;
    border-radius:50%;animation:g 1s linear infinite}
    @keyframes g{to{transform:rotate(360deg)}}
    h1{font-size:19px;font-weight:600;margin:0}p{color:#94a3b8;font-size:14px;margin:0}
    </style></head><body><div class="sp"></div>
    <h1>Iniciando o servidor…</h1><p>Aguarde alguns segundos.</p></body></html>`;
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}

async function iniciar() {
  const config = lerConfig();
  if (!config.apiUrl) {
    abrirSetup();
    return;
  }
  const servidor = ehModoServidor(config.apiUrl);
  if (servidor) iniciarBackendLocal();
  abrirPrincipal(config.apiUrl, servidor);
}

// Formulário de configuração confirma o endereço do servidor.
ipcMain.on("salvar-servidor", (_evento, apiUrl) => {
  salvarConfig({ apiUrl });
  if (janelaSetup) janelaSetup.close();
  if (janelaPrincipal) {
    janelaPrincipal.close();
  }
  const servidor = ehModoServidor(apiUrl);
  if (servidor) iniciarBackendLocal();
  abrirPrincipal(apiUrl, servidor);
});

ipcMain.handle("ler-servidor", () => lerConfig().apiUrl || "");

// Garante uma única instância do app.
const temLock = app.requestSingleInstanceLock();
if (!temLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const janela = janelaPrincipal || janelaSetup;
    if (janela) {
      if (janela.isMinimized()) janela.restore();
      janela.focus();
    }
  });

  app.whenReady().then(() => {
    // Atalho para reabrir a configuração do servidor a qualquer momento.
    const menu = Menu.buildFromTemplate([
      {
        label: "Arquivo",
        submenu: [
          { label: "Configurar servidor…", accelerator: "CmdOrCtrl+Shift+C", click: abrirSetup },
          { label: "Recarregar", accelerator: "CmdOrCtrl+R", role: "reload" },
          { type: "separator" },
          { label: "Sair", role: "quit" },
        ],
      },
    ]);
    Menu.setApplicationMenu(menu);

    iniciar();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) iniciar();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
