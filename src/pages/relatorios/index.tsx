import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Clock, MapPin, User, DollarSign, Image, Edit, FileText, Check, FileDown, BarChart3, Search } from 'lucide-react';
import { Ocorrencia } from '@/types/ocorrencia';
import api from '@/services/api';
import { pdf } from '@react-pdf/renderer';
import RelatorioPDF from '@/components/pdf/RelatorioPDF';
import HorariosPopup from '@/components/ocorrencia/HorariosPopup';
import KMPopup from '@/components/ocorrencia/KMPopup';
import PrestadorPopup from '@/components/ocorrencia/PrestadorPopup';
import DespesasPopup from '@/components/ocorrencia/DespesasPopup';
import FotosPopup from '@/components/ocorrencia/FotosPopup';
import DescricaoPopup from '@/components/ocorrencia/DescricaoPopup';
import EditarDadosPopup from '@/components/ocorrencia/EditarDadosPopup';
import StatusRecuperacaoPopup from '@/components/ocorrencia/StatusRecuperacaoPopup';
import PassagemServicoPopup from '@/components/ocorrencia/PassagemServicoPopup';
import PermissionButton from '@/components/PermissionButton';
import PageAccessControl from '@/components/PageAccessControl';

// Interface para gerenciar popups de forma unificada
interface PopupData {
  id: number;
  type: 'horarios' | 'km' | 'prestador' | 'despesas' | 'fotos' | 'descricao' | 'editar' | 'passagem' | 'status';
}

// Interface para cliente resumo
interface ClienteResumo {
  id: string;
  nome: string;
  nome_fantasia?: string | null;
}

const formatarDataHora = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const converterParaRelatorioDados = (ocorrencia: Ocorrencia) => {
  console.log('🔍 [DEBUG] Dados da ocorrência recebidos:', {
    id: ocorrencia.id,
    operador: ocorrencia.operador,
    sub_cliente: ocorrencia.sub_cliente,
    cliente: ocorrencia.cliente,
    tipo: ocorrencia.tipo
  });
  
  const convertNullToUndefined = <T,>(value: T | null | undefined): T | undefined => 
    value === null ? undefined : value;

  const dadosConvertidos = {
    id: ocorrencia.id,
    cliente: convertNullToUndefined(ocorrencia.cliente),
    sub_cliente: convertNullToUndefined(ocorrencia.sub_cliente),
    tipo: convertNullToUndefined(ocorrencia.tipo),
    operador: convertNullToUndefined(ocorrencia.operador),
    data_acionamento: convertNullToUndefined(ocorrencia.data_acionamento),
    placa1: convertNullToUndefined(ocorrencia.placa1),
    modelo1: convertNullToUndefined(ocorrencia.modelo1),
    cor1: convertNullToUndefined(ocorrencia.cor1),
    placa2: convertNullToUndefined(ocorrencia.placa2),
    placa3: convertNullToUndefined(ocorrencia.placa3),
    endereco: convertNullToUndefined(ocorrencia.endereco),
    bairro: convertNullToUndefined(ocorrencia.bairro),
    cidade: convertNullToUndefined(ocorrencia.cidade),
    estado: convertNullToUndefined(ocorrencia.estado),
    coordenadas: convertNullToUndefined(ocorrencia.coordenadas),
    inicio: convertNullToUndefined(ocorrencia.inicio),
    chegada: convertNullToUndefined(ocorrencia.chegada),
    termino: convertNullToUndefined(ocorrencia.termino),
    km_inicial: ocorrencia.km_inicial ? Number(ocorrencia.km_inicial) : undefined,
    km_final: ocorrencia.km_final ? Number(ocorrencia.km_final) : undefined,
    km: ocorrencia.km ? Number(ocorrencia.km) : undefined,
    descricao: convertNullToUndefined(ocorrencia.descricao),
    fotos: ocorrencia.fotos,
    os: convertNullToUndefined(ocorrencia.os),
    origem_bairro: convertNullToUndefined(ocorrencia.origem_bairro),
    origem_cidade: convertNullToUndefined(ocorrencia.origem_cidade),
    origem_estado: convertNullToUndefined(ocorrencia.origem_estado),
    condutor: convertNullToUndefined(ocorrencia.nome_condutor),
    resultado: convertNullToUndefined(ocorrencia.resultado),
    sub_resultado: convertNullToUndefined(ocorrencia.sub_resultado),
    cpf_condutor: convertNullToUndefined(ocorrencia.cpf_condutor),
    nome_condutor: convertNullToUndefined(ocorrencia.nome_condutor),
    transportadora: convertNullToUndefined(ocorrencia.transportadora),
    valor_carga: ocorrencia.valor_carga !== null && ocorrencia.valor_carga !== undefined ? ocorrencia.valor_carga : undefined,
    notas_fiscais: convertNullToUndefined(ocorrencia.notas_fiscais),
    planta_origem: convertNullToUndefined(ocorrencia.planta_origem),
    cidade_destino: convertNullToUndefined(ocorrencia.cidade_destino),
    km_acl: convertNullToUndefined(ocorrencia.km_acl),
    conta: convertNullToUndefined(ocorrencia.conta),
    status: ocorrencia.status,
    tipo_veiculo: convertNullToUndefined(ocorrencia.tipo_veiculo),
    criado_em: convertNullToUndefined(ocorrencia.criado_em),
    despesas: ocorrencia.despesas !== null && ocorrencia.despesas !== undefined ? Number(ocorrencia.despesas) : undefined,
    despesas_detalhadas: ocorrencia.despesas_detalhadas,
    checklist: ocorrencia.checklist
  };
  
  console.log('🔍 [DEBUG] Dados convertidos:', {
    operador: dadosConvertidos.operador,
    sub_cliente: dadosConvertidos.sub_cliente
  });
  
  return dadosConvertidos;
};

export default function RelatoriosPage() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [filtros, setFiltros] = useState({ id: '', placa: '', cliente: '', prestador: '', inicio: '', fim: '' });
  const [buscou, setBuscou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);

  // Função para buscar o nome fantasia do cliente
  const getNomeCliente = (cliente: string) => {
    const c = clientes.find(c => c.nome === cliente);
    return c?.nome_fantasia || c?.nome || cliente;
  };

  // Função para carregar clientes
  const carregarClientes = async () => {
    try {
      const res = await api.get('/api/clientes');
      const dados = res.data;
      
      // Verificar se é formato paginado ou array direto
      let clientesArray: any[];
      if (dados && typeof dados === 'object' && 'data' in dados && 'total' in dados) {
        clientesArray = (dados as any).data;
      } else {
        clientesArray = Array.isArray(dados) ? dados : [];
      }
      
      setClientes(clientesArray.map(c => ({
        id: String(c.id ?? c.nome),
        nome: c.nome,
        nome_fantasia: c.nome_fantasia ?? null
      })));
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
    }
  };

  // Carregar clientes ao montar o componente
  useEffect(() => {
    carregarClientes();
  }, []);

  // Função para abrir popups de forma unificada
  const handlePopupOpen = (id: number, type: PopupData['type']) => {
    setPopupData({ id, type });
  };

  // Função para fechar popups
  const handlePopupClose = () => {
    setPopupData(null);
  };

  const buscarOcorrencias = async () => {
    setLoading(true);
    setBuscou(true);
    try {
      const params = new URLSearchParams();
      if (filtros.id && !isNaN(Number(filtros.id))) params.append('id', filtros.id);
      if (filtros.placa) params.append('placa', filtros.placa.replace(/\s/g, '').toUpperCase());
      if (filtros.cliente) params.append('cliente', filtros.cliente.trim().toUpperCase());
      if (filtros.prestador) params.append('prestador', filtros.prestador.trim().toUpperCase());
      if (filtros.inicio) params.append('data_inicio', filtros.inicio);
      if (filtros.fim) params.append('data_fim', filtros.fim);

      console.log('🔍 Filtros aplicados:', filtros);
      console.log('🔍 Query string:', params.toString());

      const res = await api.get(`/api/ocorrencias?${params.toString()}`);
      const dados = res.data;
      
      // Verificar se é formato paginado (quando há filtros) ou array direto
      let ocorrenciasArray: any[];
      if (dados && typeof dados === 'object' && 'data' in dados && 'total' in dados) {
        // Formato paginado: { data: [...], total: X, page: X, pageSize: X }
        ocorrenciasArray = (dados as any).data;
      } else {
        // Formato antigo: array direto
        ocorrenciasArray = Array.isArray(dados) ? dados : [];
      }
      
      if (ocorrenciasArray.length === 0) {
        setOcorrencias([]);
        alert('Nenhuma ocorrência encontrada. Tente ajustar os filtros de busca.');
        return;
      }
      
      // Debug: verificar se os campos prestador e despesas estão sendo retornados
      console.log('📊 Dados das ocorrências:', ocorrenciasArray);
      console.log('🔍 Primeira ocorrência:', ocorrenciasArray[0]);
      console.log('👤 Campo prestador:', ocorrenciasArray[0]?.prestador);
      console.log('💰 Campo despesas:', ocorrenciasArray[0]?.despesas);
      
      // Debug adicional para verificar todos os campos da primeira ocorrência
      if (ocorrenciasArray.length > 0) {
        const primeiraOcorrencia = ocorrenciasArray[0];
        console.log('🔍 Todos os campos da primeira ocorrência:', Object.keys(primeiraOcorrencia));
        console.log('👤 Prestador (tipo):', typeof primeiraOcorrencia.prestador);
        console.log('💰 Despesas (tipo):', typeof primeiraOcorrencia.despesas);
        console.log('💰 Despesas (valor):', primeiraOcorrencia.despesas);
        console.log('💰 Despesas (null?):', primeiraOcorrencia.despesas === null);
        console.log('💰 Despesas (undefined?):', primeiraOcorrencia.despesas === undefined);
      }
      
      setOcorrencias(ocorrenciasArray);
    } catch (err) {
      console.error('Erro ao buscar ocorrências:', err);
      alert('Erro ao buscar ocorrências. Verifique o console para mais detalhes.');
      setOcorrencias([]);
    } finally {
      setLoading(false);
    }
  };

  const atualizarOcorrencia = async (atualizada: Partial<Ocorrencia>) => {
    try {
      if (!atualizada?.id) {
        console.error('ID da ocorrência não definido. Dados recebidos:', atualizada);
        throw new Error('ID da ocorrência não definido');
      }

      // Buscar a ocorrência atual para garantir que temos os campos obrigatórios
      const ocorrenciaAtual = ocorrencias.find(o => o.id === atualizada.id);
      if (!ocorrenciaAtual) {
        console.error('Ocorrência não encontrada:', atualizada.id);
        throw new Error('Ocorrência não encontrada');
      }

      const body = {
        // Campos obrigatórios - sempre enviar
        placa1: ocorrenciaAtual.placa1,
        cliente: ocorrenciaAtual.cliente,
        tipo: ocorrenciaAtual.tipo,
        // Campos que podem estar sendo atualizados
        km: atualizada.km,
        km_inicial: atualizada.km_inicial,
        km_final: atualizada.km_final,
        despesas: atualizada.despesas,
        despesas_detalhadas: atualizada.despesas_detalhadas,
        prestador: atualizada.prestador,
        descricao: atualizada.descricao,
        status: atualizada.status,
        resultado: atualizada.resultado,
        inicio: atualizada.inicio,
        chegada: atualizada.chegada,
        termino: atualizada.termino
      };

      // Limpar campos nulos/undefined do body antes de enviar
      const cleanBody = { ...body } as Record<string, any>;
      Object.keys(cleanBody).forEach(key => {
        if (cleanBody[key] === null || cleanBody[key] === undefined) {
          delete cleanBody[key];
        }
      });
              await api.put(`/api/v1/ocorrencias/${atualizada.id}`, cleanBody);
      await buscarOcorrencias();
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      throw error;
    }
  };

  const gerarPDF = async (ocorrencia: Ocorrencia) => {
    try {
      console.log('🔍 Gerando PDF para ocorrência:', ocorrencia.id);
      
      // Buscar fotos diretamente do backend para garantir URLs públicas
      let fotosPublicas: any[] = [];
      try {
        const resFotos = await api.get(`/api/v1/fotos/por-ocorrencia/${ocorrencia.id}`);
        fotosPublicas = (resFotos.data || []).filter(
          (f: any) => f.url && (f.url.startsWith('http') || f.url.startsWith('/api/'))
        );
        console.log('📷 Fotos públicas do backend:', fotosPublicas);
      } catch (err) {
        console.error('❌ Erro ao buscar fotos do backend para o relatório:', err);
      }

      // Converter dados incluindo as fotos públicas
      const dados = {
        ...converterParaRelatorioDados(ocorrencia),
        fotos: fotosPublicas
      };
      
      console.log('📄 Dados para PDF:', dados);
      
      const blob = await pdf(<RelatorioPDF dados={dados} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpar blob URLs das fotos processadas após gerar o PDF
      setTimeout(() => {
        fotosPublicas.forEach((foto: any) => {
          if (foto.url && foto.url.startsWith('blob:')) {
            URL.revokeObjectURL(foto.url);
          }
        });
      }, 5000); // Aguardar 5 segundos para garantir que o PDF foi aberto
      
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };

  return (
    <PageAccessControl pageKey="access:relatorios">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-8 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-slate-600/5 to-blue-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header Elegante */}
        <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm text-white rounded-2xl p-6 mb-8 shadow-xl border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Relatórios
              </h1>
              <p className="text-slate-300 mt-2 text-sm lg:text-base">
                Gere relatórios detalhados e gerencie ocorrências
              </p>
            </div>
          </div>
        </div>

        {/* Filtros de busca */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 lg:p-6 flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Filtros de Busca</h3>
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              💡 Use os filtros para encontrar ocorrências específicas
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">ID Ocorrência</label>
              <Input 
                placeholder="ID Ocorrência" 
                value={filtros.id} 
                onChange={e => setFiltros({ ...filtros, id: e.target.value })} 
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Placa</label>
              <Input 
                placeholder="Placa" 
                value={filtros.placa} 
                onChange={e => setFiltros({ ...filtros, placa: e.target.value })} 
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Cliente</label>
              <Input 
                placeholder="Cliente" 
                value={filtros.cliente} 
                onChange={e => setFiltros({ ...filtros, cliente: e.target.value })} 
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Prestador</label>
              <Input 
                placeholder="Prestador" 
                value={filtros.prestador} 
                onChange={e => setFiltros({ ...filtros, prestador: e.target.value })} 
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Data Início</label>
              <Input 
                type="date" 
                value={filtros.inicio} 
                onChange={e => setFiltros({ ...filtros, inicio: e.target.value })} 
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Data Fim</label>
              <Input 
                type="date" 
                value={filtros.fim} 
                onChange={e => setFiltros({ ...filtros, fim: e.target.value })} 
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
              onClick={buscarOcorrencias} 
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-lg">Carregando ocorrências...</p>
              <p className="text-slate-500 text-sm mt-2">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        ) : !buscou ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma ocorrência carregada</h3>
            <p className="text-slate-500">Use os filtros acima para pesquisar ocorrências.</p>
          </div>
        ) : ocorrencias.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-lg mb-2">🔍 Nenhuma ocorrência encontrada</div>
            <div className="text-sm text-slate-400">
              Tente ajustar os filtros ou verificar se os dados estão corretos
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                <Search className="w-6 h-6 text-blue-600" />
                Resultados da Busca
                <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ocorrencias.length}
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr className="h-12">
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '60px'}}>ID</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '120px'}}>Placa</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '150px'}}>Cliente</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '120px'}}>Operador</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '80px'}}>Tipo</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '100px'}}>Status</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '200px'}}>Horários</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '120px'}}>Prestador</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '100px'}}>Despesas</th>
                    <th className="p-2 md:p-3 text-slate-700 font-semibold text-xs md:text-sm align-middle" style={{width: '400px'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ocorrencias.map((o: Ocorrencia) => (
                    <tr key={o.id} className="border-t border-slate-200 hover:bg-slate-50/50 transition-colors h-16">
                      <td className="p-2 md:p-3 text-slate-900 font-medium text-xs md:text-sm align-middle">{o.id}</td>
                      <td className="p-2 md:p-3 text-slate-900 text-xs md:text-sm align-middle">
                        {o.placa1}
                      </td>
                      <td className="p-2 md:p-3 text-slate-700 text-xs md:text-sm truncate max-w-[150px] align-middle" title={String(o.cliente || '')}>
                        {getNomeCliente(o.cliente || '')}
                      </td>
                      <td className="p-2 md:p-3 text-slate-700 text-xs md:text-sm truncate max-w-[120px] align-middle" title={String(o.nome_condutor || o.operador || '')}>
                        {o.nome_condutor || o.operador || '–'}
                      </td>
                      <td className="p-2 md:p-3 text-slate-700 text-xs md:text-sm align-middle">{o.tipo}</td>
                      <td className="p-2 md:p-3 align-middle">
                        {o.resultado ? (
                          <div className="space-y-1">
                            <span className={`px-1 md:px-2 py-1 rounded text-xs font-medium inline-block ${
                              o.resultado === 'RECUPERADO' ? 'bg-green-100 text-green-800' :
                              o.resultado === 'NAO_RECUPERADO' ? 'bg-red-100 text-red-800' :
                              o.resultado === 'CANCELADO' ? 'bg-gray-100 text-gray-800' :
                              o.resultado === 'LOCALIZADO' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {o.resultado === 'RECUPERADO' ? 'Recuperado' :
                               o.resultado === 'NAO_RECUPERADO' ? 'Não Recuperado' :
                               o.resultado === 'CANCELADO' ? 'Cancelado' : 
                               o.resultado === 'LOCALIZADO' ? 'Localizado' : o.resultado}
                            </span>
                            {o.sub_resultado && o.resultado === 'RECUPERADO' && (
                              <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {o.sub_resultado.replace(/_/g, ' ').toLowerCase()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-1 md:px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 inline-block">
                            Em Andamento
                          </span>
                        )}
                      </td>
                      <td className="p-2 md:p-3 align-middle">
                        <div className="space-y-1">
                          {o.inicio && <div className="text-xs text-slate-600">Início: {formatarDataHora(o.inicio)}</div>}
                          {o.chegada && <div className="text-xs text-slate-600">Local: {formatarDataHora(o.chegada)}</div>}
                          {o.termino && <div className="text-xs text-slate-600">Fim: {formatarDataHora(o.termino)}</div>}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-slate-700 text-xs md:text-sm truncate max-w-[120px] align-middle" title={String(o.prestador || '')}>
                        {o.prestador ?? '–'}
                      </td>
                      <td className="p-2 md:p-3 text-slate-700 text-xs md:text-sm align-middle">
                        {(() => {
                          const despesas = o.despesas;
                          if (!despesas) {
                            return '–';
                          }
                          // Converter para número
                          const valor = Number(despesas);
                          if (isNaN(valor) || valor === 0) {
                            return '–';
                          }
                          return `R$ ${valor.toFixed(2)}`;
                        })()}
                      </td>
                      <td className="p-2 md:p-3 align-middle" style={{width: '400px'}}>
                        <div className="flex flex-wrap gap-1 justify-start items-center" style={{minWidth: '380px'}}>
                        
                        {/* Botões com controle de permissões */}
                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'horarios')}
                          message="Você não tem permissão para editar horários de ocorrências."
                        >
                          <Clock size={14} />
                        </PermissionButton>
                        
                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-green-300 bg-green-50 hover:bg-green-100 text-green-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'km')}
                          message="Você não tem permissão para editar KM de ocorrências."
                        >
                          <MapPin size={14} />
                        </PermissionButton>
                        
                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'prestador')}
                          message="Você não tem permissão para editar prestadores de ocorrências."
                        >
                          <User size={14} />
                        </PermissionButton>
                        
                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'despesas')}
                          message="Você não tem permissão para editar despesas de ocorrências."
                        >
                          <DollarSign size={14} />
                        </PermissionButton>
                        
                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'fotos')}
                          message="Você não tem permissão para editar fotos de ocorrências."
                        >
                          <Image size={14} />
                        </PermissionButton>
                        
                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'editar')}
                          message="Você não tem permissão para editar ocorrências."
                        >
                          <Edit size={14} />
                        </PermissionButton>

                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'descricao')}
                          message="Você não tem permissão para editar descrições de ocorrências."
                        >
                          <FileText size={14} />
                        </PermissionButton>

                        <PermissionButton 
                          requiredPermission="update:relatorio"
                          variant="ghost" 
                          size="sm" 
                          className="border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'status')}
                          message="Você não tem permissão para editar status de ocorrências."
                        >
                          <Check size={14} />
                        </PermissionButton>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Passagem de Serviço"
                          className="border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-700 p-1 h-8 w-8 flex items-center justify-center"
                          onClick={() => handlePopupOpen(o.id, 'passagem')}
                        >
                          <FileText size={14} />
                        </Button>

                        <PermissionButton 
                          requiredPermission="read:relatorio"
                          variant="ghost" 
                          size="sm" 
                          onClick={() => gerarPDF(o)} 
                          className="border-2 border-red-400 bg-red-50 hover:bg-red-100 text-red-700 p-1 h-8 w-8 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                          message="Você não tem permissão para gerar relatórios PDF."
                        >
                          <FileDown size={14} />
                        </PermissionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dialog unificado para todos os popups */}
        {popupData && (
          <Dialog open={!!popupData} onOpenChange={() => handlePopupClose()}>
            <DialogContent className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 ${
              popupData.type === 'fotos' 
                ? 'max-w-7xl w-[95vw] h-[90vh]' 
                : 'max-w-4xl'
            }`}>
              {popupData.type === 'horarios' && (
                <HorariosPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'km' && (
                <KMPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'prestador' && (
                <PrestadorPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                  open={popupData.type === 'prestador'}
                  onOpenChange={(open) => {
                    if (!open) handlePopupClose();
                  }}
                />
              )}
              {popupData.type === 'despesas' && (
                <DespesasPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                  open={popupData.type === 'despesas'}
                  onOpenChange={(open) => {
                    if (!open) handlePopupClose();
                  }}
                />
              )}
              {popupData.type === 'fotos' && (
                <FotosPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'descricao' && (
                <DescricaoPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'editar' && (
                <EditarDadosPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'passagem' && (
                <PassagemServicoPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'status' && (
                <StatusRecuperacaoPopup
                  ocorrencia={ocorrencias.find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => atualizarOcorrencia({ ...ocorrencias.find(o => o.id === popupData.id)!, ...dados })}
                  onClose={handlePopupClose}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
      </PageAccessControl>
  );
} 
