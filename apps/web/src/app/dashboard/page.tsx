"use client";

import { useEffect, useState, useMemo } from "react";
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
  Package,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type User = {
  id: string;
  email: string;
  nome?: string;
  nivel_acesso?: string;
};

type Packaging = {
  id: string;
  codigo: string;
  nome: string;
  marca?: string | null;
  material?: string | null;
  pais?: string | null;
  url_imagem?: string | null;
  status: string;
  grafica?: string | null; // transformador
  tags?: string[] | null; // categorias
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Embalagens", href: "/dashboard/embalagens", icon: Box },
  { label: "Cenários", href: "/dashboard/cenarios", icon: Layers },
  { label: "Usuários", href: "/dashboard/usuarios", icon: Users },
  { label: "Locais", href: "/dashboard/locais", icon: MapPin },
  { label: "Scanner", href: "/dashboard//scanner", icon: ScanLine },
];

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [loadingPackaging, setLoadingPackaging] = useState(true);
  const [packaging, setPackaging] = useState<Packaging[]>([]);

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

  // dark mode inicial
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
  // DADOS DE EMBALAGENS PARA RESUMO
  // ======================

  useEffect(() => {
    if (!token) return;

    async function fetchPackaging() {
      try {
        setLoadingPackaging(true);

        // você pode trocar/otimizar depois (ex: endpoint /dashboard/overview)
        const res = await fetch(`${API_BASE_URL}/packaging`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setPackaging(data.items || []);
      } catch (err) {
        console.error("Erro ao listar embalagens:", err);
      } finally {
        setLoadingPackaging(false);
      }
    }

    fetchPackaging();
  }, [token]);

  const stats = useMemo(() => {
    const total = packaging.length;
    const ativos = packaging.filter((p) => p.status === "ativo").length;
    const arquivados = packaging.filter((p) => p.status === "arquivado").length;
    const rascunhos = packaging.filter((p) => p.status === "rascunho").length;

    return { total, ativos, arquivados, rascunhos };
  }, [packaging]);

  const recentes = useMemo(() => {
    // aqui assumimos que o backend já retorna em ordem recente;
    // se tiver campo createdAt depois dá pra ordenar.
    return packaging.slice(0, 5);
  }, [packaging]);

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

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              {loadingUser
                ? "Carregando usuário..."
                : "Visão geral do acervo e dos módulos do sistema."}
            </p>
          </div>

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
              <span className="text-xs text-muted-foreground">
                Logado como
              </span>
              <span className="text-sm font-medium truncate max-w-[180px]">
                {loadingUser ? "Carregando..." : displayName}
              </span>
            </div>

            {/* Botão sair */}
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
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* BOAS-VINDAS + AÇÃO RÁPIDA */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Visão geral
                </p>
                <h2 className="text-lg font-semibold">
                  {loadingUser
                    ? "Carregando..."
                    : `Bem-vindo(a), ${displayName.split(" ")[0]}!`}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Acompanhe o resumo das embalagens e acesse os módulos mais
                  usados.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/dashboard/embalagens">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Ir para Embalagens
                  </Button>
                </Link>
              </div>
            </section>

            {/* CARDS DE MÉTRICAS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-emerald-500/20 bg-background/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total de embalagens
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">
                    {loadingPackaging ? "..." : stats.total}
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-background/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Ativas no acervo
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">
                    {loadingPackaging ? "..." : stats.ativos}
                  </span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-background/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Arquivadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">
                    {loadingPackaging ? "..." : stats.arquivados}
                  </span>
                  <Box className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-background/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Rascunhos
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">
                    {loadingPackaging ? "..." : stats.rascunhos}
                  </span>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </section>

            {/* MÓDULOS / ACESSOS RÁPIDOS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background/90">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Acervo de Embalagens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Consulte, organize e faça a curadoria das embalagens
                    cadastradas no catálogo.
                  </p>
                  <Link href="/dashboard/embalagens">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Abrir módulo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-background/90">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Gestão de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Administre acessos, níveis de permissão e mantenha o time
                    sincronizado com o acervo.
                  </p>
                  <Link href="/usuarios">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Ver usuários
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-background/90">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Cenários & Locais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Explore os cenários, pontos de venda e demais locais
                    associados às embalagens.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/cenarios">
                      <Button size="sm" variant="outline">
                        Cenários
                      </Button>
                    </Link>
                    <Link href="/locais">
                      <Button size="sm" variant="outline">
                        Locais
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* LISTA DE RECENTES */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-emerald-500/10 bg-background/90">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    Últimas embalagens cadastradas
                  </CardTitle>
                  <Link href="/dashboard/embalagens">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs flex items-center gap-1"
                    >
                      Ver todas
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {loadingPackaging ? (
                    <p className="text-sm text-muted-foreground">
                      Carregando embalagens...
                    </p>
                  ) : recentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma embalagem cadastrada ainda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recentes.map((item) => (
                        <Link
                          key={item.id}
                          href={`/dashboard/embalagens/${item.id}`}
                        >
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/70 transition cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-md border flex items-center justify-center text-muted-foreground bg-background">
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {item.nome}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {item.marca ? item.marca + " • " : ""}
                                  {item.codigo}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {[item.material, item.pais]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/10 bg-background/90">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Próximos passos sugeridos
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>
                    • Revise as embalagens em rascunho e finalize os dados para
                    curadoria.
                  </p>
                  <p>
                    • Mapeie quais marcas estão com menor representação no
                    acervo.
                  </p>
                  <p>
                    • Use o módulo de scanner para registrar novas embalagens
                    diretamente do ponto de venda.
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
