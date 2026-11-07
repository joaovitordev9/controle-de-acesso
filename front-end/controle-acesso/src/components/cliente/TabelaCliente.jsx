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
import { ShieldBan } from "lucide-react";
import { rotuloCategoria } from "../../lib/dominio";

function TabelaClientes({ clientes, onEditar, onExcluir, onRegistrarEntrada }) {

    return (
        <div className="overflow-hidden rounded-xl border">

            <Table className="mx-auto w-full table-fixed ">
                <colgroup>
                    <col className="w-[18%]" /> {/* Nome */}
                    <col className="w-[14%]" /> {/* CPF */}
                    <col className="w-[12%]" /> {/* Telefone */}
                    <col className="w-[12%]" /> {/* Cidade */}
                    <col className="w-[12%]" /> {/* Código da Cota */}
                    <col className="w-[10%]" /> {/* Categoria */}
                    <col className="w-[22%]" /> {/* Ações */}
                </colgroup>
                <TableHeader className="bg-muted">
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
                {clientes.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            Nenhum cliente encontrado.
                        </TableCell>
                    </TableRow>
                ) : (
                    clientes.map(cliente => (
                    <TableRow
                        key={cliente.id}
                        className={cliente.bloqueado ? "bg-destructive/10 text-destructive hover:bg-destructive/15" : undefined}
                    >
                        <TableCell className="whitespace-normal break-words">
                            <span className={cliente.bloqueado ? "font-semibold" : undefined}>{cliente.nome}</span>
                        </TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.cpf}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.telefone}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.cidade}</TableCell>
                        <TableCell className="whitespace-normal break-words">{cliente.codigoDaCota}</TableCell>
                        <TableCell className="whitespace-normal break-words">{rotuloCategoria(cliente.categoria)}</TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                            {cliente.bloqueado ? (
                                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/15 px-3 text-xs font-semibold text-destructive">
                                    <ShieldBan className="size-4" aria-hidden="true" />
                                    Lista Negra
                                </span>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => onEditar(cliente)}>
                                    Editar
                                </Button>
                            )}

                            <Button variant="destructive" size="sm" onClick={() => onExcluir(cliente)}>
                                Excluir
                            </Button>

                            {!cliente.bloqueado && (
                                <Button size="sm" onClick={() => onRegistrarEntrada(cliente)}>
                                    Registrar entrada
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
        </div>
            );
            }



export default TabelaClientes;
