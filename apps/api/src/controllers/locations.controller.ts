// src/controllers/locations.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";
import { registerLog } from "../lib/logs";
import { appendLocationToSheet } from "../lib/googleSheets"; // você cria esse helper espelhando o de embalagens

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
      console.error("Erro ao listar locais:", error);
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
    console.error("Erro inesperado em listLocations:", err);
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
      console.error("Erro ao buscar local:", error);
      return res.status(500).json({ error: "Erro ao buscar local" });
    }

    if (!data) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    return res.json({ location: data });
  } catch (err) {
    console.error("Erro inesperado em getLocationById:", err);
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
    const userId = req.user?.sub;
    const userEmail = req.user?.email;

    const { code, building, description } = req.body as {
      code?: string;
      building?: string;
      description?: string;
    };

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
          code,
          building,
          description: description || null,
          created_at: nowIso,
          created_by: userEmail || null,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao criar local:", error);
      return res.status(500).json({ error: "Erro ao criar local" });
    }

    // log no sistema
    try {
      await registerLog({
        req,
        acao: "Criou local",
        detalhes: `Code: ${data.code} | Building: ${data.building}`,
      });
    } catch (logErr) {
      console.error("[createLocation] erro ao registrar log:", logErr);
    }

    // registra na aba "Locations" da planilha (best effort)
    try {
      await appendLocationToSheet({
        Id: data.id,
        Code: data.code,
        Building: data.building,
        Description: data.description,
        CreatedAt: data.created_at,
        CreatedBy: data.created_by || userEmail || null,
      });
      console.log("[CREATE LOCATION] Linha adicionada na planilha Locations");
    } catch (sheetErr) {
      console.error("Erro ao registrar local na planilha Locations:", sheetErr);
    }

    return res.status(201).json({ location: data });
  } catch (err) {
    console.error("Erro inesperado em createLocation:", err);
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
    const { code, building, description } = req.body as {
      code?: string;
      building?: string;
      description?: string;
    };

    const updatePayload: Record<string, any> = {
      // se futuramente quiser, pode adicionar updated_at / updated_by
      updated_at: new Date().toISOString(),
      updated_by: userId || null,
    };

    if (code !== undefined) updatePayload.code = code;
    if (building !== undefined) updatePayload.building = building;
    if (description !== undefined) updatePayload.description = description;

    const { data, error } = await supabase
      .from("locations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar local:", error);
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
    console.error("Erro inesperado em updateLocation:", err);
    return res.status(500).json({ error: "Erro interno ao atualizar local" });
  }
}

// ==============================
// DELETE /locations/:id
// (hard delete simples; se quiser soft-delete depois, trocamos)
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
      console.error("Erro ao excluir local:", error);
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
    console.error("Erro inesperado em deleteLocation:", err);
    return res.status(500).json({ error: "Erro interno ao excluir local" });
  }
}
