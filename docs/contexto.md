# Contexto do Projeto — Mendes Orça

## Status (2026-08-13) — RESOLVIDO
**PDF/mobile na página pública de propostas**

### Problema
- Link do WhatsApp `/view/proposta?id=XXX` aberto no mobile mostrava layout quebrado (colunas empilhadas, múltiplas páginas)
- Desktop funcionava perfeitamente
- Clientes leigos se assustavam com o preview quebrado

### Solução aplicada (3 commits)
1. **`@media (max-width: 720px)` → `@media screen and (max-width: 720px)`** — impede CSS mobile em print (ambos arquivos)
2. **Reforço no `@media print`** — `html/body` com `210mm`, tabela forçada como `display: table*`, cards lado a lado, grand total em linha
3. **Botão "Baixar PDF"** na página pública — JS adiciona classe `force-print-layout` antes de `window.print()`, contorna bugs de `@media print` em navegadores mobile
4. **Removeu layout mobile** da página pública — documento sempre no formato papel, cliente dá zoom/scroll horizontal

### Commits
- `c816b25` — fix: força layout desktop no print do mobile para propostas
- `f4488a0` — fix: reforça layout desktop no @media print para mobile
- `653c663` — feat: adiciona botão Baixar PDF na página pública com force-print-layout
- `4796f6d` — fix: remove layout mobile da página pública — mantém formato papel

### Arquivos alterados
- `src/app/view/proposta/page.tsx` (página pública — link WhatsApp)
- `src/app/proposta/page.tsx` (página interna — botão Baixar PDF)
- `docs/contexto.md` (este arquivo)

## Estrutura do Projeto
- Next.js 16 + React 19 + Supabase + Tailwind CSS
- Páginas: catálogo, proposta, pedidos, clientes, empresa, orçamento, recibo
- API routes: products, quotes, upload, clients, company
- Link público para visualização de proposta: `/view/proposta?id=XXX`
- PDF gerado via `window.print()` + `@media print` (sem backend)
- WhatsApp envia link público, não PDF direto

## Observações
- A página interna (`/proposta`) mantém layout mobile para visualização no admin
- A página pública (`/view/proposta`) agora é sempre formato papel
- `force-print-layout` é uma classe body adicionada via JS antes do print e removida depois
