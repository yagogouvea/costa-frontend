import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const formatDateShort = (date: Date | string | undefined): string => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatTime = (date: Date | string | undefined): string => {
  if (!date) return '-';
  return format(new Date(date), 'HH:mm', { locale: ptBR });
}; 