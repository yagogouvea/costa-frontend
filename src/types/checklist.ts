export interface CheckList {
  id: number;
  ocorrencia_id: number;
  
  // Removido: destino_veiculo - agora é título do popup
  
  // Loja
  loja_selecionada?: boolean;
  nome_loja?: string | null;
  endereco_loja?: string | null;
  nome_atendente?: string | null;
  matricula_atendente?: string | null;
  
  // Guincho
  guincho_selecionado?: boolean;
  tipo_guincho?: string | null;
  valor_guincho?: string | null;
  telefone_guincho?: string | null;
  nome_empresa_guincho?: string | null;
  nome_motorista_guincho?: string | null;
  destino_guincho?: string | null;
  endereco_destino_guincho?: string | null;
  
  // Apreensão
  apreensao_selecionada?: boolean;
  nome_dp_batalhao?: string | null;
  endereco_apreensao?: string | null;
  numero_bo_noc?: string | null;
  
  // Recuperado com chave
  recuperado_com_chave?: string | null;
  
  // Posse do veículo
  posse_veiculo?: string | null;
  observacao_posse?: string | null;
  
  // Avarias
  avarias?: string | null;
  detalhes_avarias?: string | null;
  
  // Fotos
  fotos_realizadas?: string | null;
  justificativa_fotos?: string | null;
  
  // Observação geral
  observacao_ocorrencia?: string | null;
  
  criado_em: string;
  atualizado_em: string;
}

export interface CreateCheckListDTO {
  ocorrencia_id: number;
  
  // Loja
  loja_selecionada?: boolean;
  nome_loja?: string;
  endereco_loja?: string;
  nome_atendente?: string;
  matricula_atendente?: string;
  
  // Guincho
  guincho_selecionado?: boolean;
  tipo_guincho?: string;
  valor_guincho?: string;
  telefone_guincho?: string;
  nome_empresa_guincho?: string;
  nome_motorista_guincho?: string;
  destino_guincho?: string;
  endereco_destino_guincho?: string;
  
  // Apreensão
  apreensao_selecionada?: boolean;
  nome_dp_batalhao?: string;
  endereco_apreensao?: string;
  numero_bo_noc?: string;
  
  // Recuperado com chave
  recuperado_com_chave?: string;
  
  // Posse do veículo
  posse_veiculo?: string;
  observacao_posse?: string;
  
  // Avarias
  avarias?: string;
  detalhes_avarias?: string;
  
  // Fotos
  fotos_realizadas?: string;
  justificativa_fotos?: string;
  
  // Observação geral
  observacao_ocorrencia?: string;
}
