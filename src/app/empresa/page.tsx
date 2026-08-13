"use client";

import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { DEFAULT_COMPANY, type Company } from "@/lib/constants";
import { useSupabaseCompany, uploadImage } from "@/lib/store";
import { Save } from "lucide-react";

export default function EmpresaPage() {
  const [company, setCompany] = useSupabaseCompany<Company>(DEFAULT_COMPANY);
  const [form, setForm] = useState<Company>({ ...company });
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => alert("Erro ao ler a logo. Tente outra imagem.");
    reader.onload = async () => {
      const img = new Image();
      img.onerror = () => alert("Erro ao processar a logo. Tente outra imagem.");
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX = 400;
          let w = img.width;
          let h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas não suportado");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/png");
          const path = `logo/${Date.now()}.png`;
          const url = await uploadImage(dataUrl, path);
          setForm((f) => ({ ...f, logo: url }));
        } catch (err) {
          console.error(err);
          alert("Erro ao enviar a logo. Tente uma imagem menor.");
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function save() {
    if (!form.name.trim()) {
      alert("Nome da empresa é obrigatório.");
      return;
    }
    setCompany({ ...form });
    setToast("Dados da empresa salvos!");
    setTimeout(() => setToast(""), 2500);
  }

  useEffect(() => {
    setForm((f) => ({ ...company, ...f }));
  }, [company]);

  return (
    <AppLayout>
      <div className="p-5">
        {toast && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-gold text-bg font-semibold text-sm px-5 py-2.5 rounded-full z-[60] shadow-lg">
            {toast}
          </div>
        )}

        <h1 className="font-serif text-2xl text-gold mb-1">Dados da Empresa</h1>
        <p className="text-text2 text-[13px] mb-5">Informações que aparecem no PDF e no recibo</p>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-2.5 mb-2">
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Nome / Razão Social</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">CNPJ</label>
              <input
                value={form.cnpj}
                onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2">
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">IE</label>
              <input
                value={form.ie}
                onChange={(e) => setForm((f) => ({ ...f, ie: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Telefone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              placeholder="contato@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Endereço</label>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2">
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Cidade</label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Estado</label>
              <input
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full bg-bg2 border border-border rounded-[10px] text-text p-[11px_12px] text-sm outline-none focus:border-gold"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-text2 mb-1.5 uppercase tracking-[0.4px]">Logo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleLogo}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-bg2 border border-dashed border-border rounded-[10px] text-text2 p-3 text-sm w-full hover:border-gold hover:text-gold transition-colors"
            >
              {form.logo ? "📷 Logo selecionada — clique para trocar" : "📷 Selecionar logo da empresa"}
            </button>
            {form.logo && (
              <div className="mt-2">
                <img src={form.logo} alt="Logo" className="h-16 object-contain rounded-lg border border-border" />
              </div>
            )}
          </div>

          <button
            onClick={save}
            className="w-full bg-gold text-bg font-bold border-none rounded-xl px-5 py-3 text-sm mt-4 hover:bg-gold-d transition-colors"
          >
            <Save size={16} className="inline mr-1.5 -mt-0.5" /> Salvar dados da empresa
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
