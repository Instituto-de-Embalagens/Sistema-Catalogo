"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha: password }),

      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      // guarda token no navegador
      localStorage.setItem("catalogo_token", data.token);

      // manda a pessoa pro dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-md shadow-lg bg-surface border-border-subtle">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-display text-text">
            Catálogo Instituto
          </CardTitle>
          <p className="text-text-muted text-sm">
            Acesse sua conta para continuar
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">E-mail</label>
              <Input
                type="email"
                placeholder="Seu e-mail"
                className="bg-surface-alt border-border-subtle text-text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-surface-alt border-border-subtle text-text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary-soft transition-all"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link
              href="#"
              className="text-sm text-primary hover:text-primary-soft font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
