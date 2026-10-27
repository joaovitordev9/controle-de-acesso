// Executa antes da tela React. Lê o endereço do servidor passado pelo processo
// principal (--api-url=...) e expõe em window.__API_URL__, que a camada de API
// (src/services/api.js) usa como BASE_URL.
const arg = process.argv.find((a) => a.startsWith("--api-url="));
window.__API_URL__ = arg ? arg.slice("--api-url=".length) : "";
