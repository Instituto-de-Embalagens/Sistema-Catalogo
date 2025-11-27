"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
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
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type ScenarioPackagingLink = {
  id: string;
  scenario_id: string;
  packaging_id: string;
  posicao?: number | null;
  observacoes?: string | null;
  data_criacao?: string | null;
  criado_por?: string | null;
  packaging?: {
    id: string;
    codigo: string;
    nome: string;
    marca?: string | null;
    material?: string | null;
    pais?: string | null;
  } | null;
};

type Packaging = {
  id: string;
  codigo: string;
  nome: string;
  marca?: string | null;
  material?: string | null;
  pais?: string | null;
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

export default function ScenarioDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();

  // pega o último trecho da URL: /dashboard/cenarios/<id>
  const scenarioId = pathname?.split("/").filter(Boolean).pop() || "";

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const [links, setLinks] = useState<ScenarioPackagingLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [packagingSearch, setPackagingSearch] = useState("");
  const [packagingResults, setPackagingResults] = useState<Packaging[]>([]);
  const [loadingPackagingSearch, setLoadingPackagingSearch] = useState(false);
  const [packagingSearchError, setPackagingSearchError] = useState<
    string | null
  >(null);

  const [novaPosicao, setNovaPosicao] = useState("");
  const [novasObservacoes, setNovasObservacoes] = useState("");
  const [savingLinks, setSavingLinks] = useState(false);
  const [linkActionError, setLinkActionError] = useState<string | null>(null);

  // ======================
  // AUTH / THEME
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
  // CARREGA CENÁRIO
  // ======================

  useEffect(() => {
    if (!token) return;
    if (!scenarioId) {
      setScenarioError("ID do cenário não encontrado na URL.");
      setLoadingScenario(false);
      return;
    }

    async function fetchScenario() {
      try {
        setLoadingScenario(true);
        setScenarioError(null);

        console.log("[ScenarioDetails] GET /scenarios/:id", {
          scenarioId,
        });

        const res = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error(
            "[ScenarioDetails] Resposta não-JSON ao buscar cenário:",
            {
              status: res.status,
              text,
            }
          );
          setScenarioError(
            "A API retornou um conteúdo inesperado ao carregar o cenário."
          );
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          console.error("[ScenarioDetails] erro da API:", data);
          setScenarioError(data.error || "Cenário não encontrado.");
          return;
        }

        const s: Scenario = data.scenario || data;
        console.log("[ScenarioDetails] cenário carregado:", s);
        setScenario(s);
      } catch (err) {
        console.error("Erro ao carregar cenário:", err);
        setScenarioError("Erro de conexão ao carregar cenário.");
      } finally {
        setLoadingScenario(false);
      }
    }

    fetchScenario();
  }, [token, scenarioId]);

  // ======================
  // CARREGA EMBALAGENS VINCULADAS
  // ======================

  async function loadLinks() {
    if (!token || !scenarioId) return;

    try {
      setLoadingLinks(true);
      setLinksError(null);

      const res = await fetch(
        `${API_BASE_URL}/scenarios/${scenarioId}/packaging`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error(
          "[ScenarioDetails] Resposta não-JSON ao listar packaging:",
          { status: res.status, text }
        );
        setLinksError(
          "A API retornou um conteúdo inesperado ao listar embalagens."
        );
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("[ScenarioDetails] erro ao listar packaging:", data);
        setLinksError(
          data.error || "Erro ao listar embalagens vinculadas ao cenário."
        );
        return;
      }

      const list: ScenarioPackagingLink[] = data.items || data || [];
      setLinks(list);
    } catch (err) {
      console.error("Erro ao listar embalagens do cenário:", err);
      setLinksError("Erro de conexão ao listar embalagens.");
    } finally {
      setLoadingLinks(false);
    }
  }

  useEffect(() => {
    if (!token || !scenarioId) return;
    loadLinks();
  }, [token, scenarioId]);

  // ======================
  // BUSCAR EMBALAGENS
  // ======================

  async function handleSearchPackaging() {
    if (!token) return;
    if (!packagingSearch.trim()) return;

    try {
      setLoadingPackagingSearch(true);
      setPackagingSearchError(null);

      const url = `${API_BASE_URL}/packaging?search=${encodeURIComponent(
        packagingSearch.trim()
      )}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Resposta da API não é JSON ao buscar embalagens:", {
          url,
          status: res.status,
          text,
        });
        setPackagingSearchError(
          "A API retornou um conteúdo inesperado (não-JSON)."
        );
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setPackagingSearchError(data.error || "Erro ao buscar embalagens.");
        return;
      }

      const list: Packaging[] = data.items || data || [];
      setPackagingResults(list);
    } catch (err) {
      console.error("Erro ao buscar embalagens:", err);
      setPackagingSearchError("Erro de conexão ao buscar embalagens.");
    } finally {
      setLoadingPackagingSearch(false);
    }
  }

  // ======================
  // VINCULAR EMBALAGEM
  // ======================

  async function handleAddPackaging(pack: Packaging) {
    if (!token || !scenarioId) return;

    setSavingLinks(true);
    setLinkActionError(null);

    try {
      const body = {
        items: [
          {
            packaging_id: pack.id,
            observacoes: novasObservacoes || undefined,
            posicao: novaPosicao
              ? Number.isNaN(Number(novaPosicao))
                ? undefined
                : Number(novaPosicao)
              : undefined,
          },
        ],
      };

      const res = await fetch(
        `${API_BASE_URL}/scenarios/${encodeURIComponent(
          scenarioId
        )}/packaging`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        console.error("[addScenarioPackaging] error:", data);
        setLinkActionError(
          (data && (data as any).error) ||
            `Erro ao vincular embalagem (status ${res.status}).`
        );
        return;
      }

      await loadLinks();
      setNovaPosicao("");
      setNovasObservacoes("");
      setPackagingResults([]);
      setPackagingSearch("");
    } catch (err) {
      console.error("Erro ao adicionar embalagem ao cenário:", err);
      setLinkActionError("Erro de conexão ao adicionar embalagem.");
    } finally {
      setSavingLinks(false);
    }
  }

  async function handleRemoveLink(linkId: string) {
    if (!token || !scenarioId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/scenarios/${scenarioId}/packaging/${linkId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        console.error("[removeScenarioPackaging] error:", data);
      }

      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      console.error("Erro ao remover embalagem do cenário:", err);
    }
  }

  function goBack() {
    router.push("/dashboard/cenarios");
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
            const isActive = item.href === "/dashboard/cenarios";
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goBack}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Detalhes do cenário
              </p>
              <h2 className="text-lg font-semibold">
                {scenario?.nome || "Cenário"}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                ID: {scenarioId || "—"}
              </p>
            </div>
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
          <div className="space-y-6 w-full max-w-5xl mx-auto">
            {/* INFO DO CENÁRIO */}
            <Card className="border-emerald-500/20 bg-background/90">
              <CardHeader>
                <CardTitle className="text-sm">
                  Informações do cenário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {loadingScenario && (
                  <p className="text-muted-foreground">
                    Carregando informações do cenário...
                  </p>
                )}

                {scenarioError && (
                  <p className="text-red-500 text-sm">{scenarioError}</p>
                )}

                {!loadingScenario && !scenarioError && scenario && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Código
                      </p>
                      <p>{scenario.codigo || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Nome
                      </p>
                      <p>{scenario.nome}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        País
                      </p>
                      <p>{scenario.pais || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Local
                      </p>
                      <p>{scenario.local || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Data da foto
                      </p>
                      <p>
                        {scenario.data
                          ? new Date(scenario.data).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Criado em
                      </p>
                      <p>
                        {scenario.data_criacao
                          ? new Date(
                              scenario.data_criacao
                            ).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </div>

                    {scenario.descricao && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Descrição
                        </p>
                        <p>{scenario.descricao}</p>
                      </div>
                    )}

                    {scenario.url_imagem && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Imagem
                        </p>
                        <a
                          href={scenario.url_imagem}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 text-xs underline hover:text-emerald-400 break-all"
                        >
                          Abrir imagem
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* EMBALAGENS VINCULADAS */}
            <Card className="border-emerald-500/20 bg-background/90">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Embalagens no cenário</span>
                  <span className="text-xs text-muted-foreground">
                    {links.length} vínculos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {linksError && (
                  <p className="text-red-500 text-sm">{linksError}</p>
                )}

                {linkActionError && (
                  <p className="text-xs text-red-500">{linkActionError}</p>
                )}

                {loadingLinks && (
                  <p className="text-muted-foreground">
                    Carregando embalagens vinculadas...
                  </p>
                )}

                {!loadingLinks && links.length === 0 && !linksError && (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma embalagem vinculada a este cenário ainda.
                  </p>
                )}

                {!loadingLinks && links.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/40 text-[11px] uppercase text-muted-foreground">
                          <th className="px-2 py-2 text-left">Embalagem</th>
                          <th className="px-2 py-2 text-left">Posição</th>
                          <th className="px-2 py-2 text-left">Observações</th>
                          <th className="px-2 py-2 text-left">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {links.map((link) => (
                          <tr
                            key={link.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="px-2 py-1">
                              {link.packaging ? (
                                <span>
                                  <span className="font-medium">
                                    {link.packaging.codigo}
                                  </span>{" "}
                                  — {link.packaging.nome}
                                </span>
                              ) : (
                                link.packaging_id
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {link.posicao ?? "—"}
                            </td>
                            <td className="px-2 py-1 max-w-[260px] truncate">
                              {link.observacoes || "—"}
                            </td>
                            <td className="px-2 py-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLink(link.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* BUSCA E VÍNCULO NOVO */}
                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Adicionar novas embalagens ao cenário
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="novaPosicao">Posição na gôndola</Label>
                      <Input
                        id="novaPosicao"
                        value={novaPosicao}
                        onChange={(e) => setNovaPosicao(e.target.value)}
                        placeholder="Ex: 1, 2, 3..."
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label htmlFor="novasObservacoes">Observações</Label>
                      <Input
                        id="novasObservacoes"
                        value={novasObservacoes}
                        onChange={(e) =>
                          setNovasObservacoes(e.target.value)
                        }
                        placeholder="Notas sobre esse posicionamento..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar embalagem por código ou nome"
                        value={packagingSearch}
                        onChange={(e) => setPackagingSearch(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSearchPackaging}
                        disabled={loadingPackagingSearch}
                      >
                        {loadingPackagingSearch ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>

                    {packagingSearchError && (
                      <p className="text-xs text-red-500">
                        {packagingSearchError}
                      </p>
                    )}

                    {packagingResults.length > 0 && (
                      <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                        {packagingResults.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="truncate">
                              <span className="font-medium">{p.codigo}</span>{" "}
                              {p.nome && (
                                <span className="text-muted-foreground">
                                  — {p.nome}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={savingLinks}
                              onClick={() => handleAddPackaging(p)}
                            >
                              {savingLinks ? "Salvando..." : "Adicionar"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
