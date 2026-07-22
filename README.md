# Mendes Orça

Sistema de orçamentos para a **Mendes Design Móveis** — móveis para áreas externas, Uberaba-MG.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- Persistência: `localStorage` (dados do usuário)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Módulos

| Rota | Módulo | Descrição |
|------|--------|-----------|
| `/` | Dashboard | Visão geral com stats e orçamentos recentes |
| `/orcamento` | Orçamento | Criar/editar orçamentos com ambientes, itens e totais |
| `/catalogo` | Catálogo | CRUD de produtos com busca, reajuste % e importação/exportação CSV |
| `/clientes` | Clientes | CRUD de clientes com vinculação a arquitetos e proteção de exclusão |
| `/proposta` | Proposta | Preview da proposta em PDF (impressão) com envio via WhatsApp |
| `/recibo` | Recibo | Geração de recibo com valor por extenso e impressão |

## Funcionalidades

- Tema claro/escuro com persistência (toggle lua/sol)
- Layout responsivo (mobile: bottom nav / desktop: sidebar)
- Dados persistidos no `localStorage` do navegador
- Impressão PDF via `window.print()` (CSS `@media print`)
- Envio via WhatsApp com mensagem pré-preenchida
