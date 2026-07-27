"use client";

import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <Image src="/logo-md.png" alt="Mendes" width={38} height={38} className="object-contain" />
        <div>
          <div className="font-serif text-[15px] tracking-[2px] font-bold text-text">MENDES DESIGN</div>
          <div className="text-[9px] tracking-[2px] text-gold mt-[-1px]">MÓVEIS PARA ÁREAS EXTERNAS</div>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
