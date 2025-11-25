// src/routes/users.routes.ts
import { Router } from "express";
import { getMe } from "../controllers/users.controller";
import { authRequired } from "../auth/authMiddleware";

const router = Router();

// GET /users/me  -> retorna o usuário autenticado
router.get("/me", authRequired, getMe);

export default router;
