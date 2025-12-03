"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Package, ArrowLeft, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

type AuthUser = {
  id: string;
  email: string;
  nome?: string;
  nivel_acesso?: string | null;
};

type Packaging = {
  id: string;
  codigo: string;
  nome: string;
  marca?: string | null;
  material?: string | null;
  dimensoes?: string | null;
  pais?: string | null;
  data_cadastro?: string | null;
  grafica?: string | null; // Transformador
  url_imagem?: string | null; // link do Drive
  status: string;
  eventos?: string | null;
  livros?: string | null;
  observacoes?: string | null;
  tags?: string[] | null; // Categorias
};

export default function EmbalagemDetalhesPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // em rotas [id], o Next já garante string, mas vamos ser gentis
  const id = params?.id;

  const [token, setToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [embalagem, setEmbalagem] = useState<Packaging | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --------- Token ---------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("catalogo_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  // --------- Usuário logado ---------
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

  // --------- Tema ---------
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

  // --------- Detalhes da embalagem ---------
  useEffect(() => {
    if (!token || !id) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${API_BASE_URL}/packaging/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || "Erro ao carregar embalagem");
          return;
        }

        const e = data.embalagem || data;
        setEmbalagem(e);
      } catch (err) {
        console.error("Erro ao buscar embalagem:", err);
        setErrorMsg("Erro de conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [token, id]);

  function goBack() {
    router.push("/dashboard/embalagens");
  }

  const categoriasTexto = embalagem?.tags?.join(", ");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader
          isDark={isDark}
          toggleTheme={toggleTheme}
          loadingUser={loadingUser}
          displayName={displayName}
          onLogout={handleLogout}
          customTitle="Embalagens"
        />

        <main className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Título local da página + voltar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goBack}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Package className="w-6 h-6 text-emerald-400" />
                    Detalhes da embalagem
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Visualização completa do registro.
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-emerald-500/20 bg-background/90">
              <CardHeader>
                <CardTitle className="text-base">
                  {loading
                    ? "Carregando..."
                    : embalagem?.nome || "Embalagem não encontrada"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {errorMsg && (
                  <p className="text-red-500 text-sm mb-2">{errorMsg}</p>
                )}

                {loading && (
                  <p className="text-muted-foreground">Carregando...</p>
                )}

                {!loading && embalagem && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Código
                        </p>
                        <p>{embalagem.codigo}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Marca
                        </p>
                        <p>{embalagem.marca || "—"}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Material
                        </p>
                        <p>{embalagem.material || "—"}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          País
                        </p>
                        <p>{embalagem.pais || "—"}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Dimensões
                        </p>
                        <p>{embalagem.dimensoes || "—"}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Status
                        </p>
                        <p>{embalagem.status}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Transformador
                        </p>
                        <p>{embalagem.grafica || "—"}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-muted-foreground uppercase">
                          Categorias
                        </p>
                        <p>{categoriasTexto || "—"}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t mt-3 space-y-2">
                      <p className="font-semibold text-xs text-muted-foreground uppercase">
                        Link do Drive / Arquivo relacionado
                      </p>
                      {embalagem.url_imagem ? (
                        <a
                          href={embalagem.url_imagem}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 underline-offset-2 hover:underline break-all"
                        >
                          Abrir no Drive
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Nenhum link informado.
                        </p>
                      )}
                    </div>

                    {(embalagem.eventos ||
                      embalagem.livros ||
                      embalagem.observacoes) && (
                      <div className="pt-3 border-t mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {embalagem.eventos && (
                          <div>
                            <p className="font-semibold text-xs text-muted-foreground uppercase">
                              Eventos
                            </p>
                            <p>{embalagem.eventos}</p>
                          </div>
                        )}
                        {embalagem.livros && (
                          <div>
                            <p className="font-semibold text-xs text-muted-foreground uppercase">
                              Livros
                            </p>
                            <p>{embalagem.livros}</p>
                          </div>
                        )}
                        {embalagem.observacoes && (
                          <div className="md:col-span-2">
                            <p className="font-semibold text-xs text-muted-foreground uppercase">
                              Observações
                            </p>
                            <p>{embalagem.observacoes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
