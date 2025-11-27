// src/routes/users.routes.ts
import { Router } from "express";
import { authRequired } from "../auth/authMiddleware";
import {
  getCurrentUser,
  createUser,
  listUsers,
  getUserById,
  updateUser,
  softDeleteUser,
} from "../controllers/users.controller";

const router = Router();

router.get("/me", authRequired, getCurrentUser);
router.post("/", authRequired, createUser);
router.get("/", authRequired, listUsers);
router.get("/:id", authRequired, getUserById);
router.patch("/:id", authRequired, updateUser);
router.delete("/:id", authRequired, softDeleteUser);

export default router;
