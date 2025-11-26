import { readSheet } from "../services/google/sheets";

export async function testSheets() {
  const data = await readSheet();
  console.log("DADOS DA PLANILHA:", data);
}
