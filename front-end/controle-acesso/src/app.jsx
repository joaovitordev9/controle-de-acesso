import { useState } from "react";
import Layout from "./components/Layout.jsx";
import Clientes from "./pages/Cliente.jsx";
import Autorizacoes from "./pages/Autorizacoes.jsx";
import Convites from "./pages/Convites.jsx";
import Relatorio from "./pages/Relatorio.jsx";
import Objetos from "./pages/Objetos.jsx";
import Emprestimos from "./pages/Emprestimos.jsx";
import ListaNegra from "./pages/ListaNegra.jsx";

const ABAS = [
    { chave: "clientes", rotulo: "Clientes" },
    { chave: "autorizacoes", rotulo: "Autorizações" },
    { chave: "convites", rotulo: "Convites" },
    { chave: "objetos", rotulo: "Objetos" },
    { chave: "emprestimos", rotulo: "Empréstimos" },
    { chave: "lista-negra", rotulo: "Lista Negra" },
    { chave: "relatorio", rotulo: "Relatório" },
];

function App() {
    const [paginaAtual, setPaginaAtual] = useState("clientes");

    return (
        <Layout paginaAtual={paginaAtual} onNavegar={setPaginaAtual} abas={ABAS}>
            {paginaAtual === "clientes" && <Clientes />}
            {paginaAtual === "autorizacoes" && <Autorizacoes />}
            {paginaAtual === "convites" && <Convites />}
            {paginaAtual === "objetos" && <Objetos />}
            {paginaAtual === "emprestimos" && <Emprestimos />}
            {paginaAtual === "lista-negra" && <ListaNegra />}
            {paginaAtual === "relatorio" && <Relatorio />}
        </Layout>
    );
}

export default App;
