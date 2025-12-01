// src/lib/googleAuth.ts
import { google } from "googleapis";

let googleAuth: any = null;

export function getGoogleAuth() {
  if (googleAuth) return googleAuth;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL ou GOOGLE_PRIVATE_KEY não definidos no .env"
    );
  }

  const privateKey = rawPrivateKey.includes("\\n")
    ? rawPrivateKey.replace(/\\n/g, "\n")
    : rawPrivateKey;

  console.log("==================================================");
  console.log("[GOOGLE AUTH] Inicializando GoogleAuth via ENV");
  console.log("[GOOGLE AUTH] clientEmail:", clientEmail);
  console.log("[GOOGLE AUTH] rawPrivateKey starts with:", rawPrivateKey.slice(0, 20));
  console.log("[GOOGLE AUTH] privateKey starts with:", privateKey.slice(0, 30));
  console.log("[GOOGLE AUTH] privateKey ends with:", privateKey.slice(-30));
  console.log("==================================================");

  googleAuth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return googleAuth;
}
