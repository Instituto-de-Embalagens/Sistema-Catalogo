"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
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

import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { PackagingCreateDialog } from "@/components/ui/packaging-create-dialog";
import { DashboardHeader } from "@/components/ui/dashboard-header";

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
  grafica?: string | null;
  tags?: string[] | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const CATEGORIAS = [
  "Alimentos",
  "Bebidas",
  "Brinquedo",
  "Higiene Pessoal/Cosmético",
  "Limpeza",
  "Farmácia",
  "Pet food",
  "Outros",
];

const MATERIAIS = [
  "Aço",
  "Alumínio",
  "Madeira",
  "Papelão Ondulado",
  "Papel",
  "Papelcartão",
  "Embalagens Flexíveis",
  "Plástico Rígido",
  "Vidro/Cerâmica",
  "Cartonada",
  "Sacolas",
];

export default function EmbalagensPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const [loadingList, setLoadingList] = useState(true);
  const [packaging, setPackaging] = useState<Packaging[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCodigo, setFilterCodigo] = useState("");
  const [filterMarca, setFilterMarca] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("todos");
  const [filterPais, setFilterPais] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todas");

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
  // LISTAGEM DE EMBALAGENS
  // ======================

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        setLoadingList(true);

        const params = new URLSearchParams();

        if (search.trim()) params.set("q", search.trim());
        if (filterStatus !== "todos") params.set("status", filterStatus);
        if (filterCodigo.trim()) params.set("codigo", filterCodigo.trim());
        if (filterMarca.trim()) params.set("marca", filterMarca.trim());
        if (filterMaterial !== "todos") params.set("material", filterMaterial);
        if (filterPais.trim()) params.set("pais", filterPais.trim());

        if (filterCategoria !== "todas") {
          // aqui eu já presumi que a API espera "tags"
          // se no backend for outro nome, é só trocar aqui
          params.set("tags", filterCategoria);
        }

        const url = `${API_BASE_URL}/packaging?${params.toString() || ""}`;
        console.log("[LISTAGEM EMBALAGENS] GET", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setPackaging(data.items || []);
      } catch (err) {
        console.error("Erro ao listar embalagens:", err);
      } finally {
        setLoadingList(false);
      }
    }

    fetchData();
  }, [
    token,
    search,
    filterStatus,
    filterCodigo,
    filterMarca,
    filterMaterial,
    filterPais,
    filterCategoria,
  ]);

  function handleClearFilters() {
    setSearch("");
    setFilterStatus("todos");
    setFilterCodigo("");
    setFilterMarca("");
    setFilterMaterial("todos");
    setFilterPais("");
    setFilterCategoria("todas");
  }

  function handleCreatedPackaging(id?: string) {
    if (id) {
      router.push(`/dashboard/embalagens/${id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        {/* HEADER COMPONENTIZADO + DINÂMICO PELA URL */}
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
              <div />
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Nova embalagem
              </Button>
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
                <div className="flex items-center gap-2 md:col-span-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Busca geral (nome, marca, código, material...)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status da embalagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="arquivado">Arquivados</SelectItem>
                      <SelectItem value="rascunho">Rascunhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    placeholder="Filtrar por código / EAN"
                    value={filterCodigo}
                    onChange={(e) => setFilterCodigo(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    placeholder="Filtrar por marca"
                    value={filterMarca}
                    onChange={(e) => setFilterMarca(e.target.value)}
                  />
                </div>

                <div>
                  <Select
                    value={filterMaterial}
                    onValueChange={setFilterMaterial}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {MATERIAIS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    placeholder="Filtrar por país"
                    value={filterPais}
                    onChange={(e) => setFilterPais(e.target.value)}
                  />
                </div>

                <div>
                  <Select
                    value={filterCategoria}
                    onValueChange={setFilterCategoria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleClearFilters}
                  >
                    Limpar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* LISTAGEM */}
            <Card className="border-emerald-500/10 bg-background/90">
              <CardHeader>
                <CardTitle className="text-base">
                  Resultados ({packaging.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingList ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando embalagens...
                  </p>
                ) : packaging.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma embalagem encontrada.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b text-xs uppercase text-muted-foreground">
                          <th className="px-2 py-2 text-left">Código</th>
                          <th className="px-2 py-2 text-left">Nome</th>
                          <th className="px-2 py-2 text-left">Marca</th>
                          <th className="px-2 py-2 text-left">Material</th>
                          <th className="px-2 py-2 text-left">País</th>
                          <th className="px-2 py-2 text-left">Categoria</th>
                          <th className="px-2 py-2 text-left">
                            Transformador
                          </th>
                          <th className="px-2 py-2 text-left">Status</th>
                          <th className="px-2 py-2 text-left">Detalhes</th>
                          <th className="px-2 py-2 text-left">Arquivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packaging.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b hover:bg-muted/60 transition-colors"
                          >
                            <td className="px-2 py-1">{item.codigo}</td>
                            <td className="px-2 py-1 max-w-[180px] truncate">
                              {item.nome}
                            </td>
                            <td className="px-2 py-1">
                              {item.marca || "-"}
                            </td>
                            <td className="px-2 py-1">
                              {item.material || "-"}
                            </td>
                            <td className="px-2 py-1">{item.pais || "-"}</td>
                            <td className="px-2 py-1">
                              {item.tags && item.tags.length > 0
                                ? item.tags.join(", ")
                                : "-"}
                            </td>
                            <td className="px-2 py-1">
                              {item.grafica || "-"}
                            </td>
                            <td className="px-2 py-1">
                              <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] border">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-2 py-1">
                              <Link
                                href={`/dashboard/embalagens/${item.id}`}
                                className="text-emerald-500 text-xs hover:underline"
                              >
                                Ver
                              </Link>
                            </td>
                            <td className="px-2 py-1">
                              {item.url_imagem ? (
                                <a
                                  href={item.url_imagem}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-emerald-500 hover:underline"
                                >
                                  Abrir
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
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

      <PackagingCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        token={token}
        apiBaseUrl={API_BASE_URL}
        materiais={MATERIAIS}
        categorias={CATEGORIAS}
        onCreated={handleCreatedPackaging}
      />
    </div>
  );
}
