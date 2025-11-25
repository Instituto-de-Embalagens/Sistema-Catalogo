// src/auth/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthUserPayload {
  sub: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function authRequired(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET não definido no .env");
      return res
        .status(500)
        .json({ error: "Configuração de JWT ausente no servidor" });
    }

    const payload = jwt.verify(token, secret) as AuthUserPayload;

    req.user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
