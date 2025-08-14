/// <reference types="vite/client" />

import axios, { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL, API_CONFIG } from '@/config/api';

const MAX_RETRIES = API_CONFIG.retry.maxRetries;
const RETRY_DELAY = API_CONFIG.retry.retryDelay;
const IS_DEV = import.meta.env.DEV;

// Interface estendida para incluir retryCount
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: IS_DEV ? API_CONFIG.timeout.development : API_CONFIG.timeout.production,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para delay entre retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    // Log request details in development
    if (IS_DEV) {
      console.log(`[${new Date().toISOString()}] Request:`, {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }

    // Add token to headers if available
    const token = localStorage.getItem('segtrack.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token adicionado ao header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('❌ Nenhum token encontrado no localStorage');
    }

    // Salvar informações da requisição para debug
    const requestDebugInfo = {
      timestamp: new Date().toISOString(),
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 20) : 'N/A'
    };
    localStorage.setItem('debug_api_request', JSON.stringify(requestDebugInfo));

    // Remove any double slashes in the URL except after http(s): and preserve /api paths
    if (config.url) {
      // Don't modify URLs that start with /api to avoid breaking API endpoints
      if (!config.url.startsWith('/api')) {
        config.url = config.url.replace(/([^:])\/+/g, '$1/');
      }
    }

    // Add retry count to config
    if (typeof config.retryCount === 'undefined') {
      config.retryCount = 0;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (IS_DEV) {
      console.log(`[${new Date().toISOString()}] Response:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (IS_DEV) {
      console.error('❌ Server Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        url: originalRequest?.url,
        requestData: originalRequest?.data,
        message: error.message
      });
    }

    // Retry logic for network errors or 5xx errors
    if (
      (error.message.includes('Network Error') || 
       (error.response && error.response.status >= 500)) &&
      originalRequest.retryCount < MAX_RETRIES
    ) {
      originalRequest.retryCount += 1;
      await delay(RETRY_DELAY * originalRequest.retryCount);
      return api(originalRequest);
    }

    // Handle specific error cases
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Ocorreu um erro na requisição';
      
      // Salvar informações do erro para debug
      const errorDebugInfo = {
        timestamp: new Date().toISOString(),
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest?.url,
        method: originalRequest?.method,
        errorMessage: errorMessage,
        responseData: error.response.data
      };
      localStorage.setItem('debug_api_error', JSON.stringify(errorDebugInfo));
      
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('segtrack.token');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          break;
        case 403:
          toast.error('Acesso negado. Você não tem permissão para acessar este recurso.');
          break;
        case 404:
          toast.error('Recurso não encontrado.');
          break;
        case 422:
          toast.error(errorMessage);
          break;
        case 429:
          toast.error('Muitas requisições. Por favor, aguarde um momento.');
          break;
        case 500:
          toast.error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
          break;
        default:
          toast.error(errorMessage);
      }
      
      return Promise.reject(new Error(errorMessage));
    }

    if (error.request) {
      const message = 'Servidor não respondeu à solicitação. Verifique sua conexão.';
      toast.error(message);
      return Promise.reject(new Error(message));
    }

    const message = 'Erro ao fazer requisição. Verifique sua conexão.';
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);

// API instance for external services (no credentials needed)
export const externalApi = axios.create({
  timeout: IS_DEV ? 5000 : 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add retry logic to external API as well
externalApi.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.message.includes('Network Error') &&
      (!originalRequest.retryCount || originalRequest.retryCount < MAX_RETRIES)
    ) {
      originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
      await delay(RETRY_DELAY * originalRequest.retryCount);
      return externalApi(originalRequest);
    }

    return Promise.reject(error);
  }
);

// External API helpers with proper typing
interface NominatimResponse {
  display_name: string;
  address: {
    city?: string;
    state?: string;
    country_code?: string;
  };
  lat?: string;
  lon?: string;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const geocodingApi = {
  async search(query: string): Promise<NominatimResponse[]> {
    try {
      const response = await externalApi.get<NominatimResponse[]>(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 5
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      toast.error('Erro ao buscar localização. Tente novamente.');
      return [];
    }
  }
};

export const cepApi = {
  async get(cep: string): Promise<ViaCEPResponse> {
    try {
      const response = await externalApi.get<ViaCEPResponse>(
        `https://viacep.com.br/ws/${cep}/json/`
      );
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw new Error('Erro ao buscar CEP. Verifique se o número está correto.');
    }
  }
};

export default api;
