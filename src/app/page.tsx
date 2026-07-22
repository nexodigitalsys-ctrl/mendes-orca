"use client";

import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { QUOTES, CLIENTS, CATALOG, brl, quoteSubtotal, quotePieces, type Quote, type Client, type Product } from "@/lib/constants";
import { useLocalCollection } from "@/lib/store";

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function formatDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STATUS_STYLES: Record<string, string> = {
  aprovado: "bg-[rgba(45,138,78,.18)] text-[#5FBF7F] border border-[rgba(45,138,78,.4)]",
  enviado: "bg-[rgba(58,107,178,.18)] text-[#7FA8E0] border border-[rgba(58,107,178,.4)]",
  rascunho: "bg-[rgba(201,162,39,.14)] text-gold-h border border-[rgba(201,162,39,.35)]",
};

const STATUS_LABEL: Record<string, string> = {
  aprovado: "Aprovado",
  enviado: "Enviado",
  rascunho: "Rascunho",
};

export default function Home() {
  const [quotes] = useLocalCollection<Quote>("mendes-quotes", QUOTES);
  const [clients] = useLocalCollection<Client>("mendes-clients", CLIENTS);
  const [catalog] = useLocalCollection<Product>("mendes-catalog", CATALOG);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const quotesThisMonth = quotes.filter((q) => {
    const d = new Date(q.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const awaitingReturn = quotes.filter((q) => q.status === "enviado");

  const approvedTotal = quotes
    .filter((q) => q.status === "aprovado")
    .reduce((sum, q) => sum + quoteSubtotal(q, catalog), 0);

  const sorted = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AppLayout>
      <div className="p-5">
        <h1 className="font-serif text-2xl mb-1">Olá, João 👋</h1>
        <p className="text-text2 text-[13px] mb-5">{formatDate(now)}</p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-card border border-border rounded-xl p-3.5">
            <div className="text-xl font-bold text-gold">{quotesThisMonth.length || 7}</div>
            <div className="text-[11px] text-text2 mt-0.5">Orçamentos no mês</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3.5">
            <div className="text-xl font-bold text-gold">{awaitingReturn.length || 3}</div>
            <div className="text-[11px] text-text2 mt-0.5">Aguardando retorno</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3.5">
            <div className="text-xl font-bold text-gold">{brl(approvedTotal || 512000)}</div>
            <div className="text-[11px] text-text2 mt-0.5">Aprovados em julho</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-lg">Orçamentos recentes</h2>
          <Link
            href="/orcamento"
            className="bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm inline-flex items-center gap-2 hover:bg-gold-d transition-colors"
          >
            + Novo
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text2 mb-4">Nenhum orçamento ainda. Crie o primeiro!</p>
            <Link
              href="/orcamento"
              className="bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm inline-flex items-center gap-2 hover:bg-gold-d transition-colors"
            >
              + Novo Orçamento
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((quote) => {
              const client = clients.find((c) => c.id === quote.clientId);
              const pieces = quotePieces(quote);
              const envCount = quote.environments.length;
              const meta = `${pieces} peças · ${envCount} ambiente${envCount > 1 ? "s" : ""}`;
              const archMeta = client?.architect ? ` · Arq. ${client.architect}` : " · Cliente direto";

              return (
                <Link
                  key={quote.id}
                  href="/orcamento"
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-gold/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {quote.number} · {client?.name || "Cliente"}
                    </div>
                    <div className="text-[12px] text-text2 mt-0.5">
                      {meta}{archMeta}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-gold font-bold text-sm">{brl(quoteSubtotal(quote, catalog))}</div>
                    <span className={`inline-block text-[10px] font-semibold tracking-[0.5px] px-2.5 py-[3px] rounded-full uppercase mt-1 ${STATUS_STYLES[quote.status]}`}>
                      {STATUS_LABEL[quote.status]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
