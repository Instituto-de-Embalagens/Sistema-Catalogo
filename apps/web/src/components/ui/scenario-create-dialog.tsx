"use client";

import type React from "react";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";

type ScenarioCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  apiBaseUrl: string;
  onCreated?: (id?: string) => void; // callback opcional
};

export function ScenarioCreateDialog({
  open,
  onOpenChange,
  token,
  apiBaseUrl,
  onCreated,
}: ScenarioCreateDialogProps) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // campos do formulário
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pais, setPais] = useState("");
  const [local, setLocal] = useState("");
  const [dataFoto, setDataFoto] = useState("");
  const [linkImagem, setLinkImagem] = useState("");

  function resetForm() {
    setCodigo("");
    setNome("");
    setDescricao("");
    setPais("");
    setLocal("");
    setDataFoto("");
    setLinkImagem("");
    setCreateError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setCreateError("Token de autenticação não encontrado.");
      return;
    }

    if (!nome.trim()) {
      setCreateError("Informe o nome do cenário.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const body = {
        codigo: codigo.trim() || undefined,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        pais: pais.trim() || null,
        local: local.trim() || null,
        data: dataFoto || null,
        url_imagem: linkImagem.trim() || null,
      };

      const res = await fetch(`${apiBaseUrl}/scenarios`, {
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

      // tenta pegar o id do cenário criado
      const created = data.scenario || data;
      const createdId = created?.id as string | undefined;

      resetForm();
      onOpenChange(false);

      if (onCreated) {
        onCreated(createdId);
      }
    } catch (err) {
      console.error("Erro ao criar cenário:", err);
      setCreateError("Erro de conexão com o servidor.");
    } finally {
      setCreating(false);
    }
  }

  function handleClose(openValue: boolean) {
    if (!openValue) {
      resetForm();
    }
    onOpenChange(openValue);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo cenário</DialogTitle>
          <DialogDescription>
            Cadastre uma nova foto/cenário. As embalagens podem ser vinculadas
            depois na tela de detalhes.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              onClick={() => handleClose(false)}
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
  );
}
