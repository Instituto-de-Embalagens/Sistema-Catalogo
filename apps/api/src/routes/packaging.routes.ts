// src/routes/packaging.routes.ts

import { Router } from "express";
import multer from "multer";

import { authRequired } from "../auth/authMiddleware";
import {
  listPackaging,
  getPackagingById,
  createPackaging,
  updatePackaging,
  softDeletePackaging,
  uploadPackagingFile,
} from "../controllers/packaging.controller";

const router = Router();

/**
 * Multer configurado em memória (ideal p/ enviar ao Drive)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

/**
 * Rotas protegidas por autenticação
 */
router.get("/", authRequired, listPackaging);
router.get("/:id", authRequired, getPackagingById);
router.post("/", authRequired, createPackaging);
router.patch("/:id", authRequired, updatePackaging);
router.delete("/:id", authRequired, softDeletePackaging);

router.post(
  "/upload",
  authRequired,
  upload.single("file"),
  uploadPackagingFile
);

export default router;
