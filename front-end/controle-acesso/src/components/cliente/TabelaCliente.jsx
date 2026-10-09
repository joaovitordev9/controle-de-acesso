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

function TabelaClientes({clientes, onEditar, onExcluir}) {

    const registrarEntrada = (cliente) => {
        console.log("Registrar entrada:", cliente);
    };

    return (
        <div className="">
            <Table className="">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Código da Cota</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {clientes.map(cliente => (
                        <TableRow key={cliente.id} className="">
                            <TableCell className="">{cliente.nome}</TableCell>
                            <TableCell className="">{cliente.cpf}</TableCell>
                            <TableCell className="">{cliente.telefone}</TableCell>
                            <TableCell className="">{cliente.cidade}</TableCell>
                            <TableCell className="">{cliente.codigoDaCota}</TableCell>
                            <TableCell className="">{cliente.categoria}</TableCell>


                            <TableCell className="">
                                <div className="flex gap-2">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => onEditar(cliente)}
                                    >
                                        Editar
                                    </Button>

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
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );


}

export default TabelaClientes;
