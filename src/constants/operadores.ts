/**
 * Constantes relacionadas aos operadores do sistema
 */

// Lista de operadores disponíveis para abertura e edição de ocorrências
export const OPERADORES = [
  'Bia',
  'Joyce', 
  'Junior',
  'Laura',
  'Camila',
  'Rodrigo',
  'Gabrielle',
  'Marcelo',
  'Wellington',
  'Costa'
] as const;

// Tipo TypeScript derivado da lista de operadores
export type Operador = typeof OPERADORES[number];

// Função utilitária para verificar se um valor é um operador válido
export const isOperadorValido = (valor: string): valor is Operador => {
  return OPERADORES.includes(valor as Operador);
};

// Função para obter a lista de operadores como opções para select
export const getOperadoresOptions = () => {
  return OPERADORES.map(operador => ({
    value: operador,
    label: operador
  }));
};


