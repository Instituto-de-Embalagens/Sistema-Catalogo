// src/services/google/googleAuth.ts
import { google, Auth } from "googleapis";

let googleAuth: Auth.GoogleAuth | null = null;

export function getGoogleAuth() {
  if (googleAuth) return googleAuth;

  const keyFilePath =
    "/Users/institutodeembalagens/Sistema-Catalogo/apps/api/src/credentials/catalogo-embalagens-prod.json";

  console.log("[GOOGLE] getGoogleAuth() chamado");
  console.log("[GOOGLE] keyFilePath:", keyFilePath);
  console.log(
    "[GOOGLE] GOOGLE_APPLICATION_CREDENTIALS:",
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "(não setada)"
  );

  googleAuth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return googleAuth;
}
