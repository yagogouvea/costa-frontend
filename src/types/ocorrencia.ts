export type OcorrenciaStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando';

export interface DespesaDetalhada {
  tipo: string;
  valor: number;
  descricao?: string;
}

export interface Foto {
  id: number | null;
  url: string;
  legenda: string;
  cropX?: number;
  cropY?: number;
  zoom?: number;
  cropArea?: any;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CreateOcorrenciaDTO {
  placa1: string;
  placa2?: string | null;
  placa3?: string | null;
  cliente: string;
  sub_cliente?: string | null;
  tipo: string;
  tipo_veiculo?: string | null;
  modelo1?: string | null;
  cor1?: string | null;
  coordenadas?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  prestador?: string | null;
  inicio?: string | null;
  chegada?: string | null;
  termino?: string | null;
  km?: string;
  data_acionamento?: string | null;
  despesas?: number;
  despesas_detalhadas?: DespesaDetalhada[];
  fotos?: Foto[];
  status: OcorrenciaStatus;
  resultado?: string;
  sub_resultado?: string;
  observacoes?: string;
  operador?: string;

  // Novos campos para horários
  data_chamado?: string | null;
  hora_chamado?: string | null;
  data_recuperacao?: string | null;
  chegada_qth?: string | null;
  local_abordagem?: string | null;
  destino?: string | null;
  tipo_remocao?: string | null;
  endereco_loja?: string | null;
  nome_loja?: string | null;
  nome_guincho?: string | null;
  endereco_base?: string | null;
  detalhes_local?: string | null;

  // Campos específicos ITURAN
  os?: string | null;
  origem_bairro?: string | null;
  origem_cidade?: string | null;
  origem_estado?: string | null;

  // Campos específicos MARFRIG
  cpf_condutor?: string | null;
  nome_condutor?: string | null;
  transportadora?: string | null;
  valor_carga?: number | null;
  notas_fiscais?: string | null;
  planta_origem?: string | null;
  cidade_destino?: string | null;
  km_acl?: string | null;

  // Campo específico OPENTECH
  operacao?: string | null;
  
  // Campo específico BRK
  conta?: string | null;
}

export interface Ocorrencia {
  id: number;
  placa1: string;
  placa2?: string | null;
  placa3?: string | null;
  cliente: string;
  sub_cliente?: string | null;
  tipo: string;
  tipo_veiculo?: string | null;
  modelo1?: string | null;
  cor1?: string | null;
  coordenadas?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  prestador?: string | null;
  inicio?: string | null;
  chegada?: string | null;
  termino?: string | null;
  km?: string;
  km_inicial?: string | null;
  km_final?: string | null;
  data_acionamento?: string | null;
  despesas?: number;
  despesas_detalhadas?: DespesaDetalhada[];
  fotos?: Foto[];
  status: OcorrenciaStatus;
  resultado?: string;
  sub_resultado?: string;
  observacoes?: string;
  descricao?: string | null;
  passagem_servico?: string | null;
  criado_em: string;
  atualizado_em: string;
  encerrada_em?: string | null;
  tem_fotos?: boolean;
  
  // Novos campos para horários
  data_chamado?: string | null;
  hora_chamado?: string | null;
  data_recuperacao?: string | null;
  chegada_qth?: string | null;
  local_abordagem?: string | null;
  destino?: string | null;
  tipo_remocao?: string | null;
  endereco_loja?: string | null;
  nome_loja?: string | null;
  nome_guincho?: string | null;
  endereco_base?: string | null;
  detalhes_local?: string | null;
  
  // Campos específicos ITURAN
  os?: string | null;
  origem_bairro?: string | null;
  origem_cidade?: string | null;
  origem_estado?: string | null;

  // Campos específicos MARFRIG
  cpf_condutor?: string | null;
  nome_condutor?: string | null;
  transportadora?: string | null;
  valor_carga?: number | null;
  notas_fiscais?: string | null;
  planta_origem?: string | null;
  cidade_destino?: string | null;
  km_acl?: string | null;
  operador?: string;

  // Campo específico OPENTECH
  operacao?: string | null;
  
  // Campo específico BRK
  conta?: string | null;
  
  // ✅ DADOS FINANCEIROS DO PRESTADOR (como no app do prestador)
  valor_acionamento?: number | null;
  valor_hora_adc?: number | null;
  valor_km_adc?: number | null;
  valor_pago_prestador?: number | null;
  franquia_horas?: string | null;
  franquia_km?: number | null;
  
  // ✅ NOVOS CAMPOS DO CLIENTE
  cliente_nome_fantasia?: string | null;
  
  // ✅ RELACIONAMENTOS
  checklist?: any;
}

export interface OcorrenciaFormatada extends Omit<Ocorrencia, 'inicio' | 'chegada' | 'termino' | 'encerrada_em'> {
  inicio: string | null;
  chegada: string | null;
  termino: string | null;
  encerradaEm: string | null;
  tem_fotos: boolean;
  operador?: string;
}
