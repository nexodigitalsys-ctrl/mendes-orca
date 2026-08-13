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
      </head>
      {/* ===== PAPER ===== */}
      <div className="paper-wrap">
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

      {/* All styles - Print-ready version */}
      <style>{`
        @page { size: A4; margin: 6mm 8mm; }

        html, body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .paper-wrap {
          overflow: visible !important;
          padding: 10px;
        }

        .paper {
          min-width: 0 !important;
          max-width: none !important;
          width: 100% !important;
          box-sizing: border-box !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 10px 8px;
          font-size: 8pt !important;
          background: #fff !important;
          color: #1a1a1a !important;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }
        .paper *, .paper td, .paper th, .paper h2, .paper .foot, .paper .sig {
          color: #1a1a1a !important;
        }

        /* HEADER */
        .paper .ph {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 3px solid #C9A227 !important;
          padding-bottom: 10px !important;
          margin-bottom: 12px !important;
          gap: 10px !important;
        }
        .paper .plogo { display: flex; gap: 10px; align-items: center; }
        .paper .plogo-img { max-height: 48px !important; max-width: 48px !important; width: auto; object-fit: contain; flex-shrink: 0; }
        .paper .plogo-fallback { width: 48px !important; height: 48px !important; border-radius: 50%; background: #0A0A0A; color: #C9A227; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 16px !important; flex-shrink: 0; }
        .paper .plogo-info { flex: 1; min-width: 0; }
        .paper .plogo h2, .paper .plogo-info h2 { font-family: 'Playfair Display', serif; font-size: 16pt !important; letter-spacing: 1.5px !important; font-weight: 700; margin: 0; }
        .paper .company-slogan { font-size: 8pt !important; letter-spacing: 2px; text-transform: uppercase; color: #8a6d1a !important; margin-top: 2px; display: block; }
        .paper .quote-number { text-align: right !important; display: flex; flex-direction: column; justify-content: center; gap: 1px !important; white-space: nowrap; }
        .paper .quote-number span { font-size: 7.5pt !important; letter-spacing: 1px !important; text-transform: uppercase; color: #8a6d1a !important; }
        .paper .quote-number b { font-family: 'Playfair Display', serif; font-size: 14pt !important; color: #0A0A0A !important; letter-spacing: 0.5px !important; }
        .paper .curr { font-size: 6.5pt !important; margin-right: 2px !important; color: #8a6d1a !important; }

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
        .paper .info-card-title { font-size: 7.5pt !important; margin-bottom: 5px !important; color: #8a6d1a !important; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .paper .info-card b { color: #8a6d1a !important; }

        /* TABLE */
        .paper table { table-layout: fixed !important; width: 100% !important; border-collapse: collapse !important; max-width: none !important; }
        .paper table thead { display: table-header-group !important; }
        .paper table tbody { display: table-row-group !important; }
        .paper table tbody tr, .paper table thead tr { display: table-row !important; }
        .paper th {
          display: table-cell !important;
          box-sizing: border-box !important;
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
          box-sizing: border-box !important;
          vertical-align: top !important;
          padding: 4px 3px !important;
          font-size: 8pt !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow: hidden !important;
          border: none !important;
          border-bottom: 1px solid #e5ddc8 !important;
          color: #1a1a1a !important;
        }
        .paper tbody tr { height: auto !important; min-height: 70px !important; }

        /* COLUMN WIDTHS */
        .paper th:nth-child(1), .paper td:nth-child(1) { width: 4% !important; text-align: center !important; white-space: nowrap !important; padding: 5px 3px !important; }
        .paper th:nth-child(2), .paper td:nth-child(2) { width: 5% !important; text-align: center !important; white-space: nowrap !important; padding: 5px 3px !important; }
        .paper th:nth-child(3), .paper td:nth-child(3) { width: 18% !important; text-align: left !important; padding: 5px 4px !important; }
        .paper th:nth-child(4), .paper td:nth-child(4) { width: 9% !important; text-align: center !important; padding: 5px 3px !important; }
        .paper th:nth-child(5), .paper td:nth-child(5) { width: 20% !important; text-align: left !important; padding: 5px 4px !important; line-height: 1.25 !important; }
        .paper th:nth-child(6), .paper td:nth-child(6) { width: 14% !important; text-align: center !important; padding: 4px 3px !important; }
        .paper th:nth-child(7), .paper td:nth-child(7) { width: 13% !important; text-align: right !important; white-space: nowrap !important; padding: 5px 4px !important; }
        .paper th:nth-child(8), .paper td:nth-child(8) { width: 14% !important; text-align: right !important; white-space: nowrap !important; padding: 5px 4px !important; font-weight: 700 !important; }

        /* HIDE MOBILE LABELS */
        .paper table tbody td::before { display: none !important; }

        /* IMAGES */
        .paper .th-img, .paper .td-img { width: 15% !important; text-align: center !important; }
        .paper .td-img img { max-width: 90px !important; max-height: 68px !important; width: auto !important; height: auto !important; object-fit: contain !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; }
        .paper .placeholder-box { width: 90px !important; height: 68px !important; display: flex !important; align-items: center !important; justify-content: center !important; background: #F7F4EC !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; margin: 0 auto !important; }
        .paper .placeholder-box svg { width: 26px !important; height: 26px !important; }

        /* VALUES */
        .paper .val-cell { font-size: 7.5pt !important; font-weight: 600 !important; white-space: nowrap !important; }

        /* CODE bold, name smaller */
        .paper td:nth-child(3) b { font-size: 8pt !important; font-weight: 700 !important; }
        .paper td:nth-child(3) { line-height: 1.25 !important; }
        .paper td:nth-child(3) br + * { font-size: 7.5pt !important; color: #555 !important; }

        /* ORC TITLE */
        .paper .orc-title { font-weight: 700; font-size: 14px; letter-spacing: 3px; text-align: center; margin-bottom: 12px; }

        /* AREA BAR */
        .paper .area-t {
          background: linear-gradient(90deg, #C9A227, #B8911F) !important;
          color: #1a1a1a !important;
          font-weight: 700 !important;
          font-size: 9pt !important;
          letter-spacing: 1px;
          padding: 5px 10px !important;
          margin: 14px 0 0;
          text-transform: uppercase;
          border-radius: 4px 4px 0 0;
        }

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
          padding: 8px 12px !important;
          border-radius: 5px !important;
          margin-top: 10px !important;
          font-weight: 700 !important;
          font-size: 10pt !important;
        }
        .paper .grand span { color: #C9A227 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .paper .grand span:last-child { white-space: nowrap !important; text-align: right !important; }

        /* FOOTER */
        .paper .foot { margin-top: 14px !important; padding-top: 10px !important; font-size: 8pt !important; color: #555 !important; border-top: 1px solid #E8E4DA; line-height: 1.6; }
        .paper .sig { margin-top: 18px !important; font-size: 10px !important; text-align: center; color: #333 !important; }
        .paper .sig .line { width: 220px; border-top: 1px solid #999; margin: 0 auto 5px; }

        /* ZEBRADO */
        .paper tbody tr:nth-child(even) td { background: #f5f3ed !important; }
        .paper tbody tr:nth-child(odd) td { background: #ffffff !important; }

        /* ===== PRINT ===== */
        @media print {
          .paper-wrap { padding: 0 !important; }
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
