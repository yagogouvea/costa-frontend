// types/cliente.ts

export interface Contrato {
  nome_interno: string;
  tipo: string;
  valor_acionamento: number;
  franquia_horas: number;
  franquia_km: number;
  valor_hora_extra: number;
  valor_km_extra: number;
  valor_fixo: number;
}

export interface Cliente {
  id?: number;
  nome: string;
  cnpj: string;
  contato1?: string;
  telefone1?: string;
  contratos: Contrato[];
}
