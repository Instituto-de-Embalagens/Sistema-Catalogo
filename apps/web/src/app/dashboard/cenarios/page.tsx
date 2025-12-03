"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { ScenarioCreateDialog } from "@/components/ui/scenario-create-dialog";

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

export default function CenariosPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [loadingList, setLoadingList] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const [search, setSearch] = useState("");

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
  // LISTAGEM DE CENÁRIOS
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

  function handleCreatedScenario(id?: string) {
    // se quiser já ir pra tela de detalhes do cenário:
    if (id) {
      router.push(`/dashboard/cenarios/${id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* SIDEBAR REUTILIZADO */}
      <DashboardSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER REUTILIZADO (dinâmico pela URL, tipo "Cenários") */}
        <DashboardHeader
          isDark={isDark}
          toggleTheme={toggleTheme}
          loadingUser={loadingUser}
          displayName={displayName}
          onLogout={handleLogout}
        />

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="space-y-6 w-full">
            {/* TÍTULO + BOTÃO */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Cada registro representa uma foto/cenário. As embalagens serão
                  vinculadas depois na tela de detalhes.
                </p>
              </div>

              <Button
                onClick={() => setIsCreateOpen(true)}
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

      {/* MODAL COMPONENTIZADO */}
      <ScenarioCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        token={token}
        apiBaseUrl={API_BASE_URL}
        onCreated={handleCreatedScenario}
      />
    </div>
  );
}
