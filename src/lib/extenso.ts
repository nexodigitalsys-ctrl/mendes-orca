const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZENAS = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
const ESPECIAIS: Record<number, string> = {
  11: "onze",
  12: "doze",
  13: "treze",
  14: "quatorze",
  15: "quinze",
  16: "dezesseis",
  17: "dezessete",
  18: "dezoito",
  19: "dezenove",
};

function ate999(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const rest = n % 100;

  let parts: string[] = [];

  if (c > 0) parts.push(CENTENAS[c]);

  if (rest >= 11 && rest <= 19) {
    parts.push(ESPECIAIS[rest]);
  } else {
    if (d > 0) parts.push(DEZENAS[d]);
    if (u > 0) parts.push(UNIDADES[u]);
  }

  if (parts.length === 2) {
    return parts[0] + " e " + parts[1];
  }
  return parts.join("");
}

function ate999999(n: number): string {
  if (n === 0) return "";
  const mil = Math.floor(n / 1000);
  const resto = n % 1000;
  let result = "";

  if (mil > 0) {
    if (mil === 1) {
      result = "mil";
    } else {
      result = ate999(mil) + " mil";
    }
  }

  if (resto > 0) {
    if (result) {
      if (resto < 100) {
        result += " e " + ate999(resto);
      } else {
        result += ", " + ate999(resto);
      }
    } else {
      result = ate999(resto);
    }
  }

  return result;
}

export function valorPorExtenso(v: number): string {
  if (v === 0) return "zero reais";

  const inteiros = Math.floor(v);
  const centavos = Math.round((v - inteiros) * 100);

  let result = "";

  if (inteiros > 0) {
    const inteiroStr = ate999999(inteiros);
    if (inteiros === 1) {
      result = inteiroStr + " real";
    } else {
      result = inteiroStr + " reais";
    }
  }

  if (centavos > 0) {
    const centStr = ate999(centavos);
    const centLabel = centavos === 1 ? "centavo" : "centavos";
    if (result) {
      result += " e " + centStr + " " + centLabel;
    } else {
      result = centStr + " " + centLabel;
    }
  }

  return result;
}
