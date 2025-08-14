import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Ocorrencia } from '@/types/ocorrencia';
import api from '@/services/api';
import Badge from '@/components/ui/badge';
import { MapPin, Phone, User, CheckCircle } from 'lucide-react';

interface Prestador {
  id: number;
  nome: string;
  cod_nome: string | null;
  telefone?: string;
  cidade?: string;
  estado?: string;
  funcoes?: string[];
  regioes?: string[];
}

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrestadorPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose, open, onOpenChange }) => {
  const [selecionado, setSelecionado] = useState(ocorrencia.prestador || '');
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Força o uso do Badge para evitar erro de importação não utilizada
  const BadgeComponent = Badge;

  useEffect(() => {
    const carregarPrestadores = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/v1/prestadores/popup');
        if (Array.isArray(data)) {
          setPrestadores(data);
        } else {
          console.error('❌ Formato inesperado de prestadores:', data);
          setPrestadores([]);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar prestadores:', err);
        setPrestadores([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      carregarPrestadores();
    }
  }, [open]);

  useEffect(() => {
    setSelecionado(ocorrencia.prestador || '');
  }, [ocorrencia.id]);

  const salvar = async () => {
    try {
      setLoading(true);
      const { data } = await api.put(`/api/ocorrencias/${ocorrencia.id}`, {
        prestador: selecionado,
      });
      onUpdate(data);
      onOpenChange(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
      alert('Erro ao salvar prestador. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filtrados =
    filtro.trim().length >= 2
      ? prestadores.filter(p =>
          normalize(`${p.nome} ${p.cod_nome ?? ''} ${p.cidade ?? ''} ${p.estado ?? ''}`).includes(normalize(filtro))
        )
      : prestadores.slice(0, 10); // Mostrar apenas os primeiros 10 se não houver filtro

  const prestadorSelecionado = prestadores.find(p => p.nome === selecionado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] md:w-[90vw] lg:w-[85vw] max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 md:p-6 lg:p-8 rounded-t-lg">
          <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Selecionar Prestador</DialogTitle>
          <DialogDescription className="text-blue-100 text-sm md:text-base lg:text-lg opacity-90">
            Escolha um prestador para vincular à ocorrência #{ocorrencia.id}
          </DialogDescription>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
          {/* Barra de Busca */}
          <div className="relative">
            <div className="relative">
              <Input
                placeholder="Buscar por nome, codinome, cidade..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="w-full text-base md:text-lg py-3 md:py-4 lg:py-5 px-4 md:px-5 lg:px-6 pl-10 md:pl-12 border-0 bg-white shadow-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 rounded-xl md:rounded-2xl transition-all duration-300"
              />
              <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 md:py-16 lg:py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
              </div>
              <p className="mt-4 md:mt-5 lg:mt-6 text-gray-600 text-base md:text-lg lg:text-xl font-medium">Carregando prestadores...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8">
              {/* Layout Mobile - Lista Simples */}
              <div className="block lg:hidden">
                {/* Prestador Selecionado Mobile */}
                {prestadorSelecionado && (
                  <div className="mb-4 md:mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-4 md:p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-500 p-2 md:p-3 rounded-full shadow-md">
                          <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <span className="font-bold text-emerald-800 text-lg md:text-xl">Prestador Selecionado</span>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                          <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                            <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-base md:text-lg text-gray-800 truncate">{prestadorSelecionado.nome}</span>
                            {prestadorSelecionado.cod_nome && (
                              <BadgeComponent key="selected-cod" className="text-xs md:text-sm px-2 md:px-3 py-1 bg-blue-100 text-blue-700 border-0 ml-2">
                                {prestadorSelecionado.cod_nome}
                              </BadgeComponent>
                            )}
                          </div>
                        </div>
                        {prestadorSelecionado.telefone && (
                          <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                            <div className="bg-green-100 p-2 md:p-3 rounded-full">
                              <Phone className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                            </div>
                            <span className="text-sm md:text-base text-gray-700 font-medium truncate">{prestadorSelecionado.telefone}</span>
                          </div>
                        )}
                        {(prestadorSelecionado.cidade || prestadorSelecionado.estado) && (
                          <div className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                            <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                            </div>
                            <span className="text-sm md:text-base text-gray-700 font-medium truncate">
                              {[prestadorSelecionado.cidade, prestadorSelecionado.estado].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Prestadores Mobile */}
                <div className="space-y-3 md:space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto border-0 rounded-2xl p-3 md:p-4 bg-white/80 backdrop-blur-sm shadow-lg">
                  {filtrados.map(p => (
                    <label key={p.id} className="group block cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg p-3 md:p-4 rounded-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 bg-white shadow-sm">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="relative">
                          <input
                            type="radio"
                            name="prestador"
                            value={p.nome}
                            checked={selecionado === p.nome}
                            onChange={() => setSelecionado(p.nome)}
                            className="mt-1 md:mt-2 mr-2 md:mr-3 scale-110 md:scale-125 accent-blue-600"
                          />
                          {selecionado === p.nome && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <span className="font-bold text-base md:text-lg truncate text-gray-800 group-hover:text-blue-700 transition-colors">
                              {p.nome}
                            </span>
                            {p.cod_nome && (
                              <BadgeComponent className="text-xs px-2 md:px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 flex-shrink-0 shadow-sm">
                                {p.cod_nome}
                              </BadgeComponent>
                            )}
                          </div>
                          <div className="text-sm md:text-base text-gray-600 space-y-2 md:space-y-3">
                            {p.telefone && (
                              <div className="flex items-center gap-2 md:gap-3 p-1 md:p-2 bg-gray-50 rounded-lg">
                                <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-green-500" />
                                <span className="truncate font-medium text-xs md:text-sm">{p.telefone}</span>
                              </div>
                            )}
                            {(p.cidade || p.estado) && (
                              <div className="flex items-center gap-2 md:gap-3 p-1 md:p-2 bg-gray-50 rounded-lg">
                                <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-purple-500" />
                                <span className="truncate font-medium text-xs md:text-sm">{[p.cidade, p.estado].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            {p.funcoes && p.funcoes.length > 0 && (
                              <div className="flex flex-wrap gap-1 md:gap-2 mt-2 md:mt-3">
                                {p.funcoes.slice(0, 3).map((funcao, index) => (
                                  <BadgeComponent key={index} className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0 shadow-sm">
                                    {funcao}
                                  </BadgeComponent>
                                ))}
                                {p.funcoes.length > 3 && (
                                  <BadgeComponent className="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 shadow-sm">
                                    +{p.funcoes.length - 3}
                                  </BadgeComponent>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  {filtro.length >= 2 && filtrados.length === 0 && (
                    <div className="text-center py-8 md:py-12">
                      <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                          <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                          </svg>
                        </div>
                        <p className="text-gray-600 text-base md:text-lg font-semibold mb-1 md:mb-2">Nenhum prestador encontrado</p>
                        <p className="text-gray-500 text-sm md:text-base">Tente ajustar os termos de busca</p>
                      </div>
                    </div>
                  )}
                  {filtro.length < 2 && filtrados.length === 0 && (
                    <div className="text-center py-8 md:py-12">
                      <div className="bg-blue-50 rounded-2xl p-4 md:p-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                          <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-blue-800 text-base md:text-lg font-semibold mb-1 md:mb-2">Digite para buscar</p>
                        <p className="text-blue-600 text-sm md:text-base">Digite pelo menos 2 caracteres para buscar prestadores</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Layout Desktop - Grid */}
              <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Prestador Selecionado Desktop */}
                {prestadorSelecionado && (
                  <div className="xl:col-span-1">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-3xl p-8 h-fit sticky top-0 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-500 p-3 rounded-full shadow-lg">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-emerald-800 text-xl">Prestador Selecionado</span>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-xl text-gray-800">{prestadorSelecionado.nome}</span>
                            {prestadorSelecionado.cod_nome && (
                              <BadgeComponent key="selected-cod" className="text-sm px-3 py-1 bg-blue-100 text-blue-700 border-0 ml-2">
                                {prestadorSelecionado.cod_nome}
                              </BadgeComponent>
                            )}
                          </div>
                        </div>
                        {prestadorSelecionado.telefone && (
                          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                            <div className="bg-green-100 p-3 rounded-full">
                              <Phone className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-lg text-gray-700 font-medium">{prestadorSelecionado.telefone}</span>
                          </div>
                        )}
                        {(prestadorSelecionado.cidade || prestadorSelecionado.estado) && (
                          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                            <div className="bg-purple-100 p-3 rounded-full">
                              <MapPin className="h-6 w-6 text-purple-600" />
                            </div>
                            <span className="text-lg text-gray-700 font-medium">
                              {[prestadorSelecionado.cidade, prestadorSelecionado.estado].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Prestadores Desktop */}
                <div className={`${prestadorSelecionado ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto border-0 rounded-3xl p-6 bg-white/80 backdrop-blur-sm shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filtrados.map(p => (
                        <label key={p.id} className="group block cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-2xl p-6 rounded-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 bg-white shadow-sm hover:scale-[1.02]">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <input
                                type="radio"
                                name="prestador"
                                value={p.nome}
                                checked={selecionado === p.nome}
                                onChange={() => setSelecionado(p.nome)}
                                className="mt-2 mr-4 scale-125 accent-blue-600"
                              />
                              {selecionado === p.nome && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="font-bold text-xl truncate text-gray-800 group-hover:text-blue-700 transition-colors">
                                  {p.nome}
                                </span>
                                {p.cod_nome && (
                                  <BadgeComponent className="text-sm px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 flex-shrink-0 shadow-sm">
                                    {p.cod_nome}
                                  </BadgeComponent>
                                )}
                              </div>
                              <div className="text-base text-gray-600 space-y-3">
                                {p.telefone && (
                                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <Phone className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="truncate font-medium">{p.telefone}</span>
                                  </div>
                                )}
                                {(p.cidade || p.estado) && (
                                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-purple-500" />
                                    <span className="truncate font-medium">{[p.cidade, p.estado].filter(Boolean).join(', ')}</span>
                                  </div>
                                )}
                                {p.funcoes && p.funcoes.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {p.funcoes.slice(0, 4).map((funcao, index) => (
                                      <BadgeComponent key={index} className="text-xs px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0 shadow-sm">
                                        {funcao}
                                      </BadgeComponent>
                                    ))}
                                    {p.funcoes.length > 4 && (
                                      <BadgeComponent className="text-xs px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 shadow-sm">
                                        +{p.funcoes.length - 4}
                                      </BadgeComponent>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    {filtro.length >= 2 && filtrados.length === 0 && (
                      <div className="text-center py-16">
                        <div className="bg-gray-50 rounded-3xl p-8">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                            </svg>
                          </div>
                          <p className="text-gray-600 text-xl font-semibold mb-2">Nenhum prestador encontrado</p>
                          <p className="text-gray-500 text-base">Tente ajustar os termos de busca</p>
                        </div>
                      </div>
                    )}
                    {filtro.length < 2 && filtrados.length === 0 && (
                      <div className="text-center py-16">
                        <div className="bg-blue-50 rounded-3xl p-8">
                          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-blue-800 text-xl font-semibold mb-2">Digite para buscar</p>
                          <p className="text-blue-600 text-base">Digite pelo menos 2 caracteres para buscar prestadores</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-4 md:pt-6 lg:pt-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 rounded-b-lg">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                onClick={() => {
                  onClose();
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto px-6 md:px-8 py-2 md:py-3 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-base md:text-lg font-medium transition-all duration-200 rounded-xl"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={salvar} 
              disabled={!selecionado || loading}
              className="w-full sm:w-auto px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base md:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </div>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrestadorPopup;
