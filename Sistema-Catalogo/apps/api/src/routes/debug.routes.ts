// src/routes/debug.routes.ts
import { Router } from "express";
import { testSheets } from "./test-sheets";

const router = Router();

// GET /debug/test-sheets → roda o teste de integração com Google Sheets
router.get("/test-sheets", async (req, res) => {
  try {
    await testSheets();
    res.json({ ok: true, message: "testSheets executado com sucesso" });
  } catch (err) {
    console.error("Erro ao rodar testSheets:", err);
    res.status(500).json({ ok: false, error: "Erro ao rodar testSheets" });
  }
});

export default router;
