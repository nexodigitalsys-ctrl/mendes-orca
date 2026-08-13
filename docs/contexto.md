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

**Solução:** Alterado `@media (max-width: 720px)` para `@media screen and (max-width: 720px)` nos arquivos:
- `src/app/view/proposta/page.tsx` (página pública)
- `src/app/proposta/page.tsx` (página interna)

Isso garante que o CSS mobile só se aplica em tela, nunca em print.

## Estrutura do Projeto
- Next.js 16 + React 19 + Supabase + Tailwind CSS
- Páginas: catálogo, proposta, pedidos, clientes, empresa, orçamento
- API routes: products, quotes, upload, clients, company
- Link público para visualização de proposta: `/view/proposta?id=XXX`
