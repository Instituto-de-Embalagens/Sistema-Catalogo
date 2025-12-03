"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const API_LOCATIONS_ENDPOINT = `${API_BASE_URL}/locations`;

export type Location = {
  id: string;
  code: string;
  building: string;
  description: string | null;
  created_at?: string | null;
  created_by?: string | null;
};

type LocationCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  onCreated?: (location: Location) => void;
};

export function LocationCreateDialog({
  open,
  onOpenChange,
  token,
  onCreated,
}: LocationCreateDialogProps) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [novoCode, setNovoCode] = useState("");
  const [novoBuilding, setNovoBuilding] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  function resetForm() {
    setNovoCode("");
    setNovoBuilding("");
    setNovaDescricao("");
    setCreateError(null);
  }

  function handleClose(openValue: boolean) {
    if (!openValue) {
      resetForm();
    }
    onOpenChange(openValue);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setCreateError("Sessão expirada. Faça login novamente.");
      return;
    }

    if (!novoCode.trim() || !novoBuilding.trim()) {
      setCreateError("Preencha código e prédio.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const body = {
        code: novoCode.trim(),
        building: novoBuilding.trim(),
        description: novaDescricao.trim() || null,
      };

      const res = await fetch(API_LOCATIONS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setCreateError(data?.error || "Erro ao criar local.");
        setCreating(false);
        return;
      }

      const created: Location = data.location || data;

      if (onCreated) {
        onCreated(created);
      }

      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao criar local:", err);
      setCreateError("Erro de conexão com o servidor.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo local</DialogTitle>
          <DialogDescription>
            Defina código, prédio e uma descrição para o local físico
            (ex.: prédio, caixa, área de armazenagem).
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={novoCode}
                onChange={(e) => setNovoCode(e.target.value)}
                required
                placeholder="CX-001"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="building">Prédio / área</Label>
              <Input
                id="building"
                value={novoBuilding}
                onChange={(e) => setNovoBuilding(e.target.value)}
                required
                placeholder="Tagetes"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Caixa Tailândia, estoque alto, etc."
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
              {creating ? "Criando..." : "Criar local"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
