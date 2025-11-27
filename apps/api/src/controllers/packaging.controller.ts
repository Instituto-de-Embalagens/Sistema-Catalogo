// src/controllers/packaging.controller.ts
import { Response } from "express";
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";
import { appendPackagingToSheet } from "../lib/googleSheets";
import { uploadFileToDrive } from "../lib/googleDrive";
import { registerLog } from "../lib/logs";

// GET /packaging
// filtros opcionais: ?status=ativo&material=Papel&pais=Brasil&q=texto&tag=algumaTag&page=1&pageSize=20
export async function listPackaging(req: AuthenticatedRequest, res: Response) {
  try {
    let {
      status,
      material,
      pais,
      q,
      tag,
      page = "1",
      pageSize = "20",
    } = req.query as Record<string, string>;

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const limit = Math.max(parseInt(pageSize || "20", 10), 1);
    const from = (pageNumber - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("embalagens")
      .select(
        "id, codigo, nome, marca, material, pais, data_cadastro, url_imagem, tags, status, grafica",
        { count: "exact" }
      );

    if (status) query = query.eq("status", status);
    if (material) query = query.ilike("material", `%${material}%`);
    if (pais) query = query.ilike("pais", `%${pais}%`);
    if (tag) query = query.contains("tags", [tag]);

    if (q) {
      query = query.or(
        `nome.ilike.%${q}%,marca.ilike.%${q}%,codigo.ilike.%${q}%`
      );
    }

    query = query.range(from, to).order("data_cadastro", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Erro ao listar embalagens:", error);
      return res.status(500).json({ error: "Erro ao listar embalagens" });
    }

    return res.json({
      items: data,
      pagination: {
        page: pageNumber,
        pageSize: limit,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 1,
      },
    });
  } catch (err) {
    console.error("Erro inesperado em listPackaging:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao listar embalagens" });
  }
}

// GET /packaging/:id
export async function getPackagingById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("embalagens")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar embalagem:", error);
      return res.status(500).json({ error: "Erro ao buscar embalagem" });
    }

    if (!data) {
      return res.status(404).json({ error: "Embalagem não encontrada" });
    }

    return res.json({ embalagem: data });
  } catch (err) {
    console.error("Erro inesperado em getPackagingById:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao buscar embalagem" });
  }
}

// POST /packaging
export async function createPackaging(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub; // uuid pro banco
    const userEmail = req.user?.email; // email pra planilha

    const {
      codigo,
      nome,
      marca,
      material,
      dimensoes,
      pais,
      data_cadastro,
      grafica,
      url_imagem,
      tags,
      localizacao,
      eventos,
      livros,
      observacoes,
      status,
    } = req.body;

    if (!codigo || !nome) {
      return res
        .status(400)
        .json({ error: "Campos 'codigo' e 'nome' são obrigatórios" });
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("embalagens")
      .insert([
        {
          codigo,
          nome,
          marca: marca || null,
          material: material || null,
          dimensoes: dimensoes || null,
          pais: pais || null,
          data_cadastro: data_cadastro || null,
          grafica: grafica || null,
          url_imagem: url_imagem || null,
          tags: Array.isArray(tags)
            ? tags
            : tags
            ? String(tags).split(",")
            : null,
          localizacao: localizacao || null,
          eventos: eventos || null,
          livros: livros || null,
          observacoes: observacoes || null,
          status: status || "ativo",
          criado_por: userId || null,
          data_criacao: nowIso,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao criar embalagem:", error);
      return res.status(500).json({ error: "Erro ao criar embalagem" });
    }

    console.log("[CREATE PACKAGING] Criado no Supabase:", data);

    // log no sistema
    try {
      await registerLog({
        req,
        acao: "Criou embalagem",
        detalhes: `Código: ${data.codigo} | Nome: ${data.nome}`,
      });
    } catch (logErr) {
      console.error("[createPackaging] erro ao registrar log:", logErr);
    }

    // registra na planilha (best effort)
    try {
      await appendPackagingToSheet({
        ...data,
        criado_por: userEmail || null,
      });
      console.log(
        "[CREATE PACKAGING] Linha adicionada na planilha com sucesso"
      );
    } catch (sheetErr) {
      console.error("Erro ao registrar embalagem na planilha:", sheetErr);
    }

    return res.status(201).json({ embalagem: data });
  } catch (err) {
    console.error("Erro inesperado em createPackaging:", err);
    return res.status(500).json({ error: "Erro interno ao criar embalagem" });
  }
}

// PATCH /packaging/:id
export async function updatePackaging(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const {
      codigo,
      nome,
      marca,
      material,
      dimensoes,
      pais,
      data_cadastro,
      grafica,
      url_imagem,
      tags,
      localizacao,
      eventos,
      livros,
      observacoes,
      status,
    } = req.body;

    const updatePayload: Record<string, any> = {
      modificado_por: userId || null,
      data_modificacao: new Date().toISOString(),
    };

    if (codigo !== undefined) updatePayload.codigo = codigo;
    if (nome !== undefined) updatePayload.nome = nome;
    if (marca !== undefined) updatePayload.marca = marca;
    if (material !== undefined) updatePayload.material = material;
    if (dimensoes !== undefined) updatePayload.dimensoes = dimensoes;
    if (pais !== undefined) updatePayload.pais = pais;
    if (data_cadastro !== undefined) updatePayload.data_cadastro = data_cadastro;
    if (grafica !== undefined) updatePayload.grafica = grafica;
    if (url_imagem !== undefined) updatePayload.url_imagem = url_imagem;
    if (localizacao !== undefined) updatePayload.localizacao = localizacao;
    if (eventos !== undefined) updatePayload.eventos = eventos;
    if (livros !== undefined) updatePayload.livros = livros;
    if (observacoes !== undefined) updatePayload.observacoes = observacoes;
    if (status !== undefined) updatePayload.status = status;
    if (tags !== undefined) {
      updatePayload.tags = Array.isArray(tags)
        ? tags
        : tags
        ? String(tags).split(",")
        : null;
    }

    const { data, error } = await supabase
      .from("embalagens")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar embalagem:", error);
      return res.status(500).json({ error: "Erro ao atualizar embalagem" });
    }

    if (!data) {
      return res.status(404).json({ error: "Embalagem não encontrada" });
    }

    // log de edição
    try {
      await registerLog({
        req,
        acao: "Atualizou embalagem",
        detalhes: `ID: ${id} | Código: ${data.codigo} | Nome: ${data.nome}`,
      });
    } catch (logErr) {
      console.error("[updatePackaging] erro ao registrar log:", logErr);
    }

    return res.json({ embalagem: data });
  } catch (err) {
    console.error("Erro inesperado em updatePackaging:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar embalagem" });
  }
}

// DELETE /packaging/:id  (soft delete: altera status)
export async function softDeletePackaging(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const { data, error } = await supabase
      .from("embalagens")
      .update({
        status: "arquivado",
        modificado_por: userId || null,
        data_modificacao: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao arquivar embalagem:", error);
      return res.status(500).json({ error: "Erro ao arquivar embalagem" });
    }

    if (!data) {
      return res.status(404).json({ error: "Embalagem não encontrada" });
    }

    // log de arquivamento
    try {
      await registerLog({
        req,
        acao: "Arquivou embalagem",
        detalhes: `ID: ${id} | Código: ${data.codigo} | Nome: ${data.nome}`,
      });
    } catch (logErr) {
      console.error("[softDeletePackaging] erro ao registrar log:", logErr);
    }

    return res.json({ embalagem: data });
  } catch (err) {
    console.error("Erro inesperado em softDeletePackaging:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao arquivar embalagem" });
  }
}

// POST /packaging/upload
export async function uploadPackagingFile(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const file = (req as any).file as
      | {
          buffer: Buffer;
          mimetype: string;
          originalname: string;
        }
      | undefined;

    if (!file) {
      return res
        .status(400)
        .json({ error: "Arquivo não enviado (campo 'file')." });
    }

    const publicUrl = await uploadFileToDrive({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    // log de upload
    try {
      await registerLog({
        req,
        acao: "Upload de arquivo de embalagem",
        detalhes: `Arquivo: ${file.originalname}`,
      });
    } catch (logErr) {
      console.error("[uploadPackagingFile] erro ao registrar log:", logErr);
    }

    return res.json({ url: publicUrl });
  } catch (err) {
    console.error("Erro ao enviar arquivo para o Drive:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao enviar arquivo para o Drive." });
  }
}
