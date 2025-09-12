/**
 * Utilitários para formatação de resultados de ocorrências
 * Mapeia os valores salvos pelo StatusRecuperacaoPopup para o formato de exibição desejado
 */

export const formatarResultadoCompleto = (resultado?: string | null, subResultado?: string | null): string => {
  if (!resultado) return '-';

  // Mapear resultado + sub_resultado para o formato desejado
  switch (resultado) {
    case 'RECUPERADO':
      if (subResultado === 'COM_RASTREIO') {
        return 'Recuperado com rastreio';
      } else if (subResultado === 'SEM_RASTREIO') {
        return 'Recuperado sem rastreio';
      } else if (subResultado === 'SEM_RASTREIO_COM_CONSULTA_APOIO') {
        return 'Recuperado com consulta do apoio';
      } else {
        return 'Recuperado';
      }
    
    case 'NAO_RECUPERADO':
      return 'Não recuperado';
    
    case 'CANCELADO':
      return 'Cancelado';
    
    case 'LOCALIZADO':
      return 'Localizado (simples verificação)';
    
    default:
      return resultado.replace(/_/g, ' ').toLowerCase();
  }
};

export const formatarResultadoSimples = (resultado?: string | null): string => {
  if (!resultado) return '-';
  
  switch (resultado) {
    case 'RECUPERADO':
      return 'Recuperado';
    case 'NAO_RECUPERADO':
      return 'Não recuperado';
    case 'CANCELADO':
      return 'Cancelado';
    case 'LOCALIZADO':
      return 'Localizado (simples verificação)';
    default:
      return resultado.replace(/_/g, ' ').toLowerCase();
  }
};
