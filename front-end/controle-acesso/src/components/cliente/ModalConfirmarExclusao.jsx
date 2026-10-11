// import "./ModalConfirmarExclusao.css";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

function ModalConfirmarExclusao({ cliente, onConfirmar, onCancelar }) {
    if (!cliente) {
        return null;
    }

    return (
        <AlertDialog open={true} onOpenChange={onCancelar}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                        <span className="text-2xl font-bold text-destructive">
                            !
                        </span>
                    </div>

                    <AlertDialogTitle className="mx-auto text-xl">
                        Excluir cliente?
                    </AlertDialogTitle>

                </AlertDialogHeader>

                <div className="space-y-2 rounded-md border bg-muted/40 p-4">
                    <strong className="block text-sm font-semibold text-foreground">
                        {cliente.nome}
                    </strong>

                    <span className="block text-sm text-muted-foreground">
                        CPF: {cliente.cpf}
                    </span>

                    <span className="block text-sm text-muted-foreground">
                        Código da cota: {cliente.codigoDaCota}
                    </span>
                </div>

                <p className="text-sm text-muted-foreground">
                    Essa ação não poderá ser desfeita.
                </p>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancelar}>
                        Cancelar
                    </AlertDialogCancel>

                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={function () {
                            onConfirmar(cliente);
                        }}
                    >
                        Excluir cliente
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ModalConfirmarExclusao;