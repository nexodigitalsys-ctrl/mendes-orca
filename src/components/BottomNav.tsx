"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/orcamento", label: "Orçamento", icon: "📝" },
  { href: "/catalogo", label: "Catálogo", icon: "🪑" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/empresa", label: "Empresa", icon: "⚙️" },
  { href: "/proposta", label: "Proposta", icon: "📄" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg2 border-t border-border flex md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 text-[11px] transition-colors ${
              active ? "text-gold" : "text-text2 hover:text-text"
            }`}
          >
            <span className={`text-lg ${active ? "translate-y-[-1px]" : ""}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
