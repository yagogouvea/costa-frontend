// src/types/prestadorPublico.ts

import { TipoVeiculo } from './base';

export type TipoPix = 'cpf' | 'email' | 'telefone' | 'chave_aleatoria';

// Tipos de função específicos para prestadores públicos
export type TipoFuncao = 'Pronta resposta' | 'Apoio armado' | 'Policial' | 'Antenista' | 'Drone';
export const funcoesPublicasDisponiveis: TipoFuncao[] = ['Pronta resposta', 'Apoio armado', 'Policial', 'Antenista', 'Drone'];

export const tiposPix: TipoPix[] = ['cpf', 'email', 'telefone', 'chave_aleatoria'];

export interface VeiculoBase {
  tipo: TipoVeiculo;
}

export interface PrestadorPublicoInput {
  nome: string;
  cpf: string;
  cod_nome: string; // Codinome: como gostaria de ser chamado
  telefone: string; // Ex: 11 91234-5678
  email: string;    // Ex: nome@exemplo.com
  tipo_pix: TipoPix;
  chave_pix: string;
  cep: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  funcoes: TipoFuncao[];
  regioes: string[];     // Localidades de atuação
  tipo_veiculo: TipoVeiculo[];
  veiculos: VeiculoBase[];
}

export interface PrestadorPublicoForm {
  nome: string;
  cpf: string;
  cod_nome: string;
  telefone: string;
  email: string;
  tipo_pix: TipoPix;
  chave_pix: string;
  cep: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  funcoes: TipoFuncao[];
  regioes: string[];
  tipo_veiculo: TipoVeiculo[];
  modelo_antena?: string; // Novo campo para antenista
  veiculos: VeiculoBase[];
  // Removidos os campos de valores: valor_acionamento, valor_hora_adc, valor_km_adc
  // Esses valores são preenchidos internamente pelos funcionários
}

export interface PrestadorPublicoPayload {
  nome: string;
  cpf: string;
  cod_nome: string;
  telefone: string;
  email: string;
  tipo_pix: TipoPix;
  chave_pix: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  funcoes: TipoFuncao[];
  regioes: string[];
  tipo_veiculo: TipoVeiculo[];
  modelo_antena?: string; // Campo para antenista
  // Campos adicionais que o backend adiciona automaticamente
  aprovado: boolean;
  valor_acionamento: string;
  valor_hora_adc: string;
  valor_km_adc: string;
  franquia_km: string;
  franquia_horas: string;
  veiculos?: VeiculoBase[]; // Opcional pois o backend não o espera no input
}

export const mapFormToPayloadPublico = (form: PrestadorPublicoForm): PrestadorPublicoPayload => {
  // Remover o campo veiculos do payload pois o backend não o espera
  const { veiculos, ...formWithoutVeiculos } = form;
  
  const payload: PrestadorPublicoPayload = {
    ...formWithoutVeiculos,
    tipo_pix: form.tipo_pix as TipoPix,
    endereco: form.endereco || '',
    bairro: form.bairro || '',
    cidade: form.cidade || '',
    estado: form.estado || '',
    aprovado: false,
    valor_acionamento: '0',
    valor_hora_adc: '0',
    valor_km_adc: '0',
    franquia_km: '0',
    franquia_horas: '0',
    funcoes: form.funcoes,
    regioes: form.regioes,
    tipo_veiculo: form.tipo_veiculo,
    modelo_antena: form.modelo_antena || undefined,
  };
  return payload;
};

// Dica adicional: você pode expandir esse tipo para incluir validações com Zod ou Joi futuramente.
// Exemplo com Zod:
// import { z } from 'zod';
// export const PrestadorPublicoSchema = z.object({ nome: z.string(), ... });