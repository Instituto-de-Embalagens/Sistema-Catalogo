import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // habilita carregar imagens remotas desses domínios
    domains: [
      "images.unsplash.com",
      "institutodeembalagens.com.br",
    ],
  },
};

export default nextConfig;
