import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';

interface PrestadorPin {
  id: string;
  nome: string;
  telefone?: string;
  funcoes?: { funcao: string }[];
  latitude: number;
  longitude: number;
  regioes: string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  distanciaKm?: number;
  modelo_antena?: string;
}

interface PrestadoresContextType {
  prestadores: PrestadorPin[];
  prestadoresFiltrados: PrestadorPin[];
  loading: boolean;
  erro: string | null;
  atualizarPrestadores: () => Promise<void>;
  setPrestadoresFiltrados: (prestadores: PrestadorPin[]) => void;
  ultimaAtualizacao: Date | null;
}

const PrestadoresContext = createContext<PrestadoresContextType | undefined>(undefined);

export const usePrestadores = () => {
  const context = useContext(PrestadoresContext);
  if (!context) {
    throw new Error('usePrestadores deve ser usado dentro de um PrestadoresProvider');
  }
  return context;
};

interface PrestadoresProviderProps {
  children: ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number; // em milissegundos
}

export const PrestadoresProvider: React.FC<PrestadoresProviderProps> = ({ 
  children, 
  autoRefresh = true, 
  refreshInterval = 30000 // 30 segundos
}) => {
  const [prestadores, setPrestadores] = useState<PrestadorPin[]>([]);
  const [prestadoresFiltrados, setPrestadoresFiltrados] = useState<PrestadorPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  const atualizarPrestadores = async () => {
    try {
      setErro(null);
      console.log('🔄 [PrestadoresContext] Iniciando atualização dos prestadores...');
      // Lista de endpoints para tentar em ordem (CLIENTE COSTA)
      const endpoints = [
        '/api/prestadores-publico/mapa', // ✅ Endpoint específico para mapa (apenas aprovados com coordenadas)
        '/api/prestadores-publico', // ✅ Endpoint público de cadastro (todos os aprovados)
        '/api/v1/prestadores/mapa', // Fallback para rotas v1
        '/api/v1/prestadores/public', // Fallback para rotas v1
        '/api/v1/prestadores', // Endpoint protegido como último recurso
        '/prestadores/mapa', // Fallback para rotas legadas
        '/prestadores/public', // Fallback para rotas legadas
        '/prestadores' // Fallback para rotas legadas
      ];

      let prestadoresEncontrados = null;

      // Tentar cada endpoint até encontrar um que funcione
      for (const endpointUrl of endpoints) {
        try {
          console.log(`📡 [PrestadoresContext] Tentando endpoint: ${endpointUrl}`);
          const response = await api.get(endpointUrl);
          
          if (response.data && Array.isArray(response.data)) {
            console.log(`✅ [PrestadoresContext] Endpoint ${endpointUrl} funcionou!`);
            console.log(`✅ [PrestadoresContext] Dados recebidos:`, {
              total: response.data.length,
              sample: response.data.slice(0, 2)
            });
            
            prestadoresEncontrados = response.data;
            break;
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            console.log(`✅ [PrestadoresContext] Endpoint ${endpointUrl} funcionou! (formato paginado)`);
            console.log(`✅ [PrestadoresContext] Dados recebidos:`, {
              total: response.data.data.length,
              sample: response.data.data.slice(0, 2)
            });
            
            prestadoresEncontrados = response.data.data;
            break;
          }
        } catch (error) {
          console.log(`❌ [PrestadoresContext] Endpoint ${endpointUrl} falhou:`, error);
          continue;
        }
      }
      if (!prestadoresEncontrados) {
        setErro('Nenhum endpoint de prestadores funcionou');
        setPrestadores([]);
        setPrestadoresFiltrados([]);
        return;
      }
      // Validar se data é um array
      if (!Array.isArray(prestadoresEncontrados)) {
        console.error('❌ [PrestadoresContext] Resposta da API não é um array:', {
          type: typeof prestadoresEncontrados,
          value: prestadoresEncontrados,
          stringified: JSON.stringify(prestadoresEncontrados, null, 2)
        });
        setPrestadores([]);
        setPrestadoresFiltrados([]);
        setErro(`Formato de resposta inválido da API: esperado array, recebido ${typeof prestadoresEncontrados}`);
        return;
      }
      console.log('✅ [PrestadoresContext] Dados recebidos:', {
        total: prestadoresEncontrados.length,
        sample: prestadoresEncontrados.slice(0, 2)
      });
      // Filtrar apenas os que têm latitude e longitude válidos
      const pins = prestadoresEncontrados
        .filter((p: any) => {
          const isValid = p && p.latitude && p.longitude && 
                         typeof p.latitude === 'number' && 
                         typeof p.longitude === 'number';
          if (!isValid) {
            console.warn('⚠️ [PrestadoresContext] Prestador sem coordenadas válidas:', {
              id: p?.id,
              nome: p?.nome,
              latitude: p?.latitude,
              longitude: p?.longitude,
              latitudeType: typeof p?.latitude,
              longitudeType: typeof p?.longitude
            });
          }
          return isValid;
        })
        .map((p: any) => ({
          id: String(p.id),
          nome: p.nome || '',
          telefone: p.telefone || '',
          funcoes: Array.isArray(p.funcoes) ? p.funcoes : [],
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          regioes: Array.isArray(p.regioes) ? p.regioes.map((r: any) => r.regiao || r.nome || String(r)) : [],
          bairro: p.bairro || '',
          cidade: p.cidade || '',
          estado: p.estado || '',
          modelo_antena: p.modelo_antena || '',
        }));
      console.log('✅ [PrestadoresContext] Prestadores processados:', {
        total: pins.length,
        sample: pins.slice(0, 2)
      });
      setPrestadores(pins);
      setPrestadoresFiltrados(pins);
      setUltimaAtualizacao(new Date());
      console.log('🔄 [PrestadoresContext] Prestadores atualizados automaticamente:', pins.length);
    } catch (e: any) {
      console.error('❌ [PrestadoresContext] Erro ao buscar prestadores:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status,
        statusText: e.response?.statusText,
        config: {
          url: e.config?.url,
          method: e.config?.method,
          baseURL: e.config?.baseURL
        }
      });
      let errorMessage = 'Erro ao buscar prestadores para o mapa';
      if (e.response?.status === 404) {
        errorMessage = 'Endpoint de mapa não encontrado';
      } else if (e.response?.status === 500) {
        errorMessage = 'Erro interno do servidor';
      } else if (e.code === 'NETWORK_ERROR') {
        errorMessage = 'Erro de conexão com o servidor';
      }
      setErro(errorMessage);
      setPrestadores([]);
      setPrestadoresFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar prestadores iniciais
  useEffect(() => {
    atualizarPrestadores();
  }, []);

  // Atualização automática
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Atualizando prestadores automaticamente...');
      atualizarPrestadores();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Função para forçar atualização manual
  const forcarAtualizacao = async () => {
    console.log('🔄 [PrestadoresContext] Forçando atualização manual dos prestadores...');
    await atualizarPrestadores();
    console.log('✅ [PrestadoresContext] Atualização manual concluída');
  };

  // Expor função para atualização manual
  useEffect(() => {
    console.log('🎯 [PrestadoresContext] Expondo função global para atualização manual...');
    // Adicionar função global para atualização manual
    (window as any).atualizarPrestadoresMapa = forcarAtualizacao;
    console.log('✅ [PrestadoresContext] Função global exposta:', typeof (window as any).atualizarPrestadoresMapa);
    
    return () => {
      console.log('🎯 [PrestadoresContext] Removendo função global...');
      delete (window as any).atualizarPrestadoresMapa;
    };
  }, []);

  const value: PrestadoresContextType = {
    prestadores,
    prestadoresFiltrados,
    loading,
    erro,
    atualizarPrestadores,
    setPrestadoresFiltrados,
    ultimaAtualizacao
  };

  return (
    <PrestadoresContext.Provider value={value}>
      {children}
    </PrestadoresContext.Provider>
  );
}; 