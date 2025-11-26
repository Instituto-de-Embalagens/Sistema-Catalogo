// apps/api/src/lib/googleDrive.ts
import { google } from "googleapis";
import { Readable } from "stream";
import { getGoogleAuth } from "../services/google/googleAuth"; // ajuste o path conforme seu projeto

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

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
  if (!FOLDER_ID) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID não está definido.");
  }

  const auth = getGoogleAuth(); // usa a mesma auth para tudo (Drive, Sheets, etc.)
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata: any = {
    name: originalName,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType,
    body: Readable.from(buffer), // melhor do que mandar o Buffer “cru”
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

  const url =
    file.webViewLink ||
    file.webContentLink ||
    `https://drive.google.com/uc?export=view&id=${file.id}`;

  return url;
}
