// src/lib/googleSheets.ts
import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.SPREADSHEET_ID;

if (!SPREADSHEET_ID) {
  throw new Error(
    "SPREADSHEET_ID / GOOGLE_SHEETS_SPREADSHEET_ID não definido no .env"
  );
}

// o tipo aqui bate com as colunas da tabela do Supabase
export async function appendPackagingToSheet(packaging: {
  id: string;
  codigo: string;
  nome: string;
  marca?: string | null;
  material?: string | null;
  dimensoes?: string | null;
  pais?: string | null;
  data_cadastro?: string | null;
  grafica?: string | null;
  url_imagem?: string | null;
  tags?: string[] | null;
  localizacao?: string | null;
  eventos?: string | null;
  livros?: string | null;
  observacoes?: string | null;
  status: string;
  criado_por?: string | null;
  data_criacao?: string | null;
  modificado_por?: string | null;
  data_modificacao?: string | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // ORDEM EXATA DAS COLUNAS DA PLANILHA:
  // ID | Código | Nome | Marca | Material | Dimensões | País | Data Cadastro
  // Transformador | URL Imagem | Categorias | Localização | Eventos | Livros
  // Observações | Status | Criado Por | Data Criação | Modificado Por | Data Modificação
  const row = [
    packaging.id,                                // ID
    packaging.codigo,                            // Código
    packaging.nome,                              // Nome
    packaging.marca || "",                       // Marca
    packaging.material || "",                    // Material
    packaging.dimensoes || "",                   // Dimensões
    packaging.pais || "",                        // País
    packaging.data_cadastro || "",               // Data Cadastro
    packaging.grafica || "",                     // Transformador
    packaging.url_imagem || "",                  // URL Imagem
    packaging.tags?.join(", ") || "",            // Categorias
    packaging.localizacao || "",                 // Localização
    packaging.eventos || "",                     // Eventos
    packaging.livros || "",                      // Livros
    packaging.observacoes || "",                 // Observações
    packaging.status || "",                      // Status
    packaging.criado_por || "",                  // Criado Por
    packaging.data_criacao || "",                // Data Criação
    packaging.modificado_por || "",              // Modificado Por
    packaging.data_modificacao || "",            // Data Modificação
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Embalagens!A:T", // agora vão 20 colunas (A até T)
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}
