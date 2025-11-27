import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../services/supabase";
import { registerLog } from "../lib/logs";

export async function register(req: Request, res: Response) {
  try {
    const { email, nome, senha } = req.body;

    if (!email || !nome || !senha) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    // verifica se ja existe
    const { data: existingUser, error: lookupError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingUser) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const { data: createdUser, error: insertError } = await supabase
      .from("usuarios")
      .insert([
        {
          email,
          nome,
          senha_hash,
          status: "ativo",
          nivel_acesso: "admin",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // registra log
    try {
      await registerLog({
        req,
        acao: "Criou usuário",
        detalhes: `Email: ${createdUser.email}`,
      });
    } catch (err) {
      console.error("[register] falha ao registrar log:", err);
    }

    const token = jwt.sign(
      {
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.nivel_acesso,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        nome: createdUser.nome,
      },
      token,
    });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha_hash || "");

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.nivel_acesso,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // registra log
    try {
      await registerLog({
        req,
        acao: "Login",
        detalhes: `Email: ${user.email}`,
      });
    } catch (err) {
      console.error("[login] falha log:", err);
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        nivel_acesso: user.nivel_acesso,
      },
      token,
    });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}
