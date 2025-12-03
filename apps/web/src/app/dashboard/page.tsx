"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Layers,
  Package,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
  Box,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardSidebar } from "../../components/ui/dashboard-sidebar";
import { DashboardHeader } from "../../components/ui/dashboard-header";

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

export default function DashboardPage() {
  const router = useRouter();

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
    const arquivadas = packaging.filter((p) => p.status === "arquivado").length;
    const rascunhos = packaging.filter((p) => p.status === "rascunho").length;

    return { total, ativos, arquivadas, rascunhos };
  }, [packaging]);

  const recentes = useMemo(() => {
    return packaging.slice(0, 5);
  }, [packaging]);

  // ======================
  // RENDER
  // ======================

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <DashboardSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          isDark={isDark}
          toggleTheme={toggleTheme}
          loadingUser={loadingUser}
          displayName={displayName}
          onLogout={handleLogout}
        />

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="space-y-6 w-full max-w-6xl mx-auto">
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
                    {loadingPackaging ? "..." : stats.arquivadas}
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
                  <Link href="/dashboard/usuarios">
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
                    <Link href="/dashboard/cenarios">
                      <Button size="sm" variant="outline">
                        Cenários
                      </Button>
                    </Link>
                    <Link href="/dashboard/locais">
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
