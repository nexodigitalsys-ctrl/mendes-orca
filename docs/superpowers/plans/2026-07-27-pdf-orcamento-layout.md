# Redesign do PDF de Orçamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajustar o layout do PDF de proposta/orçamento em `src/app/proposta/page.tsx` para ficar menos apertado, com cabeçalho moderno, tabela espaçosa, imagens maiores e total geral visível.

**Architecture:** O PDF é gerado pelo navegador via `window.print()` a partir da página `src/app/proposta/page.tsx`. Todas as mudanças são no JSX da área `.paper` e no bloco `<style>` inline da página, afetando tanto o preview de tela quanto as regras `@media print`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS (UI externa), CSS inline para o template do PDF.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/app/proposta/page.tsx` | Página de preview/print da proposta. Contém a marcação do papel e o bloco `<style>` com todos os estilos do PDF. |

Nenhum arquivo novo será criado. As alterações são localizadas no arquivo acima.

---

## Task 1: Reestruturar cabeçalho e bloco empresa/cliente

**Files:**
- Modify: `src/app/proposta/page.tsx:144-180`

- [ ] **Step 1: Substituir o cabeçalho e o bloco de cliente pelo novo layout**

Localize o comentário `{/* Header */}` (aproximadamente linha 148) e substitua todo o bloco até antes de `{/* Title */}` por:

```tsx
            {/* Header */}
            <div className="ph">
              <div className="plogo">
                {company.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={company.logo} alt={company.name} className="plogo-img" />
                ) : (
                  <div className="plogo-fallback">MD</div>
                )}
                <div className="plogo-info">
                  <h2>MENDES DESIGN</h2>
                  <span className="company-slogan">MÓVEIS PARA ÁREAS EXTERNAS</span>
                </div>
              </div>
            </div>

            {/* Company + Client cards */}
            <div className="info-cards">
              <div className="info-card">
                <div className="info-card-title">Dados da Empresa</div>
                <div><b>{company.name || "Mendes Design Móveis"}</b></div>
                {company.address && <div>{company.address}</div>}
                {(company.city || company.state) && <div>{company.city}{company.state ? ` - ${company.state}` : ""}</div>}
                {company.phone && <div>{company.phone}</div>}
                {company.cnpj && <div>CNPJ: {company.cnpj}</div>}
                <div style={{ marginTop: "8px" }}>
                  {formatDatePtBR(quote.createdAt)}<br />
                  <b className="co-number">{quote.number}</b>
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-title">Cliente</div>
                <div><b>{quote.clientName || client?.name || "—"}</b></div>
                <div><b>CNPJ/CPF:</b> {quote.clientDocument || client?.document || "—"}</div>
                <div><b>Endereço:</b> {quote.clientAddress || client?.address || "—"}</div>
                <div><b>Cidade:</b> {quote.clientCity || client?.city || "—"}</div>
                <div><b>Telefone:</b> {quote.clientPhone || client?.phone || "—"}</div>
                <div><b>Arquiteto(a):</b> {quote.clientArchitect || client?.architect || "—"}</div>
              </div>
            </div>
```

- [ ] **Step 2: Verificar preview na tela**

Run: `npm run dev` e acesse `http://localhost:3000/proposta` com um orçamento selecionado.
Expected: O cabeçalho mostra logo + MENDES DESIGN + slogan à esquerda; abaixo aparecem dois cards lado a lado (empresa e cliente).

- [ ] **Step 3: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): reestrutura cabeçalho e cards empresa/cliente"
```

---

## Task 2: Ajustar estilos base do preview de tela

**Files:**
- Modify: `src/app/proposta/page.tsx:264-355` (bloco `.paper` e classes filhas)

- [ ] **Step 1: Atualizar classes do cabeçalho, cards e tabela no CSS base**

Substituir as regras existentes por:

```css
        /* ===== PAPER BASE ===== */
        .paper {
          background: #fff !important;
          color: #1a1a1a !important;
          border-radius: 8px;
          padding: 18px 16px;
          font-size: 12px;
          line-height: 1.5;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 12px rgba(0,0,0,.15);
          max-width: none;
          width: 100%;
          margin: 0;
        }
        .paper *, .paper td, .paper th, .paper h2, .paper .foot, .paper .sig {
          color: #1a1a1a !important;
        }
        .paper .ph {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 3px solid #C9A227;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .paper .plogo { display: flex; gap: 12px; align-items: center; }
        .paper .plogo-img { max-height: 56px; max-width: 56px; width: auto; object-fit: contain; flex-shrink: 0; }
        .paper .plogo-fallback { width: 56px; height: 56px; border-radius: 50%; background: #0A0A0A; color: #C9A227; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; flex-shrink: 0; }
        .paper .plogo-info { flex: 1; min-width: 0; }
        .paper .plogo h2, .paper .plogo-info h2 { font-family: 'Playfair Display', serif; font-size: 18pt; letter-spacing: 2px; font-weight: 700; margin: 0; }
        .paper .company-slogan { font-size: 9pt; letter-spacing: 2px; text-transform: uppercase; color: #8a6d1a !important; margin-top: 2px; display: block; }

        /* INFO CARDS */
        .paper .info-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .paper .info-card {
          background: #F7F4EC;
          border: 1px solid #E5DDC8;
          border-radius: 6px;
          padding: 12px;
          font-size: 10.5px;
          line-height: 1.6;
        }
        .paper .info-card-title {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8a6d1a !important;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .paper .info-card b { color: #8a6d1a !important; }
        .paper .co-number { color: #8a6d1a !important; }

        .paper .orc-title { font-weight: 700; font-size: 14px; letter-spacing: 3px; text-align: center; margin-bottom: 12px; }
        .paper .area-t {
          background: linear-gradient(90deg, #C9A227, #B8911F);
          color: #1a1a1a !important;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          padding: 6px 10px;
          margin: 14px 0 0;
          text-transform: uppercase;
          border-radius: 4px 4px 0 0;
        }
        .paper table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .paper th {
          background: #0A0A0A;
          color: #C9A227 !important;
          font-size: 9.5px;
          letter-spacing: .5px;
          padding: 8px 6px;
          text-align: left;
          text-transform: uppercase;
        }
        .paper td { border-bottom: 1px solid #E8E4DA; padding: 8px 6px; font-size: 10.5px; vertical-align: top; color: #1a1a1a !important; }
        .paper .subt td { background: #F7F4EC; font-weight: 700; font-size: 11px; border-top: 2px solid #C9A227; text-align: right !important; }
        .paper .grand {
          display: flex;
          justify-content: space-between;
          background: #0A0A0A;
          color: #E5C76B !important;
          padding: 12px 16px;
          border-radius: 6px;
          margin-top: 14px;
          font-weight: 700;
          font-size: 13px;
        }
        .paper .foot { margin-top: 18px; font-size: 10px; color: #555 !important; border-top: 1px solid #E8E4DA; padding-top: 12px; line-height: 1.6; }
        .paper .sig { margin-top: 24px; text-align: center; font-size: 11px; color: #333 !important; }
        .paper .sig .line { width: 220px; border-top: 1px solid #999; margin: 0 auto 5px; }
        .paper .th-img, .paper .td-img { width: 120px; text-align: center; }
        .paper .td-img img { width: 110px; height: 82px; object-fit: contain; border-radius: 4px; border: 1px solid #E8E4DA; }
        .paper .placeholder-img { font-size: 28px; color: #C9A227 !important; }
        .paper-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
        .paper-wrap .paper { min-width: 680px; }
```

- [ ] **Step 2: Verificar preview na tela**

Run: `npm run dev` e acesse `http://localhost:3000/proposta`.
Expected: Preview de tela mostra os cards, tabela com mais respiro e imagens maiores.

- [ ] **Step 3: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): ajusta estilos base do preview de tela"
```

---

## Task 3: Ajustar estilos de impressão

**Files:**
- Modify: `src/app/proposta/page.tsx:357-530` (bloco `@media print`)

- [ ] **Step 1: Ajustar margens da página e reset do papel no print**

Alterar a regra `@page` no topo do `<style>` (linha ~265):

```css
        @page { size: A4; margin: 8mm 10mm; }
```

No bloco `@media print`, garantir que `.paper` tenha padding adequado:

```css
          .paper {
            min-width: 0 !important;
            max-width: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 12px 10px;
            font-size: 8pt !important;
            background: #fff !important;
            color: #1a1a1a !important;
          }
```

- [ ] **Step 2: Ajustar cabeçalho, cards e tabela no print**

Dentro de `@media print`, adicionar/atualizar:

```css
          /* HEADER */
          .paper .ph {
            border-bottom: 3px solid #C9A227 !important;
            padding-bottom: 12px !important;
            margin-bottom: 14px !important;
            gap: 10px !important;
          }
          .paper .plogo-img { max-height: 48px !important; max-width: 48px !important; }
          .paper .plogo-fallback { width: 48px !important; height: 48px !important; font-size: 16px !important; }
          .paper .plogo h2 { font-size: 16pt !important; letter-spacing: 1.5px !important; }
          .paper .company-slogan { font-size: 8pt !important; }

          /* INFO CARDS */
          .paper .info-cards {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            margin-bottom: 14px !important;
          }
          .paper .info-card {
            background: #F7F4EC !important;
            border: 1px solid #E5DDC8 !important;
            border-radius: 5px !important;
            padding: 10px !important;
            font-size: 8.5pt !important;
            line-height: 1.5 !important;
          }
          .paper .info-card-title { font-size: 7.5pt !important; margin-bottom: 5px !important; }

          /* TABLE */
          .paper table { table-layout: fixed !important; width: 100% !important; border-collapse: collapse !important; }
          .paper th {
            background: #1a1a1a !important;
            color: #C9A227 !important;
            font-size: 7.5pt !important;
            padding: 5px 4px !important;
            white-space: nowrap !important;
          }
          .paper td {
            padding: 6px 4px !important;
            font-size: 8pt !important;
            vertical-align: top !important;
            border-bottom: 1px solid #e5ddc8 !important;
            color: #1a1a1a !important;
          }
          .paper tbody tr { height: auto !important; min-height: 95px !important; }
```

- [ ] **Step 3: Redistribuir larguras das colunas no print**

Substituir o bloco de larguras das colunas por:

```css
          /* COLUMN WIDTHS */
          .paper th:nth-child(1), .paper td:nth-child(1) { width: 4% !important; text-align: center !important; white-space: nowrap !important; padding: 5px 3px !important; }
          .paper th:nth-child(2), .paper td:nth-child(2) { width: 5% !important; text-align: center !important; white-space: nowrap !important; padding: 5px 3px !important; }
          .paper th:nth-child(3), .paper td:nth-child(3) { width: 20% !important; text-align: left !important; padding: 5px 4px !important; }
          .paper th:nth-child(4), .paper td:nth-child(4) { width: 10% !important; text-align: center !important; padding: 5px 3px !important; }
          .paper th:nth-child(5), .paper td:nth-child(5) { width: 23% !important; text-align: left !important; padding: 5px 4px !important; line-height: 1.25 !important; }
          .paper th:nth-child(6), .paper td:nth-child(6) { width: 17% !important; text-align: center !important; padding: 4px 3px !important; }
          .paper th:nth-child(7), .paper td:nth-child(7) { width: 10% !important; text-align: right !important; white-space: nowrap !important; padding: 5px 4px !important; }
          .paper th:nth-child(8), .paper td:nth-child(8) { width: 11% !important; text-align: right !important; white-space: nowrap !important; padding: 5px 4px !important; font-weight: 700 !important; }
```

- [ ] **Step 4: Ajustar imagens, valores, subtotal e total no print**

```css
          /* IMAGES */
          .paper .th-img, .paper .td-img { width: 17% !important; text-align: center !important; }
          .paper .td-img img { max-width: 110px !important; max-height: 82px !important; width: auto !important; height: auto !important; object-fit: contain !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; }
          .paper .placeholder-img { font-size: 26pt !important; color: #C9A227 !important; }

          /* VALUES */
          .paper .curr { font-size: 6.5pt !important; margin-right: 2px !important; }
          .paper .val-cell { font-size: 8pt !important; font-weight: 600 !important; white-space: nowrap !important; }

          /* SUBTOTAL */
          .paper .subt td {
            background: #F7F4EC !important;
            font-weight: 700 !important;
            color: #0A0A0A !important;
            font-size: 9pt !important;
            padding: 7px 12px !important;
            border-top: 2px solid #C9A227 !important;
            border-bottom: none !important;
            text-align: right !important;
          }
          .paper .subt td:first-child { text-align: right !important; padding-right: 12px !important; }
          .paper .subt td:last-child { white-space: nowrap !important; }

          /* GRAND TOTAL */
          .paper .grand {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: #1a1a1a !important;
            color: #C9A227 !important;
            padding: 10px 14px !important;
            border-radius: 5px !important;
            margin-top: 12px !important;
            font-weight: 700 !important;
            font-size: 10.5pt !important;
          }
          .paper .grand span { color: #C9A227 !important; }
          .paper .grand span:last-child { white-space: nowrap !important; text-align: right !important; }

          /* FOOTER */
          .paper .foot { margin-top: 18px !important; padding-top: 12px !important; font-size: 8.5pt !important; }
          .paper .sig { margin-top: 24px !important; }

          /* ZEBRADO */
          .paper tbody tr:nth-child(even) td { background: #f5f3ed !important; }
          .paper tbody tr:nth-child(odd) td { background: #ffffff !important; }
```

- [ ] **Step 5: Verificar via print preview**

Run: Na página `/proposta`, clicar em “Baixar PDF” (`window.print()`).
Expected: O PDF gerado mostra o novo cabeçalho, cards lado a lado, tabela com colunas redistribuídas e imagens maiores.

- [ ] **Step 6: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): ajusta estilos de impressão para novo layout"
```

---

## Task 4: Corrigir placeholder de imagem e garantir total geral visível

**Files:**
- Modify: `src/app/proposta/page.tsx:216-222` (placeholder da imagem na tabela)

- [ ] **Step 1: Substituir emoji por placeholder em contorno**

Localize o span com `placeholder-img` e substitua:

```tsx
                          <td data-label="Ilustr." className="td-img">
                            {product?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <div className="placeholder-box">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a6d1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </td>
```

- [ ] **Step 2: Adicionar estilos do placeholder no CSS base e no print**

No CSS base (fora de `@media print`), substituir a regra `.paper .placeholder-img` por:

```css
        .paper .placeholder-box { width: 110px; height: 82px; display: flex; align-items: center; justify-content: center; background: #F7F4EC; border: 1px solid #E8E4DA; border-radius: 4px; margin: 0 auto; }
        .paper .placeholder-box svg { width: 32px; height: 32px; }
```

Dentro de `@media print`, substituir `.paper .placeholder-img` por:

```css
          .paper .placeholder-box { width: 110px !important; height: 82px !important; background: #F7F4EC !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; margin: 0 auto !important; }
          .paper .placeholder-box svg { width: 32px !important; height: 32px !important; }
```

- [ ] **Step 3: Garantir que o total geral apareça**

Verifique se o JSX do grand total está assim (já está, mas confirmar):

```tsx
            {/* Grand total */}
            <div className="grand">
              <span>TOTAL DE {pieces} PEÇAS</span>
              <span>TOTAL {brl(total)}</span>
            </div>
```

O ajuste no CSS do print (Task 3) já corrige a visibilidade. Se ainda não aparecer, adicionar explicitamente:

```css
          .paper .grand span { color: #C9A227 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
```

- [ ] **Step 4: Testar PDF com produtos sem imagem**

Run: Gerar PDF com um orçamento que tenha produtos sem imagem cadastrada.
Expected: Aparece o ícone de caixa/móvel em contorno dourado no lugar do emoji colorido.

- [ ] **Step 5: Commit**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): substitui emoji por placeholder e garante total geral visível"
```

---

## Task 5: Validação final e ajustes finos

**Files:**
- Modify: `src/app/proposta/page.tsx` (ajustes finos conforme necessário)

- [ ] **Step 1: Testar com orçamento de exemplo completo**

Run:
1. Certificar-se de que existem produtos com e sem imagens no catálogo.
2. Criar ou selecionar um orçamento com vários produtos e pelo menos um ambiente.
3. Ir para `/proposta`, selecionar o orçamento e clicar em “Baixar PDF”.
4. No diálogo de impressão, escolher “Salvar como PDF”.

- [ ] **Step 2: Verificar checklist visual**

Expected:
- [ ] Cabeçalho mostra logo + MENDES DESIGN + slogan, nada à direita.
- [ ] Dois cards (empresa e cliente) aparecem lado a lado sem quebrar.
- [ ] Tabela cabe na largura A4 retrato sem scroll/overflow.
- [ ] Imagens aparecem grandes (~110 × 82 px) e sem distorcer.
- [ ] Placeholder aparece para produtos sem imagem.
- [ ] Total geral aparece legível na barra preta.
- [ ] Rodapé não fica colado no total geral.

- [ ] **Step 3: Ajustar fino se necessário**

Se a tabela ainda parecer espremida ou os valores quebrarem, ajustar:
- Larguras percentuais no bloco `COLUMN WIDTHS`.
- Tamanho da fonte em `.paper td` e `.paper th`.
- Padding dos cards e do papel.

- [ ] **Step 4: Commit final**

```bash
git add src/app/proposta/page.tsx
git commit -m "feat(pdf): validação final do redesign do PDF de orçamento"
```

---

## Self-Review

### Spec coverage
- Cabeçalho com logo à esquerda → Task 1.
- Cards empresa/cliente → Task 1.
- Tabela espaçosa com colunas redistribuídas → Task 3.
- Imagens maiores → Tasks 2 e 3.
- Placeholder sem emoji → Task 4.
- Total geral visível → Tasks 3 e 4.
- Rodapé organizado → Task 3.
- Margens e configuração de página → Task 3.
- Validação visual → Task 5.

### Placeholder scan
- Nenhum TBD, TODO ou “implement later”.
- Código real fornecido em cada step.
- Comandos e expected outputs definidos.

### Type consistency
- As classes CSS citadas (`paper`, `info-cards`, `info-card`, `td-img`, `val-cell`, `curr`, `subt`, `grand`, `area-t`) são usadas consistentemente.
- Nenhuma função ou tipo novo é introduzido.
