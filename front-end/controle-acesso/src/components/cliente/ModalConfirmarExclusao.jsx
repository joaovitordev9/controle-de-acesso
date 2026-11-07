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

function ModalConfirmarExclusao({ cliente, vinculos, onConfirmar, onCancelar }) {
    if (!cliente) {
        return null;
    }

    // vinculos pode ser null enquanto carrega do servidor.
    const carregando = vinculos == null;
    const itens = [];
    if (vinculos) {
        if (vinculos.entradas > 0) itens.push(`${vinculos.entradas} entrada(s)`);
        if (vinculos.autorizacoes > 0) itens.push(`${vinculos.autorizacoes} autorização(ões)`);
        if (vinculos.emprestimos > 0) itens.push(`${vinculos.emprestimos} empréstimo(s)`);
    }
    const temVinculos = itens.length > 0;
    const emAberto = vinculos ? vinculos.emprestimos_em_aberto : 0;

    return (
        <AlertDialog open={true} onOpenChange={onCancelar}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                        <span className="text-2xl font-bold text-destructive">!</span>
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

                {carregando ? (
                    <p className="text-sm text-muted-foreground">Verificando o que está vinculado…</p>
                ) : temVinculos ? (
                    <div className="space-y-2">
                        <p className="text-sm text-foreground">
                            Esta pessoa tem vinculado a ela:
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {itens.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        {emAberto > 0 && (
                            <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                ⚠ Ainda está com {emAberto} objeto(s) emprestado(s) sem devolução.
                            </p>
                        )}
                        <p className="text-sm font-medium text-foreground">
                            Ao excluir, tudo isso será apagado junto. Apagar tudo?
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Essa ação não poderá ser desfeita.
                    </p>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancelar}>
                        Cancelar
                    </AlertDialogCancel>

                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={carregando}
                        onClick={function () {
                            onConfirmar(cliente);
                        }}
                    >
                        {temVinculos ? "Apagar tudo" : "Excluir cliente"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ModalConfirmarExclusao;
