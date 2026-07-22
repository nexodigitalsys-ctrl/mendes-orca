"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const items = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/orcamento", label: "Orçamento", icon: "📝" },
  { href: "/catalogo", label: "Catálogo", icon: "🪑" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/empresa", label: "Empresa", icon: "⚙️" },
  { href: "/proposta", label: "Proposta", icon: "📄" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[230px] bg-bg2 border-r border-border p-5 z-45">
      <div className="flex items-center gap-2.5 pb-5 border-b border-border mb-3.5">
        <Image src="/logo-md.png" alt="Mendes" width={42} height={42} className="object-contain" />
        <div>
          <div className="font-serif text-base tracking-[3px] font-bold text-text">MENDES</div>
          <div className="text-[10px] tracking-[4px] text-gold mt-[-1px]">ORÇA</div>
        </div>
      </div>

      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-3 text-sm rounded-lg mb-1 transition-colors ${
              active
                ? "bg-gold/12 text-gold border-l-[3px] border-gold"
                : "text-text2 hover:bg-card hover:text-text"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto pt-2.5 border-t border-border">
        <div className="flex items-center justify-between px-1.5 mb-2">
          <span className="text-[10px] text-text2">Tema</span>
          <ThemeToggle />
        </div>
        <div className="text-[10px] text-text2 px-1.5">Mendes Design Móveis</div>
      </div>
    </aside>
  );
}
