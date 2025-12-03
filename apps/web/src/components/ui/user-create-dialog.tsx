"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export type Usuario = {
  id: string;
  email: string;
  nome: string;
  nivel_acesso?: string | null;
  equipe_id?: string | null;
  status?: string | null;
  data_criacao?: string | null;
  ultimo_acesso?: string | null;
};

type UserCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  onCreated?: (user: Usuario) => void;
};

export function UserCreateDialog({
  open,
  onOpenChange,
  token,
  onCreated,
}: UserCreateDialogProps) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [novoEmail, setNovoEmail] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoNivel, setNovoNivel] = useState<string>("viewer");
  const [novoStatus, setNovoStatus] = useState<string>("ativo");
  const [novaSenha, setNovaSenha] = useState("");

  function resetForm() {
    setNovoEmail("");
    setNovoNome("");
    setNovoNivel("viewer");
    setNovoStatus("ativo");
    setNovaSenha("");
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

    if (!novoEmail.trim() || !novoNome.trim()) {
      setCreateError("Preencha email e nome.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const body = {
        email: novoEmail.trim(),
        nome: novoNome.trim(),
        nivel_acesso: novoNivel,
        status: novoStatus,
        senha: novaSenha.trim() || undefined, // opcional
      };

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setCreateError(data?.error || "Erro ao criar usuário.");
        setCreating(false);
        return;
      }

      const created: Usuario = data.usuario || data;

      if (onCreated) {
        onCreated(created);
      }

      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setCreateError("Erro de conexão com o servidor.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Defina o email, nome e nível de acesso. Senha é opcional se você
            estiver usando login via Google.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                required
                placeholder="Nome do usuário"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                required
                placeholder="usuario@institutoembalagens.com.br"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="nivel">Nível de acesso</Label>
              <Select
                value={novoNivel}
                onValueChange={setNovoNivel}
              >
                <SelectTrigger id="nivel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Acesso total</SelectItem>
                  <SelectItem value="editor">Criar e editar</SelectItem>
                  <SelectItem value="viewer">Visualização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select
                value={novoStatus}
                onValueChange={setNovoStatus}
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

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="senha">
                Senha (opcional, se não for usar só Google)
              </Label>
              <Input
                id="senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Defina uma senha inicial (opcional)"
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
              {creating ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
