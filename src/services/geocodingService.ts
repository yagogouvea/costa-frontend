// src/services/geocodingService.ts

import { GOOGLE_MAPS_CONFIG } from '@/config/api';

export interface SugestaoEndereco {
  id: string;
  descricao: string;
  enderecoCompleto: string;
  latitude: number;
  longitude: number;
  tipos: string[];
}

class GeocodingService {
  private apiKey: string | null = null;
  private cache = new Map<string, SugestaoEndereco[]>();

  constructor() {
    console.log('🔧 GeocodingService: Iniciando inicialização...');
    console.log('🌐 GOOGLE_MAPS_CONFIG:', GOOGLE_MAPS_CONFIG);
    console.log('🔑 API Key raw:', import.meta.env.VITE_GOOGLE_MAPS_KEY);
    
    this.apiKey = GOOGLE_MAPS_CONFIG.apiKey;
    console.log('🔧 GeocodingService: Inicializado');
    console.log('🔑 API Key disponível:', !!this.apiKey);
    console.log('🌐 Configuração Google Maps:', GOOGLE_MAPS_CONFIG);
  }

  // Verificar se API está disponível
  isApiDisponivel(): boolean {
    return GOOGLE_MAPS_CONFIG.isAvailable;
  }

  // Gerar chave de cache
  private gerarChaveCache(query: string): string {
    return query.toLowerCase().trim();
  }

  // Buscar sugestões de endereço
  async buscarSugestoes(query: string): Promise<SugestaoEndereco[]> {
    try {
      console.log('🔍 GeocodingService: Iniciando busca para:', query);
      
      // Limpar query
      const queryLimpa = query.trim();
      if (queryLimpa.length < 3) {
        console.log('❌ GeocodingService: Query muito curta');
        return [];
      }

      // Verificar cache
      const chaveCache = this.gerarChaveCache(queryLimpa);
      if (this.cache.has(chaveCache)) {
        console.log('📋 GeocodingService: Usando sugestões do cache');
        return this.cache.get(chaveCache)!;
      }

      // Se não há API key, usar sugestões locais
      if (!this.apiKey) {
        console.log('⚠️ GeocodingService: Sem API key do Google Maps, usando sugestões locais');
        const sugestoesLocais = this.buscarSugestoesLocais(queryLimpa);
        console.log('📋 GeocodingService: Sugestões locais encontradas:', sugestoesLocais.length);
        return sugestoesLocais;
      }

      console.log('🔍 Buscando sugestões via Google Maps API...');
      
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(queryLimpa)}&types=geocode&language=pt-BR&components=country:br&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        const sugestoes: SugestaoEndereco[] = data.predictions.map((prediction: any, index: number) => ({
          id: `google_${index}`,
          descricao: prediction.structured_formatting?.main_text || prediction.description,
          enderecoCompleto: prediction.description,
          latitude: 0, // Será preenchido se necessário
          longitude: 0, // Será preenchido se necessário
          tipos: prediction.types || []
        }));

        // Salvar no cache
        this.cache.set(chaveCache, sugestoes);
        
        console.log('✅ Sugestões encontradas:', sugestoes.length);
        return sugestoes;
      } else {
        console.error('❌ Erro na API do Google Maps:', data.status, data.error_message);
        return this.buscarSugestoesLocais(queryLimpa);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar sugestões:', error);
      return this.buscarSugestoesLocais(query.trim());
    }
  }

  // Buscar coordenadas para um endereço
  async buscarCoordenadas(endereco: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      if (!this.apiKey) {
        console.log('⚠️ Sem API key, não é possível buscar coordenadas precisas');
        return null;
      }

      console.log('📍 Buscando coordenadas para:', endereco);
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&language=pt-BR&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        console.log('✅ Coordenadas encontradas:', location);
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      } else {
        console.error('❌ Erro ao buscar coordenadas:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar coordenadas:', error);
      return null;
    }
  }

  // Sugestões locais para fallback
  private buscarSugestoesLocais(query: string): SugestaoEndereco[] {
    console.log('🔍 GeocodingService: Buscando sugestões locais para:', query);
    
    const sugestoesLocais = [
      // São Paulo - Região Central
      { id: 'local_1', descricao: 'Avenida Paulista', enderecoCompleto: 'Avenida Paulista, São Paulo, SP', latitude: -23.5505, longitude: -46.6333, tipos: ['route'] },
      { id: 'local_2', descricao: 'Rua Augusta', enderecoCompleto: 'Rua Augusta, São Paulo, SP', latitude: -23.5489, longitude: -46.6388, tipos: ['route'] },
      { id: 'local_3', descricao: 'Rua Oscar Freire', enderecoCompleto: 'Rua Oscar Freire, São Paulo, SP', latitude: -23.5614, longitude: -46.6656, tipos: ['route'] },
      
      // São Paulo - Zona Sul
      { id: 'local_4', descricao: 'Rua Vergueiro', enderecoCompleto: 'Rua Vergueiro, São Paulo, SP', latitude: -23.5882, longitude: -46.6324, tipos: ['route'] },
      { id: 'local_5', descricao: 'Avenida Brigadeiro Faria Lima', enderecoCompleto: 'Avenida Brigadeiro Faria Lima, São Paulo, SP', latitude: -23.5882, longitude: -46.6844, tipos: ['route'] },
      
      // São Paulo - Zona Norte
      { id: 'local_6', descricao: 'Avenida Santana', enderecoCompleto: 'Avenida Santana, São Paulo, SP', latitude: -23.5011, longitude: -46.6333, tipos: ['route'] },
      { id: 'local_7', descricao: 'Rua Voluntários da Pátria', enderecoCompleto: 'Rua Voluntários da Pátria, São Paulo, SP', latitude: -23.5011, longitude: -46.6333, tipos: ['route'] },
      
      // São Paulo - Zona Leste
      { id: 'local_8', descricao: 'Avenida Radial Leste', enderecoCompleto: 'Avenida Radial Leste, São Paulo, SP', latitude: -23.5505, longitude: -46.5000, tipos: ['route'] },
      { id: 'local_9', descricao: 'Rua Tito', enderecoCompleto: 'Rua Tito, São Paulo, SP', latitude: -23.5505, longitude: -46.5000, tipos: ['route'] },
      
      // São Paulo - Zona Oeste
      { id: 'local_10', descricao: 'Avenida Rebouças', enderecoCompleto: 'Avenida Rebouças, São Paulo, SP', latitude: -23.5505, longitude: -46.7000, tipos: ['route'] },
      { id: 'local_11', descricao: 'Rua Cardeal Arcoverde', enderecoCompleto: 'Rua Cardeal Arcoverde, São Paulo, SP', latitude: -23.5505, longitude: -46.7000, tipos: ['route'] },
      
      // Outras cidades
      { id: 'local_12', descricao: 'Avenida Engenheiro Caetano Álvares', enderecoCompleto: 'Avenida Engenheiro Caetano Álvares, São Paulo, SP', latitude: -23.5505, longitude: -46.6333, tipos: ['route'] },
      { id: 'local_13', descricao: 'Rua Maria Antônia', enderecoCompleto: 'Rua Maria Antônia, São Paulo, SP', latitude: -23.5489, longitude: -46.6388, tipos: ['route'] },
      { id: 'local_14', descricao: 'Avenida São João', enderecoCompleto: 'Avenida São João, São Paulo, SP', latitude: -23.5505, longitude: -46.6333, tipos: ['route'] },
      { id: 'local_15', descricao: 'Rua 7 de Abril', enderecoCompleto: 'Rua 7 de Abril, São Paulo, SP', latitude: -23.5505, longitude: -46.6333, tipos: ['route'] }
    ];

    const queryLower = query.toLowerCase();
    const sugestoesFiltradas = sugestoesLocais
      .filter(sugestao => 
        sugestao.descricao.toLowerCase().includes(queryLower) ||
        sugestao.enderecoCompleto.toLowerCase().includes(queryLower)
      )
      .slice(0, 8); // Limitar a 8 sugestões
    
    console.log('📋 GeocodingService: Sugestões locais filtradas:', sugestoesFiltradas.length);
    return sugestoesFiltradas;
  }

  // Limpar cache
  limparCache(): void {
    this.cache.clear();
  }

  // Verificar se é coordenada
  isCoordenada(texto: string): boolean {
    return /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(texto);
  }

  // Verificar se é CEP
  isCEP(texto: string): boolean {
    return /^\d{5}-?\d{3}$/.test(texto);
  }
}

export const geocodingService = new GeocodingService(); 