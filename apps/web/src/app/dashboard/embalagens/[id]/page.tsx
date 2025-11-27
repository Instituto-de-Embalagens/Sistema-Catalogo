"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Layers,
  Users,
  MapPin,
  ScanLine,
  LogOut,
  Moon,
  Sun,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EmbalagemDetalhesClient } from "./EmbalagemDetalhesClient";
import { Button } from "@/components/ui/button";

type ParamsPromise = Promise<{ id: string }>;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Embalagens", href: "/dashboard/embalagens", icon: Box },
  { label: "Cenários", href: "/dashboard/cenarios", icon: Layers },
  { label: "Usuários", href: "/dashboard/usuarios", icon: Users },
  { label: "Locais", href: "/dashboard/locais", icon: MapPin },
  { label: "Scanner", href: "/dashboard/scanner", icon: ScanLine },
];

export default function Page({ params }: { params: ParamsPromise }) {
  const { id } = use(params);
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  function toggleTheme() {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  }

  function handleLogout() {
    localStorage.removeItem("catalogo_token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-background/95">
        <div className="h-16 flex items-center px-5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              IE
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                Sistema de Embalagens
              </span>
              <span className="text-xs text-muted-foreground">
                Instituto de Embalagens
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="px-2 text-xs font-medium text-muted-foreground mb-2">
            NAVEGAÇÃO
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                      : "text-muted-foreground hover:bg-muted/50",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t">
          <p className="text-[10px] text-muted-foreground">
            v1.0 • Catálogo conectado ao Supabase
          </p>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95">
          <div>
            {/* <h1 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Detalhes da Embalagem
            </h1> */}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="max-w-7xl mx-auto w-full">
            <EmbalagemDetalhesClient id={id} />
          </div>
        </main>
      </div>
    </div>
  );
}
