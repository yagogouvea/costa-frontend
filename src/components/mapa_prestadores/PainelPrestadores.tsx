import React, { useState, useEffect } from 'react';
import { directionsService, type TempoDeslocamento } from '@/services/directionsService';

interface Prestador {
  id: string;
  nome: string;
  cod_nome?: string;
  regioes: string[];
  distanciaKm?: number;
  latitude: number;
  longitude: number;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  funcoes?: { funcao: string }[];
  modelo_antena?: string; // Adicionado para armazenar o modelo da antena
}

interface PontoReferencia {
  latitude: number;
  longitude: number;
  endereco: string;
}

interface PainelPrestadoresProps {
  prestadores: Prestador[];
  totalPrestadores?: number;
  onSelecionarPrestador?: (prestador: Prestador) => void;
  onTraçarRota?: (prestador: Prestador) => void;
  prestadorSelecionado?: Prestador | null;
  rotaAtiva?: boolean;
  onLimparRota?: () => void;
  pontoReferencia?: PontoReferencia | null;
}

const PainelPrestadores: React.FC<PainelPrestadoresProps> = ({ 
  prestadores, 
  onSelecionarPrestador,
  onTraçarRota,
  prestadorSelecionado,
  rotaAtiva,
  onLimparRota,
  pontoReferencia,
  totalPrestadores
}) => {
  const [temposDeslocamento, setTemposDeslocamento] = useState<Map<string, TempoDeslocamento>>(new Map());
  const [calculandoTempos, setCalculandoTempos] = useState<Set<string>>(new Set());

  // Ordenar prestadores por distância e tempo de deslocamento
  const prestadoresOrdenados = [...prestadores].sort((a, b) => {
    // Se ambos têm tempo de deslocamento calculado, ordenar por tempo
    const tempoA = temposDeslocamento.get(a.id);
    const tempoB = temposDeslocamento.get(b.id);
    
    if (tempoA && tempoB) {
      return tempoA.duracaoMinutos - tempoB.duracaoMinutos;
    }
    
    // Se apenas um tem tempo, priorizar o que tem
    if (tempoA && !tempoB) return -1;
    if (!tempoA && tempoB) return 1;
    
    // Se nenhum tem tempo, ordenar por distância
    if (a.distanciaKm !== undefined && b.distanciaKm !== undefined) {
      return a.distanciaKm - b.distanciaKm;
    }
    if (a.distanciaKm !== undefined) return -1;
    if (b.distanciaKm !== undefined) return 1;
    return 0;
  });

  // Calcular tempos de deslocamento quando há ponto de referência
  useEffect(() => {
    if (!pontoReferencia) {
      setTemposDeslocamento(new Map());
      return;
    }

    const calcularTempos = async () => {
      const novosTempos = new Map<string, TempoDeslocamento>();
      const calculando = new Set<string>();

      for (const prestador of prestadores) {
        if (!prestador.latitude || !prestador.longitude) continue;

        const chave = prestador.id;
        // Se já foi calculado, usar do cache
        if (temposDeslocamento.has(chave)) {
          novosTempos.set(chave, temposDeslocamento.get(chave)!);
          continue;
        }
        // Marcar como calculando
        calculando.add(chave);
        setCalculandoTempos(new Set(calculando));
        try {
          const tempo = await directionsService.calcularTempoDeslocamento(
            { latitude: pontoReferencia.latitude, longitude: pontoReferencia.longitude },
            { latitude: prestador.latitude, longitude: prestador.longitude }
          );
          if (tempo) {
            novosTempos.set(chave, tempo);
          }
        } catch (error) {
          console.error(`Erro ao calcular tempo para ${prestador.nome}:`, error);
        }
        // Remover da lista de calculando
        calculando.delete(chave);
        setCalculandoTempos(new Set(calculando));
      }
      setTemposDeslocamento(novosTempos);
    };
    calcularTempos();
  }, [pontoReferencia, prestadores]);

  const handleCardClick = (prestador: Prestador) => {
    onSelecionarPrestador?.(prestador);
  };

  const handleTraçarRota = (prestador: Prestador, e: React.MouseEvent) => {
    e.stopPropagation();
    onTraçarRota?.(prestador);
  };

  return (
    <aside className="h-full w-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-base font-bold text-gray-800 truncate">Prestadores {prestadores.some(p => p.distanciaKm !== undefined) ? 'Próximos' : 'Encontrados'}</div>
            {prestadores.some(p => p.distanciaKm !== undefined) && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                {directionsService.isApiDisponivel() && temposDeslocamento.size > 0 
                  ? 'Ordenados por tempo de chegada' 
                  : 'Ordenados por distância'}
              </div>
            )}
            {pontoReferencia && (
              <div className="text-xs text-blue-700 mt-1 truncate">📍 {pontoReferencia.endereco}</div>
            )}
          </div>
          {rotaAtiva && (
            <button
              onClick={onLimparRota}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 whitespace-nowrap"
            >
              ✕ Limpar Rota
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {prestadoresOrdenados.map((p) => {
          // Montar endereço
          const endereco = [p.bairro, p.cidade, p.estado].filter(Boolean).join(', ');
          const urlMaps = endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}` : null;
          const isSelected = prestadorSelecionado?.id === p.id;
          
          return (
            <div 
              key={p.id} 
              className={`border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleCardClick(p)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-base text-gray-900">
                    {p.nome}
                    {p.cod_nome && (
                      <span className="text-sm text-gray-500 ml-2">({p.cod_nome})</span>
                    )}
                  </div>
                  
                  {/* Distância e tempo de deslocamento */}
                  {p.distanciaKm !== undefined ? (
                    <div className="text-sm text-blue-600 font-semibold flex items-center gap-1 mt-1">
                      📏 {p.distanciaKm.toFixed(1)} km
                      {p.distanciaKm <= 5 && (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                          Muito próximo
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Distância não calculada</div>
                  )}
                  
                  {/* Tempo de deslocamento */}
                  {pontoReferencia && p.latitude && p.longitude && (
                    <div className="text-xs text-gray-700 mt-1">
                      {calculandoTempos.has(p.id) ? (
                        <span className="text-blue-500">⏳ Calculando tempo...</span>
                      ) : temposDeslocamento.has(p.id) ? (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-medium">
                            ⏱️ {temposDeslocamento.get(p.id)!.duracao}
                          </span>
                          <span className="text-gray-500">
                            ({temposDeslocamento.get(p.id)!.distancia})
                          </span>
                          {!directionsService.isApiDisponivel() && (
                            <span className="text-xs text-gray-400">estimativa</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Tempo não calculado</span>
                      )}
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <div className="text-blue-600 text-lg">⭐</div>
                )}
              </div>
              
              {/* Funções */}
              {p.funcoes && p.funcoes.length > 0 && (
                <div className="text-xs text-gray-700">
                  <span className="font-medium">Funções:</span> {p.funcoes.map((f: any) => (typeof f === 'string' ? f : f?.funcao || '')).filter(Boolean).join(', ')}
                  
                  {/* Observação para antenistas */}
                  {p.funcoes.some((f: any) => (typeof f === 'string' ? f : f?.funcao || '').toLowerCase().includes('antenista')) && p.modelo_antena && (
                    <div className="mt-1 text-xs text-blue-600 font-medium">
                      📡 Antena: {p.modelo_antena}
                    </div>
                  )}
                </div>
              )}
              
              {/* Telefone com link WhatsApp */}
              {p.telefone && (
                <div className="text-xs text-gray-700 flex items-center gap-2">
                  <span className="font-medium">Telefone:</span>
                  <a
                    href={`https://wa.me/55${p.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📱 {p.telefone}
                  </a>
                </div>
              )}
              
              {/* Endereço */}
              {endereco && (
                <div className="text-xs text-gray-700 flex items-center gap-2">
                  <span><b>Endereço:</b> {endereco}</span>
                  {urlMaps && (
                    <a
                      href={urlMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver no Maps
                    </a>
                  )}
                </div>
              )}
              
              {!p.latitude || !p.longitude ? (
                <div className="text-xs text-red-500">Sem localização no mapa</div>
              ) : null}
              
              {/* Botão de ação */}
              {pontoReferencia && p.latitude && p.longitude && (
                <div className="mt-2">
                  <button
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    onClick={(e) => handleTraçarRota(p, e)}
                  >
                    🚗 Traçar Rota
                  </button>
                </div>
              )}
              
              {/* Informações adicionais se selecionado */}
              {isSelected && pontoReferencia && p.latitude && p.longitude && (
                <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-xs text-blue-800">
                    <div className="font-medium mb-1">📍 Rota disponível:</div>
                    <div>• Clique em "Traçar Rota" para ver o caminho</div>
                    <div>• Use "Google Maps" para navegação externa</div>
                    {temposDeslocamento.has(p.id) && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="font-medium text-orange-700">⏱️ Tempo de chegada:</div>
                        <div className="text-orange-600">
                          {temposDeslocamento.get(p.id)!.duracao} 
                          <span className="text-gray-500 ml-1">
                            ({temposDeslocamento.get(p.id)!.distancia})
                          </span>
                        </div>
                        {!directionsService.isApiDisponivel() && (
                          <div className="text-xs text-gray-500 mt-1">
                            * Estimativa baseada em distância em linha reta
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {prestadoresOrdenados.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">🔍 Nenhum prestador encontrado</div>
            <div className="text-sm">
              {pontoReferencia 
                ? 'Tente ampliar a área de busca ou verificar o endereço informado'
                : 'Digite um endereço ou coordenadas para encontrar prestadores próximos'
              }
            </div>
          </div>
        )}
      </div>
      {/* Informação do total de prestadores cadastrados */}
      <div className="p-4 border-t bg-gray-50 text-gray-700 text-sm text-center">
        <span className="font-semibold">Total de prestadores cadastrados:</span> {totalPrestadores ?? prestadores.length}
      </div>
    </aside>
  );
};

export default PainelPrestadores; 