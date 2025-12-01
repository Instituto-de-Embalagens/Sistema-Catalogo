// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1533636723495-4f5010c4c33c?auto=format&fit=crop&w=1600&q=80";

export default function Index() {
  return (
    <div className="relative min-h-screen bg-[#020704] text-white">
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-700/25 blur-3xl" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src="https://institutodeembalagens.com.br/wp-content/uploads/2023/09/logo_20_anos_novo_branco-scaled.png"
              alt="Instituto de Embalagens"
              className="h-9 w-auto"
            />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-emerald-300/80 md:inline">
              Sistema de Catálogo
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-xs font-medium text-white/70 md:flex">
            <span className="cursor-default text-emerald-300">Início</span>
            <span className="cursor-default hover:text-white/90">
              Sobre o catálogo
            </span>
            <span className="cursor-default hover:text-white/90">
              Como funciona
            </span>
          </nav>

          <Link href="/login">
            <button className="flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-emerald-500/20">
              Acessar sistema
              <ArrowRight className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </header>

      {/* LAYOUT PRINCIPAL */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col lg:flex-row">
        {/* COLUNA ESQUERDA */}
        <section className="relative flex flex-1 flex-col justify-center px-6 py-10 md:px-10 lg:px-8">
          {/* faixa escura translucida lembrando o layout de referência */}
          <div className="pointer-events-none absolute inset-y-0 -left-40 right-10 bg-gradient-to-r from-black/80 via-black/75 to-black/20" />

          <div className="relative space-y-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/80">
              CATÁLOGO INSTITUTO DE EMBALAGENS
            </p>

            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.25em] text-emerald-200/80">
                ACERVO CURADO • PROJETOS REAIS
              </p>
              <h1 className="text-4xl font-semibold leading-tight md:text-[44px]">
                <span className="block text-white">Centro de referência</span>
                <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                  em embalagens
                </span>
              </h1>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-white/75">
              Uma visão unificada do acervo físico do Instituto, conectando
              Google Sheets, Supabase e o novo sistema de catálogo. Organize,
              busque e explore embalagens com contexto, imagem e localização.
            </p>

            {/* CTA PRINCIPAL */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/login">
                <button className="group inline-flex items-center gap-3 rounded-full bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 hover:shadow-emerald-400/40">
                  Entrar no catálogo
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 transition group-hover:bg-black/20">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </Link>

              <p className="text-xs text-white/60">
                Acesso restrito a equipe Instituto e convidados.
              </p>
            </div>

            {/* INFO RÁPIDA */}
            <div className="mt-6 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <p className="text-[11px] tracking-[0.18em] text-emerald-300/90">
                  ACERVO
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  +{100}
                </p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  embalagens catalogadas
                </p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.18em] text-emerald-300/90">
                  CONEXÕES
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  Sheets · Supabase
                </p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  fluxo automatizado
                </p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.18em] text-emerald-300/90">
                  VISÃO
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  20+ anos
                </p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  de conteúdo em embalagem
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COLUNA DIREITA – HERO */}
        <section className="relative flex flex-1 items-stretch">
          {/* imagem de fundo */}
          <div className="relative h-[320px] w-full bg-black/40 lg:h-auto">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={HERO_IMAGE_URL}
                alt="Folhagens verdes em close"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-[0.85] saturate-150"
                unoptimized
              />
              {/* overlay em gradiente pra mesclar com o lado esquerdo */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/40 to-black/70" />
            </div>

            <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 text-white/70">
              <span className="h-8 w-px bg-white/25" />
              <div className="flex flex-col gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-white" />
                <span className="inline-block h-2 w-2 rounded-full border border-white/60" />
                <span className="inline-block h-2 w-2 rounded-full border border-white/30" />
              </div>
            </div>

            {/* cardzinho flutuante */}
            <div className="absolute bottom-6 left-6 max-w-xs rounded-xl bg-black/55 px-4 py-3 text-xs backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                VISUALIZAÇÃO EM TEMPO REAL
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                Embalagens conectadas ao acervo físico
              </p>
              <p className="mt-1 text-[11px] text-white/70">
                Cada item do catálogo traz contexto, fotos, local de guarda e
                relação com eventos, cursos e livros.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
