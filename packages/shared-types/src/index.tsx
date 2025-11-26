// Embalagem principal (modelo Supabase)
export interface Packaging {
  id: string;
  code: string;          // EAN ou código interno
  name: string;          // Nome do produto
  brand: string;         // Marca
  material: string;      // Material
  dimensions?: string | null;
  country: string;
  registeredAt: string;  // Data Cadastro
  transformer?: string | null;  // Transformador/Gráfica
  imageUrl?: string | null;
  tags?: string | null;
  locationCode?: string | null;
  events?: string | null;
  books?: string | null;
  notes?: string | null;
  status: "active" | "inactive";
  createdBy: string;
  createdAt: string;
  modifiedBy?: string | null;
  modifiedAt?: string | null;
  origin?: string | null; // Origem da amostra
}

export interface Location {
  id: string;
  code: string;          // ex: "CX-001"
  building: string;      // sala/estante/etc
  description?: string | null;
  createdAt: string;
  createdBy: string;
}

export interface User {
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  team?: string | null;
  status: "Ativo" | "Inativo";
  createdAt: string;
  lastAccess?: string | null;
}
