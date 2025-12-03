// src/controllers/scenarioPackaging.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { registerLog } from "../lib/logs";
import { AuthenticatedRequest } from "../auth/authMiddleware";
import { appendScenarioPackagingViaWebhook } from "../lib/sheetsWebhook"; 

// helperzinho pra não brigar com TS
function getSinglePackaging(packaging: any) {
  if (!packaging) return undefined;
  if (Array.isArray(packaging)) {
    return packaging[0]; // se vier array, pega o primeiro
  }
  return packaging;
}

// GET /scenarios/:scenarioId/packaging
export async function listScenarioPackaging(
  req: AuthenticatedRequest,
  res: Response
) {
  const { scenarioId } = req.params;

  try {
    const { data, error } = await supabase
      .from("scenario_packaging")
      .select(
        `
        id,
        scenario_id,
        packaging_id,
        posicao,
        observacoes,
        data_criacao,
        criado_por,
        packaging:packaging_id (
          id,
          codigo,
          nome,
          marca,
          material,
          pais
        )
      `
      )
      .eq("scenario_id", scenarioId)
      .order("posicao", { ascending: true });

    if (error) {
      console.error("[listScenarioPackaging] error:", error);
      return res
        .status(500)
        .json({ error: "Erro ao listar embalagens do cenário" });
    }

    return res.json({ items: data ?? [] });
  } catch (err) {
    console.error("[listScenarioPackaging] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro inesperado ao listar embalagens do cenário" });
  }
}

// POST /scenarios/:scenarioId/packaging
// body: { items: [{ packaging_id, posicao?, observacoes? }, ...] }
export async function addScenarioPackaging(
  req: AuthenticatedRequest,
  res: Response
) {
  const { scenarioId } = req.params;
  const userId = req.user?.sub as string | undefined;      // uuid pro banco
  const userEmail = req.user?.email as string | undefined; // email pra planilha

  const body = req.body as {
    items?: {
      packaging_id: string;
      posicao?: number;
      observacoes?: string;
    }[];
  };

  if (!body.items || body.items.length === 0) {
    return res.status(400).json({ error: "Nenhuma embalagem informada" });
  }

  try {
    // buscar quantas já existem para calcular posicao default
    const { data: existing, error: existingError } = await supabase
      .from("scenario_packaging")
      .select("id, posicao")
      .eq("scenario_id", scenarioId);

    if (existingError) {
      console.error("[addScenarioPackaging] existingError:", existingError);
      return res
        .status(500)
        .json({ error: "Erro ao verificar embalagens já vinculadas" });
    }

    const basePos = existing?.length ?? 0;
    const now = new Date().toISOString();

    const rowsToInsert = body.items.map((item, index) => ({
      scenario_id: scenarioId,
      packaging_id: item.packaging_id,
      posicao: item.posicao ?? basePos + index + 1,
      observacoes: item.observacoes ?? null,
      data_criacao: now,
      criado_por: userId ?? null, // uuid aqui
    }));

    const { data, error } = await supabase
      .from("scenario_packaging")
      .insert(rowsToInsert)
      .select(
        `
        id,
        scenario_id,
        packaging_id,
        posicao,
        observacoes,
        data_criacao,
        criado_por,
        packaging:packaging_id (
          id,
          codigo,
          nome,
          marca,
          material,
          pais
        )
      `
      );

    if (error) {
      console.error("[addScenarioPackaging] error:", error);
      return res
        .status(500)
        .json({ error: "Erro ao adicionar embalagens ao cenário" });
    }

    const inserted = (data ?? []) as any[];

    // LOG de vínculo
    try {
      const codigos = inserted
        .map((row) => {
          const pkg = getSinglePackaging(row.packaging);
          return pkg?.codigo || row.packaging_id;
        })
        .join(", ");

      await registerLog({
        req,
        acao: "Vinculou embalagens a cenário",
        detalhes: `ScenarioID: ${scenarioId} | Embalagens: ${codigos} (qtde: ${inserted.length})`,
      });
    } catch (logErr) {
      console.error("[addScenarioPackaging] erro ao registrar log:", logErr);
    }

    // sincroniza cada linha na aba ScenarioPackaging via webhook (best effort)
    try {
      await Promise.all(
        inserted.map((row) =>
          appendScenarioPackagingViaWebhook({
            id: row.id,
            scenario_id: row.scenario_id,
            packaging_id: row.packaging_id,
            posicao: row.posicao,
            observacoes: row.observacoes,
            data_criacao: row.data_criacao,
            // na planilha a coluna "Criado Por" fica com e-mail
            criado_por: userEmail || null,
          })
        )
      );
      console.log(
        "[addScenarioPackaging] Linhas adicionadas na aba ScenarioPackaging da planilha via webhook"
      );
    } catch (sheetErr) {
      console.error(
        "[addScenarioPackaging] erro ao registrar pivot na planilha (mas Supabase ok):",
        sheetErr
      );
    }

    return res.status(201).json({ items: inserted });
  } catch (err) {
    console.error("[addScenarioPackaging] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro inesperado ao adicionar embalagens" });
  }
}

// DELETE /scenarios/:scenarioId/packaging/:id
export async function removeScenarioPackaging(
  req: AuthenticatedRequest,
  res: Response
) {
  const { scenarioId, id } = req.params;

  try {
    // opcional: buscar antes para logar detalhes mais ricos
    const { data: existing, error: fetchError } = await supabase
      .from("scenario_packaging")
      .select(
        `
        id,
        scenario_id,
        packaging_id,
        posicao,
        packaging:packaging_id (
          codigo,
          nome
        )
      `
      )
      .eq("id", id)
      .eq("scenario_id", scenarioId)
      .maybeSingle();

    if (fetchError) {
      console.error("[removeScenarioPackaging] fetchError:", fetchError);
      // não bloqueia o delete por causa disso, segue
    }

    const { error } = await supabase
      .from("scenario_packaging")
      .delete()
      .eq("id", id)
      .eq("scenario_id", scenarioId);

    if (error) {
      console.error("[removeScenarioPackaging] error:", error);
      return res
        .status(500)
        .json({ error: "Erro ao remover embalagem do cenário" });
    }

    // LOG de remoção
    try {
      let embalagemInfo = `pivot ${id}`;

      if (existing) {
        const pkg = getSinglePackaging((existing as any).packaging);
        const codigo = pkg?.codigo || (existing as any).packaging_id;
        const nome = pkg?.nome || "";
        embalagemInfo = `${codigo}${nome ? " - " + nome : ""}`;
      }

      await registerLog({
        req,
        acao: "Removeu embalagem de cenário",
        detalhes: `ScenarioID: ${scenarioId} | Embalagem: ${embalagemInfo}`,
      });
    } catch (logErr) {
      console.error("[removeScenarioPackaging] erro ao registrar log:", logErr);
    }

    return res.status(204).send();
  } catch (err) {
    console.error("[removeScenarioPackaging] exception:", err);
    return res
      .status(500)
      .json({ error: "Erro inesperado ao remover embalagem" });
  }
}
