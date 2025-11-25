// src/services/google/googleDriveClient.ts
import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

let driveClient: ReturnType<typeof google.drive> | null = null;

export async function getDriveClient() {
  if (driveClient) return driveClient;

  const googleAuth = getGoogleAuth(); // GoogleAuth
  // não chamar getClient() — o GoogleAuth já é aceito como auth

  driveClient = google.drive({
    version: "v3",
    auth: googleAuth, // <-- ESSENCIAL
  });

  return driveClient;
}
