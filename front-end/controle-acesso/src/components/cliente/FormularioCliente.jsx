
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogClose} from "../ui/dialog";
// import "./FormularioCliente.css";

function FormularioCliente({ cliente, onSalvar, onCancelar }) {

    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        async function carregarCategorias() {
            try {
                const resposta = await fetch("http://localhost:8080/categorias");

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar as categorias.");
                }

                const dados = await resposta.json();
                setCategorias(dados);
            } catch (erro) {
                console.error("Erro ao carregar categorias:", erro);
            }
        }

        carregarCategorias();
    }, []);

    const [dados, setDados] = useState({
        nome: cliente ? cliente.nome || "" : "",
        cpf: cliente ? cliente.cpf || "" : "",
        telefone: cliente ? cliente.telefone || "" : "",
        cidade: cliente ? cliente.cidade || "" : "",
        codigoDaCota: cliente ? cliente.codigoDaCota || "" : "",
        categoria: cliente ? cliente.categoria || "" : ""
    });

    function atualizarCampo(evento) {
        const nomeCampo = evento.target.name;
        const valorCampo =
            nomeCampo === "codigoDaCota" && evento.target.value !== ""
                ? Number(evento.target.value)
                : evento.target.value;

        setDados({
            ...dados,
            [nomeCampo]: valorCampo
        });
    }

    function enviarFormulario(evento) {
        evento.preventDefault();
        console.log(dados);

        if (onSalvar) {
            onSalvar(dados);
        }
    }

    return (
        <form onSubmit={enviarFormulario} className="space-y-6">

            <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                    {cliente ? "Editar cliente" : "Cadastrar cliente"}
                </DialogTitle>

                <DialogDescription className="text-sm text-muted-foreground">
                    Preencha os dados para manter o cadastro atualizado.
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">

                <div className="col-span-2 grid gap-2">
                    <Label htmlFor="nome">Nome completo</Label>

                    <Input
                        type="text"
                        id="nome"
                        name="nome"
                        value={dados.nome}
                        onChange={atualizarCampo}
                        placeholder="Ex.: João Silva"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cpf">CPF</Label>

                    <Input
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={dados.cpf}
                        onChange={atualizarCampo}
                        placeholder="000.000.000-00"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>

                    <Input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={dados.telefone}
                        onChange={atualizarCampo}
                        placeholder="(00) 00000-0000"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>

                    <Input
                        type="text"
                        id="cidade"
                        name="cidade"
                        value={dados.cidade}
                        onChange={atualizarCampo}
                        placeholder="Digite a cidade"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="codigoDaCota">Código da cota</Label>

                    <Input
                        type="number"
                        min="0"
                        step="1"
                        required
                        id="codigoDaCota"
                        name="codigoDaCota"
                        value={dados.codigoDaCota}
                        onChange={atualizarCampo}
                        placeholder="Ex.: 151515"
                    />
                </div>

                <div className="col-span-2 grid gap-2">
                    <Label htmlFor="categoria">Categoria</Label>

                    <Select
                        value={dados.categoria}
                        onValueChange={function (valor) {
                            atualizarCampo({
                                target: {
                                    name: "categoria",
                                    value: valor
                                }
                            });
                        }}
                    >
                        <SelectTrigger id="categoria" className="w-full">
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>

                        <SelectContent>
                            {categorias.map((categoria) => (
                                <SelectItem
                                    key={categoria.id}
                                    value={String(categoria.id)}
                                >
                                    {categoria.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
                <DialogClose>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancelar}
                    >
                        Cancelar
                    </Button>
                </DialogClose>

                <Button type="submit">
                    {cliente ? "Salvar alterações" : "Cadastrar pessoa"}
                </Button>
            </div>

        </form>
    );
}

export default FormularioCliente;