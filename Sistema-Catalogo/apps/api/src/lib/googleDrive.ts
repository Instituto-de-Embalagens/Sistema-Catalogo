import { google } from "googleapis";
import { Readable } from "stream";

const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_DRIVE_FOLDER_ID,
} = process.env;

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getDriveClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL não definido no .env");
  }
  if (!GOOGLE_PRIVATE_KEY) {
    throw new Error("GOOGLE_PRIVATE_KEY não definido no .env");
  }

  const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
}

type UploadParams = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export async function uploadFileToDrive({
  buffer,
  mimeType,
  originalName,
}: UploadParams): Promise<string> {
  const drive = getDriveClient();

  const fileMetadata: any = {
    name: originalName,
  };

  if (GOOGLE_DRIVE_FOLDER_ID) {
    fileMetadata.parents = [GOOGLE_DRIVE_FOLDER_ID];
  }

  // 🔹 aqui está o pulo do gato: usar stream em vez de Buffer
  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  const createRes = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink, webContentLink",
  });

  const file = createRes.data;

  if (!file.id) {
    throw new Error("Falha ao criar arquivo no Drive (sem ID retornado)");
  }

  // deixa público pra leitura
  await drive.permissions.create({
    fileId: file.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const url = file.webViewLink || file.webContentLink;
  if (!url) {
    throw new Error("Arquivo criado mas sem URL pública retornada");
  }

  return url;
}
