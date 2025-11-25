import { use } from "react";
import { EmbalagemDetalhesClient } from "./EmbalagemDetalhesClient";

type ParamsPromise = Promise<{ id: string }>;

export default function Page({ params }: { params: ParamsPromise }) {
  // Desembrulha o params (Next.js App Router trata como Promise)
  const { id } = use(params);

  return <EmbalagemDetalhesClient id={id} />;
}
