// src/app.ts
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import debugRoutes from "./routes/debug.routes";
import packagingRoutes from "./routes/packaging.routes";
import { filesRoutes } from "./routes/files.routes";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/debug", debugRoutes);
app.use("/packaging", packagingRoutes);
app.use("/files", filesRoutes);

export default app;
