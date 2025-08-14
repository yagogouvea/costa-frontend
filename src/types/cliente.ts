// src/types/cliente.ts

export type TipoContrato = 'PADRAO_REGIAO' | 'ACL_KM' | 'PADRAO_FIXO' | 'VALOR_FECHADO';

export interface ValorPorRegiao {
  regiao: 'CAPITAL' | 'GRANDE_SP' | 'INTERIOR' | 'OUTROS_ESTADOS';
  valor_acionamento: number;
  valor_hora_adicional: number;
  valor_km_adicional: number;
  valor_acionamento_nao_recuperado?: number; // Valor diferenciado para não recuperados
}

export interface FranquiaBase {
  horas: string; // formato "HH:mm"
  km: number;
}

// Contrato Tipo 1 - Valores por região com franquia
export interface ContratoPadraoRegiao {
  tipo: 'PADRAO_REGIAO';
  franquia: FranquiaBase;
  valores_por_regiao: ValorPorRegiao[];
  cobranca_nao_recuperado: boolean; // Indica se tem valor diferenciado para não recuperados
}

// Contrato Tipo 2 - ACL (Valor por KM)
export interface ContratoACL {
  tipo: 'ACL_KM';
  valor_km: number;
}

// Contrato Tipo 3 - Padrão com valores fixos
export interface ContratoPadraoFixo {
  tipo: 'PADRAO_FIXO';
  franquia: FranquiaBase;
  valor_acionamento: number;
  valor_hora_adicional: number;
  valor_km_adicional: number;
}

// Contrato Tipo 4 - Valor Fechado
export interface ContratoValorFechado {
  tipo: 'VALOR_FECHADO';
  permite_negociacao: boolean; // Se permite negociar valor por atendimento
  valor_padrao?: number; // Valor base sugerido (opcional)
  franquia?: FranquiaBase; // Franquia opcional
  valor_hora_adicional?: number; // Valores adicionais opcionais
  valor_km_adicional?: number;
}

// União de todos os tipos de contrato
export type Contrato = 
  | ContratoPadraoRegiao 
  | ContratoACL 
  | ContratoPadraoFixo 
  | ContratoValorFechado;

export interface Contato {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  cnpj: string;
  contato: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  regiao: 'CAPITAL' | 'GRANDE_SP' | 'INTERIOR';
  tipo_contrato: 'MENSAL' | 'ANUAL';
  valor_contrato: string;
  horario_inicio: string;
  horario_fim: string;
  logo?: string; // Caminho para o logo do cliente
  contratos: Contrato[];
  nome_fantasia?: string | null;
}

export interface ClienteFormData {
  nome: string;
  cnpj: string;
  contato: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  regiao: 'CAPITAL' | 'GRANDE_SP' | 'INTERIOR';
  tipo_contrato: 'MENSAL' | 'ANUAL';
  valor_contrato: string;
  horario_inicio: string;
  horario_fim: string;
  logo?: string;
  nome_fantasia?: string;
  contratos: ContratoFormData[];
}

// Interface para o formulário de edição de cliente
export interface ContratoFormData {
  nome_interno: string;
  tipo: TipoContrato;
  regiao?: 'CAPITAL' | 'GRANDE_SP' | 'INTERIOR' | 'OUTROS_ESTADOS';
  valor_acionamento?: string | number;
  valor_nao_recuperado?: string | number;
  valor_hora_extra?: string | number;
  valor_km_extra?: string | number;
  valor_km?: string | number;
  valor_base?: string | number;
  franquia_horas?: string;
  franquia_km?: string | number;
  permite_negociacao?: boolean;
}

// Função para converter string para número
function toNumber(value: string | number | undefined): number | undefined {
  if (typeof value === 'undefined') return undefined;
  if (typeof value === 'number') return value;
  const numeric = value.replace(/[^\d.-]/g, "");
  return numeric ? parseFloat(numeric) : undefined;
}

// Função para converter ContratoFormData para Contrato
export function converterParaContrato(form: ContratoFormData): Contrato {
  switch (form.tipo) {
    case 'PADRAO_REGIAO':
      return {
        tipo: 'PADRAO_REGIAO',
        franquia: {
          horas: form.franquia_horas || '00:00',
          km: toNumber(form.franquia_km) || 0
        },
        valores_por_regiao: form.regiao ? [{
          regiao: form.regiao,
          valor_acionamento: toNumber(form.valor_acionamento) || 0,
          valor_hora_adicional: toNumber(form.valor_hora_extra) || 0,
          valor_km_adicional: toNumber(form.valor_km_extra) || 0,
          valor_acionamento_nao_recuperado: toNumber(form.valor_nao_recuperado)
        }] : [],
        cobranca_nao_recuperado: !!form.valor_nao_recuperado
      };
    case 'ACL_KM':
      return {
        tipo: 'ACL_KM',
        valor_km: toNumber(form.valor_km) || 0
      };
    case 'PADRAO_FIXO':
      return {
        tipo: 'PADRAO_FIXO',
        franquia: {
          horas: form.franquia_horas || '00:00',
          km: toNumber(form.franquia_km) || 0
        },
        valor_acionamento: toNumber(form.valor_acionamento) || 0,
        valor_hora_adicional: toNumber(form.valor_hora_extra) || 0,
        valor_km_adicional: toNumber(form.valor_km_extra) || 0
      };
    case 'VALOR_FECHADO':
      return {
        tipo: 'VALOR_FECHADO',
        permite_negociacao: form.permite_negociacao || false,
        valor_padrao: toNumber(form.valor_base),
        franquia: form.franquia_horas ? {
          horas: form.franquia_horas,
          km: toNumber(form.franquia_km) || 0
        } : undefined,
        valor_hora_adicional: toNumber(form.valor_hora_extra),
        valor_km_adicional: toNumber(form.valor_km_extra)
      };
  }
}

// Função para converter Contrato para ContratoFormData
export function converterParaFormData(contrato: Contrato): ContratoFormData {
  const toStringOrEmpty = (v: any) => (v !== undefined && v !== null ? String(v) : '');
  
  // Mapeamento dos tipos do backend para o frontend
  const tipoMap: Record<string, string> = {
    'padrao_regiao': 'PADRAO_REGIAO',
    'acl_km': 'ACL_KM',
    'padrao_fixo': 'PADRAO_FIXO',
    'valor_fechado': 'VALOR_FECHADO'
  };
  
  const base: ContratoFormData = {
    nome_interno: (contrato as any).nome_interno || 'Principal',
    tipo: (tipoMap[(contrato as any).tipo] || (contrato as any).tipo) as any
  };

  const tipoContrato = (contrato as any).tipo;

  switch (tipoContrato) {
    case 'padrao_regiao':
      return {
        ...base,
        regiao: (contrato as any).regiao || (contrato as any).valores_por_regiao?.[0]?.regiao,
        valor_acionamento: toStringOrEmpty((contrato as any).valor_acionamento ?? (contrato as any).valores_por_regiao?.[0]?.valor_acionamento),
        valor_hora_extra: toStringOrEmpty((contrato as any).valor_hora_extra ?? (contrato as any).valores_por_regiao?.[0]?.valor_hora_adicional),
        valor_km_extra: toStringOrEmpty((contrato as any).valor_km_extra ?? (contrato as any).valores_por_regiao?.[0]?.valor_km_adicional),
        valor_nao_recuperado: toStringOrEmpty((contrato as any).valor_nao_recuperado ?? (contrato as any).valores_por_regiao?.[0]?.valor_acionamento_nao_recuperado),
        franquia_horas: toStringOrEmpty((contrato as any).franquia_horas ?? (contrato as any).franquia?.horas),
        franquia_km: toStringOrEmpty((contrato as any).franquia_km ?? (contrato as any).franquia?.km)
      };
    case 'acl_km':
      return {
        ...base,
        valor_km: toStringOrEmpty((contrato as any).valor_km)
      };
    case 'padrao_fixo':
      return {
        ...base,
        valor_acionamento: toStringOrEmpty((contrato as any).valor_acionamento),
        valor_hora_extra: toStringOrEmpty((contrato as any).valor_hora_adicional),
        valor_km_extra: toStringOrEmpty((contrato as any).valor_km_adicional),
        franquia_horas: toStringOrEmpty((contrato as any).franquia?.horas),
        franquia_km: toStringOrEmpty((contrato as any).franquia?.km)
      };
    case 'valor_fechado':
      return {
        ...base,
        valor_base: toStringOrEmpty((contrato as any).valor_padrao),
        permite_negociacao: (contrato as any).permite_negociacao,
        franquia_horas: toStringOrEmpty((contrato as any).franquia?.horas),
        franquia_km: toStringOrEmpty((contrato as any).franquia?.km),
        valor_hora_extra: toStringOrEmpty((contrato as any).valor_hora_adicional),
        valor_km_extra: toStringOrEmpty((contrato as any).valor_km_adicional)
      };
    default:
      console.warn('Tipo de contrato não reconhecido:', tipoContrato);
      return base;
  }
}
