"use client";

import { useState } from "react";
import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type PackagingCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  apiBaseUrl: string;
  materiais: string[];
  categorias: string[];
  onCreated?: (id?: string) => void; // callback para navegar depois
};

export function PackagingCreateDialog({
  open,
  onOpenChange,
  token,
  apiBaseUrl,
  materiais,
  categorias,
  onCreated,
}: PackagingCreateDialogProps) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  function resetForm() {
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
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm();
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    setCreateError(null);

    try {
      let finalUrl: string | null = linkDrive || null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${apiBaseUrl}/packaging/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

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

      const res = await fetch(`${apiBaseUrl}/packaging`, {
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

      handleOpenChange(false);

      if (onCreated) {
        onCreated(created?.id);
      }
    } catch (err) {
      console.error("Erro ao criar embalagem:", err);
      setCreateError("Erro de conexão com o servidor.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova embalagem</DialogTitle>
          <DialogDescription>
            Preencha os dados principais. Você poderá complementar depois na
            tela de detalhes.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {materiais.map((m) => (
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
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
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

          <div className="space-y-2">
            <Label htmlFor="file">
              Arquivo da embalagem (upload para Drive)
            </Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f || null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Se você selecionar um arquivo aqui, ele será enviado para a pasta
              do Google Drive configurada e o link será salvo automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkDrive">Link do arquivo no Drive (opcional)</Label>
            <Input
              id="linkDrive"
              value={linkDrive}
              onChange={(e) => setLinkDrive(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Caso não envie arquivo, você pode colar manualmente o link da
              embalagem no Google Drive.
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
              onClick={() => handleOpenChange(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={creating || !token}
            >
              {creating ? "Criando..." : "Criar e ir para detalhes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
