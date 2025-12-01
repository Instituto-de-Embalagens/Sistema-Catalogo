// src/routes/locations.routes.ts
import { Router } from "express";
import { authRequired } from "../auth/authMiddleware";
import {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locations.controller";

const router = Router();

router.use(authRequired);

router.get("/", listLocations);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.patch("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;
