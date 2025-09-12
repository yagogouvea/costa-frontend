/**
 * Utilitários para classificação de cidades
 * Centraliza a lógica de determinação de regiões baseada em cidades
 */

// Lista completa de cidades da Grande São Paulo
export const CIDADES_GRANDE_SP = [
  'ARUJA', 'BARUERI', 'BIRITIBA-MIRIM', 'CAIEIRAS', 'CAJAMAR',
  'CARAPICUIBA', 'COTIA', 'DIADEMA', 'EMBU-GUACU', 'EMBU DAS ARTES',
  'FERRAZ DE VASCONCELOS', 'FRANCISCO MORATO', 'FRANCO DA ROCHA',
  'GUARULHOS', 'GUAIANASES', 'ITAPECERICA DA SERRA', 'ITAPEVI',
  'ITAQUAQUECETUBA', 'JANDIRA', 'JUQUITIBA', 'MAIRIPORA',
  'MAUA', 'MOGI DAS CRUZES', 'OSASCO', 'POA', 'RIBEIRAO PIRES',
  'RIO GRANDE DA SERRA', 'SANTA ISABEL', 'SANTANA DE PARNAIBA',
  'SANTO ANDRE', 'SAO BERNARDO', 'SAO CAETANO', 'SUZANO',
  'TABOAO DA SERRA', 'VARGEM GRANDE PAULISTA'
];

// Lista completa de cidades de São Paulo e Grande São Paulo (Capital + Grande SP)
export const CIDADES_SAO_PAULO_E_GRANDE_SP = [
  'SAO PAULO', // Capital
  ...CIDADES_GRANDE_SP // Grande São Paulo
];

/**
 * Normaliza o nome de um estado para sigla
 */
export const normalizarEstado = (estado: string = ''): string => {
  const estadoNormalizado = estado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  const mapaEstados: Record<string, string> = {
    'ACRE': 'AC',
    'ALAGOAS': 'AL',
    'AMAPA': 'AP',
    'AMAZONAS': 'AM',
    'BAHIA': 'BA',
    'CEARA': 'CE',
    'DISTRITO FEDERAL': 'DF',
    'ESPIRITO SANTO': 'ES',
    'GOIAS': 'GO',
    'MARANHAO': 'MA',
    'MATO GROSSO': 'MT',
    'MATO GROSSO DO SUL': 'MS',
    'MINAS GERAIS': 'MG',
    'PARA': 'PA',
    'PARAIBA': 'PB',
    'PARANA': 'PR',
    'PERNAMBUCO': 'PE',
    'PIAUI': 'PI',
    'RIO DE JANEIRO': 'RJ',
    'RIO GRANDE DO NORTE': 'RN',
    'RIO GRANDE DO SUL': 'RS',
    'RONDONIA': 'RO',
    'RORAIMA': 'RR',
    'SANTA CATARINA': 'SC',
    'SAO PAULO': 'SP',
    'SERGIPE': 'SE',
    'TOCANTINS': 'TO'
  };

  return mapaEstados[estadoNormalizado] || estadoNormalizado;
};

/**
 * Determina a macro região de uma cidade
 * @param estado Estado da cidade
 * @param cidade Nome da cidade
 * @returns 'CAPITAL' | 'GRANDE SP' | 'INTERIOR' | 'OUTROS ESTADOS'
 */
export const definirMacro = (estado?: string | null, cidade?: string | null): string => {
  const estadoUF = normalizarEstado(estado || '');
  const cidadeNome = (cidade || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  if (!estadoUF || estadoUF !== 'SP') return 'OUTROS ESTADOS';

  if (cidadeNome.includes('SAO PAULO')) return 'CAPITAL';

  if (CIDADES_GRANDE_SP.some(c => cidadeNome.includes(c))) {
    return 'GRANDE SP';
  }

  return 'INTERIOR';
};

/**
 * Verifica se uma cidade pertence à Grande São Paulo
 * @param cidade Nome da cidade
 * @param estado Estado da cidade
 * @returns true se a cidade pertence à Grande São Paulo
 */
export const isGrandeSP = (cidade?: string | null, estado?: string | null): boolean => {
  const macro = definirMacro(estado, cidade);
  return macro === 'GRANDE SP';
};

/**
 * Verifica se uma cidade pertence à Capital (São Paulo)
 * @param cidade Nome da cidade
 * @param estado Estado da cidade
 * @returns true se a cidade pertence à Capital
 */
export const isCapital = (cidade?: string | null, estado?: string | null): boolean => {
  const macro = definirMacro(estado, cidade);
  return macro === 'CAPITAL';
};

/**
 * Verifica se uma cidade pertence a São Paulo e Grande São Paulo (Capital + Grande SP)
 * @param cidade Nome da cidade
 * @param estado Estado da cidade
 * @returns true se a cidade pertence a São Paulo ou Grande São Paulo
 */
export const isSaoPauloEGrandeSP = (cidade?: string | null, estado?: string | null): boolean => {
  const macro = definirMacro(estado, cidade);
  return macro === 'CAPITAL' || macro === 'GRANDE SP';
};

/**
 * Verifica se uma cidade pertence ao Interior de SP
 * @param cidade Nome da cidade
 * @param estado Estado da cidade
 * @returns true se a cidade pertence ao Interior
 */
export const isInterior = (cidade?: string | null, estado?: string | null): boolean => {
  const macro = definirMacro(estado, cidade);
  return macro === 'INTERIOR';
};

/**
 * Verifica se uma cidade pertence a outros estados
 * @param cidade Nome da cidade
 * @param estado Estado da cidade
 * @returns true se a cidade pertence a outros estados
 */
export const isOutrosEstados = (cidade?: string | null, estado?: string | null): boolean => {
  const macro = definirMacro(estado, cidade);
  return macro === 'OUTROS ESTADOS';
};

/**
 * Retorna todas as cidades que pertencem a uma região específica
 * @param regiao Região desejada
 * @returns Array com nomes das cidades
 */
export const getCidadesPorRegiao = (regiao: 'CAPITAL' | 'GRANDE_SP' | 'SAO_PAULO_E_GRANDE_SP'): string[] => {
  switch (regiao) {
    case 'CAPITAL':
      return ['SAO PAULO'];
    case 'GRANDE_SP':
      return CIDADES_GRANDE_SP;
    case 'SAO_PAULO_E_GRANDE_SP':
      return CIDADES_SAO_PAULO_E_GRANDE_SP;
    default:
      return [];
  }
};
