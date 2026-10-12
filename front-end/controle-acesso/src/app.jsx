import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Categorias from "./pages/Categoria.jsx";
import { Settings } from "lucide-react";
import Clientes from "./pages/Cliente";



function App() {
    const [paginaAtual, setPaginaAtual] = useState("clientes");
    const [modoEscuro, setModoEscuro] = useState(
        () => localStorage.getItem("tema") === "dark"
    );

    useEffect(() => {
        document.documentElement.classList.toggle("dark", modoEscuro);
        localStorage.setItem("tema", modoEscuro ? "dark" : "light");
    }, [modoEscuro]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="fixed inset-x-0 top-0 z-50 border-b bg-background">
                <div className="flex h-14 items-center justify-between px-4">
                    <nav className="flex gap-2" aria-label="Páginas">
                        <Button
                            variant={paginaAtual === "clientes" ? "secondary" : "ghost"}
                            onClick={() => setPaginaAtual("clientes")}
                        >
                            Clientes
                        </Button>

                        <Button
                            variant={paginaAtual === "categorias" ? "secondary" : "ghost"}
                            onClick={() => setPaginaAtual("categorias")}
                        >
                            Categorias
                        </Button>
                    </nav>
                    {<details className="fixed right-4 top-4 z-50">
                        <summary
                            aria-label="Configurações"
                            title="Configurações"
                            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border bg-background hover:bg-accent"
                        >
                            <Settings className="size-4" />
                        </summary>

                        <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-popover p-2 shadow-md">
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setModoEscuro((atual) => !atual)}
                            >
                                {modoEscuro ? "Usar tema claro" : "Usar tema escuro"}
                            </Button>
                        </div>
                    </details>}
                </div>
            </header>

            <div className="pt-14">
                <div className={paginaAtual === "clientes" ? "block" : "hidden"}>
                    <Clientes />
                </div>

                <div className={paginaAtual === "categorias" ? "block" : "hidden"}>
                    <Categorias />
                </div>
            </div>
        </div>
    );
}

export default App;