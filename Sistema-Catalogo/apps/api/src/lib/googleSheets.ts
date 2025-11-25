// src/lib/googleSheets.ts
import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID!; // já tem esse SPREAD-ID no log, né? coloca no .env

export async function appendPackagingToSheet(packaging: {
  id: string;
  codigo: string;
  nome: string;
  marca?: string | null;
  material?: string | null;
  pais?: string | null;
  grafica?: string | null;
  url_imagem?: string | null;
  status: string;
  tags?: string[] | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // aqui você escolhe como quer organizar as colunas na planilha
  const row = [
    packaging.id,
    packaging.codigo,
    packaging.nome,
    packaging.marca || "",
    packaging.material || "",
    packaging.pais || "",
    packaging.grafica || "",
    packaging.status || "",
    packaging.tags?.join(", ") || "",
    packaging.url_imagem || "",
    new Date().toISOString(), // data de cadastro
  ];

  // exemplo de aba: "Embalagens" (primeira linha sendo o cabeçalho)
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Embalagens!A:K", // ajusta pro número de colunas
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}
