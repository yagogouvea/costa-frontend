/**
 * Função utilitária para normalizar texto (remover acentos e converter para minúsculas)
 * Útil para buscas insensíveis a acentos e maiúsculas/minúsculas
 */
export const normalizarTexto = (texto: string): string => {
  if (!texto || typeof texto !== 'string') return '';
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim();
};

/**
 * Função para comparar dois textos de forma insensível a acentos e maiúsculas/minúsculas
 */
export const compararTexto = (texto1: string, texto2: string): boolean => {
  return normalizarTexto(texto1) === normalizarTexto(texto2);
};

/**
 * Função para verificar se um texto contém outro de forma insensível a acentos
 */
export const textoContem = (textoPrincipal: string, textoBusca: string): boolean => {
  const principal = normalizarTexto(textoPrincipal);
  const busca = normalizarTexto(textoBusca);
  return principal.includes(busca);
};

/**
 * Função para filtrar array de strings baseado em um termo de busca
 */
export const filtrarPorTexto = (array: string[], termoBusca: string): string[] => {
  const termoNormalizado = normalizarTexto(termoBusca);
  return array.filter(item => textoContem(item, termoNormalizado));
}; 