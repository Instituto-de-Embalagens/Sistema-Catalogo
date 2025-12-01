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

export async function appendScenarioToSheet(scenario: {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  pais?: string | null;
  local?: string | null;
  data?: string | null;
  url_imagem?: string | null;
  tags?: string[] | null;
  criado_por?: string | null;
  data_criacao?: string | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    scenario.id,                   // ID
    scenario.codigo,               // Código
    scenario.nome,                 // Nome
    scenario.descricao || "",      // Descricao
    scenario.pais || "",           // Pais
    scenario.local || "",          // Local
    scenario.data || "",           // Data Foto
    scenario.url_imagem || "",     // URL Imagem
    scenario.tags?.join(", ") || "", // Tags
    scenario.criado_por || "",       // Criado Por
    scenario.data_criacao || "",     // Data Criação
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Scenarios!A:K", // <= 11 colunas A até K
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

export async function appendScenarioPackagingToSheet(pivot: {
  id: string;
  scenario_id: string;
  packaging_id: string;
  posicao?: number | null;
  observacoes?: string | null;
  data_criacao?: string | null;
  criado_por?: string | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // ORDEM EXATA DAS COLUNAS NA ABA ScenarioPackaging:
  // ID | ScenarioID | PackagingID | Posicao | Observacoes | Data Criacao | Criado Por
  const row = [
    pivot.id,                          // ID
    pivot.scenario_id,                 // ScenarioID
    pivot.packaging_id,                // PackagingID
    pivot.posicao ?? "",               // Posicao
    pivot.observacoes || "",           // Observacoes
    pivot.data_criacao || "",          // Data Criacao
    pivot.criado_por || "",            // Criado Por (email na planilha)
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "ScenarioPackaging!A:G", // 7 colunas (A até G)
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

export async function appendUserToSheet(user: {
  email: string;
  nome: string;
  nivel_acesso?: string | null;
  equipe?: string | null;
  status?: string | null;
  data_criacao?: string | null;
  ultimo_acesso?: string | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // ORDEM EXATA DAS COLUNAS DA ABA:
  // Email | Nome | Nível Acesso | Equipe | Status | Data Criação | Último Acesso
  const row = [
    user.email || "",
    user.nome || "",
    user.nivel_acesso || "",
    user.equipe || "",
    user.status || "",
    user.data_criacao || "",
    user.ultimo_acesso || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Usuarios!A:G", // ajuste se o nome da aba for diferente
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

export async function appendLogToSheet(log: {
  data_hora: string;
  usuario: string;
  acao: string;
  detalhes?: string | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    log.data_hora || "",
    log.usuario || "",
    log.acao || "",
    log.detalhes || "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Logs!A:D", // se a aba for "logs", troca aqui pra "logs!A:D"
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}
export async function appendLocationToSheet(location: {
  Id: string;
  Code: string;
  Building: string;
  Description?: string | null;
  CreatedAt?: string | null;
  CreatedBy?: string | null;
}) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // ORDEM EXATA DAS COLUNAS NA ABA "Locations":
  // ID | Code | Building | Description | CreatedAt | CreatedBy
  const row = [
    location.Id || "",          // A: ID
    location.Code || "",        // B: Code
    location.Building || "",    // C: Building
    location.Description || "", // D: Description
    location.CreatedAt || "",   // E: CreatedAt
    location.CreatedBy || "",   // F: CreatedBy
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Locations!A:F", // 6 colunas (A até F)
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}
