"use client";

import { Shield } from "lucide-react";

export default function UsuarioPage() {
  return (
    <div className="flex flex-col p-6 w-full gap-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Usuário
        </p>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Detalhes do usuário
        </h2>
      </div>

      <div className="border rounded-lg p-6 bg-background/80">
        Conteúdo em construção …
      </div>
    </div>
  );
}
