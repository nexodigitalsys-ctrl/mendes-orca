# Contexto do Projeto — Mendes Orça

## Problema Atual (2026-08-13)
**PDF quebrado no mobile ao abrir link do WhatsApp**

- Gerar PDF via desktop: funciona perfeitamente
- Abrir link da proposta no mobile via WhatsApp: layout quebrado
  - Colunas empilhadas
  - Mais de uma página gerada
  - Elementos mudam de lugar

**Causa raiz:** O `@media print` está sendo sobrescrito pelo `@media (max-width: 720px)` em mobile, pois ambos os media queries se aplicam simultaneamente quando o usuário tenta imprimir/salvar PDF no celular.

**Arquivo:** `src/app/view/proposta/page.tsx`

**Solução (2 camadas):**

1. `@media (max-width: 720px)` → `@media screen and (max-width: 720px)` — impede CSS mobile em print
2. Reforço no `@media print`:
   - `html, body` com `width/min-width/max-width: 210mm` — força largura A4
   - Regras explícitas para `table/thead/tbody/tr/td/th` com `display: table*` — anula layout grid/mobile
   - `.info-cards` com `grid-template-columns: 1fr 1fr` — mantém cards lado a lado
   - `.grand` com `flex-direction: row` — mantém total em linha

**Arquivos alterados:**
- `src/app/view/proposta/page.tsx` (página pública)
- `src/app/proposta/page.tsx` (página interna)

## Estrutura do Projeto
- Next.js 16 + React 19 + Supabase + Tailwind CSS
- Páginas: catálogo, proposta, pedidos, clientes, empresa, orçamento
- API routes: products, quotes, upload, clients, company
- Link público para visualização de proposta: `/view/proposta?id=XXX`
