/**
 * Configuração dinâmica da API baseada no ambiente
 * Prioriza diferentes URLs conforme o hostname detectado
 */

const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // 1. Ambiente de desenvolvimento local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // 2. Domínio oficial de produção Costa & Camargo
  if (hostname === 'painel.costaecamargo.seg.br') {
    return 'https://api.costaecamargo.seg.br';
  }

  // 3. Ambiente Railway (mantém URL antiga por compatibilidade)
  if (hostname.includes('.up.railway.app')) {
    return 'https://web-production-19090.up.railway.app';
  }

  // 4. Domínios Segtrack
  if (hostname === 'app.painelsegtrack.com.br' || hostname === 'cliente.painelsegtrack.com.br') {
    return 'https://api.costaecamargo.seg.br';
  }

  // 5. Fallback seguro para outros ambientes - usar HTTPS em produção
  if (protocol === 'https:') {
    return 'https://api.costaecamargo.seg.br';
  }
  
  // 6. Fallback para desenvolvimento
  return 'http://localhost:3001';
};

// URL da API baseada no ambiente atual
export const API_URL = getApiUrl();

// Configurações adicionais da API
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: {
    development: 10000,
    production: 30000
  },
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  }
};

// Configuração do Google Maps
export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || null,
  isAvailable: !!(import.meta.env.VITE_GOOGLE_MAPS_KEY),
  directionsApiUrl: 'https://maps.googleapis.com/maps/api/directions/json'
};

// Log da configuração em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    apiUrl: API_URL,
    environment: import.meta.env.MODE,
    fullUrl: `${API_URL}/api/auth/login`,
    googleMapsAvailable: GOOGLE_MAPS_CONFIG.isAvailable
  });
} else {
  // Log em produção para debug
  console.log('🔧 API Configuration (Production):', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    apiUrl: API_URL,
    environment: import.meta.env.MODE,
    fullUrl: `${API_URL}/api/auth/login`,
    googleMapsAvailable: GOOGLE_MAPS_CONFIG.isAvailable
  });
} 