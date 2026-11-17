import{temas} from './cartas.js';

import { criarBaralho,
    verificarPar,
    verificarSeTerminou,
    escolherSimbolos,
 } from './jogo.js';

 import { CHAVE_RECORDE,
    mostrarRecordeAtual,
    formatarTempo,
    mostrarRecorde,
    carregarRecorde,
    
 } from './recorde.js';

import{CHAVE_HISTORICO,
    MAXIMO_DE_PARTIDAS,
       carregarHistorico,
         formatarData, 
} from './historic.js'

import { intervalo,
         segundos,
        aoPassarUmSegundo,
        pararCronometro,
        pausarCronometro,
        continuarCronometro,
        iniciarCronometro,
 } from './cronometro.js';


 import { tabuleiro,
    botaoPausar,
    textoTempo,
    textoJogadas,
    telaFim,
    textoFimTempo,
    textoFimJogadas,
    seloNovoRecorde,
    textoHistoricoVazio,
    listaHistorico,
  } from './tela.js';

let baralho = [];
let primeiraCarta = null;   // a posição da primeira carta virada
let travado = false;        // true enquanto duas cartas erradas estão à mostra
let jogadas = 0;
let paresEncontrados = 0;
let comecou = false;        // o relógio só começa no primeiro clique
let totalDePares = 0;
let pausado = false;
let terminou = false;
 // a função que recebe cada segundo
const NOMES_DOS_NIVEIS = { 6: 'Fácil', 8: 'Médio', 12: 'Difícil' };
const campoTema = document.querySelector('.campo-tema');
const campoNivel = document.querySelector('.campo-nivel');
// embaralhar(['a', 'b', 'c']) → ['c', 'a', 'b'] (uma ordem diferente
// a cada vez)

function novaPartida() {
    pararCronometro();
    totalDePares = Number(campoNivel.value);
    const simbolos = escolherSimbolos(temas[campoTema.value], totalDePares);
    ajustarTabuleiro(totalDePares);
    baralho = criarBaralho(simbolos);
    primeiraCarta = null;
    travado = false;
    jogadas = 0;
    paresEncontrados = 0;
    comecou = false;
    pausado = false;
    terminou = false;
    mostrarPausa(pausado);
    atualizarJogadas(jogadas);
    atualizarTempo(formatarTempo(0));
    esconderFim();
    desenharCartas(baralho, escolherCarta);
    mostrarRecordeAtual();
}
// Uma carta (um botão) para cada símbolo. O clique avisa quem
// chamou, com a posição da carta.
function desenharCartas(baralho, aoClicar) {
    tabuleiro.innerHTML = '';
    baralho.forEach((simbolo, posicao) => {
        const carta = document.createElement('button');
        carta.type = 'button';
        carta.classList.add('carta');
        carta.setAttribute('aria-label', 'Carta ' + (posicao + 1));

        const interno = document.createElement('span');
        interno.classList.add('carta-interno');

        const frente = document.createElement('span');
        frente.classList.add('carta-frente');
        frente.textContent = '?';

        const verso = document.createElement('span');
        verso.classList.add('carta-verso');
        verso.textContent = simbolo;

        interno.appendChild(frente);
        interno.appendChild(verso);
        carta.appendChild(interno);
        carta.addEventListener('click', () => {
            aoClicar(posicao);
        });
        tabuleiro.appendChild(carta);
    });
}
// formatarTempo(65) → '1:05'
// Cada tema tem 12 símbolos: o jogo usa quantos o nível pedir, e
// cada um aparece duas vezes.
// Com mais de 8 pares, o tabuleiro passa a ter seis colunas.
function ajustarTabuleiro(quantidadeDePares) {
    if (quantidadeDePares > 8) {
        tabuleiro.classList.add('nivel-dificil');
    } else {
        tabuleiro.classList.remove('nivel-dificil');
    }
}
// escolherSimbolos(['a', 'b', 'c', 'd'], 2) → dois deles, sorteados
// Soma um segundo e avisa.
function escolherCarta(posicao) {
    if (travado || pausado || posicao === primeiraCarta) {
        return;
    }
    if (!comecou) {
        comecou = true;
        iniciarCronometro((segundos) => {
            atualizarTempo(formatarTempo(segundos));
        });
    }

    virarCarta(posicao);
    // A primeira carta da jogada: só guarda e espera a segunda.
    if (primeiraCarta === null) {
        primeiraCarta = posicao;
        return;
    }

    // A segunda carta: conta a jogada e confere o par.
    const segundaCarta = posicao;
    jogadas = jogadas + 1;
    atualizarJogadas(jogadas);

    if (verificarPar(baralho[primeiraCarta], baralho[segundaCarta])) {
        marcarPar(primeiraCarta, segundaCarta);
        paresEncontrados = paresEncontrados + 1;
        primeiraCarta = null;
        if (verificarSeTerminou(paresEncontrados, totalDePares)) {
            terminarPartida();
        }
    } else {
        // Errou: as duas ficam à mostra por um instante e desviram.
        travado = true;
        const cartaA = primeiraCarta;
        primeiraCarta = null;
        setTimeout(() => {
            desvirarCartas(cartaA, segundaCarta);
            travado = false;
        }, 900);
    }
}

// tabuleiro.children é a lista de cartas, na ordem do baralho
function virarCarta(posicao) {
    tabuleiro.children[posicao].classList.add('virada');
}

function desvirarCartas(posicaoA, posicaoB) {
    tabuleiro.children[posicaoA].classList.remove('virada');
    tabuleiro.children[posicaoB].classList.remove('virada');
}

// carregarHistorico() → [], enquanto ninguém terminou uma partida.
// A partida mais recente vem primeiro.
// criarBaralho(['🍕', '🚀']) → ['🚀', '🍕', '🍕', '🚀'], embaralhado
// Começa do zero e, a cada segundo, chama quemAvisar com o total.
// Um par encontrado fica virado, verde, e não clica mais.
function marcarPar(posicaoA, posicaoB) {
    [posicaoA, posicaoB].forEach((posicao) => {
        const carta = tabuleiro.children[posicao];
        carta.classList.add('encontrada');
        carta.disabled = true;
    });
}

function atualizarTempo(texto) {
    textoTempo.textContent = texto;
}

// Só dá para pausar com o relógio correndo.
function alternarPausa() {
    if (!comecou || terminou) {
        return;
    }
    pausado = !pausado;
    if (pausado) {
        pausarCronometro();
    } else {
        continuarCronometro();
    }
    mostrarPausa(pausado);
}

// verificarPar('🍕', '🍕') → true
// carregarRecorde() → null, enquanto ninguém terminou uma partida
function atualizarJogadas(jogadas) {
    textoJogadas.textContent = jogadas;
}
// Para o relógio e devolve quantos segundos passaram.
function terminarPartida() {
    terminou = true;
    const segundos = pararCronometro();
    const bateuRecorde = registrarTempo(segundos);
    mostrarFim(formatarTempo(segundos), jogadas);
    mostrarNovoRecorde(bateuRecorde);
    mostrarRecordeAtual();

    // A data vira texto para poder ir para o localStorage
    registrarPartida({
        data: new Date().toISOString(),
        nivel: NOMES_DOS_NIVEIS[totalDePares],
        segundos: segundos,
        jogadas: jogadas
    });
    mostrarHistoricoAtual();
}

function mostrarFim(tempo, jogadas) {
    textoFimTempo.textContent = tempo;
    textoFimJogadas.textContent = jogadas;
    telaFim.classList.remove('escondida');
}
// Coloca a partida no começo da lista e guarda só as últimas cinco.
function registrarPartida(partida) {
    const lista = [partida].concat(carregarHistorico());
    const ultimas = lista.filter((item, posicao) => posicao < MAXIMO_DE_PARTIDAS);
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(ultimas));
}


// verificarSeTerminou(8, 8) → true
function esconderFim() {
    telaFim.classList.add('escondida');
}
// Só salva se for o primeiro tempo ou se for menor que o recorde.
// Devolve true quando o tempo é um recorde novo.
function registrarTempo(totalDeSegundos) {
    const recorde = carregarRecorde();
    if (recorde !== null && totalDeSegundos >= recorde) {
        return false;
    }
    localStorage.setItem(CHAVE_RECORDE, totalDeSegundos);
    return true;
}

function mostrarNovoRecorde(bateuRecorde) {
    if (bateuRecorde) {
        seloNovoRecorde.classList.remove('escondida');
    } else {
        seloNovoRecorde.classList.add('escondida');
    }
}

// Cada partida vira uma linha: '09/11, 16:42 · Médio · 1:05 · 9 jogadas'
function mostrarHistoricoAtual() {
    const linhas = carregarHistorico().map((partida) => {
        return formatarData(partida.data) + ' · ' + partida.nivel + ' · ' +
            formatarTempo(partida.segundos) + ' · ' + partida.jogadas + ' jogadas';
    });
    mostrarHistorico(linhas);
}
// Pausar é parar sem zerar: os segundos continuam guardados.
document.querySelector('.botao-jogar-de-novo').addEventListener('click', novaPartida);
campoTema.addEventListener('change', novaPartida);

// Recebe as linhas prontas, uma por partida.
function mostrarHistorico(linhas) {
    listaHistorico.innerHTML = '';
    if (linhas.length === 0) {
        textoHistoricoVazio.classList.remove('escondida');
        return;
    }
    textoHistoricoVazio.classList.add('escondida');
    linhas.forEach((linha) => {
        const item = document.createElement('li');
        item.textContent = linha;
        listaHistorico.appendChild(item);
    });
}
// formatarData('2026-11-09T19:42:00.000Z') → '09/11, 16:42'
// (o horário sai no fuso do computador)
// Continua de onde parou.
// Pausado: o tabuleiro fica borrado (o CSS cuida disso) e o botão
// passa a dizer "Continuar".
function mostrarPausa(pausado) {
    if (pausado) {
        tabuleiro.classList.add('pausado');
        botaoPausar.textContent = 'Continuar';
    } else {
        tabuleiro.classList.remove('pausado');
        botaoPausar.textContent = 'Pausar';
    }
}
document.querySelector('.botao-recomecar').addEventListener('click', novaPartida);
campoNivel.addEventListener('change', novaPartida);
document.querySelector('.botao-pausar').addEventListener('click', alternarPausa);

novaPartida();
mostrarHistoricoAtual();
