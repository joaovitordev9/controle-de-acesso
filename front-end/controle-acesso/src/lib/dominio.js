// Categorias de pessoa (substitui o antigo CRUD de categorias por um enum fixo).
export const CATEGORIAS = [
    { valor: "SOCIO", rotulo: "Sócio" },
    { valor: "CONVIDADO", rotulo: "Convidado" },
    { valor: "NAUTICA", rotulo: "Náutica" },
    { valor: "PRESTADOR_DE_SERVICO", rotulo: "Prestador de serviço" },
    { valor: "DAY_USE", rotulo: "Day use" },
    { valor: "RESTAURANTE", rotulo: "Restaurante" },
    { valor: "CONVIDADO_SEM_FREQUENCIA", rotulo: "Convidado sem frequência" },
    { valor: "CONVIDADO_COM_FREQUENCIA", rotulo: "Convidado com frequência" },
];

// Categorias que possuem código da cota.
export const CATEGORIAS_COM_COTA = ["SOCIO", "NAUTICA"];

export function rotuloCategoria(valor) {
    if (!valor) return "Sem categoria";
    const item = CATEGORIAS.find((categoria) => categoria.valor === valor);
    return item ? item.rotulo : valor;
}

// Tipos de benefício usados na confirmação da entrada.
export const TIPOS_CONVITE = [
    { valor: "CONVITE_ESPECIAL", rotulo: "Convite" },
    { valor: "CORTESIA", rotulo: "Cortesia" },
];

export function rotuloTipoConvite(valor) {
    const item = TIPOS_CONVITE.find((tipo) => tipo.valor === valor);
    return item ? item.rotulo : valor;
}
