import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import BadgeComponent from '@/components/ui/BadgeComponent';
import { api } from '@/services/api';
import { 
  Phone, 
  Clock, 
  Car, 
  Plus, 
  Trash2, 
  Search,
  CheckCircle,
  Users,
  Edit
} from 'lucide-react';

interface Prestador {
  id: number;
  nome: string;
  cod_nome?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  funcoes?: string[];
}

interface ApoioAdicional {
  id?: number;
  nome_prestador: string;
  is_prestador_cadastrado: boolean;
  prestador_id?: number;
  telefone?: string;
  hora_inicial?: string;
  hora_final?: string;
  hora_inicial_local?: string;
  km_inicial?: number;
  km_final?: number;
  franquia_km: boolean;
  observacoes?: string;
  ordem: number;
}

interface PrestadorAdicionalPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  ocorrencia: any;
  onUpdate: (ocorrencia: any) => void;
}

const PrestadorAdicionalPopup: React.FC<PrestadorAdicionalPopupProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  ocorrencia,
  onUpdate
}) => {
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [apoiosAdicionais, setApoiosAdicionais] = useState<ApoioAdicional[]>([]);
  const [apoiosRemovidos, setApoiosRemovidos] = useState<number[]>([]);
  
  // Estados de edição
  const [editando, setEditando] = useState(false);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
  
  // Estados de pesquisa
  const [filtro, setFiltro] = useState('');
  const [filtrados, setFiltrados] = useState<Prestador[]>([]);
  
  // Estados para novo apoio
  const [novoApoio, setNovoApoio] = useState<ApoioAdicional>({
    nome_prestador: '',
    is_prestador_cadastrado: true,
    telefone: '',
    hora_inicial: '',
    hora_final: '',
    hora_inicial_local: '',
    km_inicial: undefined,
    km_final: undefined,
    franquia_km: false,
    observacoes: '',
    ordem: 1
  });

  // Estados de validação
  const [erros, setErros] = useState<Record<string, string>>({});

  // Carregar prestadores e apoios existentes
  useEffect(() => {
    if (isOpen) {
      carregarPrestadores();
      carregarApoiosAdicionais();
      // Limpar estado de apoios removidos ao abrir
      setApoiosRemovidos([]);
      // Limpar estado de edição ao abrir
      setEditando(false);
      setIndiceEditando(null);
    }
  }, [isOpen]);

  // Filtrar prestadores
  useEffect(() => {
    if (filtro.length >= 2 && Array.isArray(prestadores)) {
      const filtrados = prestadores.filter(p => 
        p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        p.cod_nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        p.cidade?.toLowerCase().includes(filtro.toLowerCase()) ||
        p.estado?.toLowerCase().includes(filtro.toLowerCase())
      );
      setFiltrados(filtrados);
    } else {
      setFiltrados([]);
    }
  }, [filtro, prestadores]);

  const carregarPrestadores = async () => {
    try {
      // Usar a API correta para buscar prestadores cadastrados
      const { data } = await api.get('/api/v1/prestadores/popup');
      // Garantir que data seja sempre um array
      setPrestadores(Array.isArray(data) ? data : []);
      console.log('✅ Prestadores carregados:', data);
    } catch (error) {
      console.error('❌ Erro ao carregar prestadores:', error);
      setPrestadores([]);
    }
  };

  const carregarApoiosAdicionais = async () => {
    try {
      const { data } = await api.get(`/api/v1/apoios-adicionais/${ocorrencia.id}`);
      console.log('📥 Apoios carregados do banco:', data);
      
      // Verificar se os dados estão corretos
      if (Array.isArray(data)) {
        data.forEach((apoio, index) => {
          console.log(`📋 Apoio ${index + 1}:`, {
            id: apoio.id,
            nome: apoio.nome_prestador,
            hora_inicial: apoio.hora_inicial,
            hora_final: apoio.hora_final,
            hora_inicial_local: apoio.hora_inicial_local,
            km_inicial: apoio.km_inicial,
            km_final: apoio.km_final
          });
        });
      }
      
      setApoiosAdicionais(data);
      
      // Limpar estado de edição ao recarregar
      setEditando(false);
      setIndiceEditando(null);
    } catch (error: any) {
      console.error('❌ Erro ao carregar apoios adicionais:', error);
      
      // Verificar se é erro 500 (problema no banco)
      if (error?.response?.status === 500) {
        console.error('🚨 ERRO 500: Problema no servidor/banco de dados');
        console.error('💡 Verifique se a migração do Prisma foi executada');
        alert('Erro no servidor ao salvar. Verifique se o banco de dados foi atualizado com a migração do campo "hora_inicial_local".\n\nExecute no terminal:\ncd cliente-costa/backend-costa\nnpx prisma migrate dev --name add_hora_inicial_local_to_apoio_adicional');
      } else {
        alert('Erro ao salvar apoios adicionais. Tente novamente.');
      }
      
      setApoiosAdicionais([]);
    }
  };

  const validarApoio = (apoio: ApoioAdicional): boolean => {
    const novosErros: Record<string, string> = {};

    if (!apoio.nome_prestador.trim()) {
      novosErros.nome_prestador = 'Nome do prestador é obrigatório';
    }

    if (apoio.hora_inicial && !apoio.hora_final) {
      novosErros.hora_final = 'Hora final é obrigatória quando há hora inicial';
    }

    if (apoio.hora_final && !apoio.hora_inicial) {
      novosErros.hora_inicial = 'Hora inicial é obrigatória quando há hora final';
    }

    if (apoio.km_inicial !== undefined && !apoio.km_final) {
      novosErros.km_final = 'KM final é obrigatório quando há KM inicial';
    }

    if (apoio.km_final !== undefined && !apoio.km_inicial) {
      novosErros.km_inicial = 'KM inicial é obrigatório quando há KM final';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Função não utilizada no momento
  // const limparErro = (campo: string) => {
  //   if (erros[campo]) {
  //     setErros(prev => {
  //       const novosErros = { ...prev };
  //       delete novosErros[campo];
  //       return novosErros;
  //     });
  //   }
  // };

  const adicionarApoio = () => {
    if (!validarApoio(novoApoio)) {
      return;
    }

    if (editando && indiceEditando !== null) {
      // Modo de edição: atualizar apoio existente
      const apoioAtualizado = { ...novoApoio };
      
      // Se o apoio já foi salvo no banco, manter o ID
      if (apoiosAdicionais[indiceEditando].id) {
        apoioAtualizado.id = apoiosAdicionais[indiceEditando].id;
      }
      
      console.log('✏️ Editando apoio:', {
        indice: indiceEditando,
        dadosAntigos: apoiosAdicionais[indiceEditando],
        dadosNovos: apoioAtualizado,
        hora_inicial_local: apoioAtualizado.hora_inicial_local
      });
      
      setApoiosAdicionais(prev => prev.map((apoio, i) => 
        i === indiceEditando ? apoioAtualizado : apoio
      ));
      
      console.log('✅ Apoio atualizado:', indiceEditando);
      
      // Sair do modo de edição
      setEditando(false);
      setIndiceEditando(null);
    } else {
      // Modo de adição: criar novo apoio
      const ordem = apoiosAdicionais.length + 2; // Começa do 2º apoio
      const apoioCompleto = { ...novoApoio, ordem };
      
      setApoiosAdicionais(prev => [...prev, apoioCompleto]);
      console.log('➕ Novo apoio adicionado');
    }
    
    // Limpar formulário
    setNovoApoio({
      nome_prestador: '',
      is_prestador_cadastrado: true,
      telefone: '',
      hora_inicial: '',
      hora_final: '',
      hora_inicial_local: '',
      km_inicial: undefined,
      km_final: undefined,
      franquia_km: false,
      observacoes: '',
      ordem: 1
    });
    
    setErros({});
  };

  const removerApoio = (index: number) => {
    const apoio = apoiosAdicionais[index];
    
    // Se o apoio já foi salvo no banco (tem ID), marcar para remoção
    if (apoio.id) {
      setApoiosRemovidos(prev => [...prev, apoio.id as number]);
      console.log('🗑️ Apoio marcado para remoção:', apoio.id);
    }
    
    // Remover do estado local
    setApoiosAdicionais(prev => prev.filter((_, i) => i !== index));
    
    console.log('ℹ️ Apoio removido da lista local');
  };

  // Função não utilizada no momento
  // const editarApoio = (index: number, campo: keyof ApoioAdicional, valor: any) => {
  //   setApoiosAdicionais(prev => prev.map((apoio, i) => 
  //     i === index ? { ...apoio, [campo]: valor } : apoio
  //   ));
  // };

  const iniciarEdicao = (index: number) => {
    const apoio = apoiosAdicionais[index];
    
    console.log('🔍 Iniciando edição do apoio:', {
      indice: index,
      dadosOriginais: apoio,
      hora_inicial_local: apoio.hora_inicial_local
    });
    
    // Função para converter data UTC para formato local
    const converterParaFormatoLocal = (dataUTC: string | undefined): string => {
      if (!dataUTC) return '';
      const data = new Date(dataUTC);
      // Converter para formato YYYY-MM-DDTHH:mm
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      const hora = String(data.getHours()).padStart(2, '0');
      const minuto = String(data.getMinutes()).padStart(2, '0');
      return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };
    
    // Preencher o formulário com os dados do apoio
    setNovoApoio({
      nome_prestador: apoio.nome_prestador,
      is_prestador_cadastrado: apoio.is_prestador_cadastrado,
      prestador_id: apoio.prestador_id,
      telefone: apoio.telefone || '',
      hora_inicial: converterParaFormatoLocal(apoio.hora_inicial),
      hora_final: converterParaFormatoLocal(apoio.hora_final),
      hora_inicial_local: converterParaFormatoLocal(apoio.hora_inicial_local),
      km_inicial: apoio.km_inicial,
      km_final: apoio.km_final,
      franquia_km: apoio.franquia_km,
      observacoes: apoio.observacoes || '',
      ordem: apoio.ordem
    });
    
    console.log('📝 Formulário preenchido:', {
      hora_inicial_local: converterParaFormatoLocal(apoio.hora_inicial_local)
    });
    
    // Ativar modo de edição
    setEditando(true);
    setIndiceEditando(index);
    
    // Limpar erros
    setErros({});
    
    console.log('✏️ Iniciando edição do apoio:', index);
  };

  const cancelarEdicao = () => {
    // Limpar formulário
    setNovoApoio({
      nome_prestador: '',
      is_prestador_cadastrado: true,
      telefone: '',
      hora_inicial: '',
      hora_final: '',
      hora_inicial_local: '',
      km_inicial: undefined,
      km_final: undefined,
      franquia_km: false,
      observacoes: '',
      ordem: 1
    });
    
    // Desativar modo de edição
    setEditando(false);
    setIndiceEditando(null);
    
    // Limpar erros
    setErros({});
    
    console.log('❌ Edição cancelada');
  };

  const salvarTodos = async () => {
    try {
      setLoading(true);
      
      // Excluir apoios marcados para remoção
      for (const id of apoiosRemovidos) {
        await api.delete(`/api/v1/apoios-adicionais/${id}`);
        console.log('🗑️ Apoio removido do banco:', id);
      }
      
      // Salvar/atualizar apoios atuais
      for (const apoio of apoiosAdicionais) {
        console.log('🔄 Salvando apoio:', {
          id: apoio.id,
          nome: apoio.nome_prestador,
          hora_inicial: apoio.hora_inicial,
          hora_final: apoio.hora_final,
          hora_inicial_local: apoio.hora_inicial_local,
          km_inicial: apoio.km_inicial,
          km_final: apoio.km_final
        });
        
        if (apoio.id) {
          // Atualizar existente
          await api.put(`/api/v1/apoios-adicionais/${apoio.id}`, apoio);
          console.log('✅ Apoio atualizado:', apoio.id, 'Dados:', apoio);
        } else {
          // Criar novo
          const { data: novoApoio } = await api.post('/api/v1/apoios-adicionais', {
            ...apoio,
            ocorrencia_id: ocorrencia.id
          });
          console.log('➕ Novo apoio criado:', novoApoio.id, 'Dados:', apoio);
        }
      }

      // Limpar estado de apoios removidos
      setApoiosRemovidos([]);
      
      // Limpar estado de edição
      setEditando(false);
      setIndiceEditando(null);
      
      // Atualizar a ocorrência com os dados mais recentes
      if (onUpdate) {
        onUpdate({
          ...ocorrencia,
          apoios_adicionais: apoiosAdicionais
        });
      }
      
      // Fechar popup diretamente sem recarregar
      onOpenChange(false);
      onClose();
      
      console.log('✅ Todos os apoios adicionais foram sincronizados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao salvar apoios adicionais:', error);
      
      // Verificar se é erro 500 (problema no banco)
      if (error?.response?.status === 500) {
        console.error('🚨 ERRO 500: Problema no servidor/banco de dados');
        console.error('💡 Verifique se a migração do Prisma foi executada');
        alert('Erro no servidor ao salvar. Verifique se o banco de dados foi atualizado com a migração do campo "hora_inicial_local".\n\nExecute no terminal:\ncd cliente-costa/backend-costa\nnpx prisma migrate dev --name add_hora_inicial_local_to_apoio_adicional');
      } else {
        alert('Erro ao salvar apoios adicionais. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selecionarPrestador = (prestador: Prestador) => {
    setNovoApoio(prev => ({
      ...prev,
      nome_prestador: prestador.nome,
      is_prestador_cadastrado: true,
      prestador_id: prestador.id,
      telefone: prestador.telefone || ''
    }));
    setFiltro('');
  };

  const togglePrestadorNaoCadastrado = (checked: boolean) => {
    setNovoApoio(prev => ({
      ...prev,
      is_prestador_cadastrado: !checked,
      prestador_id: checked ? undefined : prev.prestador_id,
      nome_prestador: checked ? '' : prev.nome_prestador
    }));
  };

  const formatarOrdem = (ordem: number): string => {
    const ordinais = ['', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º'];
    return ordinais[ordem] || `${ordem}º`;
  };

  // Função não utilizada no momento
  // const formatarHora = (hora: string): string => {
  //   if (!hora) return '';
  //   const data = new Date(hora);
  //   return data.toLocaleTimeString('pt-BR', { 
  //     hour: '2-digit', 
  //     minute: '2-digit' 
  //   });
  // };

  const formatarDataHora = (dataHora: string | undefined): string => {
    if (!dataHora) return '';
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto p-0 border-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-2xl">
        <DialogHeader className="text-center py-6 md:py-8 lg:py-10 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-t-lg">
          <DialogTitle className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Prestador Adicional
          </DialogTitle>
          <p className="text-purple-100 text-base md:text-lg lg:text-xl mt-2">
            Adicione um ou mais prestadores de apoio à ocorrência
          </p>
        </DialogHeader>

        <div className="px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10">
          {/* Formulário para adicionar novo apoio */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 sm:p-6 md:p-8 lg:p-10">
              <h3 className="text-xl md:text-2xl font-semibold text-blue-800 mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                <Plus className="w-6 h-6 md:w-7 md:h-7" />
                {editando ? 'Editar Apoio Existente' : 'Adicionar Novo Apoio'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 sm:p-6 md:gap-8">
                {/* Seleção de prestador */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 sm:gap-3 mb-6">
                    <Checkbox
                      id="prestadorNaoCadastrado"
                      checked={!novoApoio.is_prestador_cadastrado}
                      onCheckedChange={(checked) => togglePrestadorNaoCadastrado(checked as boolean)}
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                    <Label htmlFor="prestadorNaoCadastrado" className="text-base md:text-lg font-medium text-blue-700 cursor-pointer">
                      Prestador não cadastrado
                    </Label>
                  </div>
                  
                  {novoApoio.is_prestador_cadastrado ? (
                    <div className="space-y-4">
                      <Label className="text-base md:text-lg font-medium text-blue-700">
                        Buscar prestador cadastrado
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder="Buscar por nome, codinome, cidade ou estado..."
                          value={filtro}
                          onChange={(e) => setFiltro(e.target.value)}
                          className="w-full pr-10 h-12 text-base"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      
                      {filtro.length >= 2 && filtrados.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                          {filtrados.map((prestador) => (
                            <div
                              key={prestador.id}
                              onClick={() => selecionarPrestador(prestador)}
                              className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-800 text-base">{prestador.nome}</div>
                              <div className="flex items-center gap-2 mt-2">
                                {prestador.cod_nome && (
                                  <BadgeComponent className="text-xs bg-blue-100 text-blue-700">
                                    {prestador.cod_nome}
                                  </BadgeComponent>
                                )}
                                {(prestador.cidade || prestador.estado) && (
                                  <BadgeComponent className="text-xs bg-gray-100 text-gray-700">
                                    {[prestador.cidade, prestador.estado].filter(Boolean).join(', ')}
                                  </BadgeComponent>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {filtro.length >= 2 && filtrados.length === 0 && (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-500 text-xs sm:text-sm">Nenhum prestador encontrado</p>
                          <p className="text-gray-400 text-xs mt-1">Tente outros termos de busca</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-base md:text-lg font-medium text-blue-700">
                        Nome do prestador <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Nome completo"
                        value={novoApoio.nome_prestador}
                        onChange={(e) => setNovoApoio({...novoApoio, nome_prestador: e.target.value})}
                        className={`h-12 text-base ${erros.nome_prestador ? 'border-red-500' : ''}`}
                      />
                      {erros.nome_prestador && (
                        <span className="text-red-500 text-xs sm:text-sm">{erros.nome_prestador}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    Telefone
                  </Label>
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={novoApoio.telefone || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, telefone: e.target.value})}
                    className="h-12 text-base"
                  />
                </div>

                {/* Horários */}
                <div>
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    Data e hora inicial
                  </Label>
                  <Input
                    type="datetime-local"
                    value={novoApoio.hora_inicial || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, hora_inicial: e.target.value})}
                    className={`h-12 text-base ${erros.hora_inicial ? 'border-red-500' : ''}`}
                  />
                  {erros.hora_inicial && (
                    <span className="text-red-500 text-xs sm:text-sm">{erros.hora_inicial}</span>
                  )}
                </div>

                <div>
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    Data e hora local
                  </Label>
                  <Input
                    type="datetime-local"
                    value={novoApoio.hora_inicial_local || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, hora_inicial_local: e.target.value})}
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    Data e hora final
                  </Label>
                  <Input
                    type="datetime-local"
                    value={novoApoio.hora_final || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, hora_final: e.target.value})}
                    className={`h-12 text-base ${erros.hora_final ? 'border-red-500' : ''}`}
                  />
                  {erros.hora_final && (
                    <span className="text-red-500 text-xs sm:text-sm">{erros.hora_final}</span>
                  )}
                </div>

                {/* KM */}
                <div>
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    KM inicial
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={novoApoio.km_inicial || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, km_inicial: parseFloat(e.target.value) || undefined})}
                    className={`h-12 text-base ${erros.km_inicial ? 'border-red-500' : ''}`}
                  />
                  {erros.km_inicial && (
                    <span className="text-red-500 text-xs sm:text-sm">{erros.km_inicial}</span>
                  )}
                </div>

                <div>
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    KM final
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={novoApoio.km_final || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, km_final: parseFloat(e.target.value) || undefined})}
                    className={`h-12 text-base ${erros.km_final ? 'border-red-500' : ''}`}
                  />
                  {erros.km_final && (
                    <span className="text-red-500 text-xs sm:text-sm">{erros.km_final}</span>
                  )}
                </div>

                {/* Franquia KM */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox
                    id="franquiaKm"
                    checked={novoApoio.franquia_km}
                    onCheckedChange={(checked) => setNovoApoio({...novoApoio, franquia_km: checked as boolean})}
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                  <Label htmlFor="franquiaKm" className="text-base md:text-lg font-medium text-blue-700 cursor-pointer">
                    Aplicar franquia KM (0-0)
                  </Label>
                </div>

                {/* Observações */}
                <div className="md:col-span-2 lg:col-span-3">
                  <Label className="text-base md:text-lg font-medium text-blue-700 mb-3 block">
                    Observações
                  </Label>
                  <Textarea
                    placeholder="Observações adicionais..."
                    value={novoApoio.observacoes || ''}
                    onChange={(e) => setNovoApoio({...novoApoio, observacoes: e.target.value})}
                    rows={4}
                    className="text-base"
                  />
                </div>
              </div>

              <div className="mt-6 md:mt-8 flex gap-4">
                {editando && (
                  <Button
                    onClick={cancelarEdicao}
                    variant="ghost"
                    className="px-8 py-4 border-2 border-gray-300 hover:bg-gray-100 text-base font-medium transition-all duration-200 rounded-lg"
                  >
                    Cancelar Edição
                  </Button>
                )}
                <Button
                  onClick={adicionarApoio}
                  disabled={loading}
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 text-base"
                >
                  {editando ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-3" />
                      Adicionar Apoio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de apoios adicionais */}
          <div className="mb-8 md:mb-10">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 md:w-7 md:h-7" />
              Lista de Apoios Adicionais ({apoiosAdicionais.length})
              {editando && (
                <BadgeComponent className="bg-blue-100 text-blue-700 text-xs sm:text-sm">
                  Editando {formatarOrdem(apoiosAdicionais[indiceEditando!]?.ordem || 0)} APOIO
                </BadgeComponent>
              )}
            </h3>
            
            {apoiosAdicionais.length > 0 ? (
              <div className="space-y-6 md:space-y-8">
                {apoiosAdicionais.map((apoio, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 md:p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <BadgeComponent className="bg-purple-100 text-purple-700 text-base font-medium">
                          {formatarOrdem(apoio.ordem)} APOIO
                        </BadgeComponent>
                        {apoio.is_prestador_cadastrado ? (
                          <BadgeComponent className="bg-blue-100 text-blue-700 text-base">
                            Cadastrado
                          </BadgeComponent>
                        ) : (
                          <BadgeComponent className="bg-orange-100 text-orange-700 text-base">
                            Não Cadastrado
                          </BadgeComponent>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => iniciarEdicao(index)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-3"
                          disabled={editando}
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => removerApoio(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-3"
                          disabled={editando}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 sm:p-6 md:gap-8">
                      <div>
                        <span className="text-xs sm:text-sm text-gray-500 uppercase font-medium">Prestador</span>
                        <p className="text-base md:text-lg font-medium text-gray-800 mt-2">
                          {apoio.nome_prestador}
                        </p>
                      </div>
                      
                      {apoio.telefone && (
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500 uppercase font-medium">Telefone</span>
                          <p className="text-base md:text-lg text-gray-800 mt-2 flex items-center gap-2 sm:gap-3">
                            <Phone className="w-5 h-5 text-green-600" />
                            {apoio.telefone}
                          </p>
                        </div>
                      )}
                      
                      {/* Horários agrupados */}
                      {(apoio.hora_inicial || apoio.hora_final || apoio.hora_inicial_local) && (
                        <div className="md:col-span-2">
                          <span className="text-xs sm:text-sm text-gray-500 uppercase font-medium">Horários</span>
                          <div className="space-y-2 mt-2">
                            {apoio.hora_inicial && (
                              <p className="text-base md:text-lg text-gray-800 flex items-center gap-2 sm:gap-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Inicial:</span>
                                {formatarDataHora(apoio.hora_inicial)}
                              </p>
                            )}
                            
                            {/* Horário Local - sempre mostrar, mesmo se vazio */}
                            <p className="text-base md:text-lg text-gray-800 flex items-center gap-2 sm:gap-3">
                              <Clock className="w-5 h-5 text-green-600" />
                              <span className="font-medium">Local:</span>
                              {apoio.hora_inicial_local ? (
                                formatarDataHora(apoio.hora_inicial_local)
                              ) : (
                                <span className="text-gray-400 italic">Não informado</span>
                              )}
                            </p>
                            
                            {apoio.hora_final && (
                              <p className="text-base md:text-lg text-gray-800 flex items-center gap-2 sm:gap-3">
                                <Clock className="w-5 h-5 text-red-600" />
                                <span className="font-medium">Término:</span>
                                {formatarDataHora(apoio.hora_final)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {apoio.km_inicial !== undefined && apoio.km_final !== undefined && (
                        <div>
                          <span className="text-xs sm:text-sm text-gray-500 uppercase font-medium">Quilometragem</span>
                          <p className="text-base md:text-lg text-gray-800 mt-2 flex items-center gap-2 sm:gap-3">
                            <Car className="w-5 h-5 text-purple-600" />
                            {apoio.km_inicial} → {apoio.km_final}
                            {apoio.franquia_km && (
                              <BadgeComponent className="text-xs sm:text-sm bg-yellow-100 text-yellow-700">
                                Franquia
                              </BadgeComponent>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {apoio.observacoes && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <span className="text-xs sm:text-sm text-gray-500 uppercase font-medium">Observações</span>
                        <p className="text-base text-gray-700 mt-2">{apoio.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 md:py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Users className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-6" />
                <h4 className="text-xl md:text-2xl font-medium text-gray-600 mb-3">Nenhum apoio adicional</h4>
                <p className="text-gray-500 text-base md:text-lg">
                  Adicione o primeiro prestador de apoio usando o formulário acima
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 md:gap-2 sm:gap-3 sm:p-6 pt-6 md:pt-8 lg:pt-10 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50 -mx-6 md:-mx-8 lg:-mx-10 px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10 rounded-b-lg">
          <Button
            variant="ghost"
            onClick={() => {
              // Atualizar a ocorrência com os dados mais recentes antes de fechar
              if (onUpdate) {
                onUpdate({
                  ...ocorrencia,
                  apoios_adicionais: apoiosAdicionais
                });
              }
              onClose();
            }}
            className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-base md:text-lg font-medium transition-all duration-200 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvarTodos}
            disabled={loading || (apoiosAdicionais.length === 0 && apoiosRemovidos.length === 0)}
            className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-base md:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Salvar Todos os Apoios
                {apoiosRemovidos.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    -{apoiosRemovidos.length}
                  </span>
                )}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrestadorAdicionalPopup;
