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
                  <img src={company.logo} alt={company.name} className="plogo-img" />
                ) : (
                  <div className="plogo-fallback">MD</div>
                )}
                <div className="plogo-info">
                  <h2>MENDES DESIGN</h2>
                  <span className="company-slogan">MÓVEIS PARA ÁREAS EXTERNAS</span>
                </div>
              </div>
              <div className="quote-number">
                <span>Orçamento</span>
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
        @page { size: A4; margin: 6mm 8mm; }

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
        .paper .quote-number { text-align: right; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
        .paper .quote-number span { font-size: 9pt; letter-spacing: 1px; text-transform: uppercase; color: #8a6d1a !important; }
        .paper .quote-number b { font-family: 'Playfair Display', serif; font-size: 16pt; color: #0A0A0A !important; letter-spacing: 1px; }

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
        .paper .placeholder-box { width: 110px; height: 82px; display: flex; align-items: center; justify-content: center; background: #F7F4EC; border: 1px solid #E8E4DA; border-radius: 4px; margin: 0 auto; }
        .paper .placeholder-box svg { width: 32px; height: 32px; }
        .paper-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
        .paper-wrap .paper { min-width: 680px; }

        /* ===== PRINT — A4 portrait ===== */
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
            padding: 10px 8px;
            font-size: 8pt !important;
            background: #fff !important;
            color: #1a1a1a !important;
          }

          /* HEADER */
          .paper .ph {
            border-bottom: 3px solid #C9A227 !important;
            padding-bottom: 10px !important;
            margin-bottom: 12px !important;
            gap: 10px !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .paper .plogo-img { max-height: 48px !important; max-width: 48px !important; }
          .paper .plogo-fallback { width: 48px !important; height: 48px !important; font-size: 16px !important; }
          .paper .plogo h2 { font-size: 16pt !important; letter-spacing: 1.5px !important; }
          .paper .company-slogan { font-size: 8pt !important; }
          .paper .quote-number { text-align: right !important; gap: 1px !important; }
          .paper .quote-number span { font-size: 7.5pt !important; letter-spacing: 1px !important; }
          .paper .quote-number b { font-size: 14pt !important; letter-spacing: 0.5px !important; }

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

          /* HIDE MOBILE LABELS IN PRINT */
          .paper table tbody td::before { display: none !important; }

          /* IMAGES */
          .paper .th-img, .paper .td-img { width: 15% !important; text-align: center !important; }
          .paper .td-img img { max-width: 90px !important; max-height: 68px !important; width: auto !important; height: auto !important; object-fit: contain !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; }
          .paper .placeholder-box { width: 90px !important; height: 68px !important; display: flex !important; align-items: center !important; justify-content: center !important; background: #F7F4EC !important; border: 1px solid #e5ddc8 !important; border-radius: 4px !important; margin: 0 auto !important; }
          .paper .placeholder-box svg { width: 26px !important; height: 26px !important; }

          /* VALUES */
          .paper .curr { font-size: 6.5pt !important; margin-right: 2px !important; }
          .paper .val-cell { font-size: 7.5pt !important; font-weight: 600 !important; white-space: nowrap !important; }

          /* CODE bold, name smaller */
          .paper td:nth-child(3) b { font-size: 8pt !important; font-weight: 700 !important; }
          .paper td:nth-child(3) { line-height: 1.25 !important; }
          .paper td:nth-child(3) br + * { font-size: 7.5pt !important; color: #555 !important; }

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
          .paper .foot { margin-top: 14px !important; padding-top: 10px !important; font-size: 8pt !important; }
          .paper .sig { margin-top: 18px !important; font-size: 10px !important; }

          /* AREA BAR */
          .paper .area-t {
            background: linear-gradient(90deg, #C9A227, #B8911F) !important;
            color: #1a1a1a !important;
            padding: 5px 10px !important;
            font-weight: 700 !important;
            font-size: 9pt !important;
            margin-bottom: 0 !important;
          }

          /* ZEBRADO */
          .paper tbody tr:nth-child(even) td { background: #f5f3ed !important; }
          .paper tbody tr:nth-child(odd) td { background: #ffffff !important; }

          body { background: white !important; }
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
