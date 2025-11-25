// src/lib/googleAuth.ts
import { google, Auth } from "googleapis";
import path from "path";

let googleAuth: Auth.GoogleAuth | null = null;

export function getGoogleAuth() {
  if (googleAuth) return googleAuth;

  // Caminho ABSOLUTO pro JSON da service account
  const keyFilePath = path.resolve(
    "/Users/institutodeembalagens/Sistema-Catalogo/apps/api/src/credentials/catalogo-embalagens-prod.json"
  );

  console.log("==================================================");
  console.log("[GOOGLE AUTH] Inicializando GoogleAuth");
  console.log("[GOOGLE AUTH] keyFilePath:", keyFilePath);
  console.log(
    "[GOOGLE AUTH] GOOGLE_APPLICATION_CREDENTIALS:",
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "(não setada)"
  );
  console.log("==================================================");

  googleAuth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return googleAuth;
}
