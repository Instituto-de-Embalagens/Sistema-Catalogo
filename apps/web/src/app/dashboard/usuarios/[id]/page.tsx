"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Shield, AlertTriangle, Trash2 } from "lucide-react";

import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type AuthUser = {
  id: string;
  email: string;
  nome?: string;
  nivel_acesso?: string | null;
};

type Usuario = {
  id: string;
  email: string;
  nome: string;
  nivel_acesso?: string | null;
  status?: string | null;
  data_criacao?: string | null;
  ultimo_acesso?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

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

export default function UsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string | undefined;

  const [token, setToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loadingTarget, setLoadingTarget] = useState(true);

  // form de edição
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [nivel, setNivel] = useState<string>("viewer");
  const [status, setStatus] = useState<string>("ativo");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // deleção
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

    async function fetchAuthUser() {
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
        console.error("Erro ao carregar usuário autenticado:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchAuthUser();
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
  // CARREGAR USUÁRIO ALVO
  // ======================

  useEffect(() => {
    if (!token || !userId) return;

    async function fetchUsuario() {
      try {
        setLoadingTarget(true);
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.push("/dashboard/usuarios");
          return;
        }

        const data = await res.json();
        const u: Usuario = data.usuario || data;

        setUsuario(u);
        setNome(u.nome || "");
        setEmail(u.email || "");
        setNivel((u.nivel_acesso as string) || "viewer");
        setStatus((u.status as string) || "ativo");
      } catch (err) {
        console.error("Erro ao carregar usuário alvo:", err);
      } finally {
        setLoadingTarget(false);
      }
    }

    fetchUsuario();
  }, [token, userId, router]);

  // ======================
  // SALVAR ALTERAÇÕES
  // ======================

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !usuario || !canManageUsers) return;

    if (!nome.trim() || !email.trim()) {
      setSaveError("Nome e email são obrigatórios.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const body = {
        nome: nome.trim(),
        email: email.trim(),
        nivel_acesso: nivel,
        status,
      };

      const res = await fetch(`${API_BASE_URL}/users/${usuario.id}`, {
        method: "PUT", // mude para PATCH se sua API for assim
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Erro ao atualizar usuário.");
        setSaving(false);
        return;
      }

      const atualizado: Usuario = data.usuario || data;
      setUsuario(atualizado);
      setSaveSuccess("Dados atualizados com sucesso.");
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setSaveError("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  // ======================
  // DELETAR USUÁRIO
  // ======================

  const deletePhrase = usuario?.email || "";

  async function handleDelete() {
    if (!token || !usuario || !canManageUsers) return;
    if (deleteConfirm !== deletePhrase) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${usuario.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Erro ao excluir usuário.");
        setDeleting(false);
        return;
      }

      router.push("/dashboard/usuarios");
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setDeleteError("Erro de conexão com o servidor.");
      setDeleting(false);
    }
  }

  // ======================
  // RENDER
  // ======================

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
          customTitle={
            usuario
              ? `Usuário: ${usuario.nome || usuario.email}`
              : "Detalhes do usuário"
          }
        />

        <main className="flex-1 p-4 md:p-6 bg-muted/30">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Título local / resumo */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Usuário
              </p>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Detalhes do usuário
              </h2>
              {usuario && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nível: <strong>{mapNivelLabel(usuario.nivel_acesso)}</strong>{" "}
                  • Status: <strong>{mapStatusLabel(usuario.status)}</strong>
                </p>
              )}
            </div>

            {loadingTarget ? (
              <Card className="bg-background/80">
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Carregando dados do usuário...
                </CardContent>
              </Card>
            ) : !usuario ? (
              <Card className="bg-background/80">
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Usuário não encontrado.
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Card de edição */}
                <Card className="bg-background/90 border-emerald-500/10">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Informações básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      onSubmit={handleSave}
                    >
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium" htmlFor="nome">
                          Nome completo
                        </label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          disabled={!canManageUsers || saving}
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium" htmlFor="email">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!canManageUsers || saving}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium" htmlFor="nivel">
                          Nível de acesso
                        </label>
                        <Select
                          value={nivel}
                          onValueChange={setNivel}
                          disabled={!canManageUsers || saving}
                        >
                          <SelectTrigger id="nivel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Acesso total</SelectItem>
                            <SelectItem value="editor">
                              Criar e editar
                            </SelectItem>
                            <SelectItem value="viewer">
                              Visualização
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label
                          className="text-xs font-medium"
                          htmlFor="status"
                        >
                          Status
                        </label>
                        <Select
                          value={status}
                          onValueChange={setStatus}
                          disabled={!canManageUsers || saving}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {saveError && (
                        <p className="text-xs text-red-500 md:col-span-2">
                          {saveError}
                        </p>
                      )}

                      {saveSuccess && (
                        <p className="text-xs text-emerald-500 md:col-span-2">
                          {saveSuccess}
                        </p>
                      )}

                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          disabled={!canManageUsers || saving}
                        >
                          {saving ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Zona de perigo */}
                <Card className="border border-red-500/40 bg-red-950/40">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <CardTitle className="text-sm text-red-100">
                      Zona de perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-red-100">
                    <p>
                      Essa ação é irreversível. Ao excluir este usuário, você
                      está basicamente dizendo:{" "}
                      <span className="italic">
                        &quot;nunca mais volte, criatura digital&quot;.
                      </span>
                    </p>
                    <p>
                      Para confirmar, digite o email do usuário exatamente como
                      abaixo:
                    </p>

                    <div className="rounded-md bg-black/20 border border-red-500/40 px-3 py-2 text-[11px] font-mono">
                      {deletePhrase || "email-do-usuario@exemplo.com"}
                    </div>

                    <Input
                      placeholder="Digite o email exatamente igual para habilitar a exclusão"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="bg-red-950/60 border-red-500/40 text-red-50 placeholder:text-red-300/60"
                      disabled={!canManageUsers || deleting}
                    />

                    {deleteError && (
                      <p className="text-[11px] text-red-300">{deleteError}</p>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={
                          !canManageUsers ||
                          deleting ||
                          !deletePhrase ||
                          deleteConfirm !== deletePhrase
                        }
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? "Excluindo..." : "Excluir usuário"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
