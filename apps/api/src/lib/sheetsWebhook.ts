// src/lib/sheetsWebhook.ts

// Se estiver rodando Node < 18, descomenta a linha abaixo e instala node-fetch:
// import fetch from "node-fetch";

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

if (!SHEETS_WEBHOOK_URL) {
  console.warn(
    "[SheetsWebhook] SHEETS_WEBHOOK_URL não definido. Append na planilha ficará desabilitado."
  );
}

/**
 * Embalagens → chama Apps Script com action: "appendPackaging"
 */
export async function appendPackagingViaWebhook(packaging: any) {
  if (!SHEETS_WEBHOOK_URL) {
    console.warn(
      "[SheetsWebhook] Ignorando appendPackagingViaWebhook porque SHEETS_WEBHOOK_URL não está setado."
    );
    return;
  }

  try {
    const resp = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "appendPackaging",
        packaging,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(
        "[SheetsWebhook] Erro HTTP ao chamar Apps Script (appendPackaging):",
        resp.status,
        text
      );
    } else {
      console.log(
        "[SheetsWebhook] Embalagem registrada na planilha via Apps Script"
      );
    }
  } catch (err) {
    console.error(
      "[SheetsWebhook] Erro geral ao chamar Apps Script (appendPackaging):",
      err
    );
  }
}

/**
 * Usuários → chama Apps Script com action: "appendUser"
 */
export async function appendUserViaWebhook(user: any) {
  if (!SHEETS_WEBHOOK_URL) {
    console.warn(
      "[SheetsWebhook] Ignorando appendUserViaWebhook porque SHEETS_WEBHOOK_URL não está setado."
    );
    return;
  }

  try {
    const resp = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "appendUser",
        user,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(
        "[SheetsWebhook] Erro HTTP ao chamar Apps Script (appendUser):",
        resp.status,
        text
      );
    } else {
      console.log(
        "[SheetsWebhook] Usuário registrado na planilha via Apps Script"
      );
    }
  } catch (err) {
    console.error(
      "[SheetsWebhook] Erro geral ao chamar Apps Script (appendUser):",
      err
    );
  }
}

/**
 * Locations → chama Apps Script com action: "appendLocation"
 * (usa se você quiser tirar Locations do GoogleAuth direto e ir tudo via webhook)
 */
export async function appendLocationViaWebhook(location: any) {
  if (!SHEETS_WEBHOOK_URL) {
    console.warn(
      "[SheetsWebhook] Ignorando appendLocationViaWebhook porque SHEETS_WEBHOOK_URL não está setado."
    );
    return;
  }

  try {
    const resp = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "appendLocation",
        location,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(
        "[SheetsWebhook] Erro HTTP ao chamar Apps Script (appendLocation):",
        resp.status,
        text
      );
    } else {
      console.log(
        "[SheetsWebhook] Local registrado na planilha Locations via Apps Script"
      );
    }
  } catch (err) {
    console.error(
      "[SheetsWebhook] Erro geral ao chamar Apps Script (appendLocation):",
      err
    );
  }
}
