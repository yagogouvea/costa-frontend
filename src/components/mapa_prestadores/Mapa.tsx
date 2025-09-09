import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Importar explicitamente o leaflet-routing-machine
import 'leaflet-routing-machine';

// Corrige o ícone padrão do Leaflet no webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Ícone customizado para antenistas (antena)
const antennaIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; display: block; border: 2px solid white; border-radius: 50%; text-align: center; line-height: 30px; color: white; font-weight: bold; font-size: 16px;">📡</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Ícone customizado para policiais/armados (viatura)
const policeIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 30px; height: 30px; display: block; border: 2px solid white; border-radius: 50%; text-align: center; line-height: 30px; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚓</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Ícone para prestador selecionado
const selectedIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f59e0b; width: 35px; height: 35px; display: block; border: 3px solid white; border-radius: 50%; text-align: center; line-height: 35px; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(0,0,0,0.4);">⭐</div>`,
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

L.Marker.prototype.options.icon = defaultIcon;

// Função utilitária para extrair nome da função de diferentes formatos
const getFuncaoNome = (f: any): string => {
  if (typeof f === 'string') return f;
  if (f && typeof f.funcao === 'string') return f.funcao;
  return '';
};

// Função para determinar o ícone baseado nas funções do prestador
const getIconForPrestador = (funcoes?: any[], isSelected: boolean = false) => {
  if (isSelected) return selectedIcon;
  
  if (!funcoes || funcoes.length === 0) return defaultIcon;
  
  // Verificar se tem função de antenista
  const isAntenista = funcoes.some((f: any) => {
    const nome = getFuncaoNome(f);
    return nome.toLowerCase().includes('antenista');
  });
  
  // Verificar se tem função policial/armado (e não é antenista)
  const isPolicial = !isAntenista && funcoes.some((f: any) => {
    const nome = getFuncaoNome(f);
    const lower = nome.toLowerCase();
    return lower.includes('policial') || lower.includes('armado') || lower.includes('segurança') || lower.includes('seguranca') || lower.includes('guarda');
  });
  
  if (isAntenista) return antennaIcon;
  if (isPolicial) return policeIcon;
  return defaultIcon;
};

interface Prestador {
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
  modelo_antena?: string; // Adicionado para armazenar o modelo da antena
}

interface PontoReferencia {
  latitude: number;
  longitude: number;
  endereco: string;
}

interface MapaProps {
  prestadores: Prestador[];
  center?: [number, number];
  zoom?: number;
  pontoReferencia?: PontoReferencia | null;
  prestadorSelecionado?: Prestador | null;
  rotaAtiva?: boolean;
  onSelecionarPrestador?: (prestador: Prestador) => void;
  onTraçarRota?: (prestador: Prestador) => void;
  onLimparRota?: () => void;
}

// Ícone para ponto de referência
const referenciaIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #10b981; width: 25px; height: 25px; display: block; border: 3px solid white; border-radius: 50%; text-align: center; line-height: 25px; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

// Função para calcular distância entre dois pontos
const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Componente para gerenciar o roteamento
const RoutingControl: React.FC<{
  pontoReferencia: PontoReferencia;
  prestadorSelecionado: Prestador;
  rotaAtiva: boolean;
  onLimparRota: () => void;
}> = ({ pontoReferencia, prestadorSelecionado, rotaAtiva, onLimparRota }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  const clearButtonRef = useRef<any>(null);
  const infoDivRef = useRef<any>(null);

  // Verificar se o mapa está pronto
  useEffect(() => {
    if (!map) {
      console.log('Mapa ainda não está pronto');
      return;
    }
    
    console.log('Mapa está pronto, verificando L.Routing...');
    console.log('L.Routing disponível:', !!(L as any).Routing);
  }, [map]);

  useEffect(() => {
    if (rotaAtiva && pontoReferencia && prestadorSelecionado && map) {
      try {
        // Limpar controles anteriores
        if (routingControlRef.current) {
          try {
            map.removeControl(routingControlRef.current);
          } catch (e) {
            console.log('Erro ao remover routing control anterior:', e);
          }
        }
        
        if (clearButtonRef.current) {
          try {
            map.removeControl(clearButtonRef.current);
          } catch (e) {
            console.log('Erro ao remover clear button anterior:', e);
          }
        }
        
        if (infoDivRef.current) {
          try {
            map.removeControl(infoDivRef.current);
          } catch (e) {
            console.log('Erro ao remover info div anterior:', e);
          }
        }

        // Verificar se L.Routing está disponível
        if (!(L as any).Routing) {
          console.error('L.Routing não está disponível, criando linha simples');
          
          // Criar uma linha simples entre os pontos
          const polyline = L.polyline([
            [pontoReferencia.latitude, pontoReferencia.longitude],
            [prestadorSelecionado.latitude, prestadorSelecionado.longitude]
          ], {
            color: '#3b82f6',
            weight: 6,
            opacity: 0.8
          });
          
          polyline.addTo(map);
          routingControlRef.current = polyline;
          
          // Centralizar mapa na rota
          map.fitBounds(polyline.getBounds());
        } else {
          // Criar nova rota com leaflet-routing-machine
          const routingControl = (L as any).Routing.control({
            waypoints: [
              L.latLng(pontoReferencia.latitude, pontoReferencia.longitude),
              L.latLng(prestadorSelecionado.latitude, prestadorSelecionado.longitude)
            ],
            routeWhileDragging: false,
            show: false,
            lineOptions: {
              styles: [
                { color: '#3b82f6', opacity: 0.8, weight: 6 }
              ]
            },
            createMarker: () => null, // Não criar marcadores automáticos
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false
          });

          routingControl.addTo(map);
          routingControlRef.current = routingControl;
        }

        // Adicionar botão para limpar rota
        const clearButton = (L as any).control({ position: 'topright' });
        clearButton.onAdd = () => {
          const div = (L as any).DomUtil.create('div', 'leaflet-bar leaflet-control');
          div.innerHTML = `
            <a href="#" title="Limpar rota" style="background-color: #ef4444; color: white; padding: 8px 12px; border-radius: 4px; text-decoration: none; font-weight: bold;">
              ✕ Limpar Rota
            </a>
          `;
          div.onclick = (e: any) => {
            e.preventDefault();
            onLimparRota();
          };
          return div;
        };
        clearButton.addTo(map);
        clearButtonRef.current = clearButton;

        // Adicionar informações da rota apenas se L.Routing estiver disponível
        if ((L as any).Routing && routingControlRef.current && typeof routingControlRef.current.on === 'function') {
          routingControlRef.current.on('routesfound', (e: any) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
              const route = routes[0];
              const distance = (route.summary.totalDistance / 1000).toFixed(1);
              const duration = Math.round(route.summary.totalTime / 60);

              const infoDiv = (L as any).control({ position: 'topleft' });
              infoDiv.onAdd = () => {
                const div = (L as any).DomUtil.create('div', 'route-info');
                div.innerHTML = `
                  <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); margin: 10px; min-width: 200px;">
                    <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">🚗 Rota para ${prestadorSelecionado.nome}</div>
                    <div style="font-size: 14px; color: #6b7280;">
                      📏 Distância: ${distance} km<br>
                      ⏱️ Tempo estimado: ${duration} min
                    </div>
                  </div>
                `;
                return div;
              };
              infoDiv.addTo(map);
              infoDivRef.current = infoDiv;
            }
          });
        } else {
          // Para linha simples, mostrar informações básicas
          const distance = calcularDistancia(
            pontoReferencia.latitude, 
            pontoReferencia.longitude,
            prestadorSelecionado.latitude, 
            prestadorSelecionado.longitude
          );

          const infoDiv = (L as any).control({ position: 'topleft' });
          infoDiv.onAdd = () => {
            const div = (L as any).DomUtil.create('div', 'route-info');
            div.innerHTML = `
              <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); margin: 10px; min-width: 200px;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">🚗 Rota para ${prestadorSelecionado.nome}</div>
                <div style="font-size: 14px; color: #6b7280;">
                  📏 Distância: ${distance.toFixed(1)} km<br>
                  ⏱️ Tempo estimado: ${Math.round(distance * 2)} min
                </div>
              </div>
            `;
            return div;
          };
          infoDiv.addTo(map);
          infoDivRef.current = infoDiv;
        }

        return () => {
          // Cleanup function
          if (routingControlRef.current) {
            try {
              if (routingControlRef.current instanceof L.Control) {
                map.removeControl(routingControlRef.current);
              } else if (routingControlRef.current instanceof L.Polyline) {
                map.removeLayer(routingControlRef.current);
              }
            } catch (e) {
              console.log('Erro no cleanup do routing control:', e);
            }
          }
          if (clearButtonRef.current) {
            try {
              map.removeControl(clearButtonRef.current);
            } catch (e) {
              console.log('Erro no cleanup do clear button:', e);
            }
          }
          if (infoDivRef.current) {
            try {
              map.removeControl(infoDivRef.current);
            } catch (e) {
              console.log('Erro no cleanup do info div:', e);
            }
          }
        };
      } catch (error) {
        console.error('Erro ao criar rota:', error);
      }
    }
  }, [rotaAtiva, pontoReferencia, prestadorSelecionado, map, onLimparRota]);

  return null;
};

const Mapa = forwardRef<any, MapaProps>(({ 
  prestadores, 
  center = [-23.55052, -46.633308], 
  zoom = 11,
  pontoReferencia = null,
  prestadorSelecionado = null,
  rotaAtiva = false,
  onSelecionarPrestador,
  onTraçarRota,
  onLimparRota
}, ref) => {
  const mapRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current
  }));

  // Forçar atualização do center e zoom quando as props mudarem
  useEffect(() => {
    if (mapRef.current) {
      console.log('🔄 [Mapa] Atualizando center e zoom:', { center, zoom });
      mapRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  console.log('Pins recebidos no Mapa:', prestadores);
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="absolute inset-0"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
        {/* Ponto de referência */}
        {pontoReferencia && (
          <Marker 
            position={[pontoReferencia.latitude, pontoReferencia.longitude]} 
            icon={referenciaIcon}
          >
            <Popup>
              <div>
                <div className="font-bold text-green-700">📍 Ponto de Referência</div>
                <div className="text-sm text-gray-600">{pontoReferencia.endereco}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Prestadores */}
        {prestadores.filter(p => p.latitude && p.longitude).map((p) => {
          const isSelected = prestadorSelecionado?.id === p.id;
          return (
            <Marker 
              key={p.id} 
              position={[p.latitude!, p.longitude!]} 
              icon={getIconForPrestador(p.funcoes, isSelected)}
              eventHandlers={{
                click: () => {
                  onSelecionarPrestador?.(p);
                }
              }}
            >
              <Popup>
                <div>
                  <div className="font-bold">{p.nome}</div>
                  {p.telefone && (
                    <div className="text-sm mt-1">
                      <a
                        href={`https://wa.me/55${p.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 underline"
                      >
                        {p.telefone}
                      </a>
                    </div>
                  )}
                  {p.funcoes && p.funcoes.length > 0 && (
                    <div className="text-xs text-gray-700 mt-1">
                      Tipo de apoio: {p.funcoes.map((f: any) => getFuncaoNome(f)).filter(Boolean).join(', ')}
                      
                      {/* Observação para antenistas */}
                      {p.funcoes.some((f: any) => getFuncaoNome(f).toLowerCase().includes('antenista')) && p.modelo_antena && (
                        <div className="mt-1 text-xs text-blue-600 font-medium">
                          📡 Antena: {p.modelo_antena}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {[p.bairro, p.cidade, p.estado].filter(Boolean).join(', ')}
                  </div>
                  {p.distanciaKm && (
                    <div className="text-xs text-blue-600 mt-1 font-semibold">
                      📏 Distância: {p.distanciaKm.toFixed(1)} km
                    </div>
                  )}
                  {pontoReferencia && (
                    <div className="mt-2">
                      <button
                        onClick={() => onTraçarRota?.(p)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        🚗 Traçar Rota
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/${pontoReferencia.latitude},${pontoReferencia.longitude}/${p.latitude},${p.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 inline-block"
                      >
                        📱 Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Controle de roteamento */}
        {rotaAtiva && pontoReferencia && prestadorSelecionado && (
          <RoutingControl
            pontoReferencia={pontoReferencia}
            prestadorSelecionado={prestadorSelecionado}
            rotaAtiva={rotaAtiva}
            onLimparRota={onLimparRota || (() => {})}
          />
        )}
    </MapContainer>
  );
});

Mapa.displayName = 'Mapa';

export default Mapa; 