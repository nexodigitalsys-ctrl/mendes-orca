"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { CATALOG, CLIENTS, DEFAULT_COMPANY, brl, type Product, type Client, type Company, type Quote } from "@/lib/constants";
import { useLocalCollection } from "@/lib/store";

const PAYMENT_LABELS: Record<string, string> = {
  cheque: "Cheque",
  pix: "Depósito / PIX",
  boleto: "Boleto",
  cartao: "Cartão de crédito — parcelado em até 10x",
};

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

export default function PropostaPage() {
  const [quotes] = useLocalCollection<Quote>("mendes-quotes", []);
  const [catalog] = useLocalCollection<Product>("mendes-catalog", CATALOG);
  const [clients] = useLocalCollection<Client>("mendes-clients", CLIENTS);
  const [companies] = useLocalCollection<Company>("mendes-company", [DEFAULT_COMPANY]);
  const company = companies[0] || DEFAULT_COMPANY;
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (quotes.length > 0 && !selectedId) {
      setSelectedId(quotes[quotes.length - 1].id);
    }
  }, [quotes, selectedId]);

  const quote = useMemo(
    () => quotes.find((q) => q.id === selectedId) || null,
    [quotes, selectedId]
  );

  const client = quote ? clients.find((c) => c.id === quote.clientId) : null;

  const subtotal = quote ? quoteSubtotal(quote, catalog) : 0;
  const discount = quote?.discount ?? 0;
  const total = subtotal - discount;
  const pieces = quote ? quoteTotalPieces(quote) : 0;

  const paymentText = quote?.paymentMethods?.length
    ? quote.paymentMethods.map((m) => PAYMENT_LABELS[m] || m).join(" · ")
    : "A combinar";

  const whatsappUrl = quote
    ? `https://wa.me/?text=${encodeURIComponent(
        `Olá! Segue a proposta ${quote.number} — Mendes Design Móveis. Total: ${brl(total)}. Qualquer dúvida estou à disposição!`
      )}`
    : "#";

  if (!quote) {
    return (
      <AppLayout>
        <div className="p-5">
          <h1 className="font-serif text-2xl text-gold mb-2">Proposta — Preview</h1>
          <p className="text-text2 text-[13px] mb-4">Assim o cliente recebe. Preto + dourado Mendes.</p>
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text2 mb-4">Nenhum orçamento disponível. Crie um primeiro.</p>
            <Link
              href="/orcamento"
              className="bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm inline-flex items-center gap-2 hover:bg-gold-d transition-colors"
            >
              + Novo Orçamento
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-5">
        {/* Controls — hidden on print */}
        <div className="print-hide">
          <h1 className="font-serif text-2xl text-gold mb-1">Proposta — Preview</h1>
          <p className="text-text2 text-[13px] mb-4">Assim o cliente recebe. Preto + dourado Mendes.</p>

          <div className="flex gap-2 mb-4">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
            >
              {quotes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.number} — {q.clientName || clients.find((c) => c.id === q.clientId)?.name || "Cliente"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm hover:bg-gold-d transition-colors"
            >
              ⬇️ Baixar PDF
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm rounded-xl border border-gold text-gold hover:bg-gold/10 transition-colors text-center"
            >
              💬 WhatsApp
            </a>
          </div>

          <Link
            href="/orcamento"
            className="block text-center px-5 py-3 text-sm rounded-xl border border-border text-text2 hover:text-gold hover:border-gold transition-colors"
          >
            ← Voltar e editar
          </Link>

          <div className="h-4" />
        </div>

        {/* ===== PAPER ===== */}
        <div className="paper-wrap">
          <div className="paper">
            {/* Header */}
            <div className="ph">
              <div className="plogo">
                {company.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={company.logo} alt={company.name} width={46} height={46} style={{ objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#C9A227", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>MD</div>
                )}
                <div>
                  <h2>{company.name?.split(" MÓVEIS")[0] || "MENDES DESIGN"}</h2>
                  <span className="company-slogan">MÓVEIS PARA ÁREAS EXTERNAS</span>
                  {company.cnpj && <div style={{ fontSize: "9px", color: "#555" }}>CNPJ: {company.cnpj}</div>}
                </div>
              </div>
              <div className="co">
                {company.phone && <>{company.phone}<br /></>}
                {company.city && company.state && <>{company.city} - {company.state}<br /></>}
                {company.email && <>{company.email}<br /></>}
                {formatDatePtBR(quote.createdAt)}<br />
                <b className="co-number">{quote.number}</b>
              </div>
            </div>

            {/* Client block */}
            <div className="cli">
              <div><b>Cliente:</b> {quote.clientName || client?.name || "—"}</div>
              <div><b>CNPJ/CPF:</b> {quote.clientDocument || client?.document || "—"}</div>
              <div><b>Endereço:</b> {quote.clientAddress || client?.address || "—"}</div>
              <div><b>Cidade:</b> {quote.clientCity || client?.city || "—"}</div>
              <div><b>Telefone:</b> {quote.clientPhone || client?.phone || "—"}</div>
              <div><b>Arquiteto(a):</b> {quote.clientArchitect || client?.architect || "—"}</div>
            </div>

            {/* Title */}
            <div className="orc-title">ORÇAMENTO</div>

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
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <span className="placeholder-img">🪑</span>
                            )}
                          </td>
                          <td data-label="Unit.">{brl(unitPrice)}</td>
                          <td data-label="Total">{brl(unitPrice * item.qty)}</td>
                        </tr>
                      );
                    })}
                    <tr className="subt">
                      <td colSpan={7} style={{ textAlign: "right" }}>SUBTOTAL</td>
                      <td>{brl(envSubtotal(env, catalog))}</td>
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
              <b>Condições de pagamento:</b> {paymentText} &nbsp;·&nbsp;
              <b>Prazo de entrega:</b> {quote.deliveryTime || "90 DIAS"} &nbsp;·&nbsp;
              <b>Validade:</b> {quote.validity || "15 dias"}
              <br />
              IPI incluso · Frete CIF · Aguardamos retorno!
            </div>

            {/* Signature */}
            <div className="sig">
              <div className="line" />
              At.te, JOÃO BATISTA — Mendes Design Móveis<br />
              34 9 9899-2309
            </div>
          </div>
        </div>
      </div>

      {/* All styles */}
      <style>{`
        @page { size: A4; margin: 5mm 6mm; }

        /* ===== PAPER BASE (always light, always visible) ===== */
        .paper {
          background: #fff !important;
          color: #1a1a1a !important;
          border-radius: 8px;
          padding: 10px 6px;
          font-size: 12px;
          line-height: 1.45;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 12px rgba(0,0,0,.15);
          max-width: none;
          width: 100%;
          margin: 0;
        }
        .paper *, .paper td, .paper th, .paper h2, .paper .cli, .paper .foot, .paper .sig {
          color: #1a1a1a !important;
        }
        .paper .ph {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #C9A227;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .paper .plogo { display: flex; gap: 10px; align-items: center; }
        .paper .plogo img { height: 46px; width: 46px; object-fit: contain; }
        .paper .plogo h2 { font-family: 'Playfair Display', serif; font-size: 16pt; letter-spacing: 2px; font-weight: 700; margin: 0; }
        .paper .company-slogan { font-size: 8pt; letter-spacing: 2px; text-transform: uppercase; color: #8a6d1a !important; margin-top: 2px; display: block; }
        .paper .co { font-size: 10px; color: #555 !important; text-align: right; line-height: 1.5; }
        .paper .co-number { color: #8a6d1a !important; }
        .paper .cli {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
          background: #F7F4EC;
          border: 1px solid #E5DDC8;
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 14px;
          font-size: 11px;
        }
        .paper .cli b { color: #8a6d1a !important; }
        .paper .orc-title { font-weight: 700; font-size: 13px; letter-spacing: 2px; margin-bottom: 4px; }
        .paper .area-t {
          background: linear-gradient(90deg, #C9A227, #B8911F);
          color: #1a1a1a !important;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          padding: 5px 10px;
          margin: 12px 0 0;
          text-transform: uppercase;
          border-radius: 4px 4px 0 0;
        }
        .paper table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        .paper th {
          background: #0A0A0A;
          color: #C9A227 !important;
          font-size: 9.5px;
          letter-spacing: .5px;
          padding: 6px 5px;
          text-align: left;
          text-transform: uppercase;
        }
        .paper td { border-bottom: 1px solid #E8E4DA; padding: 7px 5px; font-size: 10.5px; vertical-align: top; color: #1a1a1a !important; }
        .paper .subt td { background: #F7F4EC; font-weight: 700; font-size: 11px; border-top: 2px solid #C9A227; text-align: right !important; }
        .paper .grand {
          display: flex;
          justify-content: space-between;
          background: #0A0A0A;
          color: #E5C76B !important;
          padding: 10px 14px;
          border-radius: 6px;
          margin-top: 12px;
          font-weight: 700;
          font-size: 13px;
        }
        .paper .foot { margin-top: 16px; font-size: 10px; color: #555 !important; border-top: 1px solid #E8E4DA; padding-top: 10px; line-height: 1.5; }
        .paper .sig { margin-top: 22px; text-align: center; font-size: 11px; color: #333 !important; }
        .paper .sig .line { width: 220px; border-top: 1px solid #999; margin: 0 auto 5px; }
        .paper .th-img, .paper .td-img { width: 88px; }
        .paper .td-img img { width: 88px; height: 66px; object-fit: cover; border-radius: 4px; border: 1px solid #E8E4DA; }
        .paper .placeholder-img { font-size: 20px; color: #C9A227 !important; }
        .paper-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
        .paper-wrap .paper { min-width: 680px; }

        /* ===== PRINT — A4 portrait, tight margins ===== */
        @media print {
          html, body { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-hide, header, nav, aside { display: none !important; }
          main { padding-left: 0 !important; padding-bottom: 0 !important; margin-left: 0 !important; }
          .paper-wrap { overflow: visible !important; }
          .paper {
            min-width: 0 !important;
            max-width: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 6px !important;
            font-size: 8pt !important;
            background: #fff !important;
            color: #1a1a1a !important;
          }

          /* TABLE */
          .paper table { table-layout: fixed !important; width: 100% !important; border-collapse: collapse !important; max-width: none !important; }
          .paper table thead { display: table-header-group !important; }
          .paper table tbody { display: table-row-group !important; }
          .paper table tbody tr, .paper table thead tr { display: table-row !important; }

          /* THEAD */
          .paper th {
            display: table-cell !important;
            box-sizing: border-box !important;
            background: #1a1a1a !important;
            color: #C9A227 !important;
            font-weight: 600 !important;
            font-size: 7pt !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            padding: 4px 2px !important;
            text-align: left !important;
            white-space: nowrap !important;
            border: none !important;
            vertical-align: middle !important;
          }

          /* TD */
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

          /* ROW HEIGHT */
          .paper tbody tr { height: auto !important; min-height: 60px !important; }

          /* ZEBRADO */
          .paper tbody tr:nth-child(even) td { background: #f5f3ed !important; }
          .paper tbody tr:nth-child(odd) td { background: #ffffff !important; }

          /* COLUMN WIDTHS — recalculated for 3D measures */
          .paper th:nth-child(1), .paper td:nth-child(1) { width: 5% !important; text-align: center !important; white-space: nowrap !important; padding: 4px 2px !important; }
          .paper th:nth-child(2), .paper td:nth-child(2) { width: 6% !important; text-align: center !important; white-space: nowrap !important; padding: 4px 2px !important; }
          .paper th:nth-child(3), .paper td:nth-child(3) { width: 20% !important; text-align: left !important; padding: 4px 4px !important; }
          .paper th:nth-child(4), .paper td:nth-child(4) { width: 13% !important; text-align: center !important; font-size: 7pt !important; line-height: 1.15 !important; word-break: break-all !important; padding: 4px 3px !important; }
          .paper th:nth-child(5), .paper td:nth-child(5) { width: 23% !important; text-align: left !important; font-size: 7.5pt !important; line-height: 1.25 !important; padding: 4px 4px !important; }
          .paper th:nth-child(6), .paper td:nth-child(6) { width: 14% !important; text-align: center !important; padding: 4px 2px !important; }
          .paper th:nth-child(7), .paper td:nth-child(7) { width: 10% !important; text-align: right !important; white-space: nowrap !important; padding: 4px 4px !important; font-size: 7.5pt !important; }
          .paper th:nth-child(8), .paper td:nth-child(8) { width: 11% !important; text-align: right !important; white-space: nowrap !important; padding: 4px 4px !important; font-weight: 700 !important; font-size: 8pt !important; }

          /* CODE bold, name smaller */
          .paper td:nth-child(3) b { font-size: 8pt !important; font-weight: 700 !important; }
          .paper td:nth-child(3) { line-height: 1.2 !important; }
          .paper td:nth-child(3) br + * { font-size: 7.5pt !important; color: #555 !important; }

          /* PHOTOS */
          .paper .td-img img { height: 70px !important; width: auto !important; object-fit: contain !important; border: 1px solid #e5ddc8 !important; border-radius: 3px !important; }
          .paper .placeholder-img { font-size: 20pt !important; color: #C9A227 !important; }

          /* SUBTOTAL */
          .paper .subt td {
            background: #F7F4EC !important;
            font-weight: 600 !important;
            color: #0A0A0A !important;
            font-size: 9pt !important;
            padding: 6px 10px !important;
            border-top: 2px solid #C9A227 !important;
            border-bottom: none !important;
            text-align: right !important;
          }
          .paper .subt td:first-child { text-align: right !important; font-weight: 700 !important; padding-right: 8px !important; }

          /* GRAND TOTAL */
          .paper .grand {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: #1a1a1a !important;
            color: #C9A227 !important;
            padding: 8px 10px !important;
            border-radius: 4px !important;
            margin-top: 8px !important;
            font-weight: 700 !important;
            font-size: 10pt !important;
          }

          /* AREA BAR */
          .paper .area-t {
            background: linear-gradient(90deg, #C9A227, #B8911F) !important;
            color: #1a1a1a !important;
            padding: 4px 8px !important;
            font-weight: 700 !important;
            font-size: 9pt !important;
            margin-bottom: 0 !important;
          }

          body { background: white !important; }
          .paper .cli { background: #F7F4EC !important; }
          .paper .ph, .paper .plogo h2, .paper .company-slogan, .paper .co, .paper .co-number, .paper .cli b, .paper .cli, .paper .foot, .paper .sig, .paper td, .paper .subt td {
            color: inherit !important;
          }
        }

        /* ===== MOBILE CARDS ===== */
        @media (max-width: 720px) {
          .paper table thead { display: none; }
          .paper table { min-width: 0; }
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
          .paper .cli { grid-template-columns: 1fr; }
          .paper-wrap { overflow: visible; }
          .paper-wrap .paper { min-width: 0; }
        }
      `}</style>
    </AppLayout>
  );
}
