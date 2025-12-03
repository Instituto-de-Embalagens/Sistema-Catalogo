"use client";

import type React from "react";
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
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  UserCreateDialog,
  type Usuario,
} from "../../../components/ui/user-create-dialog";

type AuthUser = {
  id: string;
  email: string;
  nome?: string;
  nivel_acesso?: string | null; // "admin" | "editor" | "viewer"
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Embalagens", href: "/dashboard/embalagens", icon: Box },
  { label: "Cenários", href: "/dashboard/cenarios", icon: Layers },
  { label: "Usuários", href: "/dashboard/usuarios", icon: Users },
  { label: "Locais", href: "/dashboard/locais", icon: MapPin },
  { label: "Scanner", href: "/dashboard/scanner", icon: ScanLine },
];

function mapNivelLabel(nivel?: string | null): string {
  if (!nivel) return "—";
  switch (nivel) {
    case "admin":
      return "Acesso total";
    case "editor":
      return "Criar e editar";
    case "viewer":
      return "Visualização";
    default:
      return nivel;
  }
}

function mapStatusLabel(status?: string | null): string {
  if (!status) return "—";
  if (status === "ativo") return "Ativo";
  if (status === "inativo") return "Inativo";
  return status;
}

export default function UsuariosPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // filtros
  const [search, setSearch] = useState("");
  const [filterNivel, setFilterNivel] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  // modal criação (agora só controle de open/close)
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const canManageUsers =
    authUser?.nivel_acesso === "admin" || authUser?.nivel_acesso === "editor";

  // ======================
  // LISTAGEM DE USUÁRIOS
  // ======================

  useEffect(() => {
    if (!token) return;

    async function fetchUsers() {
      try {
        setLoadingList(true);

        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (filterNivel !== "todos") params.set("nivel_acesso", filterNivel);
        if (filterStatus !== "todos") params.set("status", filterStatus);

        const res = await fetch(
          `${API_BASE_URL}/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setUsuarios(data.items || data || []);
      } catch (err) {
        console.error("Erro ao listar usuários:", err);
      } finally {
        setLoadingList(false);
      }
    }

    fetchUsers();
  }, [token, search, filterNivel, filterStatus]);

  function openCreateModal() {
    setIsCreateOpen(true);
  }

  // ======================
  // RENDER
  // ======================

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
            Google Sheets • Apps Script • Node API
          </p>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Módulo de usuários
            </p>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Controle de acesso
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
                  Configure quem pode criar, editar ou apenas visualizar
                  registros no catálogo.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Níveis: <strong>admin</strong> (acesso total),{" "}
                  <strong>editor</strong> (criar/editar) e{" "}
                  <strong>viewer</strong> (visualização).
                </p>
              </div>

              {canManageUsers && (
                <Button
                  onClick={openCreateModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Novo usuário
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
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* BUSCA GERAL */}
                <div className="flex items-center gap-2 md:col-span-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* NÍVEL */}
                <div>
                  <Select
                    value={filterNivel}
                    onValueChange={setFilterNivel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nível de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos níveis</SelectItem>
                      <SelectItem value="admin">Acesso total</SelectItem>
                      <SelectItem value="editor">Criar e editar</SelectItem>
                      <SelectItem value="viewer">Visualização</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* STATUS */}
                <div>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="inativo">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* LISTAGEM */}
            <Card className="border-emerald-500/10 bg-background/90">
              <CardHeader>
                <CardTitle className="text-base">
                  Usuários ({usuarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingList ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando usuários...
                  </p>
                ) : usuarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum usuário encontrado.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="px-2 py-2 text-left">Nome</th>
                          <th className="px-2 py-2 text-left">Email</th>
                          <th className="px-2 py-2 text-left">Nível</th>
                          <th className="px-2 py-2 text-left">Status</th>
                          <th className="px-2 py-2 text-left">
                            Data criação
                          </th>
                          <th className="px-2 py-2 text-left">
                            Último acesso
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b hover:bg-muted/60 transition-colors"
                          >
                            <td className="px-2 py-1 max-w-[220px] truncate">
                              {u.nome}
                            </td>
                            <td className="px-2 py-1 max-w-[260px] truncate">
                              {u.email}
                            </td>
                            <td className="px-2 py-1">
                              {mapNivelLabel(u.nivel_acesso)}
                            </td>
                            <td className="px-2 py-1">
                              {mapStatusLabel(u.status)}
                            </td>
                            <td className="px-2 py-1">
                              {u.data_criacao
                                ? new Date(
                                    u.data_criacao
                                  ).toLocaleString("pt-BR")
                                : "—"}
                            </td>
                            <td className="px-2 py-1">
                              {u.ultimo_acesso
                                ? new Date(
                                    u.ultimo_acesso
                                  ).toLocaleString("pt-BR")
                                : "—"}
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

      {/* MODAL DE CRIAÇÃO COMPONENTIZADO */}
      <UserCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        token={token}
        onCreated={(user) => {
          setUsuarios((prev) => [user, ...prev]);
        }}
      />
    </div>
  );
}
