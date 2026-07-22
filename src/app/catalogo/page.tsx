"use client";

import { useState, useRef, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { CATALOG, brl, type Product } from "@/lib/constants";
import { useLocalCollection } from "@/lib/store";

const EMPTY_FORM: Product = { code: "", name: "", meas: "", finish: "", price: 0, image: "" };

export default function CatalogoPage() {
  const [products, setProducts] = useLocalCollection<Product>("mendes-catalog", CATALOG);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Product>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    );
  }, [products, search]);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({ ...p });
    setEditing(p.code);
    setShowForm(true);
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function save() {
    if (!form.code.trim() || !form.name.trim()) {
      alert("Código e nome são obrigatórios.");
      return;
    }
    if (form.price <= 0) {
      alert("O preço deve ser maior que zero.");
      return;
    }
    const codeUpper = form.code.trim().toUpperCase();
    const exists = products.find((p) => p.code === codeUpper);
    if (exists && editing !== codeUpper) {
      alert("Já existe um produto com esse código.");
      return;
    }

    const saved = { ...form, code: codeUpper };

    if (editing) {
      setProducts((prev) => prev.map((p) => (p.code === editing ? saved : p)));
    } else {
      setProducts((prev) => [...prev, saved]);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditing(null);
  }

  function remove(code: string) {
    if (!confirm(`Excluir produto ${code}?`)) return;
    setProducts((prev) => prev.filter((p) => p.code !== code));
  }

  function bulkAdjust() {
    const input = prompt("Reajuste % (ex: 8 para +8%, -5 para -5%):");
    if (!input) return;
    const pct = parseFloat(input.replace(",", "."));
    if (isNaN(pct)) {
      alert("Valor inválido.");
      return;
    }
    if (!confirm(`Aplicar ${pct > 0 ? "+" : ""}${pct}% em TODOS os preços?`)) return;
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        price: Math.round(p.price * (1 + pct / 100) * 100) / 100,
      }))
    );
  }

  function exportCSV() {
    const header = "code;name;meas;finish;price";
    const rows = products.map(
      (p) => `${p.code};${p.name};${p.meas};${p.finish};${p.price}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importCSV() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        alert("CSV vazio ou inválido.");
        return;
      }
      const header = lines[0].toLowerCase();
      const startIdx = header.includes("code") || header.includes("código") ? 1 : 0;

      let imported = 0;
      let updated = 0;
      const newProducts: Product[] = [];

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(";");
        if (parts.length < 5) continue;
        const [code, name, meas, finish, priceStr] = parts;
        const codeUp = code.trim().toUpperCase();
        const price = parseFloat(priceStr.replace(",", "."));
        if (!codeUp || isNaN(price)) continue;

        const existing = products.find((p) => p.code === codeUp);
        if (existing) {
          updated++;
          newProducts.push({ ...existing, price });
        } else {
          imported++;
          newProducts.push({
            code: codeUp,
            name: name.trim(),
            meas: meas.trim(),
            finish: finish.trim(),
            price,
            image: "",
          });
        }
      }

      if (newProducts.length > 0) {
        setProducts(newProducts);
        alert(`Importação concluída: ${imported} novos, ${updated} atualizados.`);
      } else {
        alert("Nenhum produto válido encontrado no CSV.");
      }
    };
    input.click();
  }

  return (
    <AppLayout>
      <div className="p-5">
        <div className="flex justify-between items-baseline mb-1">
          <h1 className="font-serif text-2xl text-gold">Catálogo</h1>
          <button
            onClick={openNew}
            className="bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm hover:bg-gold-d transition-colors"
          >
            + Produto
          </button>
        </div>
        <p className="text-text2 text-[13px] mb-4">Cadastre uma vez — o orçamento preenche sozinho</p>

        <input
          type="text"
          placeholder="🔍 Buscar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold mb-4"
        />

        {/* FORM */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="font-serif text-gold text-lg mb-3">
              {editing ? "Editar Produto" : "Novo Produto"}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Código</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  disabled={!!editing}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold disabled:opacity-50"
                  placeholder="EX: FILIPINAS-MR"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Preço (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                placeholder="Nome do produto"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Medidas</label>
              <input
                value={form.meas}
                onChange={(e) => setForm((f) => ({ ...f, meas: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                placeholder="Ex: 1,80 x 0,75"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Acabamento</label>
              <textarea
                value={form.finish}
                onChange={(e) => setForm((f) => ({ ...f, finish: e.target.value }))}
                rows={3}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold resize-none"
                placeholder="Descrição do acabamento"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Imagem</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="bg-bg2 border border-dashed border-border rounded-[10px] text-text2 p-3 text-sm w-full hover:border-gold hover:text-gold transition-colors"
              >
                {form.image ? "📷 Imagem selecionada — clique para trocar" : "📷 Selecionar imagem"}
              </button>
              {form.image && (
                <div className="mt-2">
                  <img src={form.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-border" />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={save}
                className="flex-1 bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm hover:bg-gold-d transition-colors"
              >
                {editing ? "Salvar" : "Cadastrar"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-5 py-3 text-sm rounded-xl border border-border text-text2 hover:text-text hover:border-gold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LISTA */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text2">
              {search ? "Nenhum produto encontrado para essa busca." : "Nenhum produto cadastrado."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((p) => (
              <div key={p.code} className="bg-card border border-border rounded-2xl p-3.5 flex gap-3">
                <div className="w-[84px] h-[84px] rounded-[10px] bg-bg2 border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🪑</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gold-h tracking-[1px] font-semibold">{p.code}</div>
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-[11.5px] text-text2 mt-0.5">{p.meas} · {p.finish}</div>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="bg-bg2 border border-border text-text2 rounded-lg px-2.5 py-1.5 text-[11px] hover:text-gold hover:border-gold transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => remove(p.code)}
                      className="bg-bg2 border border-border text-text2 rounded-lg px-2.5 py-1.5 text-[11px] hover:text-red-500 hover:border-red-500 transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="text-gold font-bold text-sm shrink-0">{brl(p.price)}</div>
              </div>
            ))}
          </div>
        )}

        {/* TOOLBAR */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={importCSV}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-border text-text2 hover:text-gold hover:border-gold transition-colors"
          >
            Importar CSV
          </button>
          <button
            onClick={exportCSV}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-border text-text2 hover:text-gold hover:border-gold transition-colors"
          >
            Exportar
          </button>
          <button
            onClick={bulkAdjust}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-border text-text2 hover:text-gold hover:border-gold transition-colors"
          >
            Reajuste %
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
