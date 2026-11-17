 function embaralhar(lista) {
    return lista.toSorted(() => Math.random() - 0.5);
}

export function escolherSimbolos(simbolos, quantidade) {
    return embaralhar(simbolos).filter((simbolo, posicao) => posicao < quantidade);
}

export function criarBaralho(simbolos) {
    const pares = [];
    simbolos.forEach((simbolo) => {
        pares.push(simbolo);
        pares.push(simbolo);
    });
    return embaralhar(pares);
}

export function verificarPar(simboloA, simboloB) {
    return simboloA === simboloB;
}

export function verificarSeTerminou(paresEncontrados, totalDePares) {
    return paresEncontrados >= totalDePares;
}