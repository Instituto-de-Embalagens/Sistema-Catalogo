// src/lib/googleDrive.ts
import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

type UploadFileParams = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export async function uploadFileToDrive({
  buffer,
  mimeType,
  originalName,
}: UploadFileParams): Promise<string> {
  const auth = getGoogleAuth(); // mesmo auth que você testou no script
  const drive = google.drive({
    version: "v3",
    auth,
  });

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID não está definido.");
  }

  const res = await drive.files.create({
    requestBody: {
      name: originalName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: buffer,
    },
    fields: "id, webViewLink, webContentLink",
  });

  const fileId = res.data.id;

  if (!fileId || typeof fileId !== "string") {
    throw new Error("Google Drive não retornou um fileId válido.");
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const publicUrl =
    res.data.webViewLink ||
    res.data.webContentLink ||
    `https://drive.google.com/uc?export=view&id=${fileId}`;

  return publicUrl;
}
