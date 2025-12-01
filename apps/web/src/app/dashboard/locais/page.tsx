"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Box,
  Layers,
  Users,
  MapPin,
  ScanLine,
  Moon,
  Sun,
  LogOut,
  Search,
  Filter,
  PlusCircle,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type AuthUser = {
  id: string;
  email: string;
  nome?: string;
  nivel_acesso?: string | null; // "admin" | "editor" | "viewer"
};

type Location = {
  id: string;
  code: string;
  building: string;
  description: string | null;
  created_at?: string | null;
  created_by?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

// se o endpoint tiver outro nome, troca aqui:
const API_LOCATIONS_ENDPOINT = `${API_BASE_URL}/locations`;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Embalagens", href: "/dashboard/embalagens", icon: Box },
  { label: "Cenários", href: "/dashboard/cenarios", icon: Layers },
  { label: "Usuários", href: "/dashboard/usuarios", icon: Users },
  { label: "Locais", href: "/dashboard/locais", icon: MapPin },
  { label: "Scanner", href: "/dashboard/scanner", icon: ScanLine },
];

export default function LocaisPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [locais, setLocais] = useState<Location[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [search, setSearch] = useState("");

  // modal criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // campos de criação
  const [novoCode, setNovoCode] = useState("");
  const [novoBuilding, setNovoBuilding] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  // ======================
  // AUTH / USER / THEME
  // ======================

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("catalogo_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    async function fetchUser() {
      try {
        setLoadingUser(true);
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setAuthUser(data.user || data);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, [token, router]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.add("dark");
    setIsDark(true);
  }, []);

  function toggleTheme() {
    if (typeof document === "undefined") return;
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("catalogo_token");
    }
    router.push("/login");
  }

  const displayName =
    (authUser?.nome && authUser.nome.trim()) || authUser?.email || "Usuário";

  const canManageLocations =
    authUser?.nivel_acesso === "admin" || authUser?.nivel_acesso === "editor";

  // ======================
  // LISTAGEM DE LOCAIS
  // ======================

  useEffect(() => {
    if (!token) return;

    async function fetchLocais() {
      try {
        setLoadingList(true);

        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(
          `${API_LOCATIONS_ENDPOINT}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        // Suporta tanto { items: [...] } quanto array direto
        const items: Location[] = (data.items || data || []).map(
          (loc: any) => ({
            id: loc.id,
            code: loc.code ?? loc.Code ?? "",
            building: loc.building ?? loc.Building ?? "",
            description: loc.description ?? loc.Description ?? null,
            created_at: loc.created_at ?? loc.CreatedAt ?? null,
            created_by: loc.created_by ?? loc.CreatedBy ?? null,
          })
        );

        setLocais(items);
      } catch (err) {
        console.error("Erro ao listar locais:", err);
      } finally {
        setLoadingList(false);
      }
    }

    fetchLocais();
  }, [token, search]);

  // ======================
  // CRIAÇÃO DE LOCAL
  // ======================

  function openCreateModal() {
    setCreateError(null);
    setNovoCode("");
    setNovoBuilding("");
    setNovaDescricao("");
    setIsCreateOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (!novoCode.trim() || !novoBuilding.trim()) {
      setCreateError("Preencha código e prédio.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const body = {
        code: novoCode.trim(),
        building: novoBuilding.trim(),
        description: novaDescricao.trim() || null,
      };

      const res = await fetch(API_LOCATIONS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Erro ao criar local.");
        setCreating(false);
        return;
      }

      setIsCreateOpen(false);
      setLocais((prev) => [data.location || data, ...prev]);
    } catch (err) {
      console.error("Erro ao criar local:", err);
      setCreateError("Erro de conexão com o servidor.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* SIDEBAR */}
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
            const isActive = pathname === item.href;
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
            Locations • Google Sheets • Node API
          </p>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Módulo de locais
            </p>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Mapeamento de locais
            </h2>
          </div>

          <div className="flex items-center gap-3">
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

            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                Logado como
              </span>
              <span className="text-sm font-medium truncate max-w-[180px]">
                {loadingUser ? "Carregando..." : displayName}
              </span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="space-y-6 w-full">
            {/* TÍTULO + BOTÃO */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Gerencie os locais físicos associados às embalagens e cenários
                  (prédios, caixas, áreas, etc).
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Exemplo: <strong>Code</strong> = CX-001,{" "}
                  <strong>Building</strong> = Tagetes,{" "}
                  <strong>Description</strong> = Caixa Tailândia.
                </p>
              </div>

              {canManageLocations && (
                <Button
                  onClick={openCreateModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Novo local
                </Button>
              )}
            </div>

            {/* FILTROS */}
            <Card className="border-emerald-500/20 bg-background/90">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 md:col-span-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, prédio ou descrição..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* LISTAGEM */}
            <Card className="border-emerald-500/10 bg-background/90">
              <CardHeader>
                <CardTitle className="text-base">
                  Locais ({locais.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingList ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando locais...
                  </p>
                ) : locais.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum local encontrado.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="px-2 py-2 text-left">Código</th>
                          <th className="px-2 py-2 text-left">Prédio</th>
                          <th className="px-2 py-2 text-left">Descrição</th>
                          <th className="px-2 py-2 text-left">Criado em</th>
                          <th className="px-2 py-2 text-left">Criado por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locais.map((loc) => (
                          <tr
                            key={loc.id}
                            className="border-b hover:bg-muted/60 transition-colors"
                          >
                            <td className="px-2 py-1 whitespace-nowrap">
                              {loc.code || "—"}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              {loc.building || "—"}
                            </td>
                            <td className="px-2 py-1 max-w-[260px] truncate">
                              {loc.description || "—"}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              {loc.created_at
                                ? new Date(
                                    loc.created_at
                                  ).toLocaleString("pt-BR")
                                : "—"}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              {loc.created_by || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* MODAL DE CRIAÇÃO */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo local</DialogTitle>
            <DialogDescription>
              Defina código, prédio e uma descrição para o local físico
              (ex.: prédio, caixa, área de armazenagem).
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={novoCode}
                  onChange={(e) => setNovoCode(e.target.value)}
                  required
                  placeholder="CX-001"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="building">Prédio / área</Label>
                <Input
                  id="building"
                  value={novoBuilding}
                  onChange={(e) => setNovoBuilding(e.target.value)}
                  required
                  placeholder="Tagetes"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Caixa Tailândia, estoque alto, etc."
                />
              </div>
            </div>

            {createError && (
              <p className="text-sm text-red-500">{createError}</p>
            )}

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={creating}
              >
                {creating ? "Criando..." : "Criar local"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
