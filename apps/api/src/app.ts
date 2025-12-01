// src/app.ts
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import debugRoutes from "./routes/debug.routes";
import packagingRoutes from "./routes/packaging.routes";
import { filesRoutes } from "./routes/files.routes";
import locationsRoutes from "./routes/locations.routes";

// cenários (tabela scenarios)
import scenarioRoutes from "./routes/scenario.routes";
// pivot cenário–embalagem (tabela scenario_packaging)
import scenarioPackagingRoutes from "./routes/scenarioPackaging.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/debug", debugRoutes);
app.use("/packaging", packagingRoutes);
app.use("/files", filesRoutes);
app.use("/locations", locationsRoutes);

// CENÁRIOS (CRUD de scenarios)
app.use("/scenarios", scenarioRoutes);

// RELAÇÃO CENÁRIO–EMBALAGEM (scenario_packaging)
app.use("/scenarios", scenarioPackagingRoutes);

export default app;
