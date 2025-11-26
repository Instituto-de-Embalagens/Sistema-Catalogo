import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

// Rota de cadastro
router.post("/register", register);

// Rota de login
router.post("/login", login);

export default router;
