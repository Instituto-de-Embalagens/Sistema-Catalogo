// src/services/uploadImage.ts
import { getDriveClient } from "./google/googleDriveClient";

export async function uploadImage(base64: string, filename: string) {
  const drive = await getDriveClient();

  const buffer = Buffer.from(base64, "base64");

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType: "image/jpeg",
      body: buffer,
    },
    fields: "id",
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

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
