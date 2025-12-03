// src/controllers/locations.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";
import { registerLog } from "../lib/logs";
import { appendLocationViaWebhook } from "../lib/sheetsWebhook";

type LocationBody = {
  code?: string;
  building?: string;
  description?: string | null;
};

// ==============================
// GET /locations
// filtros opcionais: ?q=texto&page=1&pageSize=20
// ==============================
export async function listLocations(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    let { q, page = "1", pageSize = "20" } = req.query as Record<
      string,
      string
    >;

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const limit = Math.max(parseInt(pageSize || "20", 10), 1);
    const from = (pageNumber - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("locations")
      .select("id, code, building, description, created_at, created_by", {
        count: "exact",
      });

    if (q && q.trim()) {
      const search = q.trim();
      query = query.or(
        `code.ilike.%${search}%,building.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    query = query
      .range(from, to)
      .order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("[listLocations] erro:", error);
      return res.status(500).json({ error: "Erro ao listar locais" });
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
    console.error("[listLocations] exception:", err);
    return res.status(500).json({ error: "Erro interno ao listar locais" });
  }
}

// ==============================
// GET /locations/:id
// ==============================
export async function getLocationById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("locations")
      .select("id, code, building, description, created_at, created_by")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[getLocationById] erro:", error);
      return res.status(500).json({ error: "Erro ao buscar local" });
    }

    if (!data) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    return res.json({ location: data });
  } catch (err) {
    console.error("[getLocationById] exception:", err);
    return res.status(500).json({ error: "Erro interno ao buscar local" });
  }
}

// ==============================
// POST /locations
// body: { code, building, description? }
// ==============================
export async function createLocation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub;      // UUID do usuário (FK no Supabase)
    const userEmail = req.user?.email; // e-mail pra planilha

    const { code, building, description } = req.body as LocationBody;

    if (!code || !building) {
      return res.status(400).json({
        error: "Campos 'code' e 'building' são obrigatórios",
      });
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("locations")
      .insert([
        {
          code: code.trim(),
          building: building.trim(),
          description: description?.trim() || null,
          created_at: nowIso,
          created_by: userId || null,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.error("[createLocation] erro Supabase:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      return res.status(500).json({ error: "Erro ao criar local" });
    }

    console.log("[CREATE LOCATION] Criado no Supabase:", data);

    // log interno (não quebra fluxo se der erro)
    try {
      await registerLog({
        req,
        acao: "Criou local",
        detalhes: `Code: ${data.code} | Building: ${data.building}`,
      });
    } catch (logErr) {
      console.error("[createLocation] erro ao registrar log:", logErr);
    }

    // registra na planilha via Apps Script (best effort, igual embalagem/cenário)
    try {
      await appendLocationViaWebhook({
        id: data.id,
        code: data.code,
        building: data.building,
        description: data.description,
        created_at: data.created_at,
        created_by: userEmail || null, // na planilha vai o e-mail
      });
      console.log(
        "[CREATE LOCATION] Local registrado na planilha via webhook"
      );
    } catch (sheetErr) {
      console.error(
        "[createLocation] Erro ao registrar local na planilha via webhook (mas criado no Supabase ok):",
        sheetErr
      );
    }

    return res.status(201).json({ location: data });
  } catch (err) {
    console.error("[createLocation] exception:", err);
    return res.status(500).json({ error: "Erro interno ao criar local" });
  }
}

// ==============================
// PATCH /locations/:id
// ==============================
export async function updateLocation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;
    const { code, building, description } = req.body as LocationBody;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      updated_by: userId || null,
    };

    if (code !== undefined) updatePayload.code = code;
    if (building !== undefined) updatePayload.building = building;
    if (description !== undefined)
      updatePayload.description = description || null;

    const { data, error } = await supabase
      .from("locations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateLocation] erro:", error);
      return res.status(500).json({ error: "Erro ao atualizar local" });
    }

    if (!data) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    try {
      await registerLog({
        req,
        acao: "Atualizou local",
        detalhes: `ID: ${id} | Code: ${data.code} | Building: ${data.building}`,
      });
    } catch (logErr) {
      console.error("[updateLocation] erro ao registrar log:", logErr);
    }

    return res.json({ location: data });
  } catch (err) {
    console.error("[updateLocation] exception:", err);
    return res.status(500).json({ error: "Erro interno ao atualizar local" });
  }
}

// ==============================
// DELETE /locations/:id
// (hard delete; se depois quiser soft-delete, a gente troca)
// ==============================
export async function deleteLocation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("locations")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[deleteLocation] erro:", error);
      return res.status(500).json({ error: "Erro ao excluir local" });
    }

    if (!data) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    try {
      await registerLog({
        req,
        acao: "Excluiu local",
        detalhes: `ID: ${id} | Code: ${data.code} | Building: ${data.building}`,
      });
    } catch (logErr) {
      console.error("[deleteLocation] erro ao registrar log:", logErr);
    }

    return res.json({ location: data });
  } catch (err) {
    console.error("[deleteLocation] exception:", err);
    return res.status(500).json({ error: "Erro interno ao excluir local" });
  }
}
