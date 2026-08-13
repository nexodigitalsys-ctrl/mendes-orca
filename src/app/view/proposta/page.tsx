"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATALOG, CLIENTS, DEFAULT_COMPANY, brl, paymentLabel, type Product, type Client, type Company, type Quote } from "@/lib/constants";
import { useSupabaseCollection, useSupabaseCompany } from "@/lib/store";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function formatDatePtBR(d: string) {
  const date = new Date(d + "T12:00:00");
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function envSubtotal(env: Quote["environments"][0], catalog: Product[]) {
  return env.items.reduce((sum, item) => {
    const product = catalog.find((p) => p.code === item.productCode);
    const price = item.unitPrice ?? product?.price ?? 0;
    return sum + price * item.qty;
  }, 0);
}

function quoteTotalPieces(q: Quote) {
  return q.environments.reduce((s, e) => s + e.items.reduce((s2, i) => s2 + i.qty, 0), 0);
}

function quoteSubtotal(q: Quote, catalog: Product[]) {
  return q.environments.reduce((s, e) => s + envSubtotal(e, catalog), 0);
}

function PropostaViewInner() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("id");

  const [quotes] = useSupabaseCollection<Quote>({
    endpoint: "/api/quotes",
    seed: [],
    localStorageKey: "mendes-quotes",
  });
  const [catalog] = useSupabaseCollection<Product>({
    endpoint: "/api/products",
    seed: CATALOG,
    localStorageKey: "mendes-catalog",
  });
  const [clients] = useSupabaseCollection<Client>({
    endpoint: "/api/clients",
    seed: CLIENTS,
    localStorageKey: "mendes-clients",
  });
  const [company] = useSupabaseCompany<Company>(DEFAULT_COMPANY);

  const quote = useMemo(
    () => quotes.find((q) => q.id === quoteId) || null,
    [quotes, quoteId]
  );

  const client = quote ? clients.find((c) => c.id === quote.clientId) : null;

  const subtotal = quote ? quoteSubtotal(quote, catalog) : 0;
  const discount = quote?.discount ?? 0;
  const total = subtotal - discount;
  const pieces = quote ? quoteTotalPieces(quote) : 0;

  const paymentText = quote?.paymentMethods?.length
    ? quote.paymentMethods.map((m) => paymentLabel(m)).join(" · ")
    : "A combinar";

  const docTitle = (quote?.docTitle || "ORÇAMENTO").toUpperCase();

  if (!quote) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>Proposta não encontrada.</p>
      </div>
    );
  }

  return (
    <>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{docTitle} {quote.number} — Mendes Design Móveis</title>
      </head>

      <div className="page-container">
        {/* Botão Baixar PDF — hidden on print */}
        <div className="print-hide" style={{ textAlign: "center", marginBottom: "16px" }}>
          <button
            onClick={() => {
              document.body.classList.add("force-print-layout");
              setTimeout(() => {
                window.print();
                setTimeout(() => document.body.classList.remove("force-print-layout"), 500);
              }, 100);
            }}
            style={{
              background: "#C9A227",
              color: "#0A0A0A",
              border: "none",
              borderRadius: "12px",
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            📄 Baixar PDF
          </button>
        </div>

        <div className="paper">
          {/* Header */}
          <div className="ph">
            <div className="plogo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.logo || "/logo-md.png"}
                alt={company.name}
                className="plogo-img"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = document.createElement("div");
                  fallback.className = "plogo-fallback";
                  fallback.textContent = "MD";
                  target.parentElement?.appendChild(fallback);
                }}
              />
              <div className="plogo-info">
                <h2>MENDES DESIGN</h2>
                <span className="company-slogan">MÓVEIS PARA ÁREAS EXTERNAS</span>
              </div>
            </div>
            <div className="quote-number">
              <span>{docTitle}</span>
              <b>{quote.number}</b>
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
              <div style={{ marginTop: "8px" }}>{formatDatePtBR(quote.createdAt)}</div>
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

          {/* Title */}
          <div className="orc-title">{docTitle}</div>

          {/* Environments */}
          {quote.environments.map((env, ei) => (
            <div key={ei}>
              <div className="area-t">▸ {env.name}</div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qtd</th>
                    <th>Código / Produto</th>
                    <th>Medidas</th>
                    <th>Acabamento</th>
                    <th className="th-img">Ilustr.</th>
                    <th>Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {env.items.map((item, ii) => {
                    const product = catalog.find((p) => p.code === item.productCode);
                    const unitPrice = item.unitPrice ?? product?.price ?? 0;
                    return (
                      <tr key={ii}>
                        <td data-label="Item">{ii + 1}</td>
                        <td data-label="Qtd">{item.qty}</td>
                        <td data-label="Código / Produto">
                          <b>{item.productCode}</b>
                          {product && <><br />{product.name}</>}
                        </td>
                        <td data-label="Medidas">{product?.meas || "—"}</td>
                        <td data-label="Acabamento">{product?.finish || "—"}</td>
                        <td data-label="Ilustr." className="td-img">
                          {product?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const placeholder = document.createElement("div");
                                placeholder.className = "placeholder-box";
                                placeholder.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a6d1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
                                e.currentTarget.parentElement?.appendChild(placeholder);
                              }}
                            />
                          ) : (
                            <div className="placeholder-box">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a6d1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td data-label="Unit." className="val-cell"><span className="curr">R$</span>{brl(unitPrice).replace("R$", "").trim()}</td>
                        <td data-label="Total" className="val-cell"><span className="curr">R$</span>{brl(unitPrice * item.qty).replace("R$", "").trim()}</td>
                      </tr>
                    );
                  })}
                  <tr className="subt">
                    <td colSpan={7} style={{ textAlign: "right" }}>SUBTOTAL</td>
                    <td className="val-cell"><span className="curr">R$</span>{brl(envSubtotal(env, catalog)).replace("R$", "").trim()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Grand total */}
          <div className="grand">
            <span>TOTAL DE {pieces} PEÇAS</span>
            <span>TOTAL {brl(total)}</span>
          </div>

          {/* Footer */}
          <div className="foot">
            <b>Condições de pagamento:</b> {paymentText}{quote.paymentNotes ? <> &nbsp;·&nbsp; {quote.paymentNotes}</> : null} &nbsp;·&nbsp;
            <b>Prazo de entrega:</b> {quote.deliveryTime || "90 DIAS"}
            {docTitle !== "PEDIDO" && <>&nbsp;·&nbsp;<b>Validade:</b> {quote.validity || "15 dias"}</>}
            <br />
            {quote.footerNote || "IPI incluso · Frete CIF · Aguardamos retorno!"}
          </div>

          {/* Signature */}
          <div className="sig">
            <div className="line" />
            At.te, JOÃO BATISTA — Mendes Design Móveis<br />
            34 9 9899-2309
          </div>
        </div>
      </div>

      {/* All styles */}
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }

        * { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          background: #f5f5f0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .page-container {
          padding: 16px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* ===== PAPER BASE ===== */
        .paper {
          background: #fff;
          color: #1a1a1a;
          border-radius: 8px;
          padding: 18px 16px;
          font-size: 12px;
          line-height: 1.5;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 12px rgba(0,0,0,.15);
          width: 100%;
        }
        .paper .ph {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
        .paper .company-slogan { font-size: 9pt; letter-spacing: 2px; text-transform: uppercase; color: #8a6d1a; margin-top: 2px; display: block; }
        .paper .quote-number { text-align: right; display: flex; flex-direction: column; justify-content: center; gap: 2px; white-space: nowrap; }
        .paper .quote-number span { font-size: 9pt; letter-spacing: 1px; text-transform: uppercase; color: #8a6d1a; }
        .paper .quote-number b { font-family: 'Playfair Display', serif; font-size: 16pt; color: #0A0A0A; letter-spacing: 1px; }
        .paper .curr { font-size: 8pt; margin-right: 3px; color: #8a6d1a; }

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
          color: #8a6d1a;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .paper .info-card b { color: #8a6d1a; }

        .paper .orc-title { font-weight: 700; font-size: 14px; letter-spacing: 3px; text-align: center; margin-bottom: 12px; }
        .paper .area-t {
          background: linear-gradient(90deg, #C9A227, #B8911F);
          color: #1a1a1a;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          padding: 6px 10px;
          margin: 14px 0 0;
          text-transform: uppercase;
          border-radius: 4px 4px 0 0;
        }
        .paper table { width: 100%; border-collapse: collapse; margin-bottom: 8px; table-layout: fixed; }
        .paper th {
          background: #0A0A0A;
          color: #C9A227;
          font-size: 9.5px;
          letter-spacing: .5px;
          padding: 8px 6px;
          text-align: left;
          text-transform: uppercase;
        }
        .paper td { border-bottom: 1px solid #E8E4DA; padding: 8px 6px; font-size: 10.5px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
        .paper .subt td { background: #F7F4EC; font-weight: 700; font-size: 11px; border-top: 2px solid #C9A227; text-align: right; }
        .paper .grand {
          display: flex;
          justify-content: space-between;
          background: #0A0A0A;
          color: #E5C76B;
          padding: 12px 16px;
          border-radius: 6px;
          margin-top: 14px;
          font-weight: 700;
          font-size: 13px;
        }
        .paper .foot { margin-top: 18px; font-size: 10px; color: #555; border-top: 1px solid #E8E4DA; padding-top: 12px; line-height: 1.6; }
        .paper .sig { margin-top: 24px; text-align: center; font-size: 11px; color: #333; }
        .paper .sig .line { width: 220px; border-top: 1px solid #999; margin: 0 auto 5px; }
        .paper .th-img, .paper .td-img { width: 120px; text-align: center; }
        .paper .td-img img { width: 110px; height: 82px; object-fit: contain; border-radius: 4px; border: 1px solid #E8E4DA; }
        .paper .placeholder-box { width: 110px; height: 82px; display: flex; align-items: center; justify-content: center; background: #F7F4EC; border: 1px solid #E8E4DA; border-radius: 4px; margin: 0 auto; }
        .paper .placeholder-box svg { width: 32px; height: 32px; }

        /* COLUMN WIDTHS */
        .paper th:nth-child(1), .paper td:nth-child(1) { width: 5%; text-align: center; }
        .paper th:nth-child(2), .paper td:nth-child(2) { width: 5%; text-align: center; }
        .paper th:nth-child(3), .paper td:nth-child(3) { width: 18%; }
        .paper th:nth-child(4), .paper td:nth-child(4) { width: 10%; text-align: center; }
        .paper th:nth-child(5), .paper td:nth-child(5) { width: 22%; }
        .paper th:nth-child(6), .paper td:nth-child(6) { width: 15%; text-align: center; }
        .paper th:nth-child(7), .paper td:nth-child(7) { width: 12%; text-align: right; }
        .paper th:nth-child(8), .paper td:nth-child(8) { width: 13%; text-align: right; font-weight: 700; }

        /* ===== PRINT — A4 portrait ===== */
        @media print {
          @page { size: A4 portrait; margin: 8mm; }

          html, body {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow-x: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .page-container {
            padding: 0 !important;
            max-width: none !important;
          }

          .paper {
            min-width: 0 !important;
            max-width: none !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 9pt !important;
          }

          .paper .ph {
            border-bottom: 3px solid #C9A227 !important;
            padding-bottom: 10px !important;
            margin-bottom: 12px !important;
            gap: 10px !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
          }
          .paper .plogo-img { max-height: 48px !important; max-width: 48px !important; }
          .paper .plogo-fallback { width: 48px !important; height: 48px !important; font-size: 16px !important; }
          .paper .plogo h2 { font-size: 16pt !important; letter-spacing: 1.5px !important; }
          .paper .company-slogan { font-size: 8pt !important; }
          .paper .quote-number { text-align: right !important; gap: 1px !important; width: auto !important; flex-direction: column !important; }
          .paper .quote-number span { font-size: 7.5pt !important; letter-spacing: 1px !important; }
          .paper .quote-number b { font-size: 14pt !important; letter-spacing: 0.5px !important; }
          .paper .curr { font-size: 6.5pt !important; margin-right: 2px !important; }

          /* FORCE IMAGES TO PRINT */
          .paper img {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

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
            padding: 8px !important;
            font-size: 8.5pt !important;
            line-height: 1.45 !important;
          }
          .paper .info-card-title { font-size: 7.5pt !important; margin-bottom: 5px !important; }

          /* TABLE - FORCE DESKTOP LAYOUT */
          .paper table {
            display: table !important;
            table-layout: fixed !important;
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8pt !important;
          }
          .paper thead {
            display: table-header-group !important;
          }
          .paper tbody {
            display: table-row-group !important;
          }
          .paper table tr {
            display: table-row !important;
            page-break-inside: avoid !important;
          }
          .paper th {
            display: table-cell !important;
            background: #1a1a1a !important;
            color: #C9A227 !important;
            font-weight: 600 !important;
            font-size: 7.5pt !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            padding: 4px 3px !important;
            text-align: left !important;
            white-space: nowrap !important;
            border: none !important;
            vertical-align: middle !important;
          }
          .paper td {
            display: table-cell !important;
            vertical-align: top !important;
            padding: 4px 3px !important;
            font-size: 8pt !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            border: none !important;
            border-bottom: 1px solid #e5ddc8 !important;
          }

          /* HIDE MOBILE LABELS */
          .paper table tbody td::before {
            display: none !important;
            content: none !important;
          }

          /* COLUMN WIDTHS */
          .paper th:nth-child(1), .paper td:nth-child(1) { width: 4% !important; text-align: center !important; }
          .paper th:nth-child(2), .paper td:nth-child(2) { width: 5% !important; text-align: center !important; }
          .paper th:nth-child(3), .paper td:nth-child(3) { width: 16% !important; }
          .paper th:nth-child(4), .paper td:nth-child(4) { width: 9% !important; text-align: center !important; }
          .paper th:nth-child(5), .paper td:nth-child(5) { width: 26% !important; font-size: 7.5pt !important; line-height: 1.3 !important; }
          .paper th:nth-child(6), .paper td:nth-child(6) { width: 15% !important; text-align: center !important; }
          .paper th:nth-child(7), .paper td:nth-child(7) { width: 12% !important; text-align: right !important; }
          .paper th:nth-child(8), .paper td:nth-child(8) { width: 13% !important; text-align: right !important; font-weight: 700 !important; }

          /* IMAGES */
          .paper .th-img, .paper .td-img { width: 15% !important; text-align: center !important; }
          .paper .td-img img { max-width: 90px !important; max-height: 68px !important; width: auto !important; height: auto !important; object-fit: contain !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; }
          .paper .placeholder-box { width: 90px !important; height: 68px !important; display: flex !important; }
          .paper .placeholder-box svg { width: 26px !important; height: 26px !important; }

          /* VALUES */
          .paper .val-cell { font-size: 7.5pt !important; font-weight: 600 !important; white-space: nowrap !important; }
          .paper td:nth-child(3) b { font-size: 8pt !important; font-weight: 700 !important; }
          .paper td:nth-child(3) { line-height: 1.25 !important; }
          .paper td:nth-child(3) br + * { font-size: 7.5pt !important; color: #555 !important; }

          /* SUBTOTAL */
          .paper .subt td {
            display: table-cell !important;
            background: #F7F4EC !important;
            font-weight: 700 !important;
            color: #0A0A0A !important;
            font-size: 9pt !important;
            padding: 7px 12px !important;
            border-top: 2px solid #C9A227 !important;
            border-bottom: none !important;
            text-align: right !important;
          }

          /* GRAND TOTAL */
          .paper .grand {
            display: flex !important;
            flex-direction: row !important;
            background: #1a1a1a !important;
            color: #C9A227 !important;
            padding: 8px 12px !important;
            border-radius: 5px !important;
            margin-top: 10px !important;
            font-size: 10pt !important;
            justify-content: space-between !important;
          }
          .paper .grand span { color: #C9A227 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          /* FOOTER */
          .paper .foot { margin-top: 14px !important; padding-top: 10px !important; font-size: 8pt !important; }
          .paper .sig { margin-top: 18px !important; font-size: 10px !important; }

          /* AREA BAR */
          .paper .area-t {
            background: linear-gradient(90deg, #C9A227, #B8911F) !important;
            color: #1a1a1a !important;
            padding: 5px 10px !important;
            font-weight: 700 !important;
            font-size: 9pt !important;
          }

          /* ZEBRADO */
          .paper tbody tr:nth-child(even) td { background: #f5f3ed !important; }
          .paper tbody tr:nth-child(odd) td { background: #ffffff !important; }

          /* === ANULAR COMPLETAMENTE O LAYOUT MOBILE DENTRO DO PRINT === */
          .page-container {
            padding: 0 !important;
            max-width: 194mm !important;
            margin: 0 auto !important;
          }

          .paper .ph {
            flex-wrap: nowrap !important;
          }
          .paper .quote-number {
            width: auto !important;
            text-align: right !important;
            flex-direction: column !important;
          }

          /* Forçar tabela em linha — nunca empilhada */
          .paper table,
          .paper table thead,
          .paper table tbody,
          .paper table tr {
            display: revert !important;
          }
          .paper table thead { display: table-header-group !important; }
          .paper table tbody { display: table-row-group !important; }
          .paper table tr { display: table-row !important; }
          .paper table th,
          .paper table td {
            display: table-cell !important;
            width: auto !important;
          }

          /* Esconder labels mobile no print */
          .paper table tbody td::before {
            display: none !important;
            content: none !important;
          }

          /* Info cards lado a lado */
          .paper .info-cards {
            grid-template-columns: 1fr 1fr !important;
          }

          /* Grand total em linha */
          .paper .grand {
            flex-direction: row !important;
          }
        }

        /* Hide button on print */
        @media print {
          .print-hide { display: none !important; }
        }

        /* ===== FORCE PRINT LAYOUT (applied via JS before window.print) ===== */
        body.force-print-layout,
        body.force-print-layout .page-container,
        body.force-print-layout .paper {
          width: 210mm !important;
          min-width: 210mm !important;
          max-width: 210mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        body.force-print-layout .paper {
          box-shadow: none !important;
          border-radius: 0 !important;
          font-size: 9pt !important;
        }
        body.force-print-layout .paper .ph { flex-wrap: nowrap !important; }
        body.force-print-layout .paper .quote-number {
          width: auto !important;
          text-align: right !important;
          flex-direction: column !important;
        }
        body.force-print-layout .paper .info-cards { grid-template-columns: 1fr 1fr !important; }
        body.force-print-layout .paper table { display: table !important; table-layout: fixed !important; width: 100% !important; }
        body.force-print-layout .paper table thead { display: table-header-group !important; }
        body.force-print-layout .paper table tbody { display: table-row-group !important; }
        body.force-print-layout .paper table tr { display: table-row !important; }
        body.force-print-layout .paper table th,
        body.force-print-layout .paper table td { display: table-cell !important; }
        body.force-print-layout .paper table tbody td::before { display: none !important; content: none !important; }
        body.force-print-layout .paper .grand { flex-direction: row !important; }
        body.force-print-layout .print-hide { display: none !important; }

        /* ===== MOBILE (screen only — print always uses desktop layout) ===== */
        @media screen and (max-width: 720px) {
          .page-container { padding: 8px; }
          .paper { padding: 14px 12px; }

          .paper .ph {
            flex-wrap: wrap;
            gap: 10px;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .paper .quote-number {
            width: 100%;
            text-align: left;
            flex-direction: row;
            align-items: baseline;
            gap: 8px;
          }
          .paper .quote-number span { font-size: 8pt; }
          .paper .quote-number b { font-size: 12pt; }

          .paper .info-cards { grid-template-columns: 1fr; gap: 10px; }
          .paper .info-card { font-size: 10.5px; padding: 10px; }

          .paper table { table-layout: auto; }
          .paper table thead { display: none; }
          .paper table tbody tr {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2px;
            padding: 10px;
            border-bottom: 1px solid #E8E4DA;
          }
          .paper table tbody tr.subt {
            display: flex;
            justify-content: space-between;
            padding: 8px 10px;
          }
          .paper table tbody td {
            border: none;
            padding: 2px 0;
            font-size: 11px;
          }
          .paper table tbody td::before {
            content: attr(data-label);
            display: inline-block;
            font-weight: 700;
            color: #8a6d1a;
            font-size: 9px;
            letter-spacing: .5px;
            text-transform: uppercase;
            margin-right: 6px;
          }
          .paper .td-img { text-align: center; }
          .paper .td-img img { width: 100%; max-width: 200px; height: auto; }
          .paper .placeholder-box { width: 100%; max-width: 160px; height: 120px; }
          .paper .placeholder-box svg { width: 40px; height: 40px; }
          .paper .curr { margin-right: 3px; color: #8a6d1a; }
          .paper .grand {
            flex-direction: column;
            gap: 4px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

export default function PropostaViewPage() {
  return (
    <Suspense>
      <PropostaViewInner />
    </Suspense>
  );
}
