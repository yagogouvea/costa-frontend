import { 
  Prestador, 
  PrestadorForm
} from '@/types/prestador';
import { MonetaryValue } from '@/types/base';

// Função para formatar valores monetários para exibição
export const formatarValorMonetario = (valor: MonetaryValue | null | undefined): string => {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valorNumerico);
};

// Função para formatar telefone para WhatsApp
export const formatarTelefoneParaWhatsApp = (telefone: string): string => {
  const numeroLimpo = telefone.replace(/\D/g, '');
  return `https://wa.me/55${numeroLimpo}`;
};

// Função para converter Prestador para PrestadorForm
export const convertPrestadorToPrestadorForm = (prestador: Prestador): PrestadorForm => {
  return {
    ...prestador,
    valor_acionamento: prestador.valor_acionamento?.toString() || '',
    valor_hora_adc: prestador.valor_hora_adc?.toString() || '',
    valor_km_adc: prestador.valor_km_adc?.toString() || '',
    franquia_km: prestador.franquia_km?.toString() || ''
  };
};

// Função para formatar data
export const formatarData = (data: string | Date | null | undefined): string => {
  if (!data) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data));
};

// Função para formatar telefone brasileiro visualmente
export const formatTelefoneBR = (valor: string): string => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }
  if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return valor;
}; 