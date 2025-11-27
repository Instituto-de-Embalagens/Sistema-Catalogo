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
  Package,
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
  { label: "Usuários", href: "/usuarios", icon: Users },
  { label: "Locais", href: "/locais", icon: MapPin },
  { label: "Scanner", href: "/scanner", icon: ScanLine },
];

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
  const pathname = usePathname();

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


  // estado do modal de criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // campos do formulário de criação
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [material, setMaterial] = useState("");
  const [pais, setPais] = useState("");
  const [transformador, setTransformador] = useState("");
  const [categoria, setCategoria] = useState("");
  const [linkDrive, setLinkDrive] = useState("");
  const [status, setStatus] = useState("ativo");
  const [file, setFile] = useState<File | null>(null);

  // ======================
  // AUTH / USER / THEME
  // ======================

  // token
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("catalogo_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  // user
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
        if (filterMaterial !== "todos") {
  params.set("material", filterMaterial);
}
        if (filterPais.trim()) params.set("pais", filterPais.trim());
        if (filterCategoria !== "todas") {
  params.set("categoria", filterCategoria);
}


        const res = await fetch(
          `${API_BASE_URL}/packaging?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setPackaging(data.items || []);
      } catch (err) {
        console.error("Erro ao listar embalagens:", err);
      } finally {
        setLoadingList(false);
      }
    }

    fetchData();
  }, [token, search, filterStatus, filterCodigo, filterMarca, filterMaterial, filterPais, filterCategoria]);

  // ======================
  // CRIAÇÃO / UPLOAD
  // ======================

  function openCreateModal() {
    setCreateError(null);
    setCodigo("");
    setNome("");
    setMarca("");
    setMaterial("");
    setPais("");
    setTransformador("");
    setCategoria("");
    setLinkDrive("");
    setStatus("ativo");
    setFile(null);
    setIsCreateOpen(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    setCreateError(null);

    try {
      let finalUrl: string | null = linkDrive || null;

      // Se tiver arquivo selecionado, faz upload primeiro
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(
          `${API_BASE_URL}/packaging/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // NÃO setar Content-Type aqui, o browser cuida disso no multipart
            },
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setCreateError(
            uploadData.error ||
              "Erro ao enviar arquivo para o Drive. Tente novamente."
          );
          setCreating(false);
          return;
        }

        finalUrl = uploadData.url || null;
      }

      const res = await fetch(`${API_BASE_URL}/packaging`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo,
          nome,
          marca: marca || null,
          material: material || null,
          pais: pais || null,
          grafica: transformador || null,
          url_imagem: finalUrl,
          status,
          // backend aceita array de tags ou string que ele split,
          // aqui já mandamos como array bonitinho
          tags: categoria ? [categoria] : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Erro ao criar embalagem");
        setCreating(false);
        return;
      }

      const created = data.embalagem || data;

      setIsCreateOpen(false);

      if (created?.id) {
        router.push(`/dashboard/embalagens/${created.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao criar embalagem:", err);
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
            <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Embalagens
            </h1>
            <p className="text-xs text-muted-foreground">
              {loadingUser
                ? "Carregando usuário..."
                : "Consulta, organização e curadoria do acervo físico."}
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
          <div className="space-y-6 w-full">


            {/* TÍTULO + BOTÃO */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {/* <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Módulo de acervo
                </p>
                <h2 className="text-lg font-semibold">
                  Lista de embalagens cadastradas
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pesquise pelo código, marca, material ou país.
                </p> */}
              </div>

              <Button
                onClick={openCreateModal}
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
  {/* BUSCA GERAL */}
  <div className="flex items-center gap-2 md:col-span-2">
    <Search className="w-4 h-4 text-muted-foreground" />
    <Input
      placeholder="Busca geral (nome, marca, código, material...)"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* STATUS */}
  <div>
    <Select value={filterStatus} onValueChange={setFilterStatus}>
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

  {/* CÓDIGO / EAN */}
  <div>
    <Input
      placeholder="Filtrar por código / EAN"
      value={filterCodigo}
      onChange={(e) => setFilterCodigo(e.target.value)}
    />
  </div>

  {/* MARCA */}
  <div>
    <Input
      placeholder="Filtrar por marca"
      value={filterMarca}
      onChange={(e) => setFilterMarca(e.target.value)}
    />
  </div>

  {/* MATERIAL */}
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

  {/* PAÍS */}
  <div>
    <Input
      placeholder="Filtrar por país"
      value={filterPais}
      onChange={(e) => setFilterPais(e.target.value)}
    />
  </div>

  {/* CATEGORIA */}
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

  {/* BOTÃO PLACEHOLDER SOME */}
  {/* Você pode tirar o botão "Filtros avançados (em breve)" ou trocar por um "Limpar filtros" */}
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
                          <th className="px-2 py-2 text-left">Transformador</th>
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
                            <td className="px-2 py-1">{item.marca || "-"}</td>
                            <td className="px-2 py-1">{item.material || "-"}</td>
                            <td className="px-2 py-1">{item.pais || "-"}</td>
                            <td className="px-2 py-1">
                              {item.tags && item.tags.length > 0
                                ? item.tags.join(", ")
                                : "-"}
                            </td>
                            <td className="px-2 py-1">{item.grafica || "-"}</td>
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

      {/* MODAL DE CRIAÇÃO */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova embalagem</DialogTitle>
            <DialogDescription>
              Preencha os dados principais. Você poderá complementar depois na
              tela de detalhes.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  placeholder="EAN / interno"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Nome da embalagem"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ex: Marca X"
                />
              </div>

              <div className="space-y-1">
                <Label>Material</Label>
                <Select
                  value={material}
                  onValueChange={(value) => setMaterial(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAIS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Categoria</Label>
                <Select
                  value={categoria}
                  onValueChange={(value) => setCategoria(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="transformador">Transformador</Label>
                <Input
                  id="transformador"
                  value={transformador}
                  onChange={(e) => setTransformador(e.target.value)}
                  placeholder="Quem transformou / produziu"
                />
              </div>
            </div>

            {/* UPLOAD DE ARQUIVO PARA O DRIVE */}
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo da embalagem (upload para Drive)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Se você selecionar um arquivo aqui, ele será enviado para a pasta do Google Drive configurada
                e o link será salvo automaticamente.
              </p>
            </div>

            {/* LINK DO DRIVE MANUAL (OPCIONAL) */}
            <div className="space-y-2">
              <Label htmlFor="linkDrive">
                Link do arquivo no Drive (opcional)
              </Label>
              <Input
                id="linkDrive"
                value={linkDrive}
                onChange={(e) => setLinkDrive(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Caso não envie arquivo, você pode colar manualmente o link da embalagem
                no Google Drive.
              </p>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                </SelectContent>
              </Select>
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
                {creating ? "Criando..." : "Criar e ir para detalhes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
