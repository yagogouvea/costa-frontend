import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Ocorrencia } from '@/types/ocorrencia';
import api from '@/services/api';
import BadgeComponent from '@/components/ui/BadgeComponent';
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
  
  // ✅ NOVOS ESTADOS PARA PRESTADOR NÃO CADASTRADO
  const [usarPrestadorNaoCadastrado, setUsarPrestadorNaoCadastrado] = useState(false);
  const [nomePrestadorNaoCadastrado, setNomePrestadorNaoCadastrado] = useState('');
  const [telefonePrestadorNaoCadastrado, setTelefonePrestadorNaoCadastrado] = useState('');

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
      
      if (usarPrestadorNaoCadastrado) {
        // ✅ SALVAR PRESTADOR NÃO CADASTRADO
        if (!nomePrestadorNaoCadastrado.trim()) {
          alert('Nome do prestador é obrigatório');
          return;
        }
        
        // Salvar prestador não cadastrado no banco
        await api.post('/api/v1/prestadores-nao-cadastrados', {
          nome: nomePrestadorNaoCadastrado.trim(),
          telefone: telefonePrestadorNaoCadastrado.trim() || null,
          ocorrencia_id: ocorrencia.id
        });
        
        // Atualizar ocorrência com o nome do prestador não cadastrado
        const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, {
          prestador: nomePrestadorNaoCadastrado.trim(),
        });
        
        onUpdate(data);
        onOpenChange(false);
        onClose();
      } else if (selecionado) {
        // ✅ SALVAR PRESTADOR CADASTRADO SELECIONADO
        const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, {
          prestador: selecionado,
        });
        onUpdate(data);
        onOpenChange(false);
        onClose();
      } else if (prestadorSalvo) {
        // ✅ ATUALIZAR PRESTADOR EXISTENTE (sem mudanças)
        onUpdate(ocorrencia);
        onOpenChange(false);
        onClose();
      } else {
        // ❌ NENHUMA OPÇÃO SELECIONADA
        alert('Selecione um prestador ou marque a opção de prestador não cadastrado');
      }
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
  
  // ✅ PRESTADOR SALVO (pode ser cadastrado ou não cadastrado)
  const prestadorSalvo = ocorrencia.prestador;
  const isPrestadorNaoCadastrado = prestadorSalvo && !prestadores.find(p => p.nome === prestadorSalvo);
  
  // ✅ FUNÇÃO PARA LIMPAR SELEÇÕES QUANDO ALTERNAR ENTRE MODOS
  const handleTogglePrestadorNaoCadastrado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUsarPrestadorNaoCadastrado(checked);
    if (checked) {
      setSelecionado(''); // Limpar seleção de prestador cadastrado
    } else {
      setNomePrestadorNaoCadastrado(''); // Limpar campos de prestador não cadastrado
      setTelefonePrestadorNaoCadastrado('');
    }
  };
  
  // ✅ FUNÇÃO PARA EXCLUIR PRESTADOR DA OCORRÊNCIA
  const excluirPrestador = async () => {
    try {
      setLoading(true);
      
      // Atualizar ocorrência removendo o prestador
      const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, {
        prestador: null,
      });
      
      onUpdate(data);
      setSelecionado('');
      setNomePrestadorNaoCadastrado('');
      setTelefonePrestadorNaoCadastrado('');
      setUsarPrestadorNaoCadastrado(false);
      
      console.log('✅ Prestador removido da ocorrência com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover prestador:', error);
      alert('Erro ao remover prestador. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto p-0 border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-2xl">
        <DialogTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-center py-6 md:py-8 lg:py-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          Selecionar Prestador
        </DialogTitle>
        <DialogDescription className="text-center text-blue-100 text-base md:text-lg lg:text-xl px-6 md:px-8 lg:px-10 pb-4 md:pb-6 lg:pb-8">
          Escolha um prestador cadastrado ou adicione um novo
        </DialogDescription>

        <div className="px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10">
          {/* ✅ SEÇÃO PRESTADOR NÃO CADASTRADO */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-3 sm:p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-6">
                <input
                  type="checkbox"
                  id="prestadorNaoCadastrado"
                  checked={usarPrestadorNaoCadastrado}
                  onChange={handleTogglePrestadorNaoCadastrado}
                  className="w-5 h-5 md:w-6 md:h-6 accent-orange-600"
                />
                <label htmlFor="prestadorNaoCadastrado" className="text-lg md:text-xl font-semibold text-orange-800 cursor-pointer">
                  Adicionar prestador não cadastrado
                </label>
              </div>
              
              {usarPrestadorNaoCadastrado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2 sm:gap-3 sm:p-6">
                  <div>
                    <label className="block text-xs sm:text-sm md:text-base font-medium text-orange-700 mb-2">
                      Nome do prestador <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      value={nomePrestadorNaoCadastrado}
                      onChange={(e) => setNomePrestadorNaoCadastrado(e.target.value)}
                      className="w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm md:text-base font-medium text-orange-700 mb-2">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={telefonePrestadorNaoCadastrado}
                      onChange={(e) => setTelefonePrestadorNaoCadastrado(e.target.value)}
                      className="w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Busca */}
          {!usarPrestadorNaoCadastrado && (
            <div className="mb-8 md:mb-10 lg:mb-12">
              <div className="relative">
                <div className="relative">
                  <Input
                    placeholder="Buscar por nome, codinome, cidade..."
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
                    className="w-full text-base md:text-lg py-4 md:py-5 lg:py-6 px-4 md:px-5 lg:px-6 pl-12 md:pl-14 border-0 bg-white shadow-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 rounded-xl md:rounded-2xl transition-all duration-300"
                  />
                  <div className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 md:w-7 md:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 md:py-20 lg:py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
              </div>
              <p className="mt-6 md:mt-7 lg:mt-8 text-gray-600 text-lg md:text-xl lg:text-2xl font-medium">Carregando prestadores...</p>
            </div>
          ) : (
            <>
              {/* Layout Mobile - Lista Simples */}
              <div className="block lg:hidden">
                {/* ✅ PRESTADOR SALVO/SELEcionado Mobile */}
                {(prestadorSalvo || prestadorSelecionado) && (
                  <div className="mb-4 md:mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-4 md:p-3 sm:p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-emerald-500 p-2 md:p-3 rounded-full shadow-md">
                            <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <span className="font-bold text-emerald-800 text-lg md:text-xl">
                            {prestadorSalvo ? 'Prestador Atual' : 'Prestador Selecionado'}
                          </span>
                        </div>
                        {prestadorSalvo && (
                          <Button
                            onClick={excluirPrestador}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          >
                            {loading ? 'Removendo...' : 'Remover'}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                          <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                            <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-base md:text-lg text-gray-800 truncate">
                              {prestadorSalvo || prestadorSelecionado?.nome}
                            </span>
                            {prestadorSelecionado?.cod_nome && (
                              <BadgeComponent key="selected-cod" className="text-xs md:text-xs sm:text-sm px-2 md:px-3 py-1 bg-blue-100 text-blue-700 border-0 ml-2">
                                {prestadorSelecionado.cod_nome}
                              </BadgeComponent>
                            )}
                            {isPrestadorNaoCadastrado && (
                              <BadgeComponent className="text-xs md:text-xs sm:text-sm px-2 md:px-3 py-1 bg-orange-100 text-orange-700 border-0 ml-2">
                                Não Cadastrado
                              </BadgeComponent>
                            )}
                          </div>
                        </div>
                        {/* Mostrar telefone se disponível (prestador cadastrado) */}
                        {prestadorSelecionado?.telefone && (
                          <div className="flex items-center gap-2 sm:gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                            <div className="bg-green-100 p-2 md:p-3 rounded-full">
                              <Phone className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                            </div>
                            <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium truncate">{prestadorSelecionado.telefone}</span>
                          </div>
                        )}
                        {/* Mostrar localização se disponível (prestador cadastrado) */}
                        {(prestadorSelecionado?.cidade || prestadorSelecionado?.estado) && (
                          <div className="flex items-center gap-2 sm:gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                            <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                            </div>
                            <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium truncate">
                              {[prestadorSelecionado.cidade, prestadorSelecionado.estado].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Prestadores Mobile - Mostrar apenas se não há prestador salvo */}
                {!prestadorSalvo && (
                  <div className="space-y-3 md:space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto border-0 rounded-2xl p-3 md:p-4 bg-white/80 backdrop-blur-sm shadow-lg">
                    {filtrados.map(p => (
                      <label key={p.id} className="group block cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg p-3 md:p-4 rounded-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 bg-white shadow-sm">
                        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
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
                            <div className="flex items-center gap-2 md:gap-2 sm:gap-3 mb-2 md:mb-3">
                              <span className="font-bold text-base md:text-lg truncate text-gray-800 group-hover:text-blue-700 transition-colors">
                                {p.nome}
                              </span>
                              {p.cod_nome && (
                                <BadgeComponent className="text-xs px-2 md:px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 flex-shrink-0 shadow-sm">
                                  {p.cod_nome}
                                </BadgeComponent>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm md:text-base text-gray-600 space-y-2 md:space-y-3">
                              {p.telefone && (
                                <div className="flex items-center gap-2 md:gap-2 sm:gap-3 p-1 md:p-2 bg-gray-50 rounded-lg">
                                  <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-green-500" />
                                  <span className="truncate font-medium text-xs md:text-xs sm:text-sm">{p.telefone}</span>
                                </div>
                              )}
                              {(p.cidade || p.estado) && (
                                <div className="flex items-center gap-2 md:gap-2 sm:gap-3 p-1 md:p-2 bg-gray-50 rounded-lg">
                                  <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-purple-500" />
                                  <span className="truncate font-medium text-xs md:text-xs sm:text-sm">{[p.cidade, p.estado].filter(Boolean).join(', ')}</span>
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
                        <div className="bg-gray-50 rounded-2xl p-4 md:p-3 sm:p-6">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                            </svg>
                          </div>
                          <p className="text-gray-600 text-base md:text-lg font-semibold mb-1 md:mb-2">Nenhum prestador encontrado</p>
                          <p className="text-gray-500 text-xs sm:text-sm md:text-base">Tente ajustar os termos de busca</p>
                        </div>
                      </div>
                    )}
                    {filtro.length < 2 && filtrados.length === 0 && (
                      <div className="text-center py-8 md:p-12">
                        <div className="bg-blue-50 rounded-2xl p-4 md:p-3 sm:p-6">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-blue-800 text-base md:text-lg font-semibold mb-1 md:mb-2">Digite para buscar</p>
                          <p className="text-blue-600 text-xs sm:text-sm md:text-base">Digite pelo menos 2 caracteres para buscar prestadores</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Layout Desktop - Grid */}
              <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-3 sm:p-6 lg:gap-8">
                {/* ✅ PRESTADOR SALVO/SELEcionado Desktop */}
                {(prestadorSalvo || prestadorSelecionado) && (
                  <div className="xl:col-span-1">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-3xl p-8 h-fit sticky top-0 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-500 p-3 rounded-full shadow-lg">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-bold text-emerald-800 text-xl">
                            {prestadorSalvo ? 'Prestador Atual' : 'Prestador Selecionado'}
                          </span>
                        </div>
                        {prestadorSalvo && (
                          <Button
                            onClick={excluirPrestador}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          >
                            {loading ? 'Removendo...' : 'Remover'}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-xl text-gray-800">{prestadorSalvo || prestadorSelecionado?.nome}</span>
                            {prestadorSelecionado?.cod_nome && (
                              <BadgeComponent key="selected-cod" className="text-xs sm:text-sm px-3 py-1 bg-blue-100 text-blue-700 border-0 ml-2">
                                {prestadorSelecionado.cod_nome}
                              </BadgeComponent>
                            )}
                            {isPrestadorNaoCadastrado && (
                              <BadgeComponent className="text-xs sm:text-sm px-3 py-1 bg-orange-100 text-orange-700 border-0 ml-2">
                                Não Cadastrado
                              </BadgeComponent>
                            )}
                          </div>
                        </div>
                        {/* Mostrar telefone se disponível (prestador cadastrado) */}
                        {prestadorSelecionado?.telefone && (
                          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                            <div className="bg-green-100 p-3 rounded-full">
                              <Phone className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-lg text-gray-700 font-medium">{prestadorSelecionado.telefone}</span>
                          </div>
                        )}
                        {/* Mostrar localização se disponível (prestador cadastrado) */}
                        {(prestadorSelecionado?.cidade || prestadorSelecionado?.estado) && (
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

                {/* Lista de Prestadores Desktop - Mostrar apenas se não há prestador salvo */}
                {!prestadorSalvo && (
                  <div className={`${prestadorSelecionado ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto border-0 rounded-3xl p-3 sm:p-6 bg-white/80 backdrop-blur-sm shadow-xl">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 sm:p-6">
                        {filtrados.map(p => (
                          <label key={p.id} className="group block cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-2xl p-3 sm:p-6 rounded-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 bg-white shadow-sm hover:scale-[1.02]">
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
                                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                  <span className="font-bold text-lg truncate text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {p.nome}
                                  </span>
                                  {p.cod_nome && (
                                    <BadgeComponent className="text-xs sm:text-sm px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 flex-shrink-0 shadow-sm">
                                      {p.cod_nome}
                                    </BadgeComponent>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 space-y-3">
                                  {p.telefone && (
                                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-lg">
                                      <Phone className="h-5 w-5 flex-shrink-0 text-green-500" />
                                      <span className="truncate font-medium">{p.telefone}</span>
                                    </div>
                                  )}
                                  {(p.cidade || p.estado) && (
                                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-lg">
                                      <MapPin className="h-5 w-5 flex-shrink-0 text-purple-500" />
                                      <span className="truncate font-medium">{[p.cidade, p.estado].filter(Boolean).join(', ')}</span>
                                    </div>
                                  )}
                                  {p.funcoes && p.funcoes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
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
                      </div>
                      
                      {filtro.length >= 2 && filtrados.length === 0 && (
                        <div className="text-center py-8 md:py-12">
                          <div className="bg-gray-50 rounded-2xl p-4 md:p-3 sm:p-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                              <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                              </svg>
                            </div>
                            <p className="text-gray-600 text-base md:text-lg font-semibold mb-1 md:mb-2">Nenhum prestador encontrado</p>
                            <p className="text-gray-500 text-xs sm:text-sm md:text-base">Tente ajustar os termos de busca</p>
                          </div>
                        </div>
                      )}
                      {filtro.length < 2 && filtrados.length === 0 && (
                        <div className="text-center py-8 md:p-12">
                          <div className="bg-blue-50 rounded-2xl p-4 md:p-3 sm:p-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <p className="text-blue-800 text-base md:text-lg font-semibold mb-1 md:mb-2">Digite para buscar</p>
                            <p className="text-blue-600 text-xs sm:text-sm md:text-base">Digite pelo menos 2 caracteres para buscar prestadores</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 md:gap-2 sm:gap-3 sm:p-6 pt-6 md:pt-8 lg:pt-10 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 -mx-6 md:-mx-8 lg:-mx-10 px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10 rounded-b-lg">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                onClick={() => {
                  onClose();
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-base md:text-lg font-medium transition-all duration-200 rounded-xl"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={salvar} 
              disabled={(!selecionado && !usarPrestadorNaoCadastrado && !prestadorSalvo) || (usarPrestadorNaoCadastrado && !nomePrestadorNaoCadastrado.trim()) || loading}
              className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base md:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </div>
              ) : prestadorSalvo ? (
                'Atualizar'
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
