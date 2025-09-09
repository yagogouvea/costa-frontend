import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePrestadores } from '../../contexts/PrestadoresContext';
import Mapa from './Mapa';
import PainelPrestadores from './PainelPrestadores';
import BuscadorEndereco from './BuscadorEndereco';
import { getDistance } from 'geolib';
import '../../styles/mapa-animations.css';

// Hook para detectar dispositivo móvel e tablet
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
        const termoBusca = (valor || '').toLowerCase();
        const prestadoresFiltrados = prestadores.filter(prestador => {
          const campos = [
            prestador.nome || '',
            prestador.bairro || '',
            prestador.cidade || '',
            prestador.estado || '',
            ...((prestador.regioes || []) as string[]),
            ...((prestador.funcoes?.map(f => f.funcao) || []) as string[])
          ].filter(Boolean);
          
          return campos.some(campo => String(campo).toLowerCase().includes(termoBusca));
        });
        
        setPrestadoresFiltrados(prestadoresFiltrados);
        setPontoReferencia(null);
        setPrestadorSelecionado(null);
        setRotaAtiva(false);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      // Em caso de erro, fazer busca por texto
      const termoBusca = (valor || '').toLowerCase();
      const prestadoresFiltrados = prestadores.filter(prestador => {
        const campos = [
          prestador.nome || '',
          prestador.bairro || '',
          prestador.cidade || '',
          prestador.estado || '',
          ...((prestador.regioes || []) as string[]),
          ...((prestador.funcoes?.map(f => f.funcao) || []) as string[])
        ].filter(Boolean);
        
        return campos.some(campo => String(campo).toLowerCase().includes(termoBusca));
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

  // Layout Mobile (moderno e otimizado)
  if (isMobile) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-gray-900">
        {/* Barra de busca moderna com gradiente */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl">
          <div className="w-full px-4 py-3">
            <BuscadorEndereco onBuscar={handleBuscar} />
          </div>
          {/* Indicador de resultados */}
          {prestadoresFiltrados.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-white text-sm">
                <span>🎯 {prestadoresFiltrados.length} prestadores encontrados</span>
                {pontoReferencia && (
                  <span className="text-blue-200">📍 {pontoReferencia.endereco}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mapa com altura otimizada */}
        <div className="absolute left-0 right-0" style={{ top: prestadoresFiltrados.length > 0 ? 110 : 80, bottom: 0 }}>
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

        {/* Botão flutuante moderno com contador */}
        {prestadoresFiltrados.length > 0 && !showMobileList && (
          <button
            onClick={() => setShowMobileList(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-full shadow-2xl z-40 flex items-center gap-2 transform transition-all duration-300 hover:scale-105"
          >
            <span className="text-lg">📋</span>
            <span className="font-bold">{prestadoresFiltrados.length}</span>
          </button>
        )}

        {/* Botão de localização atual */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  handleBuscar(`${latitude}, ${longitude}`);
                },
                (error) => console.warn('Erro ao obter localização:', error)
              );
            }
          }}
          className="fixed bottom-6 left-6 bg-green-600 text-white p-3 rounded-full shadow-2xl z-40 transform transition-all duration-300 hover:scale-105"
          title="Minha localização"
        >
          📍
        </button>

        {/* Painel de prestadores moderno (bottom sheet) */}
        {showMobileList && (
          <div className="fixed left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[70vh] overflow-hidden animate-slide-up"
            style={{ bottom: 0, top: 'auto' }}>
            {/* Handle bar para indicar que é arrastável */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>
            
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Prestadores próximos</h3>
                <p className="text-sm text-blue-600">{prestadoresFiltrados.length} encontrados</p>
              </div>
              <button
                onClick={() => setShowMobileList(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(70vh-120px)]">
              {prestadoresFiltrados.map((prestador) => {
                const tempoEstimado = prestador.distanciaKm ? Math.ceil(prestador.distanciaKm * 2) : null;
                const isSelected = prestadorSelecionado?.id === prestador.id;
                return (
                  <div
                    key={prestador.id}
                    className={`relative border rounded-xl p-4 mb-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md'
                    }`}
                    onClick={() => handleSelecionarPrestador(prestador)}
                  >
                    {/* Badge de tipo de prestador */}
                    <div className="absolute top-3 right-3">
                      {prestador.funcoes?.some(f => f.funcao.toLowerCase().includes('antenista')) ? (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">📡 Antenista</span>
                      ) : prestador.funcoes?.some(f => f.funcao.toLowerCase().includes('armado') || f.funcao.toLowerCase().includes('policial')) ? (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">🚓 Segurança</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">👤 Prestador</span>
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-3 pr-20">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg mb-1">
                          {prestador.nome}
                        </div>
                        {prestador.cod_nome && (
                          <div className="text-sm text-gray-600 mb-1">Código: {prestador.cod_nome}</div>
                        )}
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          📍 {prestador.cidade}, {prestador.estado}
                        </div>
                      </div>
                    </div>

                    {/* Informações de distância e tempo */}
                    <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{prestador.distanciaKm?.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">km</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{tempoEstimado || '--'}</div>
                          <div className="text-xs text-gray-500">min</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Tempo estimado</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      {prestador.telefone ? (
                        <a
                          href={`https://wa.me/55${prestador.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          onClick={e => e.stopPropagation()}
                        >
                          💬 WhatsApp
                        </a>
                      ) : (
                        <div className="flex-1 bg-gray-300 text-gray-500 text-center py-2 px-4 rounded-lg text-sm">
                          Sem telefone
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelecionarPrestador(prestador);
                          setShowMobileList(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        🗺️ Ver
                      </button>
                    </div>
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

  // Layout Desktop (reestruturado e moderno, compacto e sem scroll horizontal)
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header superior fixo com barra de busca */}
      <div className="bg-white border-b border-gray-200 z-30 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="grid grid-cols-12 items-center gap-3">
            {/* Título e estatísticas */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Mapa de Prestadores</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">Encontre prestadores próximos</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-700">{prestadores.length} Total</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">{prestadoresFiltrados.length} Próximos</span>
                </div>
                {pontoReferencia && (
                  <div className="flex items-center gap-2 bg-purple-50 px-2.5 py-1 rounded-full">
                    <span className="text-purple-600">📍</span>
                    <span className="text-xs font-medium text-purple-700">Referência ativa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de busca */}
            <div className="col-span-12 md:col-span-5">
              <BuscadorEndereco onBuscar={handleBuscar} />
            </div>

            {/* Controles à direita */}
            <div className="col-span-12 md:col-span-3 flex items-center justify-start md:justify-end gap-2">
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        handleBuscar(`${latitude}, ${longitude}`);
                      },
                      (error) => console.warn('Erro ao obter localização:', error)
                    );
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-sm transition-all"
                title="Minha localização"
              >
                📍 Minha localização
              </button>
              {pontoReferencia && (
                <button
                  onClick={() => {
                    setPontoReferencia(null);
                    setPrestadoresFiltrados(prestadores);
                    setMapCenter([-23.55052, -46.633308]);
                    setMapZoom(11);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-sm transition-all"
                  title="Limpar busca"
                >
                  🔄 Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área principal com mapa e painel lateral (layout flex, gap interno e sem margens externas) */}
      <div className="flex-1">
        <div className="flex h-full w-full overflow-hidden gap-3 p-3">
          {/* Mapa */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl p-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="relative h-[60vh] rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white">
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
              {/* Controles flutuantes dentro do card (canto inferior esquerdo) */}
              <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => {
                      if (mapaRef.current?.getMap) {
                        const map = mapaRef.current.getMap();
                        map.setZoom(map.getZoom() + 1);
                      }
                    }}
                    className="block w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 border-b border-gray-200 transition-colors"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      if (mapaRef.current?.getMap) {
                        const map = mapaRef.current.getMap();
                        map.setZoom(map.getZoom() - 1);
                      }
                    }}
                    className="block w-10 h-10 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                    title="Zoom out"
                  >
                    −
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Painel lateral fixo */}
          <div className="hidden lg:flex w-[380px] flex-shrink-0">
            <div className="w-full rounded-2xl p-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="h-[60vh] rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaPrestadores; 