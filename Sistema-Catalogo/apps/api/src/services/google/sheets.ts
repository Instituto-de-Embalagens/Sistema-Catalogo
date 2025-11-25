import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

export function getSheetsInstance() {
  const auth = getGoogleAuth();
  return google.sheets({ version: "v4", auth });
}

export async function readSheet() {
  const sheets = getSheetsInstance();

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  console.log("SPREAD-ID:", spreadsheetId);

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Embalagens!A1:D5",
  });

  return result.data;
}
