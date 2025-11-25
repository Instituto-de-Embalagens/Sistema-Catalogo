// src/controllers/users.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const userId = req.user.sub;

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("id, email, nome, nivel_acesso, status, data_criacao, ultimo_acesso")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao buscar usuário atual:", error);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Erro inesperado em getMe:", err);
    return res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }
}
