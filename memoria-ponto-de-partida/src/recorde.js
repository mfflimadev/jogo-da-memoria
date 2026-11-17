export const CHAVE_RECORDE = 'memoria-recorde';
const textoRecorde = document.querySelector('.recorde');

export function formatarTempo(totalDeSegundos) {
    const minutos = Math.floor(totalDeSegundos / 60);
    const resto = totalDeSegundos % 60;
    if (resto < 10) {
        return minutos + ':0' + resto;
    }
    return minutos + ':' + resto;
}

export function mostrarRecorde(texto) {
    textoRecorde.textContent = texto;
}

export function mostrarRecordeAtual() {
    const recorde = carregarRecorde();
    if (recorde === null) {
        mostrarRecorde('—');
    } else {
        mostrarRecorde(formatarTempo(recorde));
    }
}

export function carregarRecorde() {
    const salvo = localStorage.getItem(CHAVE_RECORDE);
    if (salvo === null) {
        return null;
    }
    return Number(salvo);
}
