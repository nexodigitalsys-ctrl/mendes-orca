"use client";

import Header from "./Header";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="md:ml-[230px] pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
