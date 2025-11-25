// src/routes/packaging.routes.ts
import { Router } from "express";
import { authRequired } from "../auth/authMiddleware";
import {
  listPackaging,
  getPackagingById,
  createPackaging,
  updatePackaging,
  softDeletePackaging,
} from "../../src/controllers/packaging.controller";

const router = Router();

// Todas as rotas de embalagens exigem usuário autenticado
router.get("/", authRequired, listPackaging);
router.get("/:id", authRequired, getPackagingById);
router.post("/", authRequired, createPackaging);
router.patch("/:id", authRequired, updatePackaging);
router.delete("/:id", authRequired, softDeletePackaging); // soft delete (status)

export default router;
