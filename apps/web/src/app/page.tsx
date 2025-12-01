// app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      {/* background image */}
      <Image
        src="https://images.unsplash.com/photo-1587502536263-558f8a4255be"
        alt="Clínica"
        fill
        className="object-cover opacity-50"
      />

      {/* overlay azul */}
      <div className="absolute inset-0 bg-blue-500/40 mix-blend-multiply" />

      {/* conteúdo */}
      <div className="relative z-10 flex h-screen items-center justify-center">
        <div className="max-w-xl text-center text-white px-6">
          <h1 className="text-5xl font-bold leading-tight">
            O centro do bem-estar
          </h1>

          <p className="mt-4 text-lg opacity-90">
            Um ambiente inteiramente dedicado ao cuidado em saúde e qualidade de vida.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition"
            >
              Entrar no sistema
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
