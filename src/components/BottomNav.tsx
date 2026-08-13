"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Package, Armchair, Users, Settings, FileCheck } from "lucide-react";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/orcamento", label: "Orçamento", icon: FileText },
  { href: "/pedidos", label: "Pedidos", icon: Package },
  { href: "/catalogo", label: "Catálogo", icon: Armchair },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/empresa", label: "Empresa", icon: Settings },
  { href: "/proposta", label: "Proposta", icon: FileCheck },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg2 border-t border-border flex md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 text-[11px] transition-colors ${
              active ? "text-gold" : "text-text2 hover:text-text"
            }`}
          >
            <Icon size={20} className={active ? "-translate-y-[1px]" : ""} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
