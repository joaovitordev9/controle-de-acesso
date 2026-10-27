import { useState } from "react";
import Layout from "./components/Layout.jsx";
import Clientes from "./pages/Cliente.jsx";
import Autorizacoes from "./pages/Autorizacoes.jsx";
import Convites from "./pages/Convites.jsx";
import Relatorio from "./pages/Relatorio.jsx";

const ABAS = [
    { chave: "clientes", rotulo: "Clientes" },
    { chave: "autorizacoes", rotulo: "Autorizações" },
    { chave: "convites", rotulo: "Convites" },
    { chave: "relatorio", rotulo: "Relatório" },
];

function App() {
    const [paginaAtual, setPaginaAtual] = useState("clientes");

    return (
        <Layout paginaAtual={paginaAtual} onNavegar={setPaginaAtual} abas={ABAS}>
            {paginaAtual === "clientes" && <Clientes />}
            {paginaAtual === "autorizacoes" && <Autorizacoes />}
            {paginaAtual === "convites" && <Convites />}
            {paginaAtual === "relatorio" && <Relatorio />}
        </Layout>
    );
}

export default App;
