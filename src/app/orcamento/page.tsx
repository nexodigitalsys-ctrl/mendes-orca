"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { CATALOG, CLIENTS, brl, type Product, type Client, type Quote, type Environment, type QuoteItem } from "@/lib/constants";
import { useLocalCollection } from "@/lib/store";

function nextQuoteNumber(quotes: Quote[]): string {
  const year = new Date().getFullYear();
  const nums = quotes
    .map((q) => {
      const m = q.number.match(/ORC-(\d{4})-(\d{3})/);
      return m && parseInt(m[1]) === year ? parseInt(m[2]) : 0;
    })
    .filter((n) => n > 0);
  const seq = nums.length ? Math.max(...nums) + 1 : 1;
  return `ORC-${year}-${String(seq).padStart(3, "0")}`;
}

function emptyEnv(): Environment {
  return { name: "NOVO AMBIENTE", items: [] };
}

function emptyItem(): QuoteItem {
  return { productCode: "", qty: 1 };
}

function envSubtotal(env: Environment): { total: number; pieces: number } {
  let total = 0;
  let pieces = 0;
  for (const item of env.items) {
    const product = CATALOG.find((p) => p.code === item.productCode);
    const price = item.unitPrice ?? product?.price ?? 0;
    total += price * item.qty;
    pieces += item.qty;
  }
  return { total, pieces };
}

function quoteTotals(q: {
  environments: Environment[];
  discount?: number;
}): { subtotal: number; pieces: number; total: number } {
  let subtotal = 0;
  let pieces = 0;
  for (const env of q.environments) {
    const s = envSubtotal(env);
    subtotal += s.total;
    pieces += s.pieces;
  }
  const discount = q.discount ?? 0;
  return { subtotal, pieces, total: subtotal - discount };
}

export default function OrcamentoPage() {
  const [quotes, setQuotes] = useLocalCollection<Quote>("mendes-quotes", []);
  const [catalog] = useLocalCollection<Product>("mendes-catalog", CATALOG);
  const [clients] = useLocalCollection<Client>("mendes-clients", CLIENTS);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<Quote["status"]>("rascunho");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientDocument, setClientDocument] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientArchitect, setClientArchitect] = useState("");
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [deliveryTime, setDeliveryTime] = useState("90 DIAS");
  const [validity, setValidity] = useState("15 dias");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["cartao"]);
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState("");
  const [discountType, setDiscountType] = useState<"abs" | "pct">("abs");
  const [toast, setToast] = useState("");

  const isEditing = editingId !== null;

  const totals = useMemo(() => quoteTotals({ environments, discount }), [environments, discount]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function loadQuote(q: Quote) {
    setEditingId(q.id);
    setNumber(q.number);
    setStatus(q.status);
    setClientId(q.clientId);
    setClientName(q.clientName || CLIENTS.find((c) => c.id === q.clientId)?.name || "");
    setClientDocument(q.clientDocument || CLIENTS.find((c) => c.id === q.clientId)?.document || "");
    setClientPhone(q.clientPhone || CLIENTS.find((c) => c.id === q.clientId)?.phone || "");
    setClientAddress(q.clientAddress || CLIENTS.find((c) => c.id === q.clientId)?.address || "");
    setClientCity(q.clientCity || CLIENTS.find((c) => c.id === q.clientId)?.city || "");
    setClientArchitect(q.clientArchitect || CLIENTS.find((c) => c.id === q.clientId)?.architect || "");
    setEnvironments(JSON.parse(JSON.stringify(q.environments)));
    setDeliveryTime(q.deliveryTime || "90 DIAS");
    setValidity(q.validity || "15 dias");
    setPaymentMethods(q.paymentMethods || ["cartao"]);
    setDiscount(q.discount || 0);
    setDiscountInput("");
    setDiscountType("abs");
  }

  function clearForm() {
    setEditingId(null);
    setNumber(nextQuoteNumber(quotes));
    setStatus("rascunho");
    setClientId("");
    setClientName("");
    setClientDocument("");
    setClientPhone("");
    setClientAddress("");
    setClientCity("");
    setClientArchitect("");
    setEnvironments([]);
    setDeliveryTime("90 DIAS");
    setValidity("15 dias");
    setPaymentMethods(["cartao"]);
    setDiscount(0);
    setDiscountInput("");
    setDiscountType("abs");
  }

  function selectClient(id: string) {
    setClientId(id);
    const c = clients.find((cl) => cl.id === id);
    if (c) {
      setClientName(c.name);
      setClientDocument(c.document || "");
      setClientPhone(c.phone || "");
      setClientAddress(c.address || "");
      setClientCity(c.city || "");
      setClientArchitect(c.architect || "");
    }
  }

  function addEnv() {
    setEnvironments((prev) => [...prev, emptyEnv()]);
  }

  function duplicateEnv(idx: number) {
    setEnvironments((prev) => {
      const copy = JSON.parse(JSON.stringify(prev[idx])) as Environment;
      copy.name = copy.name + " (CÓPIA)";
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function removeEnv(idx: number) {
    if (!confirm("Excluir este ambiente e todos os seus itens?")) return;
    setEnvironments((prev) => prev.filter((_, i) => i !== idx));
  }

  function renameEnv(idx: number, name: string) {
    setEnvironments((prev) => prev.map((e, i) => (i === idx ? { ...e, name } : e)));
  }

  function addItem(envIdx: number) {
    setEnvironments((prev) =>
      prev.map((e, i) => (i === envIdx ? { ...e, items: [...e.items, emptyItem()] } : e))
    );
  }

  function removeItem(envIdx: number, itemIdx: number) {
    setEnvironments((prev) =>
      prev.map((e, i) =>
        i === envIdx ? { ...e, items: e.items.filter((_, j) => j !== itemIdx) } : e
      )
    );
  }

  function updateItem(envIdx: number, itemIdx: number, patch: Partial<QuoteItem>) {
    setEnvironments((prev) =>
      prev.map((e, i) =>
        i === envIdx
          ? {
              ...e,
              items: e.items.map((it, j) =>
                j === itemIdx ? { ...it, ...patch } : it
              ),
            }
          : e
      )
    );
  }

  function handleDiscountInput(val: string) {
    setDiscountInput(val);
    const num = parseFloat(val.replace(",", ".")) || 0;
    if (discountType === "pct") {
      setDiscount(Math.round(totals.subtotal * (num / 100) * 100) / 100);
    } else {
      setDiscount(num);
    }
  }

  function toggleDiscountType() {
    const newType = discountType === "abs" ? "pct" : "abs";
    setDiscountType(newType);
    const num = parseFloat(discountInput.replace(",", ".")) || 0;
    if (newType === "pct") {
      setDiscount(Math.round(totals.subtotal * (num / 100) * 100) / 100);
    } else {
      setDiscount(num);
    }
  }

  function togglePayment(method: string) {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  const save = useCallback(() => {
    if (!clientName.trim()) {
      alert("Preencha o nome do cliente.");
      return;
    }
    if (environments.length === 0) {
      alert("Adicione pelo menos um ambiente.");
      return;
    }
    for (const env of environments) {
      if (env.items.length === 0) {
        alert(`O ambiente "${env.name}" não possui itens.`);
        return;
      }
      for (const item of env.items) {
        if (!item.productCode) {
          alert(`Selecione um produto em "${env.name}".`);
          return;
        }
      }
    }

    const now = new Date().toISOString().slice(0, 10);
    const data: Quote = {
      id: editingId || `q-${Date.now()}`,
      number: number || nextQuoteNumber(quotes),
      clientId: clientId || `cli-${Date.now()}`,
      status,
      environments: JSON.parse(JSON.stringify(environments)),
      createdAt: editingId ? (quotes.find((q) => q.id === editingId)?.createdAt || now) : now,
      clientName,
      clientDocument: clientDocument || undefined,
      clientPhone: clientPhone || undefined,
      clientAddress: clientAddress || undefined,
      clientCity: clientCity || undefined,
      clientArchitect: clientArchitect || undefined,
      deliveryTime,
      validity,
      paymentMethods,
      discount: discount || undefined,
    };

    if (editingId) {
      setQuotes((prev) => prev.map((q) => (q.id === editingId ? data : q)));
    } else {
      setQuotes((prev) => [...prev, data]);
      setEditingId(data.id);
    }
    showToast("Orçamento salvo!");
  }, [
    editingId, number, clientId, status, environments, clientName,
    clientDocument, clientPhone, clientAddress, clientCity, clientArchitect,
    deliveryTime, validity, paymentMethods, discount, quotes, setQuotes,
  ]);

  function removeQuote() {
    if (!editingId) return;
    if (!confirm("Excluir este orçamento permanentemente?")) return;
    setQuotes((prev) => prev.filter((q) => q.id !== editingId));
    clearForm();
    showToast("Orçamento excluído.");
  }

  const PAYMENT_OPTIONS = [
    { key: "cheque", label: "Cheque" },
    { key: "pix", label: "Depósito / PIX" },
    { key: "boleto", label: "Boleto" },
    { key: "cartao", label: "Cartão — até 10x" },
  ];

  const STATUS_OPTIONS: { value: Quote["status"]; label: string }[] = [
    { value: "rascunho", label: "Rascunho" },
    { value: "enviado", label: "Enviado" },
    { value: "aprovado", label: "Aprovado" },
    { value: "recusado", label: "Recusado" },
  ];

  return (
    <AppLayout>
      <div className="p-5">
        {/* TOAST */}
        {toast && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gold text-bg font-semibold text-sm px-5 py-2.5 rounded-full z-[60] shadow-lg">
            {toast}
          </div>
        )}

        {/* === A. IDENTIFICAÇÃO === */}
        <div className="flex justify-between items-center gap-2.5 mb-1">
          <h1 className="font-serif text-2xl">
            {isEditing ? "Editar Orçamento" : "Novo Orçamento"}
          </h1>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value.toUpperCase())}
            className="w-[160px] bg-bg2 border border-gold rounded-lg text-gold font-serif text-sm py-1.5 px-2.5 text-center outline-none"
            placeholder="ORC-2026-000"
          />
        </div>
        <p className="text-text2 text-[13px] mb-4">
          Preencha — o sistema calcula tudo sozinho
        </p>

        {/* Select existing + new */}
        <div className="flex gap-2 mb-4">
          <select
            value={editingId || ""}
            onChange={(e) => {
              const q = quotes.find((qq) => qq.id === e.target.value);
              if (q) loadQuote(q);
            }}
            className="flex-1 bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
          >
            <option value="">— Selecionar orçamento salvo —</option>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.number} — {q.clientName || CLIENTS.find((c) => c.id === q.clientId)?.name || "Cliente"}
              </option>
            ))}
          </select>
          <button
            onClick={clearForm}
            className="px-4 py-2.5 text-sm rounded-xl border border-border text-text2 hover:text-gold hover:border-gold transition-colors shrink-0"
          >
            Novo
          </button>
        </div>

        {/* === B. CLIENTE === */}
        <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">
          Cliente / Condomínio
        </label>
        <select
          value={clientId}
          onChange={(e) => selectClient(e.target.value)}
          className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold mb-2"
        >
          <option value="">— Selecionar cliente cadastrado —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold mb-2"
          placeholder="Nome do cliente"
        />

        <div className="grid grid-cols-2 gap-2.5 mb-2">
          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">CNPJ / CPF</label>
            <input
              value={clientDocument}
              onChange={(e) => setClientDocument(e.target.value)}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Telefone</label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              placeholder="(34) 9...."
            />
          </div>
        </div>

        <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Endereço</label>
        <input
          value={clientAddress}
          onChange={(e) => setClientAddress(e.target.value)}
          className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold mb-2"
          placeholder="Rua, número, bairro"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Cidade</label>
            <input
              value={clientCity}
              onChange={(e) => setClientCity(e.target.value)}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              placeholder="UBERABA - MG"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Arquiteto(a)</label>
            <input
              value={clientArchitect}
              onChange={(e) => setClientArchitect(e.target.value)}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* === C. AMBIENTES === */}
        <div className="flex justify-between items-center mt-6 mb-3">
          <h2 className="font-serif text-lg">Ambientes</h2>
          <button
            onClick={addEnv}
            className="px-4 py-2.5 text-sm rounded-xl border border-gold text-gold hover:bg-gold/10 transition-colors"
          >
            + Ambiente
          </button>
        </div>

        {environments.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 text-center mb-4">
            <p className="text-text2 text-sm">Nenhum ambiente adicionado.</p>
          </div>
        )}

        {environments.map((env, ei) => {
          const sub = envSubtotal(env);
          return (
            <div key={ei} className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
              {/* Env header */}
              <div className="flex items-center gap-2 px-3.5 py-3 bg-bg2 border-b border-border">
                <span className="text-gold">▦</span>
                <input
                  value={env.name}
                  onChange={(e) => renameEnv(ei, e.target.value)}
                  className="flex-1 bg-transparent border-none font-bold text-[15px] text-gold outline-none"
                />
                <button
                  onClick={() => duplicateEnv(ei)}
                  className="text-text2 hover:text-gold p-1 rounded hover:bg-border transition-colors text-sm"
                  title="Duplicar ambiente"
                >
                  ⧉
                </button>
                <button
                  onClick={() => removeEnv(ei)}
                  className="text-text2 hover:text-red-500 p-1 rounded hover:bg-border transition-colors text-sm"
                  title="Excluir ambiente"
                >
                  🗑
                </button>
              </div>

              {/* Items */}
              {env.items.length === 0 && (
                <div className="p-4 text-center text-text2 text-sm">Nenhum item.</div>
              )}

              {env.items.map((item, ii) => {
                const product = catalog.find((p) => p.code === item.productCode);
                const unitPrice = item.unitPrice ?? product?.price ?? 0;
                const lineTotal = unitPrice * item.qty;

                return (
                  <div key={ii} className="grid grid-cols-[auto_1fr_56px_80px_28px] gap-2 px-3.5 py-2.5 border-b border-border items-center">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-bg2 border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {product?.image ? (
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base">🪑</span>
                      )}
                    </div>

                    {/* Product select + details */}
                    <div className="min-w-0">
                      <select
                        value={item.productCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const p = catalog.find((pp) => pp.code === code);
                          updateItem(ei, ii, {
                            productCode: code,
                            unitPrice: p?.price,
                          });
                        }}
                        className="w-full bg-bg2 border border-border rounded-lg text-text p-1.5 text-[13px] outline-none focus:border-gold truncate"
                      >
                        <option value="">— escolher produto —</option>
                        {catalog.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.code} — {p.name}
                          </option>
                        ))}
                      </select>
                      {product && (
                        <div className="text-[10.5px] text-text2 mt-0.5 leading-tight">
                          {product.meas} · {product.finish}
                        </div>
                      )}
                      <div className="text-[12px] text-gold-h mt-0.5 font-semibold">
                        {item.qty} × {brl(unitPrice)} = <b>{brl(lineTotal)}</b>
                      </div>
                    </div>

                    {/* Qty */}
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(ei, ii, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full bg-bg2 border border-border rounded-lg text-text p-1.5 text-[13px] text-center outline-none focus:border-gold"
                    />

                    {/* Unit price (override) */}
                    <div className="text-right text-[12px] text-text2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => updateItem(ei, ii, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-bg2 border border-border rounded-lg text-text p-1.5 text-[12px] text-right outline-none focus:border-gold"
                      />
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(ei, ii)}
                      className="text-red-500 hover:text-red-400 text-base text-center cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {/* Env footer */}
              <div className="flex justify-between items-center px-3.5 py-2.5">
                <button
                  onClick={() => addItem(ei)}
                  className="bg-transparent border border-dashed border-border text-text2 rounded-[10px] px-3.5 py-2 text-[12.5px] cursor-pointer hover:text-gold hover:border-gold transition-colors"
                >
                  + adicionar item
                </button>
                <div className="text-[13px] text-text2">
                  Subtotal <b className="text-gold text-[15px]">{brl(sub.total)}</b>
                </div>
              </div>
            </div>
          );
        })}

        {/* === D. CONDIÇÕES === */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 mb-2">
          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Prazo de entrega</label>
            <input
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Validade da proposta</label>
            <input
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
            />
          </div>
        </div>

        <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Condições de pagamento</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-1.5 bg-bg2 border border-border rounded-full px-3 py-1.5 text-[12px] cursor-pointer text-text"
            >
              <input
                type="checkbox"
                checked={paymentMethods.includes(opt.key)}
                onChange={() => togglePayment(opt.key)}
                className="w-auto accent-gold"
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* === E. TOTAIS === */}
        <div className="bg-gradient-to-br from-card to-bg2 border border-gold/40 rounded-2xl p-4 mt-2">
          <div className="flex justify-between py-1.5 text-[14px] text-text2">
            <span>Subtotal</span>
            <span>{brl(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 text-[14px] text-text2">
            <span className="flex items-center gap-2">
              Desconto
              <button
                onClick={toggleDiscountType}
                className="text-[10px] bg-bg2 border border-border rounded px-1.5 py-0.5 text-text2 hover:text-gold"
              >
                {discountType === "abs" ? "R$" : "%"}
              </button>
            </span>
            <div className="flex items-center gap-1">
              <input
                value={discountInput}
                onChange={(e) => handleDiscountInput(e.target.value)}
                className="w-24 bg-bg2 border border-border rounded-lg text-text p-1 text-[13px] text-right outline-none focus:border-gold"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between py-1.5 text-[14px] text-text2">
            <span>Total de peças</span>
            <span className="text-gold">{totals.pieces} peças</span>
          </div>
          <div className="flex justify-between border-t border-border mt-2 pt-3 text-[17px] font-bold">
            <span>TOTAL</span>
            <span className="text-gold text-xl">{brl(totals.total)}</span>
          </div>
        </div>

        <div className="h-4" />

        {/* === F. AÇÕES === */}
        <button
          onClick={save}
          className="w-full bg-gold text-bg font-bold border-none rounded-2xl px-5 py-3.5 text-[14px] cursor-pointer hover:bg-gold-d transition-colors"
        >
          💾 Salvar orçamento
        </button>

        <div className="h-2.5" />

        <div className="flex items-center gap-2 mb-2">
          <label className="text-[11px] text-text2 uppercase tracking-[0.4px]">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Quote["status"])}
            className="bg-bg2 border border-border rounded-[10px] text-text p-2 text-sm outline-none focus:border-gold"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <Link
            href="/proposta"
            className="flex-1 flex items-center justify-center gap-2 bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm hover:bg-gold-d transition-colors"
          >
            👁️ Visualizar proposta
          </Link>
          {isEditing && (
            <button
              onClick={removeQuote}
              className="px-5 py-3 text-sm rounded-xl border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              🗑 Excluir
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            disabled
            title="Próxima etapa"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs rounded-xl border border-border text-text2 opacity-50 cursor-not-allowed"
          >
            WhatsApp
          </button>
          <button
            disabled
            title="Próxima etapa"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs rounded-xl border border-border text-text2 opacity-50 cursor-not-allowed"
          >
            E-mail
          </button>
          <button
            disabled
            title="Próxima etapa"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs rounded-xl border border-border text-text2 opacity-50 cursor-not-allowed"
          >
            Recibo
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
