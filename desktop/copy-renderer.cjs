// Copia o build do frontend (front-end/controle-acesso/dist) para desktop/renderer,
// que é o que o Electron empacota e carrega. Rode `npm run build` no frontend antes.
const fs = require("fs");
const path = require("path");

const origem = path.join(__dirname, "..", "front-end", "controle-acesso", "dist");
const destino = path.join(__dirname, "renderer");

if (!fs.existsSync(origem)) {
  console.error(
    "\n[ERRO] Build do frontend não encontrado em:\n  " +
      origem +
      '\n\nRode primeiro, dentro de front-end/controle-acesso:\n  npm install\n  npm run build\n'
  );
  process.exit(1);
}

fs.rmSync(destino, { recursive: true, force: true });
fs.cpSync(origem, destino, { recursive: true });
console.log("Tela copiada para:", destino);
