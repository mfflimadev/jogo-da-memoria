export let intervalo = null;
export let segundos = 0;
export let aoPassarUmSegundo = null;  
import { formatarTempo } from "./recorde";

export function passarUmSegundo() {
    segundos = segundos + 1;
    aoPassarUmSegundo(segundos);
}

export function pararCronometro() {
    clearInterval(intervalo);
    return segundos;
}

export function pausarCronometro() {
    clearInterval(intervalo);
}

export function continuarCronometro() {
    clearInterval(intervalo);
    intervalo = setInterval(passarUmSegundo, 1000);
}

export function iniciarCronometro(quemAvisar) {
    pararCronometro();
    segundos = 0;
    aoPassarUmSegundo = quemAvisar;
    aoPassarUmSegundo(segundos);
    intervalo = setInterval(passarUmSegundo, 1000);
}
