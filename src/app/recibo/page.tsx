"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { CATALOG, CLIENTS, brl, type Client, type Product, type Quote } from "@/lib/constants";
import { useLocalCollection } from "@/lib/store";
import { valorPorExtenso } from "@/lib/extenso";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function formatDatePtBR(d: string) {
  const date = new Date(d + "T12:00:00");
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function quoteTotal(q: Quote, catalog: Product[]) {
  return q.environments.reduce((s, e) =>
    s + e.items.reduce((s2, i) => {
      const p = catalog.find((pp) => pp.code === i.productCode);
      return s2 + (i.unitPrice ?? p?.price ?? 0) * i.qty;
    }, 0), 0);
}

function quotePieces(q: Quote): number {
  return q.environments.reduce((s, e) => s + e.items.reduce((s2, i) => s2 + i.qty, 0), 0);
}

function nextReciboNumber(quotes: Quote[]): string {
  const year = new Date().getFullYear();
  const nums = quotes
    .map((q) => {
      const m = q.number.match(/ORC-(\d{4})-(\d{3})/);
      return m && parseInt(m[1]) === year ? parseInt(m[2]) : 0;
    })
    .filter((n) => n > 0);
  const seq = nums.length ? Math.max(...nums) + 1 : 1;
  return `REC-${year}-${String(seq).padStart(3, "0")}`;
}

function ReciboContent() {
  const searchParams = useSearchParams();
  const preselectedQuote = searchParams.get("quote");

  const [quotes] = useLocalCollection<Quote>("mendes-quotes", []);
  const [catalog] = useLocalCollection<Product>("mendes-catalog", CATALOG);
  const [clients] = useLocalCollection<Client>("mendes-clients", CLIENTS);
  const [selectedId, setSelectedId] = useState(preselectedQuote || "");
  const [receiptValue, setReceiptValue] = useState("");
  const [reference, setReference] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (preselectedQuote && !selectedId) {
      setSelectedId(preselectedQuote);
    }
  }, [preselectedQuote, selectedId]);

  const quote = useMemo(
    () => quotes.find((q) => q.id === selectedId) || null,
    [quotes, selectedId]
  );

  const client = quote ? clients.find((c) => c.id === quote.clientId) : null;

  const total = quote ? quoteTotal(quote, catalog) : 0;
  const defaultReciboNum = useMemo(() => nextReciboNumber(quotes), [quotes]);

  useEffect(() => {
    if (quote && !receiptValue) {
      setReceiptValue(String(Math.round(total * 0.5)));
    }
    if (quote && !reference) {
      setReference(`sinal referente ao orçamento ${quote.number} (${quotePieces(quote)} peças de móveis para áreas externas)`);
    }
    if (!receiptNumber) {
      setReceiptNumber(defaultReciboNum);
    }
  }, [quote, total, receiptValue, reference, defaultReciboNum, receiptNumber]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const parsedValue = parseFloat(receiptValue) || 0;

  const whatsappUrl = quote
    ? `https://wa.me/?text=${encodeURIComponent(
        `Olá! Segue o recibo ${receiptNumber} no valor de ${brl(parsedValue)} — Mendes Design Móveis. Obrigado pela confiança!`
      )}`
    : "#";

  if (!quote) {
    return (
      <AppLayout>
        <div className="p-5">
          <h1 className="font-serif text-2xl text-gold mb-2">Recibo</h1>
          <p className="text-text2 text-[13px] mb-4">Selecione um orçamento para gerar o recibo.</p>
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text2 mb-4">Nenhum orçamento selecionado.</p>
            <Link
              href="/orcamento"
              className="bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm inline-flex items-center gap-2 hover:bg-gold-d transition-colors"
            >
              Ir para Orçamentos
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-5">
        {toast && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gold text-bg font-semibold text-sm px-5 py-2.5 rounded-full z-[60] shadow-lg">
            {toast}
          </div>
        )}

        {/* Controls — hidden on print */}
        <div className="print-hide">
          <h1 className="font-serif text-2xl text-gold mb-1">Recibo</h1>
          <p className="text-text2 text-[13px] mb-4">Gere recibo para o cliente</p>

          <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Orçamento</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setReceiptValue("");
              setReference("");
            }}
            className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold mb-3"
          >
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.number} — {q.clientName || clients.find((c) => c.id === q.clientId)?.name || "Cliente"}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Valor do recibo (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={receiptValue}
                onChange={(e) => setReceiptValue(e.target.value)}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Nº do recibo</label>
              <input
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Referente a</label>
          <textarea
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            rows={2}
            className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold resize-none mb-4"
          />

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
            ← Voltar ao orçamento
          </Link>

          <div className="h-4" />
        </div>

        {/* ===== PAPER DO RECIBO ===== */}
        <div className="paper-wrap">
          <div className="paper">
            {/* Header — idêntico ao proposta */}
            <div className="ph">
              <div className="plogo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-md.png" alt="Mendes" width={46} height={46} />
                <div>
                  <h2>MENDES DESIGN</h2>
                  <div className="co-tag">MÓVEIS PARA ÁREAS EXTERNAS</div>
                </div>
              </div>
              <div className="co">
                (34) 9 9899-2309<br />
                UBERABA - MG<br />
                {formatDatePtBR(quote.createdAt)}<br />
                <b className="co-number">{receiptNumber}</b>
              </div>
            </div>

            {/* Título */}
            <div className="recibo-title">RECIBO</div>
            <div className="recibo-number">{receiptNumber}</div>

            {/* Valor em destaque */}
            <div className="recibo-value-box">
              <span className="recibo-value">{brl(parsedValue)}</span>
            </div>

            {/* Texto corrido */}
            <div className="recibo-text">
              Recebi(emos) de <b>{quote.clientName || client?.name || "—"}</b>
              {quote.clientDocument || client?.document ? (
                <> ({quote.clientDocument || client?.document})</>
              ) : null}
              , a importância de <b>{brl(parsedValue)}</b> ({valorPorExtenso(parsedValue)}),
              referente a <b>{reference || "—"}</b>.
              Para clareza, firmo o presente recibo.
            </div>

            {/* Local e data */}
            <div className="recibo-location">
              Uberaba - MG, {formatDatePtBR(quote.createdAt)}
            </div>

            {/* Assinatura */}
            <div className="sig">
              <div className="line" />
              JOÃO BATISTA — Mendes Design Móveis<br />
              34 9 9899-2309
            </div>
          </div>
        </div>
      </div>

      {/* Print + Paper styles */}
      <style>{`
        @media print {
          .print-hide, header, nav, aside { display: none !important; }
          main { padding-left: 0 !important; padding-bottom: 0 !important; }
          .paper-wrap { overflow: visible !important; }
          .paper {
            min-width: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 20px !important;
            font-size: 10pt !important;
          }
          body { background: white !important; }
        }

        .paper {
          background: #fff;
          color: #1A1A1A;
          border-radius: 8px;
          padding: 26px 22px;
          font-size: 12px;
          line-height: 1.5;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 12px rgba(0,0,0,.15);
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
        .paper .plogo h2 { font-family: 'Playfair Display', serif; font-size: 20px; letter-spacing: 2px; color: #0A0A0A; margin: 0; }
        .paper .co-tag { font-size: 9px; letter-spacing: 3px; color: #8a6d1a; }
        .paper .co { font-size: 10px; color: #555; text-align: right; line-height: 1.5; }
        .paper .co-number { color: #8a6d1a; }
        .paper .recibo-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          letter-spacing: 3px;
          text-align: center;
          margin-bottom: 2px;
        }
        .paper .recibo-number {
          text-align: center;
          font-size: 11px;
          color: #8a6d1a;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .paper .recibo-value-box {
          display: flex;
          justify-content: center;
          margin: 16px 0;
        }
        .paper .recibo-value {
          background: #0A0A0A;
          color: #E5C76B;
          font-size: 20px;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 8px;
          letter-spacing: 1px;
        }
        .paper .recibo-text {
          margin: 20px 0;
          font-size: 12px;
          line-height: 1.6;
          text-align: justify;
        }
        .paper .recibo-location {
          text-align: right;
          font-size: 11px;
          color: #555;
          margin-top: 20px;
        }
        .paper .sig { margin-top: 22px; text-align: center; font-size: 11px; color: #333; }
        .paper .sig .line { width: 220px; border-top: 1px solid #999; margin: 0 auto 5px; }
        .paper-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
        .paper-wrap .paper { min-width: 480px; max-width: 680px; margin: 0 auto; }
      `}</style>
    </AppLayout>
  );
}

export default function ReciboPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="p-5 text-text2">Carregando...</div>
      </AppLayout>
    }>
      <ReciboContent />
    </Suspense>
  );
}
