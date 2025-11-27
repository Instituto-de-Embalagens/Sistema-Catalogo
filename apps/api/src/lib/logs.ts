// src/lib/logs.ts
import { supabase } from "../services/supabase";
import { AuthenticatedRequest } from "../auth/authMiddleware";

/**
 * Registra uma linha na tabela 'logs' do Supabase
 * e (se quiser depois) também pode mandar pra aba Logs da planilha.
 */
export async function registerLog(params: {
  req: AuthenticatedRequest;
  acao: string;
  detalhes?: string | null;
}) {
  const { req, acao, detalhes } = params;

  const usuarioId = req.user?.sub || null;

  const { error } = await supabase.from("logs").insert([
    {
      usuario_id: usuarioId,
      acao,
      detalhes: detalhes || null,
      // data_hora tem default now() no banco, então pode até omitir
    },
  ]);

  if (error) {
    console.error("[registerLog] Erro ao registrar log:", error);
  }
}
