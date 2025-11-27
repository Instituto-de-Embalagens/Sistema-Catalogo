// src/types/scenario-packaging.ts
export type ScenarioPackagingRow = {
  id: string;
  scenario_id: string;
  packaging_id: string;
  posicao: number;
  observacoes: string | null;
  data_criacao: string;      // timestamptz -> string no JS
  criado_por: string;        // uuid do user
};

// resposta com join na embalagem
export type ScenarioPackagingWithPackaging = {
  id: string;
  scenario_id: string;
  packaging_id: string;
  posicao: number;
  observacoes: string | null;
  data_criacao: string;
  criado_por: string;
  packaging: {
    id: string;
    codigo: string;
    nome: string;
    marca: string | null;
    material: string | null;
    pais: string | null;
  };
};
