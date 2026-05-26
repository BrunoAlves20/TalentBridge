import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita modo standalone para build de produção em Docker (mínimo de arquivos)
  output: "standalone",
};

export default nextConfig;
