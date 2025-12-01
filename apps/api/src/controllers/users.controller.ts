// src/controllers/users.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";
import bcrypt from "bcryptjs";
import { registerLog } from "../lib/logs";
import { appendUserViaWebhook } from "../lib/sheetsWebhook"; // <<< NOVO IMPORT

/**
 * GET /users/me
 * Retorna os dados do usuário logado
 */
export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select(
        "id, email, nome, nivel_acesso, equipe_id, status, data_criacao, ultimo_acesso"
      )
      .eq("id", userId)
      .single();

    if (error || !usuario) {
      console.error("[getCurrentUser] erro ao buscar usuário:", error);
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // opcional: atualizar último acesso
    try {
      await supabase
        .from("usuarios")
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq("id", userId);
    } catch (err) {
      console.warn("[getCurrentUser] Falha ao atualizar último acesso:", err);
    }

    return res.json({ user: usuario });
  } catch (err) {
    console.error("[getCurrentUser] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao carregar usuário atual" });
  }
}

/**
 * POST /users
 * Criação de usuário (por alguém já autenticado, tipo admin)
 */
export async function createUser(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      email,
      nome,
      senha,
      nivel_acesso,
      equipe_id,
      status,
    } = req.body as {
      email: string;
      nome: string;
      senha?: string;
      nivel_acesso?: string;
      equipe_id?: string | null;
      status?: string;
    };

    if (!email || !nome) {
      return res
        .status(400)
        .json({ error: "Campos 'email' e 'nome' são obrigatórios." });
    }

    // verifica se já existe
    const { data: existing, error: lookupError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("[createUser] erro ao verificar email existente:", lookupError);
      return res.status(500).json({ error: "Erro ao verificar usuário existente" });
    }

    if (existing) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    let senha_hash: string | null = null;
    if (senha?.trim()) {
      senha_hash = await bcrypt.hash(senha, 10);
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          email,
          nome,
          nivel_acesso: nivel_acesso || null,
          equipe_id: equipe_id || null,
          status: status || "ativo",
          data_criacao: nowIso,
          senha_hash, // usando o mesmo campo do auth.controller
        },
      ])
      .select(
        "id, email, nome, nivel_acesso, equipe_id, status, data_criacao, ultimo_acesso"
      )
      .single();

    if (error || !data) {
      console.error("[createUser] erro Supabase:", error);
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }

    // registra na planilha via Apps Script (best effort)
    try {
      await appendUserViaWebhook({
        email: data.email,
        nome: data.nome,
        nivel_acesso: data.nivel_acesso,
        equipe: data.equipe_id,
        status: data.status,
        data_criacao: data.data_criacao,
        ultimo_acesso: data.ultimo_acesso,
      });
    } catch (err) {
      console.error("[createUser] Falha ao salvar usuário na planilha via webhook:", err);
    }

    // log da criação
    try {
      await registerLog({
        req,
        acao: "Criou usuário",
        detalhes: `E-mail: ${data.email} | Nome: ${data.nome} | Nível: ${
          data.nivel_acesso || "-"
        }`,
      });
    } catch (logErr) {
      console.error("[createUser] erro ao registrar log:", logErr);
    }

    return res.status(201).json({ usuario: data });
  } catch (err) {
    console.error("[createUser] exception:", err);
    return res.status(500).json({ error: "Erro interno ao criar usuário" });
  }
}

/**
 * GET /users
 */
export async function listUsers(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select(
        "id, email, nome, nivel_acesso, equipe_id, status, data_criacao, ultimo_acesso"
      )
      .order("nome", { ascending: true });

    if (error) {
      console.error("[listUsers] erro:", error);
      return res.status(500).json({ error: "Erro ao listar usuários" });
    }

    return res.json({ items: data ?? [] });
  } catch (err) {
    console.error("[listUsers] exception:", err);
    return res.status(500).json({ error: "Erro interno ao listar usuários" });
  }
}

/**
 * GET /users/:id
 */
export async function getUserById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("usuarios")
      .select(
        "id, email, nome, nivel_acesso, equipe_id, status, data_criacao, ultimo_acesso"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("[getUserById] erro:", error);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }

    if (!data) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ usuario: data });
  } catch (err) {
    console.error("[getUserById] exception:", err);
    return res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }
}

/**
 * PATCH /users/:id
 */
export async function updateUser(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const body = { ...req.body } as Record<string, any>;

    // se vier "senha" no body, tratamos separado (hash) e NÃO deixamos passar direto
    if (body.senha) {
      const senha_hash = await bcrypt.hash(String(body.senha), 10);
      body.senha_hash = senha_hash;
      delete body.senha;
    }

    body.data_modificacao = new Date().toISOString();

    const { data, error } = await supabase
      .from("usuarios")
      .update(body)
      .eq("id", id)
      .select(
        "id, email, nome, nivel_acesso, equipe_id, status, data_criacao, ultimo_acesso"
      )
      .single();

    if (error) {
      console.error("[updateUser] erro:", error);
      return res.status(500).json({ error: "Erro ao atualizar usuário" });
    }

    if (!data) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // log de atualização
    try {
      await registerLog({
        req,
        acao: "Atualizou usuário",
        detalhes: `ID: ${id} | Campos alterados: ${Object.keys(body).join(", ")}`,
      });
    } catch (logErr) {
      console.error("[updateUser] erro ao registrar log:", logErr);
    }

    return res.json({ usuario: data });
  } catch (err) {
    console.error("[updateUser] exception:", err);
    return res.status(500).json({ error: "Erro interno ao atualizar usuário" });
  }
}

/**
 * DELETE /users/:id → soft delete (status = inativo)
 */
export async function softDeleteUser(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("usuarios")
      .update({
        status: "inativo",
        data_modificacao: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, email, nome, status")
      .single();

    if (error) {
      console.error("[softDeleteUser] erro:", error);
      return res.status(500).json({ error: "Erro ao inativar usuário" });
    }

    if (!data) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // log de inativação
    try {
      await registerLog({
        req,
        acao: "Inativou usuário",
        detalhes: `ID: ${id} | Email: ${data.email} | Nome: ${data.nome}`,
      });
    } catch (logErr) {
      console.error("[softDeleteUser] erro ao registrar log:", logErr);
    }

    return res.status(204).send();
  } catch (err) {
    console.error("[softDeleteUser] exception:", err);
    return res.status(500).json({ error: "Erro interno ao inativar usuário" });
  }
}
