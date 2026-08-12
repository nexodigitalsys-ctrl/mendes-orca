# Spec — Aba PEDIDOS, título editável e pagamento com parcelas

Data: 2026-08-12
Status: aprovado pelo usuário

## Contexto

O sistema (Next.js + Supabase) gera orçamentos e um PDF de proposta. A tabela `quotes`
já possui `status` (`rascunho`, `enviado`, `aprovado`, `recusado`) e o formulário já
permite mudar o status. Um **pedido é um orçamento aprovado** — não haverá tabela nem
código duplicado de pedidos.

## Requisitos aprovados

1. **Menu PEDIDOS** (`/pedidos`): mesmas funções da tela de orçamento (listar, criar,
   editar, excluir, gerar PDF), mas lista apenas quotes com `status = "aprovado"`.
2. **Título do documento editável** (`doc_title`): campo novo no quote. Padrão
   `ORÇAMENTO` na aba Orçamento e `PEDIDO` na aba Pedidos; usuário pode digitar outro
   texto (ex.: CONTRATO). O PDF imprime esse título (título central e rótulo do número
   no cabeçalho).
3. **Número editável**: já existe no formulário de orçamento; vale também na aba Pedidos.
4. **Condições de pagamento**:
   - PIX, Boleto e Cheque continuam **checkboxes** (combináveis, ex.: PIX + cartão).
   - **Cartão** abre uma **caixa de diálogo** para escolher parcelas de **1x a 24x**.
     Cada seleção vira um chip removível, ex.: `Cartão — 12x`.
   - Persistência: `payment_methods` (text[]) passa a aceitar entradas `cartao:N`
     (N = 1..24). Entradas antigas `cartao` continuam exibindo
     "Cartão de crédito — parcelado em até 10x" (retrocompatibilidade).
   - No PDF, `cartao:N` sai como "Cartão de crédito — Nx" (N=1 → "à vista").

## Arquitetura

- **Banco**: migração adiciona `doc_title text not null default 'ORÇAMENTO'` em
  `public.quotes` (alter table em `supabase/schema.sql` + instrução de aplicação).
- **API** (`src/app/api/quotes/route.ts`): incluir `doc_title` em
  normalize/denormalize.
- **Tipos** (`src/lib/constants.ts`): `Quote` ganha `docTitle?: string`; helper de
  label de pagamento (parse de `cartao:N`).
- **Formulário compartilhado**: extrair o conteúdo de `src/app/orcamento/page.tsx`
  para um componente (ex.: `src/components/QuoteForm.tsx`) com prop
  `mode: "orcamento" | "pedido"`:
  - `orcamento`: comportamento atual, lista todos os status, `doc_title` padrão
    "ORÇAMENTO".
  - `pedido`: lista filtrada por `aprovado`, `doc_title` padrão "PEDIDO", demais
    funções idênticas.
  - Novas páginas finas: `src/app/orcamento/page.tsx` e `src/app/pedidos/page.tsx`
    apenas renderizam o componente com o mode correto.
- **Navegação**: adicionar item "Pedidos" em `src/components/Sidebar.tsx` e
  `src/components/BottomNav.tsx`.
- **PDF** (`src/app/proposta/page.tsx`): título central e rótulo do cabeçalho usam
  `quote.docTitle` (fallback "ORÇAMENTO"); labels de pagamento usam o helper com
  parse de parcelas. Seletor de quote da proposta passa a aceitar `?id=` para a aba
  Pedidos abrir o PDF direto.

## Fluxo

Cria orçamento → envia → cliente aprova → status "Aprovado" → aparece na aba PEDIDOS
→ ajusta título/número se precisar → gera PDF como PEDIDO.

## Fora de escopo

- Tabela/cadastro separado de pedidos.
- Acompanhamento de produção/entrega (etapas do pedido).
- Qualquer refatoração não relacionada.

## Testes / verificação

- `npm run build` sem erros.
- Verificação manual no navegador: criar orçamento, aprovar, aparecer em Pedidos,
  editar título, gerar PDF com título correto; pagamento PIX + Cartão 12x saindo no
  PDF; orçamento antigo com `cartao` exibindo label legado.
