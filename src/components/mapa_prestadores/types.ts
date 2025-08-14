export interface Prestador {
  id: string;
  nome: string;
  telefone?: string;
  funcoes?: { funcao: string }[];
  latitude: number;
  longitude: number;
  regioes: string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  distanciaKm?: number;
  modelo_antena?: string;
}

export interface PontoReferencia {
  latitude: number;
  longitude: number;
  endereco: string;
}

export interface PrestadorComDistancia extends Prestador {
  distanciaKm: number;
}

export interface RotaInfo {
  distancia: number;
  tempo: number;
  waypoints: [number, number][];
} 