// src/lib/googleAuth.ts
import { google } from "googleapis";

let googleAuth: any = null;

export function getGoogleAuth() {
  if (googleAuth) return googleAuth;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL ou GOOGLE_PRIVATE_KEY não definidos no .env"
    );
  }

  console.log("==================================================");
  console.log("[GOOGLE AUTH] Inicializando GoogleAuth via ENV");
  console.log("[GOOGLE AUTH] clientEmail:", clientEmail);
  console.log(
    "[GOOGLE AUTH] PRIVATE_KEY length:",
    privateKey.length
  );
  console.log("==================================================");

  googleAuth = new google.auth.JWT({
    email: clientEmail,
    // se no .env tiver \n literais, isso converte pra quebras de linha reais
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return googleAuth;
}
