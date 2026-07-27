# Ajuste do PDF de Proposta / Orçamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajustar o CSS do PDF de proposta para exibir imagens dos produtos maiores (~110 × 82 px) e reduzir o espremimento das colunas, mantendo A4 retrato e a identidade visual preto/dourada.

**Architecture:** O PDF é gerado pelo navegador via `window.print()` a partir da página `src/app/proposta/page.tsx`. Todas as mudanças são de estilo no bloco `<style>` inline da página, alterando tanto o preview de tela quanto as regras `@media print`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS (para a UI), CSS inline para o PDF.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/app/proposta/page.tsx` | Página de preview/print da proposta. Contém a marcação da tabela e o bloco `<style>` com todos os estilos do PDF. |

Nenhum arquivo novo será criado. As alterações são localizadas no arquivo acima.

---

## Task 1: Aumentar imagens no preview de tela

**Files:**
- Modify: `src/app/proposta/page.tsx:351-355`

- [ ] **Step 1: Aplicar novas dimensões no CSS base do preview**

Substituir as regras `.paper .th-img, .paper .td-img` e `.paper .td-img img` para refletir o novo tamanho de imagem.

```css
.paper .th-img, .paper .td-img { width: 118px; text-align: center; }
.paper .td-img img { width: 110px; height: 82px; object-fit: cover; border-radius: 4px; border: 1px solid #E8E4DA; }
```

- [ ] **Step 2: Verificar o preview na tela**

Run: `npm run dev`
Navegar para `http://localhost:3000/proposta` e selecionar um orçamento com imagens.
Expected: As imagens aparecem com 110 × 82 px no preview.

- [ ] **Step 3: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): aumenta imagens dos produtos no preview de tela"
```

---

## Task 2: Ajustar margens e larguras das colunas no print

**Files:**
- Modify: `src/app/proposta/page.tsx:265`, `424-431`

- [ ] **Step 1: Aumentar margens da página**

Alterar a regra `@page`:

```css
@page { size: A4; margin: 10mm 8mm; }
```

- [ ] **Step 2: Redistribuir larguras das colunas no `@media print`**

Substituir o bloco de larguras das colunas (linhas 424–431) por:

```css
/* COLUMN WIDTHS — redistribuídas para imagem maior (soma 100%) */
.paper th:nth-child(1), .paper td:nth-child(1) { width: 4% !important; text-align: center !important; white-space: nowrap !important; padding: 4px 3px !important; font-size: 7.5pt !important; }
.paper th:nth-child(2), .paper td:nth-child(2) { width: 5% !important; text-align: center !important; white-space: nowrap !important; padding: 4px 3px !important; font-size: 7.5pt !important; }
.paper th:nth-child(3), .paper td:nth-child(3) { width: 19% !important; text-align: left !important; padding: 4px 3px !important; font-size: 8pt !important; }
.paper th:nth-child(4), .paper td:nth-child(4) { width: 9% !important; text-align: center !important; font-size: 7.5pt !important; line-height: 1.2 !important; word-wrap: break-word !important; padding: 3px 2px !important; }
.paper th:nth-child(5), .paper td:nth-child(5) { width: 20% !important; text-align: left !important; font-size: 7.5pt !important; line-height: 1.25 !important; padding: 4px 3px !important; }
.paper th:nth-child(6), .paper td:nth-child(6) { width: 18% !important; text-align: center !important; padding: 3px 2px !important; }
.paper th:nth-child(7), .paper td:nth-child(7) { width: 10% !important; text-align: right !important; white-space: nowrap !important; padding: 3px 4px !important; font-size: 7.5pt !important; }
.paper th:nth-child(8), .paper td:nth-child(8) { width: 15% !important; text-align: right !important; white-space: nowrap !important; padding: 3px 4px !important; font-weight: 700 !important; font-size: 8pt !important; }
```

- [ ] **Step 3: Testar via print preview**

Run: Na página `/proposta`, clicar em “Baixar PDF” (`window.print()`).
Expected: A tabela ocupa toda a largura útil da folha A4 sem transbordar; as colunas estão proporcionais à nova distribuição.

- [ ] **Step 4: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): ajusta margens e larguras das colunas no print"
```

---

## Task 3: Aumentar imagens e ajustar tipografia no print

**Files:**
- Modify: `src/app/proposta/page.tsx:384-414`, `442-444`

- [ ] **Step 1: Aumentar fonte do cabeçalho da tabela**

No bloco `.paper th` dentro de `@media print`, alterar:

```css
.paper th {
  display: table-cell !important;
  box-sizing: border-box !important;
  background: #1a1a1a !important;
  color: #C9A227 !important;
  font-weight: 600 !important;
  font-size: 7.5pt !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 5px 4px !important;
  text-align: left !important;
  white-space: nowrap !important;
  border: none !important;
  vertical-align: middle !important;
}
```

- [ ] **Step 2: Aumentar fonte das células e melhorar quebra de texto**

No bloco `.paper td` dentro de `@media print`, alterar:

```css
.paper td {
  display: table-cell !important;
  box-sizing: border-box !important;
  vertical-align: top !important;
  padding: 5px 4px !important;
  font-size: 8pt !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow: hidden !important;
  border: none !important;
  border-bottom: 1px solid #e5ddc8 !important;
  color: #1a1a1a !important;
}
```

- [ ] **Step 3: Aumentar imagens no print**

Substituir a regra de imagens no print (antiga linha 443):

```css
/* PHOTOS — maiores e com object-fit cover */
.paper .td-img img { width: 110px !important; height: 82px !important; object-fit: cover !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; }
.paper .placeholder-img { font-size: 20pt !important; color: #C9A227 !important; }
```

- [ ] **Step 4: Testar via print preview**

Run: Na página `/proposta`, clicar em “Baixar PDF”. Usar um orçamento com produtos que tenham imagens cadastradas.
Expected: As imagens aparecem com ~110 × 82 px, sem distorcer; o texto das colunas está legível.

- [ ] **Step 5: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): aumenta imagens e ajusta tipografia no print"
```

---

## Task 4: Alinhar e proteger valores monetários

**Files:**
- Modify: `src/app/proposta/page.tsx:433-435`, `447-458`

- [ ] **Step 1: Melhorar exibição do símbolo R$ e valores**

Substituir as regras `.paper .curr` e `.paper .val-cell`:

```css
/* R$ aligned */
.paper .curr { font-size: 6.5pt !important; margin-right: 2px !important; color: #555 !important; }
.paper .val-cell { font-size: 8pt !important; font-weight: 600 !important; letter-spacing: -0.2px !important; white-space: nowrap !important; }
```

- [ ] **Step 2: Garantir largura mínima da célula de subtotal/total**

No bloco `.paper .subt td`, manter e reforçar:

```css
.paper .subt td {
  background: #F7F4EC !important;
  font-weight: 600 !important;
  color: #0A0A0A !important;
  font-size: 9pt !important;
  padding: 6px 12px !important;
  border-top: 2px solid #C9A227 !important;
  border-bottom: none !important;
  text-align: right !important;
}
.paper .subt td:first-child { text-align: right !important; font-weight: 700 !important; padding-right: 12px !important; }
.paper .subt td:last-child { min-width: 120px !important; white-space: nowrap !important; }
```

- [ ] **Step 3: Testar via print preview**

Run: Na página `/proposta`, clicar em “Baixar PDF”.
Expected: Os valores (`Unit.`, `Total`, `Subtotal`) não quebram linha e permanecem alinhados à direita.

- [ ] **Step 4: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): melhora alinhamento e proteção dos valores monetários"
```

---

## Task 5: Validação final e ajustes finos

**Files:**
- Modify: `src/app/proposta/page.tsx` (ajustes finos conforme necessário)

- [ ] **Step 1: Testar com orçamento de exemplo**

Run:
1. Certificar-se de que existem produtos com imagens no catálogo (`localStorage` ou seeds em `src/lib/constants.ts`).
2. Criar ou selecionar um orçamento com vários produtos e ambientes.
3. Ir para `/proposta`, selecionar o orçamento e clicar em “Baixar PDF”.
4. No diálogo de impressão, escolher “Salvar como PDF”.

- [ ] **Step 2: Verificar checklist visual**

Expected:
- [ ] Imagens com aproximadamente 110 × 82 px.
- [ ] Tabela cabendo na largura A4 retrato sem scroll/overflow.
- [ ] Colunas `Unit.`, `Total`, `Subtotal` alinhadas à direita.
- [ ] Texto em `Acabamento` e `Código/Produto` legível (não cortado).
- [ ] Quebras de página respeitando ambientes (evitar cortar um ambiente no meio, se possível).

- [ ] **Step 3: Ajustar fino se necessário**

Se a tabela ainda parecer espremida ou os valores quebrarem, ajustar:
- Larguras percentuais no bloco `COLUMN WIDTHS`.
- Tamanho da fonte em `.paper td` e `.paper th`.
- Tamanho da imagem (somente se 110 × 82 px estiver causando overflow).

- [ ] **Step 4: Commit final**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): validação final do layout de proposta"
```

---

## Self-Review

### Spec coverage
- Imagens maiores no PDF → Task 3.
- Redistribuição de colunas → Task 2.
- Margens maiores → Task 2.
- Preview de tela refletindo PDF → Task 1.
- Alinhamento de valores → Task 4.
- Teste visual → Task 5.

### Placeholder scan
- Nenhum TBD, TODO ou “implement later”.
- Código real fornecido em cada step.
- Comandos e expected outputs definidos.

### Type consistency
- As classes CSS citadas (`paper`, `td-img`, `val-cell`, `curr`, `subt`, `grand`, `area-t`) existem no arquivo atual.
- Nenhuma função ou tipo novo é introduzido.
