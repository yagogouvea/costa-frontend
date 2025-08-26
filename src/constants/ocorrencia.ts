/**
 * Constantes relacionadas às ocorrências
 */

// Tipos de veículo - Lista unificada e mais completa
export const TIPOS_VEICULO = [
  'Carro',
  'Moto', 
  'Caminhão',
  'Carreta',
  'Van',
  'Utilitário',
  'Passeio',
  'Ônibus',
  'Outro'
] as const;

// Tipos de ocorrência padrão
export const TIPOS_OCORRENCIA_PADRAO = [
  'Roubo',
  'Furto',
  'Simples Verificação',
  'Apropriação',
  'Suspeita',
  'Investigação',
  'Preservação',
  'Antenista (roubo)',
  'Antenista (furto)',
  'Antenista (suspeita)'
] as const;

// Tipos de ocorrência removidos - clientes Ituran e Marfrig não são utilizados neste sistema

// Operações Opentech
export const OPERACOES_OPENTECH = [
  'OPERAÇÃO PADRÃO',
  'OPENTECH CONTRAVALE',
  'OPENTECH LACTALIS',
  'OPENTECH OP. MINERVA',
  'OPENTECH AGV - RONDA',
  'OPENTECH AGV - INVESTIGAÇÃO',
  'OPENTECH AGV - ACOMPANHAMENTO',
  'OPENTECH OP 4BIO',
  'OPENTECH OP. ESPECIAIS PRO FARMA'
] as const;

// Tipos TypeScript
export type TipoVeiculo = typeof TIPOS_VEICULO[number];
export type TipoOcorrenciaPadrao = typeof TIPOS_OCORRENCIA_PADRAO[number];
export type OperacaoOpentech = typeof OPERACOES_OPENTECH[number];

// Funções utilitárias
export const isClienteOpentech = (nomeCliente: string): boolean => {
  return nomeCliente.toUpperCase().includes('OPENTECH');
};

// Função para obter tipos de ocorrência - sempre retorna tipos padrão (não utilizada)
// export const getTiposOcorrenciaPorCliente = (nomeCliente: string) => {
//   return TIPOS_OCORRENCIA_PADRAO;
// };
