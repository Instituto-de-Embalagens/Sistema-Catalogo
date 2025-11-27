// src/routes/scenarioPackaging.routes.ts
import { Router } from "express";
import { authRequired } from "../auth/authMiddleware";
import {
  listScenarioPackaging,
  addScenarioPackaging,
  removeScenarioPackaging,
} from "../controllers/scenarioPackaging.controller";

const router = Router();

// lista embalagens de um cenário
router.get(
  "/:scenarioId/packaging",
  authRequired,
  listScenarioPackaging
);

// adiciona 1+ embalagens ao cenário
router.post(
  "/:scenarioId/packaging",
  authRequired,
  addScenarioPackaging
);

// remove uma relação cenário–embalagem (linha da pivot)
router.delete(
  "/:scenarioId/packaging/:id",
  authRequired,
  removeScenarioPackaging
);

export default router;
