import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Date formatting
export function formatDateTime(date: string | Date | null): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatTime(date: string | Date | null): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'HH:mm', { locale: ptBR });
}

// Time input formatting
export function formatTimeInput(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length <= 2) return clean;
  return clean.slice(0, 2) + ':' + clean.slice(2);
}

// Money formatting
export const formatMoney = (value: string | number): string => {
  if (typeof value === 'string') {
    if (value.includes('R$')) {
      return value;
    }
    value = parseFloat(value);
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Phone formatting
export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

// CNPJ formatting
export function formatCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

// CPF formatting
export function formatCPF(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

export function abreviarNomeCliente(nome: string): string {
  if (!nome || typeof nome !== 'string') return '';
  
  try {
    // Remove espaços extras e divide em palavras
    const palavras = nome.trim().split(/\s+/);
    
    // Se tem apenas uma palavra, retorna ela
    if (palavras.length === 1) return palavras[0];
    
    // Se tem duas ou mais palavras, retorna as duas primeiras
    return palavras.slice(0, 2).join(' ');
  } catch (error) {
    console.error('Erro ao abreviar nome do cliente:', error, 'nome:', nome);
    return String(nome || '');
  }
} 