import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Users, 
  Table, 
  BarChart2, 
  Calendar,
  Filter,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Percent,
  Activity,
  Car,
  MapPin,
  UserCheck
} from 'lucide-react';
import PageAccessControl from '@/components/PageAccessControl';
import api from '@/services/api';

// Interfaces
interface FiltroTempo {
  tipo: 'hoje' | '7dias' | '15dias' | '30dias' | 'mes_atual' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
}

interface FiltroMultiplo {
  id: string;
  tipo: 'tipo_ocorrencia' | 'apoio' | 'cliente';
  valor: string;
  label: string;
}

interface MetricasFinanceiras {
  totalOcorrencias: number;
  indiceRecuperacao: number;
  totalDespesas: number;
  ticketMedio: number;
  tempoMedioAtendimento: number;
  ocorrenciasRecuperadas: number;
  ocorrenciasNaoRecuperadas: number;
  ocorrenciasCanceladas: number;
  kmTotal: number;
  prestadoresAtivos: number;
}

const FinanceiroPage: React.FC = () => {
  const [aba, setAba] = useState<'resumo' | 'detalhado' | 'prestadores'>('resumo');
  const [filtroTempo, setFiltroTempo] = useState<FiltroTempo>({ tipo: 'mes_atual' });
  const [filtrosMultiplos, setFiltrosMultiplos] = useState<FiltroMultiplo[]>([]);
  const [metricas, setMetricas] = useState<MetricasFinanceiras>({
    totalOcorrencias: 0,
    indiceRecuperacao: 0,
    totalDespesas: 0,
    ticketMedio: 0,
    tempoMedioAtendimento: 0,
    ocorrenciasRecuperadas: 0,
    ocorrenciasNaoRecuperadas: 0,
    ocorrenciasCanceladas: 0,
    kmTotal: 0,
    prestadoresAtivos: 0
  });
  const [loading, setLoading] = useState(false);

  // Opções para filtros múltiplos
  const opcoesFiltros = {
    tipo_ocorrencia: ['Roubo', 'Furto', 'Apreensão', 'Localização'],
    apoio: ['Fox', 'Eagle', 'Wolf', 'Tiger', 'Lion'],
    cliente: ['BRK', 'Porto Seguro', 'SulAmérica', 'Bradesco', 'Itaú']
  };

  // Carregar métricas iniciais
  useEffect(() => {
    carregarMetricas();
  }, [filtroTempo, filtrosMultiplos]);

  const carregarMetricas = async () => {
    setLoading(true);
    try {
      // Simular dados por enquanto - depois integrar com API real
      const dadosSimulados: MetricasFinanceiras = {
        totalOcorrencias: 156,
        indiceRecuperacao: 78.5,
        totalDespesas: 45680.50,
        ticketMedio: 292.82,
        tempoMedioAtendimento: 2.5,
        ocorrenciasRecuperadas: 122,
        ocorrenciasNaoRecuperadas: 28,
        ocorrenciasCanceladas: 6,
        kmTotal: 12450,
        prestadoresAtivos: 12
      };
      setMetricas(dadosSimulados);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarFiltro = (tipo: 'tipo_ocorrencia' | 'apoio' | 'cliente', valor: string) => {
    const novoFiltro: FiltroMultiplo = {
      id: `${tipo}_${Date.now()}`,
      tipo,
      valor,
      label: `${tipo === 'tipo_ocorrencia' ? 'Tipo' : tipo === 'apoio' ? 'Apoio' : 'Cliente'}: ${valor}`
    };
    setFiltrosMultiplos([...filtrosMultiplos, novoFiltro]);
  };

  const removerFiltro = (id: string) => {
    setFiltrosMultiplos(filtrosMultiplos.filter(f => f.id !== id));
  };

  const resetarFiltros = () => {
    setFiltrosMultiplos([]);
    setFiltroTempo({ tipo: 'mes_atual' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const obterPeriodoTexto = () => {
    switch (filtroTempo.tipo) {
      case 'hoje': return 'Hoje';
      case '7dias': return 'Últimos 7 dias';
      case '15dias': return 'Últimos 15 dias';
      case '30dias': return 'Últimos 30 dias';
      case 'mes_atual': return 'Mês atual';
      case 'personalizado': 
        return filtroTempo.dataInicio && filtroTempo.dataFim 
          ? `${formatarData(filtroTempo.dataInicio)} - ${formatarData(filtroTempo.dataFim)}`
          : 'Período personalizado';
      default: return 'Mês atual';
    }
  };

  return (
    <PageAccessControl pageKey="access:financeiro">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-slate-600/5 to-blue-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Elegante */}
          <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm text-white rounded-2xl p-6 mb-8 shadow-xl border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  Financeiro
                </h1>
                <p className="text-slate-300 mt-2 text-sm lg:text-base">
                  Controle financeiro e análise de desempenho
                </p>
              </div>
              
              {/* Abas */}
              <div className="flex gap-2 items-center">
                <Button 
                  variant={aba === 'resumo' ? 'default' : 'ghost'} 
                  onClick={() => setAba('resumo')} 
                  className="flex items-center gap-2 text-white hover:text-white"
                >
                  <BarChart2 className="w-4 h-4" />
                  Resumo Geral
                </Button>
                <Button 
                  variant={aba === 'detalhado' ? 'default' : 'ghost'} 
                  onClick={() => setAba('detalhado')} 
                  className="flex items-center gap-2 text-white hover:text-white"
                >
                  <Table className="w-4 h-4" />
                  Controle Detalhado
                </Button>
                <Button 
                  variant={aba === 'prestadores' ? 'default' : 'ghost'} 
                  onClick={() => setAba('prestadores')} 
                  className="flex items-center gap-2 text-white hover:text-white"
                >
                  <Users className="w-4 h-4" />
                  Controle Prestadores
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Filtro de Tempo */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Período
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select 
                    value={filtroTempo.tipo} 
                    onValueChange={(value: any) => setFiltroTempo({ tipo: value })}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                      <SelectItem value="15dias">Últimos 15 dias</SelectItem>
                      <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="mes_atual">Mês atual</SelectItem>
                      <SelectItem value="personalizado">Período personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {filtroTempo.tipo === 'personalizado' && (
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filtroTempo.dataInicio || ''}
                        onChange={(e) => setFiltroTempo({ ...filtroTempo, dataInicio: e.target.value })}
                        className="w-full sm:w-40"
                      />
                      <Input
                        type="date"
                        value={filtroTempo.dataFim || ''}
                        onChange={(e) => setFiltroTempo({ ...filtroTempo, dataFim: e.target.value })}
                        className="w-full sm:w-40"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Filtros Múltiplos */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filtros Adicionais
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select onValueChange={(value) => {
                    const [tipo, valor] = value.split('|');
                    adicionarFiltro(tipo as any, valor);
                  }}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Adicionar filtro..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tipo_ocorrencia|Roubo">Tipo: Roubo</SelectItem>
                      <SelectItem value="tipo_ocorrencia|Furto">Tipo: Furto</SelectItem>
                      <SelectItem value="tipo_ocorrencia|Apreensão">Tipo: Apreensão</SelectItem>
                      <SelectItem value="tipo_ocorrencia|Localização">Tipo: Localização</SelectItem>
                      <SelectItem value="apoio|Fox">Apoio: Fox</SelectItem>
                      <SelectItem value="apoio|Eagle">Apoio: Eagle</SelectItem>
                      <SelectItem value="apoio|Wolf">Apoio: Wolf</SelectItem>
                      <SelectItem value="cliente|BRK">Cliente: BRK</SelectItem>
                      <SelectItem value="cliente|Porto Seguro">Cliente: Porto Seguro</SelectItem>
                      <SelectItem value="cliente|SulAmérica">Cliente: SulAmérica</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetarFiltros}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resetar
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros Ativos */}
            {filtrosMultiplos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {filtrosMultiplos.map((filtro) => (
                    <span key={filtro.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
                      {filtro.label}
                      <button
                        onClick={() => removerFiltro(filtro.id)}
                        className="ml-1 hover:text-red-500"
                        title="Remover filtro"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Período Atual */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Período selecionado: <strong>{obterPeriodoTexto()}</strong></span>
              </div>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          {aba === 'resumo' && (
            <div className="space-y-6">
              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total de Ocorrências */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Ocorrências</p>
                      <p className="text-2xl font-bold text-gray-900">{metricas.totalOcorrencias}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Índice de Recuperação */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Índice de Recuperação</p>
                      <p className="text-2xl font-bold text-green-600">{metricas.indiceRecuperacao}%</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Total de Despesas */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {metricas.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                {/* Ticket Médio */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Secundários */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tempo Médio de Atendimento */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                      <p className="text-xl font-bold text-gray-900">{metricas.tempoMedioAtendimento}h</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                {/* KM Total */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">KM Total</p>
                      <p className="text-xl font-bold text-gray-900">{metricas.kmTotal.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Prestadores Ativos */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prestadores Ativos</p>
                      <p className="text-xl font-bold text-gray-900">{metricas.prestadoresAtivos}</p>
                    </div>
                    <div className="p-3 bg-teal-100 rounded-full">
                      <UserCheck className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo de Resultados */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Resumo de Resultados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metricas.ocorrenciasRecuperadas}</div>
                    <div className="text-sm text-green-700">Recuperadas</div>
                    <div className="text-xs text-green-600 mt-1">
                      {((metricas.ocorrenciasRecuperadas / metricas.totalOcorrencias) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{metricas.ocorrenciasNaoRecuperadas}</div>
                    <div className="text-sm text-red-700">Não Recuperadas</div>
                    <div className="text-xs text-red-600 mt-1">
                      {((metricas.ocorrenciasNaoRecuperadas / metricas.totalOcorrencias) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{metricas.ocorrenciasCanceladas}</div>
                    <div className="text-sm text-gray-700">Canceladas</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {((metricas.ocorrenciasCanceladas / metricas.totalOcorrencias) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aba === 'detalhado' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                Controle Detalhado
              </h2>
              <p className="text-gray-600">Tabela detalhada de ocorrências será implementada aqui.</p>
            </div>
          )}

          {aba === 'prestadores' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Controle Prestadores
              </h2>
              <p className="text-gray-600">Relatórios e controle de prestadores será implementado aqui.</p>
            </div>
          )}
        </div>
      </div>
    </PageAccessControl>
  );
};

export default FinanceiroPage;