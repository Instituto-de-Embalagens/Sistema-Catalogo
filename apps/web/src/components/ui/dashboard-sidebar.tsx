"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Layers,
  Users,
  MapPin,
  ScanLine,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Embalagens", href: "/dashboard/embalagens", icon: Box },
  { label: "Cenários", href: "/dashboard/cenarios", icon: Layers },
  { label: "Usuários", href: "/dashboard/usuarios", icon: Users },
  { label: "Locais", href: "/dashboard/locais", icon: MapPin },
  { label: "Scanner", href: "/dashboard/scanner", icon: ScanLine }, 
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-background/95">
      <div className="h-16 flex items-center px-5 border-b">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-semibold shadow-sm">
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
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" &&
              pathname?.startsWith("/dashboard"));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                    : "text-muted-foreground hover:bg-muted/50",
                ].join(" ")}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-400" : "text-muted-foreground"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t">
        <p className="text-[10px] text-muted-foreground">
          v1.0 • Catálogo conectado ao Supabase
        </p>
        <p className="text-[10px] text-muted-foreground">
          Google Sheets • Apps Script • Node API
        </p>
      </div>
    </aside>
  );
}
