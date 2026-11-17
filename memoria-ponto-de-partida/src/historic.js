export const CHAVE_HISTORICO = 'memoria-historico';
export const MAXIMO_DE_PARTIDAS = 5;
export function carregarHistorico() {
    const salvo = localStorage.getItem(CHAVE_HISTORICO);
    if (salvo === null) {
        return [];
    }
    return JSON.parse(salvo);
}

export function formatarData(textoDaData) {
    return new Date(textoDaData).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}