// src/lib/sheetsWebhook.ts

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

if (!SHEETS_WEBHOOK_URL) {
  console.warn(
    "[SheetsWebhook] SHEETS_WEBHOOK_URL não definido. Append na planilha ficará desabilitado."
  );
}

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

// <<< NOVO: usuários
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
