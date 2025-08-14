import { Foto } from '@/types/ocorrencia';

export type OcorrenciaStatus = 'Em andamento' | 'Finalizada' | 'Cancelada' | 'Aguardando prestador';

export interface DespesaDetalhada {
  tipo: string;
  valor: number;
}

export interface Ocorrencia {
  id: number;
  placa1: string;
  placa2?: string | null;
  placa3?: string | null;
  modelo1?: string | null;
  cor1?: string | null;
  cliente: string;
  tipo: string;
  tipo_veiculo?: string | null;
  coordenadas?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cpf_condutor?: string | null;
  nome_condutor?: string | null;
  transportadora?: string | null;
  valor_carga?: number | null;
  notas_fiscais?: string | null;
  os?: string | null;
  origem_bairro?: string | null;
  origem_cidade?: string | null;
  origem_estado?: string | null;
  prestador?: string | null;
  inicio?: string | null;
  chegada?: string | null;
  termino?: string | null;
  km?: number | null;
  km_inicial?: number | null;
  km_final?: number | null;
  despesas?: number | null;
  despesas_detalhadas?: DespesaDetalhada[] | null;
  descricao?: string | null;
  resultado?: string | null;
  status: OcorrenciaStatus;
  encerradaEm?: string | null;
  data_acionamento?: string | null;
  criado_em?: string;
  atualizado_em?: string;
  fotos?: Foto[];
  tem_fotos?: boolean;
  passagem_servico?: string;
} 