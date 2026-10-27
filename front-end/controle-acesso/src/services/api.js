// Camada única de acesso à API.
// Prioridade da URL base:
//  1. window.__API_URL__  -> injetado em tempo de execução pelo app desktop (Electron),
//     permitindo apontar cada PC para o servidor correto sem recompilar.
//  2. VITE_API_URL        -> usado no desenvolvimento com `npm run dev` (.env).
//  3. mesma origem ("")   -> quando a tela é servida pelo próprio backend.
export const BASE_URL =
    (typeof window !== "undefined" && window.__API_URL__) ||
    import.meta.env.VITE_API_URL ||
    "";

async function requisicao(caminho, opcoes = {}) {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
        headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) },
        ...opcoes,
    });

    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;

    if (!resposta.ok) {
        const mensagem = (dados && dados.mensagem) || `Erro ${resposta.status}`;
        const erro = new Error(mensagem);
        erro.status = resposta.status;
        erro.dados = dados;
        throw erro;
    }

    return dados;
}

export const apiGet = (caminho) => requisicao(caminho);
export const apiPost = (caminho, corpo) =>
    requisicao(caminho, { method: "POST", body: JSON.stringify(corpo) });
export const apiPut = (caminho, corpo) =>
    requisicao(caminho, { method: "PUT", body: JSON.stringify(corpo) });
export const apiDelete = (caminho) => requisicao(caminho, { method: "DELETE" });
