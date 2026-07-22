"use client";

import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { CLIENTS, QUOTES, brl, quoteSubtotal, type Client, type Quote } from "@/lib/constants";
import { useLocalCollection } from "@/lib/store";

const EMPTY_FORM: Client = {
  id: "",
  name: "",
  type: "person",
  document: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  architect: "",
};

const TYPE_LABEL: Record<string, string> = {
  condominium: "Condomínio",
  architect: "Arquiteto",
  person: "Pessoa",
};

const TYPE_STYLE: Record<string, string> = {
  condominium: "bg-[rgba(58,107,178,.18)] text-[#7FA8E0] border border-[rgba(58,107,178,.4)]",
  architect: "bg-[rgba(201,162,39,.14)] text-gold-h border border-[rgba(201,162,39,.35)]",
  person: "bg-[rgba(45,138,78,.18)] text-[#5FBF7F] border border-[rgba(45,138,78,.4)]",
};

export default function ClientesPage() {
  const [clients, setClients] = useLocalCollection<Client>("mendes-clients", CLIENTS);
  const [quotes] = useLocalCollection<Quote>("mendes-quotes", QUOTES);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Client>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const architects = useMemo(
    () => clients.filter((c) => c.type === "architect"),
    [clients]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.architect && c.architect.toLowerCase().includes(q))
    );
  }, [clients, search]);

  function getClientQuotes(clientId: string) {
    return quotes.filter((q) => q.clientId === clientId);
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(c: Client) {
    setForm({ ...c });
    setEditing(c.id);
    setShowForm(true);
  }

  function save() {
    if (!form.name.trim()) {
      alert("Nome é obrigatório.");
      return;
    }

    const saved = {
      ...form,
      id: editing || `cli-${Date.now()}`,
    };

    if (editing) {
      setClients((prev) => prev.map((c) => (c.id === editing ? saved : c)));
    } else {
      setClients((prev) => [...prev, saved]);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditing(null);
  }

  function remove(c: Client) {
    const quotes = getClientQuotes(c.id);
    if (quotes.length > 0) {
      alert(`Exclua os ${quotes.length} orçamento(s) vinculado(s) a "${c.name}" primeiro.`);
      return;
    }
    if (!confirm(`Excluir cliente "${c.name}"?`)) return;
    setClients((prev) => prev.filter((cl) => cl.id !== c.id));
  }

  function exportCSV() {
    const header = "name;type;document;phone;email;address;city;architect";
    const rows = clients.map(
      (c) =>
        `${c.name};${c.type};${c.document || ""};${c.phone || ""};${c.email || ""};${c.address || ""};${c.city || ""};${c.architect || ""}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clientes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout>
      <div className="p-5">
        <div className="flex justify-between items-baseline mb-1">
          <h1 className="font-serif text-2xl text-gold">Clientes</h1>
          <button
            onClick={openNew}
            className="bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm hover:bg-gold-d transition-colors"
          >
            + Cliente
          </button>
        </div>
        <p className="text-text2 text-[13px] mb-4">Gerenciar clientes</p>

        <input
          type="text"
          placeholder="🔍 Buscar por nome, cidade ou arquiteto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold mb-4"
        />

        {/* FORM */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="font-serif text-gold text-lg mb-3">
              {editing ? "Editar Cliente" : "Novo Cliente"}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Client["type"] }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                >
                  <option value="condominium">Condomínio</option>
                  <option value="architect">Arquiteto</option>
                  <option value="person">Pessoa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">CNPJ / CPF</label>
                <input
                  value={form.document || ""}
                  onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Telefone</label>
                <input
                  value={form.phone || ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                  placeholder="(34) 9...."
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">E-mail</label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Endereço</label>
              <input
                value={form.address || ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Cidade</label>
                <input
                  value={form.city || ""}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                  placeholder="UBERABA - MG"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Arq. vinculada</label>
                <select
                  value={form.architect || ""}
                  onChange={(e) => setForm((f) => ({ ...f, architect: e.target.value || undefined }))}
                  className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                >
                  <option value="">Nenhuma</option>
                  {architects.map((a) => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
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
              {search ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((c) => {
              const quotes = getClientQuotes(c.id);
              const approvedQuotes = quotes.filter((q) => q.status === "aprovado");
              const maxApproved = approvedQuotes.length
                ? Math.max(...approvedQuotes.map((q) => quoteSubtotal(q)))
                : 0;
              const isExpanded = expanded === c.id;

              return (
                <div key={c.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-sm">{c.name}</div>
                      <span className={`inline-block text-[10px] font-semibold tracking-[0.5px] px-2.5 py-[3px] rounded-full uppercase shrink-0 ${TYPE_STYLE[c.type]}`}>
                        {TYPE_LABEL[c.type]}
                      </span>
                    </div>

                    {(c.address || c.city) && (
                      <div className="text-[12px] text-text2 mb-1.5">
                        {c.address}{c.address && c.city ? " — " : ""}{c.city}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-text2 mb-1.5">
                      {c.phone && <span>📞 {c.phone}</span>}
                      {c.email && <span>✉️ {c.email}</span>}
                      {c.architect && <span>📐 Arq. {c.architect}</span>}
                    </div>

                    <div className="flex items-center gap-3 text-[12px] text-text2 mb-2">
                      <span>{quotes.length} orçamento{quotes.length !== 1 ? "s" : ""}</span>
                      {maxApproved > 0 && (
                        <span className="text-gold font-semibold">Maior aprovado: {brl(maxApproved)}</span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : c.id)}
                        className="bg-bg2 border border-border text-text2 rounded-lg px-2.5 py-1.5 text-[11px] hover:text-gold hover:border-gold transition-colors"
                      >
                        📄 Orçamentos
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="bg-bg2 border border-border text-text2 rounded-lg px-2.5 py-1.5 text-[11px] hover:text-gold hover:border-gold transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => remove(c)}
                        className="bg-bg2 border border-border text-text2 rounded-lg px-2.5 py-1.5 text-[11px] hover:text-red-500 hover:border-red-500 transition-colors"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* EXPAND: orçamentos */}
                  {isExpanded && (
                    <div className="border-t border-border bg-bg2/50 p-3.5">
                      {quotes.length === 0 ? (
                        <p className="text-text2 text-[12px]">Nenhum orçamento vinculado.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {quotes.map((q) => (
                            <div key={q.id} className="bg-card border border-border rounded-xl p-3 flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-[13px]">{q.number}</div>
                                <div className="text-[11px] text-text2">
                                  {q.environments.reduce((s, e) => s + e.items.reduce((s2, i) => s2 + i.qty, 0), 0)} peças · {q.environments.length} ambiente{q.environments.length > 1 ? "s" : ""}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-gold font-bold text-[13px]">{brl(quoteSubtotal(q))}</div>
                                <div className="text-[10px] text-text2 uppercase">{q.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TOOLBAR */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={exportCSV}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-border text-text2 hover:text-gold hover:border-gold transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
