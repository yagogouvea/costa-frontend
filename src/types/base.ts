// Tipos monetários
export type MonetaryValue = string | number;

// Tipos de veículo
export type TipoVeiculo = 'Carro' | 'Moto' | 'Caminhão' | 'Isca';
export const tiposVeiculo: TipoVeiculo[] = ['Carro', 'Moto', 'Caminhão', 'Isca'];

// Tipos de função
export type TipoFuncao = 'Pronta Resposta' | 'Drone' | 'Investigação' | 'Escolta' | 'Segurança';
export const funcoesDisponiveis: TipoFuncao[] = ['Pronta Resposta', 'Drone', 'Investigação', 'Escolta', 'Segurança'];

// Tipos de origem
export type OrigemCadastro = 'Site' | 'cadastro_publico' | 'interno';

// Tipos de região
export type Regiao = 'NORTE' | 'SUL' | 'LESTE' | 'OESTE' | 'CENTRO' | 'GRANDE_SP' | 'LITORAL' | 'INTERIOR';
export const regioesDisponiveis: Regiao[] = [
  'NORTE',
  'SUL',
  'LESTE',
  'OESTE',
  'CENTRO',
  'GRANDE_SP',
  'LITORAL',
  'INTERIOR'
];

// Tipos de PIX
export type TipoPix = 'cpf' | 'email' | 'telefone' | 'chave_aleatoria';

// Interfaces base
export interface BaseEntity {
  id?: number;
  criado_em?: string;
  atualizado_em?: string;
}

export interface EnderecoBase {
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface ContatoBase {
  nome: string;
  email: string;
  telefone: string;
}

// Interface base para veículos
export interface VeiculoBase {
  tipo: TipoVeiculo;
  placa?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
}

// Interface base para funções
export interface FuncaoBase {
  funcao: string;
}

// Interface base para regiões
export interface RegiaoBase {
  regiao: string;
}

// Interface base para prestador
export interface PrestadorCommon {
  id?: number;
  nome: string;
  cpf: string;
  cod_nome: string;
  telefone: string;
  email: string;
  tipo_pix: string;
  chave_pix: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  aprovado: boolean;
  origem?: OrigemCadastro;
  franquia_horas: string;
}

// Type guards
export const isTipoVeiculo = (value: unknown): value is TipoVeiculo => {
  return typeof value === 'string' && tiposVeiculo.includes(value as TipoVeiculo);
};

export const isTipoFuncao = (value: unknown): value is TipoFuncao => {
  return typeof value === 'string' && funcoesDisponiveis.includes(value as TipoFuncao);
};

export const isOrigemCadastro = (origem: string): origem is OrigemCadastro => {
  return ['Site', 'cadastro_publico', 'interno'].includes(origem);
};

// Funções de validação
export const isMonetaryValue = (value: unknown): value is MonetaryValue => {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    const numericValue = value.replace(/[^\\d.,]/g, '').replace(',', '.');
    return !isNaN(parseFloat(numericValue));
  }
  return false;
};

// Funções de formatação
export const formatarRegiao = (regiao: Regiao): string => {
  switch (regiao) {
    case 'NORTE':
      return 'Zona Norte';
    case 'SUL':
      return 'Zona Sul';
    case 'LESTE':
      return 'Zona Leste';
    case 'OESTE':
      return 'Zona Oeste';
    case 'CENTRO':
      return 'Centro';
    case 'GRANDE_SP':
      return 'Grande São Paulo';
    case 'LITORAL':
      return 'Litoral';
    case 'INTERIOR':
      return 'Interior';
    default:
      return regiao;
  }
}; 