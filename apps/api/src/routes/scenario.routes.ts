// src/routes/scenario.routes.ts
import { Router } from "express";
import { authRequired } from "../auth/authMiddleware";
import {
  createScenario,
  listScenarios,
  getScenarioById,
} from "../controllers/scenario.controller";

const router = Router();

router.get("/", authRequired, listScenarios);      // GET /scenarios
router.get("/:id", authRequired, getScenarioById); // GET /scenarios/:id
router.post("/", authRequired, createScenario);    // POST /scenarios

export default router;
