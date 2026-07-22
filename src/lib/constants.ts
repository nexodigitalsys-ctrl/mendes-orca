export interface Product {
  code: string;
  name: string;
  meas: string;
  finish: string;
  price: number;
  image: string;
}

export interface Client {
  id: string;
  name: string;
  type: "condominium" | "architect" | "person";
  document?: string;
  phone?: string;
  address?: string;
  city?: string;
  architect?: string;
}

export type QuoteStatus = "aprovado" | "enviado" | "rascunho";

export interface QuoteItem {
  productCode: string;
  qty: number;
}

export interface Environment {
  name: string;
  items: QuoteItem[];
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  status: QuoteStatus;
  environments: Environment[];
  createdAt: string;
}

export const CATALOG: Product[] = [
  {
    code: "FILIPINAS-MR",
    name: "MESA FILIPINAS TAMPO REDONDO C/ GIRATÓRIO",
    meas: "1,80 x 0,75",
    finish: "Estrutura de alumínio, pintura eletrostática. Tampo giratório em madeira cumaru embutido.",
    price: 9900,
    image: "",
  },
  {
    code: "FILIPINAS-CB",
    name: "CADEIRA FILIPINAS COM BRAÇO",
    meas: "0,56 x 0,58 x 0,84",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, apoio de braço em madeira cumaru.",
    price: 1190,
    image: "",
  },
  {
    code: "MABI-BISTRO",
    name: "MABI MESA ALTA BISTRO",
    meas: "0,80 x 1,00H",
    finish: "Estrutura de alumínio, pintura eletrostática. Tampo em madeira cumaru.",
    price: 2890,
    image: "",
  },
  {
    code: "BQBI02",
    name: "BANQUETA ALTA BISTRO C/ DETALHE EM MADEIRA",
    meas: "0,42 x 0,50 x 1,05H",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, parte superior do encosto em madeira cumaru.",
    price: 1190,
    image: "",
  },
  {
    code: "BUZIOS-POL",
    name: "POLTRONA BUZIOS",
    meas: "0,80 x 0,85 x 0,80H",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, tapeçaria em tecido Acquablock.",
    price: 3890,
    image: "",
  },
  {
    code: "JHULIAN-MC",
    name: "MESA DE CENTRO JHULIAN",
    meas: "0,90 x 0,35H",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, tampo em madeira cumaru. Sem balde cooler.",
    price: 3690,
    image: "",
  },
  {
    code: "BUZIOS-SOFA",
    name: "SOFÁ BUZIOS MODESP",
    meas: "2,35 x 0,85 x 0,80H",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, tapeçaria em tecido Acquablock.",
    price: 12900,
    image: "",
  },
  {
    code: "RIPADA-AL",
    name: "MESA RIPADA ALUMÍNIO",
    meas: "1,20 x 0,75H",
    finish: "Estrutura e tampo em alumínio, pintura eletrostática. Base cone com trama em corda náutica.",
    price: 2890,
    image: "",
  },
  {
    code: "MICHIGAN",
    name: "CADEIRA ESTOFADA MICHIGAN",
    meas: "0,61 x 0,64 x 0,85H",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, assento estofado em tecido Acquablock.",
    price: 1590,
    image: "",
  },
  {
    code: "BUZIOS-BANQ",
    name: "BANQUETA ALTA BUZIOS (ESTOFADA)",
    meas: "0,57 x 0,59 x 1,10",
    finish: "Estrutura de alumínio, pintura eletrostática. Trama em corda náutica, assento e encosto estofados em Acquablock.",
    price: 1690,
    image: "",
  },
];

export const CLIENTS: Client[] = [
  {
    id: "cli-001",
    name: "RESIDENCIAL DAMHA 3",
    type: "condominium",
    address: "AV FILOMENA CARTAFINA, 100 — RECREIO DOS BANDEIRANTES",
    city: "UBERABA - MG",
    architect: "ANA CLARA - AC HOME",
  },
  {
    id: "cli-002",
    name: "ANA CLARA - AC HOME",
    type: "architect",
    city: "UBERABA - MG",
  },
  {
    id: "cli-003",
    name: "SR. RUBENS",
    type: "person",
    phone: "(34) 9 9999-0000",
    city: "UBERABA - MG",
  },
];

export const QUOTES: Quote[] = [
  {
    id: "q-041",
    number: "ORC-2026-041",
    clientId: "cli-001",
    status: "aprovado",
    environments: [
      {
        name: "QUIOSQUE 01",
        items: [
          { productCode: "FILIPINAS-MR", qty: 3 },
          { productCode: "FILIPINAS-CB", qty: 24 },
          { productCode: "MABI-BISTRO", qty: 2 },
          { productCode: "BQBI02", qty: 8 },
          { productCode: "BUZIOS-POL", qty: 2 },
          { productCode: "JHULIAN-MC", qty: 1 },
        ],
      },
    ],
    createdAt: "2026-07-15",
  },
  {
    id: "q-042",
    number: "ORC-2026-042",
    clientId: "cli-003",
    status: "enviado",
    environments: [
      {
        name: "SALA DE ESTAR",
        items: [
          { productCode: "BUZIOS-SOFA", qty: 1 },
          { productCode: "JHULIAN-MC", qty: 1 },
          { productCode: "BUZIOS-POL", qty: 2 },
        ],
      },
    ],
    createdAt: "2026-07-18",
  },
  {
    id: "q-043",
    number: "ORC-2026-043",
    clientId: "cli-002",
    status: "rascunho",
    environments: [
      {
        name: "QUIOSQUE 01",
        items: [
          { productCode: "MABI-BISTRO", qty: 2 },
          { productCode: "BQBI02", qty: 4 },
        ],
      },
      {
        name: "TERRAÇO",
        items: [
          { productCode: "RIPADA-AL", qty: 1 },
          { productCode: "MICHIGAN", qty: 4 },
        ],
      },
    ],
    createdAt: "2026-07-20",
  },
  {
    id: "q-044",
    number: "ORC-2026-044",
    clientId: "cli-003",
    status: "enviado",
    environments: [
      {
        name: "REVITALIZAÇÃO",
        items: [
          { productCode: "MICHIGAN", qty: 6 },
        ],
      },
    ],
    createdAt: "2026-07-21",
  },
];

export function brl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function quoteSubtotal(quote: Quote): number {
  return quote.environments.reduce((envSum, env) => {
    return (
      envSum +
      env.items.reduce((itemSum, item) => {
        const product = CATALOG.find((p) => p.code === item.productCode);
        return itemSum + (product ? product.price * item.qty : 0);
      }, 0)
    );
  }, 0);
}

export function quotePieces(quote: Quote): number {
  return quote.environments.reduce((envSum, env) => {
    return envSum + env.items.reduce((itemSum, item) => itemSum + item.qty, 0);
  }, 0);
}
