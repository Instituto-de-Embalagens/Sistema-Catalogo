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

type User = {
  id: string;
  email: string;
  nome?: string;
  nivel_acesso?: string;
};

type Scenario = {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  pais?: string | null;
  local?: string | null;
  data?: string | null; 
  url_imagem?: string | null;
  tags?: string[] | null;
  criado_por?: string | null;
  data_criacao?: string | null;
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

export default function CenariosPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [loadingList, setLoadingList] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // filtro simples
  const [search, setSearch] = useState("");

  // modal criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // campos de criação (tabela scenarios)
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pais, setPais] = useState("");
  const [local, setLocal] = useState("");
  const [dataFoto, setDataFoto] = useState("");
  const [linkImagem, setLinkImagem] = useState("");

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
        setUser(data.user || data);
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
    (user?.nome && user.nome.trim()) || user?.email || "Usuário";

  // ======================
  // LISTAGEM DE CENÁRIOS (tabela scenarios)
  // ======================

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        setLoadingList(true);

        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(
          `${API_BASE_URL}/scenarios?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setScenarios(data.items || data || []);
      } catch (err) {
        console.error("Erro ao listar cenários:", err);
      } finally {
        setLoadingList(false);
      }
    }

    fetchData();
  }, [token, search]);

  // ======================
  // CRIAÇÃO DE CENÁRIO
  // ======================

  function openCreateModal() {
    setCreateError(null);
    setCodigo("");
    setNome("");
    setDescricao("");
    setPais("");
    setLocal("");
    setDataFoto("");
    setLinkImagem("");
    setIsCreateOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (!nome.trim()) {
      setCreateError("Informe o nome do cenário.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const body = {
        // se código vier vazio, backend pode gerar um default
        codigo: codigo.trim() || undefined,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        pais: pais.trim() || null,
        local: local.trim() || null,
        data: dataFoto || null, // campo "data" no schema
        url_imagem: linkImagem.trim() || null,
      };

      const res = await fetch(`${API_BASE_URL}/scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Erro ao criar cenário.");
        setCreating(false);
        return;
      }

      setIsCreateOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Erro ao criar cenário:", err);
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
              Módulo de cenários
            </p>
            <h2 className="text-lg font-semibold">Cenários de embalagens</h2>
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
              <div>
                <p className="text-xs text-muted-foreground">
                  Cada registro representa uma foto/cenário. As
                  embalagens serão vinculadas depois na tela de detalhes.
                </p>
              </div>

              <Button
                onClick={openCreateModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Novo cenário
              </Button>
            </div>

            {/* FILTRO SIMPLES */}
            <Card className="border-emerald-500/20 bg-background/90">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, nome, país, local..."
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
                  Cenários cadastrados ({scenarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingList ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando cenários...
                  </p>
                ) : scenarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum cenário encontrado.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="px-2 py-2 text-left">Código</th>
                          <th className="px-2 py-2 text-left">Nome</th>
                          <th className="px-2 py-2 text-left">País</th>
                          <th className="px-2 py-2 text-left">Local</th>
                          <th className="px-2 py-2 text-left">Data</th>
                          <th className="px-2 py-2 text-left">Criado em</th>
                          <th className="px-2 py-2 text-left">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarios.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b hover:bg-muted/60 transition-colors"
                          >
                            <td className="px-2 py-1">
                              {item.codigo || "—"}
                            </td>
                            <td className="px-2 py-1 max-w-[260px] truncate">
                              {item.nome}
                            </td>
                            <td className="px-2 py-1">
                              {item.pais || "—"}
                            </td>
                            <td className="px-2 py-1">
                              {item.local || "—"}
                            </td>
                            <td className="px-2 py-1">
                              {item.data
                                ? new Date(item.data).toLocaleDateString(
                                    "pt-BR"
                                  )
                                : "—"}
                            </td>
                            <td className="px-2 py-1">
                              {item.data_criacao
                                ? new Date(
                                    item.data_criacao
                                  ).toLocaleDateString("pt-BR")
                                : "—"}
                            </td>
                            <td className="px-2 py-1">
                              <Link
                                href={`/dashboard/cenarios/${item.id}`}
                                className="text-emerald-500 text-xs hover:underline"
                              >
                                Ver
                              </Link>
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
            <DialogTitle>Novo cenário</DialogTitle>
            <DialogDescription>
              Cadastre uma nova foto/cenário. As embalagens podem
              ser vinculadas depois na tela de detalhes.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="nome">Nome do cenário</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Cenário para Nordeste - EMA3"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: SCN-0001 (opcional)"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dataFoto">Data da foto</Label>
                <Input
                  id="dataFoto"
                  type="date"
                  value={dataFoto}
                  onChange={(e) => setDataFoto(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="Ex: Brasil"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Fotografia interna - estúdio"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="linkImagem">Link da imagem</Label>
                <Input
                  id="linkImagem"
                  value={linkImagem}
                  onChange={(e) => setLinkImagem(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Notas adicionais sobre o cenário..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                {creating ? "Criando..." : "Criar cenário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
