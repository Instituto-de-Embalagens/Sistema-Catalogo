// src/controllers/scenario.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";
import { appendScenarioViaWebhook } from "../lib/sheetsWebhook";
import { registerLog } from "../lib/logs";

type ScenarioInsertBody = {
  codigo?: string;
  nome: string;
  descricao?: string | null;
  pais?: string | null;
  local?: string | null;
  data?: string | null;        // campo "data" no Supabase / planilha
  url_imagem?: string | null;
  tags?: string[] | string | null;
};

/**
 * GET /scenarios
 * filtros opcionais: ?q=texto&page=1&pageSize=50
 */
export async function listScenarios(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    let { q, page = "1", pageSize = "50" } = req.query as Record<
      string,
      string
    >;

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const limit = Math.max(parseInt(pageSize || "50", 10), 1);
    const from = (pageNumber - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("scenarios")
      .select(
        "id, codigo, nome, descricao, pais, local, data, url_imagem, tags, criado_por, data_criacao",
        { count: "exact" }
      );

    if (q && q.trim()) {
      const term = q.trim();
      query = query.or(
        `codigo.ilike.%${term}%,nome.ilike.%${term}%,pais.ilike.%${term}%,local.ilike.%${term}%`
      );
    }

    query = query.range(from, to).order("data_criacao", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("[listScenarios] erro:", error);
      return res
        .status(500)
        .json({ error: "Erro ao listar cenários" });
    }

    return res.json({
      items: data ?? [],
      pagination: {
        page: pageNumber,
        pageSize: limit,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 1,
      },
    });
  } catch (err) {
    console.error("[listScenarios] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao listar cenários" });
  }
}

/**
 * GET /scenarios/:id
 */
export async function getScenarioById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[getScenarioById] erro:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar cenário" });
    }

    if (!data) {
      return res.status(404).json({ error: "Cenário não encontrado" });
    }

    return res.json({ scenario: data });
  } catch (err) {
    console.error("[getScenarioById] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar cenário" });
  }
}

/**
 * POST /scenarios
 * Cria cenário no Supabase + registra na planilha via webhook (igual embalagens).
 */
export async function createScenario(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub;      // uuid pro banco
    const userEmail = req.user?.email; // email pra planilha

    const {
      codigo,
      nome,
      descricao,
      pais,
      local,
      data,
      url_imagem,
      tags,
    } = req.body as ScenarioInsertBody;

    if (!nome || !nome.trim()) {
      return res
        .status(400)
        .json({ error: "Campo 'nome' é obrigatório para o cenário." });
    }

    const finalCodigo =
      codigo && codigo.trim().length > 0
        ? codigo.trim()
        : `SCN-${Date.now().toString(36).toUpperCase()}`;

    const nowIso = new Date().toISOString();

    const parsedTags = Array.isArray(tags)
      ? tags
      : tags
      ? String(tags).split(",").map((t) => t.trim()).filter(Boolean)
      : null;

    // 1) grava no Supabase
    const { data: inserted, error } = await supabase
      .from("scenarios")
      .insert([
        {
          codigo: finalCodigo,
          nome: nome.trim(),
          descricao: descricao || null,
          pais: pais || null,
          local: local || null,
          data: data || null,
          url_imagem: url_imagem || null,
          tags: parsedTags,
          criado_por: userId || null,
          data_criacao: nowIso,
        },
      ])
      .select()
      .single();

    if (error || !inserted) {
      console.error("[createScenario] erro Supabase:", error);
      return res.status(500).json({ error: "Erro ao criar cenário" });
    }

    console.log("[CREATE SCENARIO] Criado no Supabase:", inserted);

    // 1.1) registra log (não quebra fluxo se der erro)
    try {
      await registerLog({
        req,
        acao: "Criou cenário",
        detalhes: `Código: ${inserted.codigo} | Nome: ${inserted.nome}`,
      });
    } catch (logErr) {
      console.error("[createScenario] erro ao registrar log:", logErr);
    }

    // 2) tenta registrar na planilha via webhook (não quebra fluxo se der erro)
    try {
      await appendScenarioViaWebhook({
        id: inserted.id,
        codigo: inserted.codigo,
        nome: inserted.nome,
        descricao: inserted.descricao,
        pais: inserted.pais,
        local: inserted.local,
        data: inserted.data,
        url_imagem: inserted.url_imagem,
        tags: inserted.tags,
        criado_por: userEmail || null,         // e-mail na planilha
        data_criacao: inserted.data_criacao || nowIso,
      });

      console.log(
        "[CREATE SCENARIO] Linha adicionada na aba Scenarios da planilha via webhook"
      );
    } catch (sheetErr) {
      console.error(
        "[createScenario] Erro ao registrar cenário na planilha via webhook (mas criado no Supabase ok):",
        sheetErr
      );
    }

    return res.status(201).json({ scenario: inserted });
  } catch (err) {
    console.error("[createScenario] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao criar cenário" });
  }
}
