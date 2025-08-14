// src/services/directionsService.ts

interface TempoDeslocamento {
  distancia: string;
  duracao: string;
  duracaoMinutos: number;
  distanciaKm: number;
}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

import { GOOGLE_MAPS_CONFIG } from '@/config/api';

class DirectionsService {
  private apiKey: string | null = null;
  private cache = new Map<string, TempoDeslocamento>();

  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  }

  private gerarChaveCache(origem: Coordenadas, destino: Coordenadas): string {
    return `${origem.latitude},${origem.longitude}-${destino.latitude},${destino.longitude}`;
  }

  async calcularTempoDeslocamento(
    origem: Coordenadas, 
    destino: Coordenadas
  ): Promise<TempoDeslocamento | null> {
    try {
      // Verificar cache primeiro
      const chaveCache = this.gerarChaveCache(origem, destino);
      if (this.cache.has(chaveCache)) {
        console.log('📋 Usando tempo de deslocamento do cache');
        return this.cache.get(chaveCache)!;
      }

      // Se não há API key, usar cálculo simples
      if (!this.apiKey) {
        console.log('⚠️ Sem API key do Google Maps, usando cálculo simples');
        return this.calcularTempoSimples(origem, destino);
      }

      console.log('🚗 Calculando tempo de deslocamento via Google Maps API...');
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origem.latitude},${origem.longitude}&destination=${destino.latitude},${destino.longitude}&mode=driving&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Dobrar o tempo estimado da API
        const duracaoMinutos = Math.round((leg.duration.value / 60) * 2);
        const resultado: TempoDeslocamento = {
          distancia: leg.distance.text,
          duracao: `${duracaoMinutos} min`,
          duracaoMinutos,
          distanciaKm: leg.distance.value / 1000
        };

        // Salvar no cache
        this.cache.set(chaveCache, resultado);
        
        console.log('✅ Tempo calculado (dobrado):', resultado);
        return resultado;
      } else {
        console.error('❌ Erro na API do Google Maps:', data.status, data.error_message);
        return this.calcularTempoSimples(origem, destino);
      }
    } catch (error) {
      console.error('❌ Erro ao calcular tempo de deslocamento:', error);
      return this.calcularTempoSimples(origem, destino);
    }
  }

  private calcularTempoSimples(origem: Coordenadas, destino: Coordenadas): TempoDeslocamento {
    // Cálculo simples baseado na distância em linha reta
    const distanciaKm = this.calcularDistancia(origem, destino);
    // Dobrar o tempo estimado
    const duracaoMinutos = Math.round(distanciaKm * 2 * 2); // Estimativa: 4 min/km
    
    return {
      distancia: `${distanciaKm.toFixed(1)} km`,
      duracao: `${duracaoMinutos} min`,
      duracaoMinutos,
      distanciaKm
    };
  }

  private calcularDistancia(ponto1: Coordenadas, ponto2: Coordenadas): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (ponto2.latitude - ponto1.latitude) * Math.PI / 180;
    const dLon = (ponto2.longitude - ponto1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(ponto1.latitude * Math.PI / 180) * Math.cos(ponto2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Limpar cache (útil para testes)
  limparCache(): void {
    this.cache.clear();
  }

  // Verificar se API está disponível
  isApiDisponivel(): boolean {
    return GOOGLE_MAPS_CONFIG.isAvailable;
  }
}

export const directionsService = new DirectionsService();
export type { TempoDeslocamento, Coordenadas }; 