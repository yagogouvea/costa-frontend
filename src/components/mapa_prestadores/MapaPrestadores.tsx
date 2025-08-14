import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePrestadores } from '../../contexts/PrestadoresContext';
import Mapa from './Mapa';
import PainelPrestadores from './PainelPrestadores';
import BuscadorEndereco from './BuscadorEndereco';
import { getDistance } from 'geolib';

// Hook para detectar dispositivo móvel
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

interface PontoReferencia {
  latitude: number;
  longitude: number;
  endereco: string;
}

interface PrestadorComDistancia {
  id: string;
  nome: string;
  cod_nome?: string;
  telefone?: string;
  funcoes?: { funcao: string }[];
  latitude: number;
  longitude: number;
  regioes: string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  distanciaKm?: number;
  modelo_antena?: string; // ✅ Campo para antenistas
}

const MapaPrestadores: React.FC = () => {
  console.log('🎯 MapaPrestadores: Componente renderizado');
  
  const { prestadores, loading, erro } = usePrestadores();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.55052, -46.633308]); // São Paulo
  const [mapZoom, setMapZoom] = useState(11);
  const [pontoReferencia, setPontoReferencia] = useState<PontoReferencia | null>(null);
  const [prestadoresFiltrados, setPrestadoresFiltrados] = useState<PrestadorComDistancia[]>([]);
  const [prestadorSelecionado, setPrestadorSelecionado] = useState<PrestadorComDistancia | null>(null);
  const [rotaAtiva, setRotaAtiva] = useState<boolean>(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const mapaRef = useRef<any>(null);
  const isMobile = useIsMobile();

  // Função para geocodificar endereço
  const geocodificarEndereco = async (endereco: string): Promise<[number, number] | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return [lat, lon];
      }
      return null;
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  };

  // Função para calcular distância usando geolib
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const distancia = getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    );
    return distancia / 1000; // Converter para km
  };

  // Função para processar busca por coordenadas
  const processarCoordenadas = (input: string): [number, number] | null => {
    const coordenadasRegex = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const match = input.match(coordenadasRegex);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return [lat, lon];
      }
    }
    return null;
  };

  const handleBuscar = useCallback(async (valor: string) => {
    console.log('🎯 MapaPrestadores: handleBuscar chamado com:', valor);
    
    if (!valor.trim()) {
      console.log('❌ Valor vazio, resetando mapa');
      setPrestadoresFiltrados(prestadores);
      setMapCenter([-23.55052, -46.633308]);
      setMapZoom(11);
      setPontoReferencia(null);
      setPrestadorSelecionado(null);
      setRotaAtiva(false);
      return;
    }

    try {
      // Primeiro, tentar processar como coordenadas
      let coordenadas = processarCoordenadas(valor);
      
      // Se não for coordenadas, tentar geocodificar como endereço
      if (!coordenadas) {
        coordenadas = await geocodificarEndereco(valor);
      }

      if (coordenadas) {
        const [lat, lon] = coordenadas;
        console.log('🎯 MapaPrestadores: Coordenadas encontradas:', { lat, lon });
        console.log('🔄 MapaPrestadores: Atualizando center e zoom do mapa...');
        setMapCenter([lat, lon]);
        setMapZoom(isMobile ? 14 : 13); // Zoom maior no mobile
        console.log('✅ MapaPrestadores: Center e zoom atualizados:', { center: [lat, lon], zoom: isMobile ? 14 : 13 });
        
        // Definir ponto de referência
        setPontoReferencia({
          latitude: lat,
          longitude: lon,
          endereco: valor
        });
        
        // Filtrar prestadores próximos (dentro de 50km) e calcular distância
        const prestadoresComDistancia = prestadores
          .filter(prestador => prestador.latitude && prestador.longitude)
          .map(prestador => ({
            ...prestador,
            distanciaKm: calcularDistancia(lat, lon, prestador.latitude!, prestador.longitude!)
          }))
          .filter(prestador => prestador.distanciaKm <= (isMobile ? 30 : 50)) // Raio menor no mobile
          .sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0))
          .slice(0, isMobile ? 20 : 10); // Mais resultados no mobile
        
        setPrestadoresFiltrados(prestadoresComDistancia);
        setPrestadorSelecionado(null);
        setRotaAtiva(false);
        console.log('✅ MapaPrestadores: Busca concluída com sucesso');
      } else {
        // Se não conseguir geocodificar, fazer busca por texto
        const termoBusca = valor.toLowerCase();
        const prestadoresFiltrados = prestadores.filter(prestador => {
          const campos = [
            prestador.nome,
            prestador.bairro,
            prestador.cidade,
            prestador.estado,
            ...prestador.regioes,
            ...(prestador.funcoes?.map(f => f.funcao) || [])
          ].filter(Boolean);
          
          return campos.some(campo => 
            campo && campo.toLowerCase().includes(termoBusca)
          );
        });
        
        setPrestadoresFiltrados(prestadoresFiltrados);
        setPontoReferencia(null);
        setPrestadorSelecionado(null);
        setRotaAtiva(false);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      // Em caso de erro, fazer busca por texto
      const termoBusca = valor.toLowerCase();
      const prestadoresFiltrados = prestadores.filter(prestador => {
        const campos = [
          prestador.nome,
          prestador.bairro,
          prestador.cidade,
          prestador.estado,
          ...prestador.regioes,
          ...(prestador.funcoes?.map(f => f.funcao) || [])
        ].filter(Boolean);
        
        return campos.some(campo => 
          campo && campo.toLowerCase().includes(termoBusca)
        );
      });
      
      setPrestadoresFiltrados(prestadoresFiltrados);
      setPontoReferencia(null);
      setPrestadorSelecionado(null);
      setRotaAtiva(false);
    }
  }, [prestadores, isMobile]);

  const handleSelecionarPrestador = useCallback((prestador: PrestadorComDistancia) => {
    setPrestadorSelecionado(prestador);
    setRotaAtiva(false);
    if (isMobile) {
      setShowMobileList(false); // Fechar lista no mobile ao selecionar
    }
  }, [isMobile]);

  const handleTraçarRota = useCallback((prestador: PrestadorComDistancia) => {
    if (!pontoReferencia || !prestador.latitude || !prestador.longitude) {
      alert('Ponto de referência ou prestador sem coordenadas válidas');
      return;
    }

    setPrestadorSelecionado(prestador);
    setRotaAtiva(true);
    
    // Centralizar mapa no prestador selecionado
    setMapCenter([prestador.latitude, prestador.longitude]);
    setMapZoom(isMobile ? 15 : 14);
  }, [pontoReferencia, isMobile]);

  const handleLimparRota = useCallback(() => {
    setRotaAtiva(false);
    setPrestadorSelecionado(null);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando prestadores no mapa...</div>;
  }
  if (erro) {
    return <div className="flex items-center justify-center h-screen text-red-600">{erro}</div>;
  }

  // Layout Mobile (profissional, sem sobreposição)
  if (isMobile) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-gray-50">
        {/* Barra de busca fixa no topo, centralizada, com padding lateral */}
        <div className="fixed top-0 left-0 right-0 z-30 flex justify-center bg-gray-50 pt-2 pb-2 shadow-md">
          <div className="w-full max-w-[95vw] px-2">
            <BuscadorEndereco onBuscar={handleBuscar} />
          </div>
        </div>

        {/* Mapa ocupa toda a tela abaixo da barra de busca (altura dinâmica) */}
        <div className="absolute left-0 right-0" style={{ top: 72, bottom: 0 }}>
          <Mapa
            prestadores={prestadoresFiltrados}
            center={mapCenter}
            zoom={mapZoom}
            pontoReferencia={pontoReferencia}
            prestadorSelecionado={prestadorSelecionado}
            rotaAtiva={rotaAtiva}
            onSelecionarPrestador={handleSelecionarPrestador}
            onTraçarRota={handleTraçarRota}
            onLimparRota={handleLimparRota}
            ref={mapaRef}
          />
        </div>

        {/* Botão flutuante reposicionado para não sobrepor barra de busca */}
        {prestadoresFiltrados.length > 0 && !showMobileList && (
          <button
            onClick={() => setShowMobileList(true)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
            style={{ bottom: showMobileList ? 180 : 16 }}
          >
            📋 {prestadoresFiltrados.length}
          </button>
        )}

        {/* Painel de prestadores (bottom sheet), começa abaixo da barra de busca */}
        {showMobileList && (
          <div className="fixed left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto animate-slide-up"
            style={{ bottom: 0, top: 'auto' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Prestadores próximos ({prestadoresFiltrados.length})</h3>
              <button
                onClick={() => setShowMobileList(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {prestadoresFiltrados.map((prestador) => {
                const tempoEstimado = prestador.distanciaKm ? Math.ceil(prestador.distanciaKm * 2) : null;
                return (
                  <div
                    key={prestador.id}
                    className="border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelecionarPrestador(prestador)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-base mb-1">
                          {prestador.nome}
                          {prestador.cod_nome && (
                            <span className="text-sm text-gray-500 ml-2">({prestador.cod_nome})</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{prestador.cidade}, {prestador.estado}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{prestador.distanciaKm?.toFixed(1)}km</div>
                        {tempoEstimado && (
                          <div className="text-xs text-gray-500">~{tempoEstimado} min</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      {prestador.telefone ? (
                        <a
                          href={`https://wa.me/55${prestador.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
                          onClick={e => e.stopPropagation()}
                        >
                          📞 {prestador.telefone}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Sem telefone</span>
                      )}
                    </div>
                    <div className="text-blue-600 text-sm">Toque para ver no mapa →</div>
                  </div>
                );
              })}
              {prestadoresFiltrados.length === 0 && (
                <div className="text-center text-gray-500 py-8">Nenhum prestador encontrado</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Layout Desktop (profissional, sem sobreposição)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Área do mapa e barra de busca */}
      <div className="flex-1 flex flex-col relative">
        {/* Barra de busca alinhada à esquerda, fixa no topo da área do mapa */}
        <div className="sticky top-0 left-0 z-20 pl-8 pt-8 pb-4 bg-gray-50" style={{ maxWidth: 'min(600px, 100vw - 480px)' }}>
          <BuscadorEndereco onBuscar={handleBuscar} />
        </div>
        {/* Mapa com padding-top suficiente para a barra de busca */}
        <div className="flex-1 w-full" style={{ paddingTop: 24 }}>
          <Mapa
            prestadores={prestadoresFiltrados}
            center={mapCenter}
            zoom={mapZoom}
            pontoReferencia={pontoReferencia}
            prestadorSelecionado={prestadorSelecionado}
            rotaAtiva={rotaAtiva}
            onSelecionarPrestador={handleSelecionarPrestador}
            onTraçarRota={handleTraçarRota}
            onLimparRota={handleLimparRota}
            ref={mapaRef}
          />
        </div>
      </div>
      {/* Painel de prestadores fixo à direita */}
      <PainelPrestadores
        prestadores={prestadoresFiltrados}
        totalPrestadores={prestadores.length}
        onSelecionarPrestador={handleSelecionarPrestador}
        onTraçarRota={handleTraçarRota}
        prestadorSelecionado={prestadorSelecionado}
        rotaAtiva={rotaAtiva}
        onLimparRota={handleLimparRota}
        pontoReferencia={pontoReferencia}
      />
    </div>
  );
};

export default MapaPrestadores; 