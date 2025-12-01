// src/lib/sheetsWebhook.ts
// Node 18+ já tem fetch global.

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

if (!SHEETS_WEBHOOK_URL) {
  console.warn(
    "[SheetsWebhook] SHEETS_WEBHOOK_URL não definido. Webhook para planilha desabilitado."
  );
}

// =============== HELPERS GENÉRICOS =================

async function callWebhook(payload: any, label: string) {
  if (!SHEETS_WEBHOOK_URL) {
    console.warn(`[SheetsWebhook] Ignorando ${label}: sem SHEETS_WEBHOOK_URL`);
    return;
  }

  try {
    const resp = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(
        `[SheetsWebhook] Erro HTTP no webhook ${label}:`,
        resp.status,
        text
      );
    } else {
      console.log(`[SheetsWebhook] OK via webhook → ${label}`);
    }
  } catch (err) {
    console.error(`[SheetsWebhook] Erro geral no webhook ${label}:`, err);
  }
}

// =============== PACKAGING =========================

export async function appendPackagingViaWebhook(packaging: any) {
  return callWebhook(
    {
      action: "appendPackaging",
      packaging,
    },
    "appendPackaging"
  );
}

// =============== LOCATIONS =========================

export async function appendLocationViaWebhook(location: any) {
  return callWebhook(
    {
      action: "appendLocation",
      location,
    },
    "appendLocation"
  );
}
