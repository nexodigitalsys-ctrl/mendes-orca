import AppLayout from "@/components/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <div className="p-5">
        <h1 className="font-serif text-2xl text-gold mb-1">Olá, João 👋</h1>
        <p className="text-text2 text-sm mb-5">Terça-feira, 21 de julho de 2026</p>
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-card border border-border rounded-xl p-3.5">
            <div className="text-xl font-bold text-gold">7</div>
            <div className="text-[11px] text-text2 mt-0.5">Orçamentos no mês</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3.5">
            <div className="text-xl font-bold text-gold">3</div>
            <div className="text-[11px] text-text2 mt-0.5">Aguardando retorno</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3.5">
            <div className="text-xl font-bold text-gold">R$ 512k</div>
            <div className="text-[11px] text-text2 mt-0.5">Aprovados em julho</div>
          </div>
        </div>
        <div className="text-gold font-serif text-lg">Início</div>
      </div>
    </AppLayout>
  );
}
