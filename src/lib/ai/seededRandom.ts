// PRNG determinístico simples (mulberry32) para que o relatório mock gerado para um
// mesmo serviço seja consistente entre requisições, em vez de mudar a cada reload.

function hashString(value: string): number {
  let h = 1779033703 ^ value.length;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function criarGeradorSeed(seed: string) {
  let a = hashString(seed);
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function escolher<T>(random: () => number, itens: readonly T[]): T {
  return itens[Math.floor(random() * itens.length) % itens.length];
}

export function embaralhar<T>(random: () => number, itens: readonly T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
