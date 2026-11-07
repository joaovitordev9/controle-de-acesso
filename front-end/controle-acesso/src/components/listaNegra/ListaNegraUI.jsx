import { ShieldAlert, ShieldBan } from "lucide-react";

// Selo vermelho pequeno, para listas e tabelas.
export function SeloListaNegra({ motivo }) {
    return (
        <span
            title={motivo ? `Motivo: ${motivo}` : "Na Lista Negra"}
            className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
        >
            <ShieldBan className="size-3.5" aria-hidden="true" />
            Lista Negra
        </span>
    );
}

// Caixa de aviso para os modais de entrada: deixa claro que a entrada está bloqueada.
export function AvisoListaNegra({ nome, motivo }) {
    return (
        <div role="alert" className="flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
                <p className="font-semibold">
                    {nome ? `${nome} está` : "Esta pessoa está"} na Lista Negra — entrada bloqueada.
                </p>
                {motivo && <p className="mt-0.5 text-destructive/90">Motivo: {motivo}</p>}
            </div>
        </div>
    );
}
