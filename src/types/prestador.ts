import { 
  TipoFuncao, 
  TipoVeiculo, 
  Regiao 
} from './base';

export type TipoPix = 'cpf' | 'email' | 'telefone' | 'chave_aleatoria';
export type OrigemCadastro = 'Site' | 'Indicacao' | 'Outro' | 'cadastro_publico';

export interface PrestadorBase {
  id?: number;
  nome: string;
  cpf: string;
  cod_nome: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  aprovado: boolean;
  origem?: OrigemCadastro;
  funcoes: TipoFuncao[];
  tipo_veiculo: TipoVeiculo[];
  veiculos: { tipo: TipoVeiculo }[];
  regioes: Regiao[];
  valor_acionamento?: string | number;
  valor_hora_adc?: string | number;
  valor_km_adc?: string | number;
  franquia_km?: string | number;
  franquia_horas?: string;
  tipo_pix: TipoPix;
  chave_pix: string;
  modelo_antena?: string; // Campo para antenista
}

export interface Prestador extends PrestadorBase {
  id: number;
  valor_acionamento: number;
  valor_hora_adc: number;
  valor_km_adc: number;
  franquia_km: number;
}

export interface PrestadorForm extends PrestadorBase {
  valor_acionamento: string;
  valor_hora_adc: string;
  valor_km_adc: string;
  franquia_km: string;
  tipo_pix: TipoPix;
  chave_pix: string;
}

export type { TipoFuncao, TipoVeiculo } from './base';
