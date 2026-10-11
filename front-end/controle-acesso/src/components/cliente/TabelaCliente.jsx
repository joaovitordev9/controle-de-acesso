import { Button } from "../ui/button";
import "./TabelaCliente.css"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import FormularioCliente from "./FormularioCliente";

function TabelaClientes({clientes, onEditar, onExcluir}) {

    const registrarEntrada = (cliente) => {
        console.log("Registrar entrada:", cliente);
    };

    return (
        
        <Table className="mx-auto w-full table-fixed ">
            <colgroup>
                <col className="w-[20%]" /> {/* Nome */}
                <col className="w-[14%]" /> {/* CPF */}
                <col className="w-[12%]" /> {/* Telefone */}
                <col className="w-[12%]" /> {/* Cidade */}
                <col className="w-[12%]" /> {/* Código da Cota */}
                <col className="w-[10%]" /> {/* Categoria */}
                <col className="w-[20%]" /> {/* Ações */}
            </colgroup>
            <TableHeader>
                <TableRow>
                    <TableHead className="whitespace-normal break-words">Nome</TableHead>
                    <TableHead className="whitespace-normal break-words">CPF</TableHead>
                    <TableHead className="whitespace-normal break-words">Telefone</TableHead>
                    <TableHead className="whitespace-normal break-words">Cidade</TableHead>
                    <TableHead className="whitespace-normal break-words">Código da Cota</TableHead>
                    <TableHead className="whitespace-normal break-words">Categoria</TableHead>
                    <TableHead className="whitespace-normal break-words">Ações</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {clientes.map(cliente => (
                    <TableRow key={cliente.id} className="">
                        <TableCell className="whitespace-normal break-words">{cliente.nome}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.cpf}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.telefone}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.cidade}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.codigoDaCota}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.categoria}</TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                            <Dialog>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => onEditar(cliente)}
                                >
                                    Editar
                                </Button>
                            </Dialog>

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onExcluir(cliente)}
                            >
                                Excluir
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => registrarEntrada(cliente)}
                            >
                                Registrar entrada
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        
    );


}

export default TabelaClientes;
