"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  isDark: boolean;
  toggleTheme: () => void;
  loadingUser: boolean;
  displayName: string;
  onLogout: () => void;
  customTitle?: string;
};

function getTitleFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);

  const last = parts[parts.length - 1] || "dashboard";

  const formatted = last
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return formatted;
}

export function DashboardHeader({
  isDark,
  toggleTheme,
  loadingUser,
  displayName,
  onLogout,
  customTitle,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const defaultTitle = getTitleFromPath(pathname);
  const title = customTitle || defaultTitle;

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur">
      {/* TÍTULO */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">
          {title}
        </h1>
      </div>

      {/* AÇÕES */}
      <div className="flex items-center gap-3">
        {/* Toggle dark mode */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-emerald-500/40"
          onClick={toggleTheme}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : (
            <Sun className="w-4 h-4 text-emerald-400" />
          )}
        </Button>

        {/* Usuário logado */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-muted-foreground">Logado como</span>
          <span className="text-sm font-medium truncate max-w-[180px]">
            {loadingUser ? "Carregando..." : displayName}
          </span>
        </div>

        {/* Botão sair */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
