import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Activity,
  RefreshCw,
  Percent,
  Users,
  UserPlus,
  FileText,
  User,
} from "lucide-react";
import api from "@/services/api";

interface DashboardMetrics {
  ocorrenciasMes: number;
  ocorrenciasEmAndamento: number;
  ocorrenciasRecuperadas: number;
  indiceRecuperacao: number;
  totalPrestadores: number;
}

interface ClienteOcorrencias {
  cliente_id: number;
  cliente_nome: string;
  total_ocorrencias: number;
  ocorrencias_mes: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ocorrenciasMes: 0,
    ocorrenciasEmAndamento: 0,
    ocorrenciasRecuperadas: 0,
    indiceRecuperacao: 0,
    totalPrestadores: 0,
  });
  const [clientesOcorrencias, setClientesOcorrencias] = useState<ClienteOcorrencias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todas as ocorrências
      const response = await api.get('/api/ocorrencias');
      const ocorrencias = response.data;

      if (!Array.isArray(ocorrencias)) {
        throw new Error('Formato de resposta inválido');
      }

      // Calcular métricas
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      // Ocorrências no mês (todas exceto canceladas)
      const ocorrenciasMes = ocorrencias.filter((oc: any) => {
        const dataCriacao = new Date(oc.criado_em);
        const status = (oc.status || '').toLowerCase();
        const resultado = (oc.resultado || '').toLowerCase();
        return dataCriacao >= inicioMes && status !== 'cancelada' && resultado !== 'cancelado' && resultado !== 'cancelada';
      }).length;

      // Ocorrências em andamento (apenas em_andamento)
      const ocorrenciasEmAndamento = ocorrencias.filter((oc: any) => {
        const status = (oc.status || '').toLowerCase();
        return status === 'em_andamento';
      }).length;

      // Ocorrências recuperadas no mês
      const ocorrenciasRecuperadas = ocorrencias.filter((oc: any) => {
        const dataCriacao = new Date(oc.criado_em);
        const resultado = (oc.resultado || '').toLowerCase();
        return dataCriacao >= inicioMes && resultado === 'recuperado';
      }).length;

      // Calcular índice de recuperação
      const indiceRecuperacao = ocorrenciasMes > 0 ? (ocorrenciasRecuperadas / ocorrenciasMes) * 100 : 0;

      // Buscar total de prestadores cadastrados
      let totalPrestadores = 0;
      try {
        const prestadoresResponse = await api.get('/api/v1/prestadores', {
          params: { page: 1, pageSize: 1 } // Buscar apenas 1 para obter o total
        });
        
        if (prestadoresResponse.data && typeof prestadoresResponse.data === 'object' && 'total' in prestadoresResponse.data) {
          totalPrestadores = (prestadoresResponse.data as any).total;
        } else if (Array.isArray(prestadoresResponse.data)) {
          totalPrestadores = prestadoresResponse.data.length;
        }
        
        console.log('📊 Total de prestadores encontrados:', totalPrestadores);
      } catch (err: any) {
        console.error('Erro ao buscar prestadores:', err);
        totalPrestadores = 0;
      }

      // Calcular ocorrências por cliente
      const ocorrenciasPorCliente = new Map<string, { nome: string; total: number; mes: number }>();
      
      ocorrencias.forEach((oc: any) => {
        // Excluir ocorrências canceladas
        const resultado = (oc.resultado || '').toLowerCase();
        if (resultado === 'cancelado' || resultado === 'cancelada') {
          return; // Pular esta ocorrência
        }
        
        const clienteNome = oc.cliente || `Cliente ${oc.id}`; // Campo cliente é uma string
        
        const dataCriacao = new Date(oc.criado_em);
        const isMesAtual = dataCriacao >= inicioMes;
        
        if (!ocorrenciasPorCliente.has(clienteNome)) {
          ocorrenciasPorCliente.set(clienteNome, {
            nome: clienteNome,
            total: 0,
            mes: 0
          });
        }
        
        const cliente = ocorrenciasPorCliente.get(clienteNome)!;
        cliente.total += 1;
        if (isMesAtual) {
          cliente.mes += 1;
        }
      });

      // Converter para array e ordenar por ocorrências do mês
      const clientesArray = Array.from(ocorrenciasPorCliente.entries())
        .map(([, data]) => ({
          cliente_id: data.nome.length, // Usar como ID temporário
          cliente_nome: data.nome,
          total_ocorrencias: data.total,
          ocorrencias_mes: data.mes
        }))
        .sort((a, b) => b.ocorrencias_mes - a.ocorrencias_mes); // Ordenar por ocorrências do mês

      console.log('📊 Clientes processados:', clientesArray.slice(0, 3)); // Log dos 3 primeiros clientes
      console.log('📊 Total de ocorrências no mês (métricas):', ocorrenciasMes);
      console.log('📊 Total de ocorrências no mês (clientes):', clientesArray.reduce((sum, c) => sum + c.ocorrencias_mes, 0));
      console.log('📊 Verificação - devem ser iguais:', ocorrenciasMes === clientesArray.reduce((sum, c) => sum + c.ocorrencias_mes, 0));
      
      // Log de ocorrências canceladas excluídas
      const ocorrenciasCanceladas = ocorrencias.filter((oc: any) => {
        const resultado = (oc.resultado || '').toLowerCase();
        const dataCriacao = new Date(oc.criado_em);
        return (resultado === 'cancelado' || resultado === 'cancelada') && dataCriacao >= inicioMes;
      }).length;
      console.log('📊 Ocorrências canceladas excluídas:', ocorrenciasCanceladas);

      setMetrics({
        ocorrenciasMes,
        ocorrenciasEmAndamento,
        ocorrenciasRecuperadas,
        indiceRecuperacao,
        totalPrestadores: totalPrestadores,
      });
      
      setClientesOcorrencias(clientesArray);
      setLastUpdate(new Date());

    } catch (err: any) {
      console.error('Erro ao carregar métricas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Atualizar a cada 1 minuto para maior responsividade
    const interval = setInterval(fetchDashboardData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIndiceColor = (indice: number) => {
    if (indice >= 80) return "from-green-500 to-emerald-600";
    if (indice >= 60) return "from-yellow-500 to-orange-500";
    if (indice >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  const getIndiceStatus = (indice: number) => {
    if (indice >= 80) return "Excelente";
    if (indice >= 60) return "Bom";
    if (indice >= 40) return "Regular";
    return "Baixo";
  };

  const cards = [
    {
      title: "Ocorrências no Mês",
      value: metrics.ocorrenciasMes,
      icon: <Calendar size={24} />,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
      description: "Total de ocorrências do mês atual",
      trend: "vs mês anterior",
    },
    {
      title: "Em Andamento",
      value: metrics.ocorrenciasEmAndamento,
      icon: <Clock size={24} />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-500 to-red-500",
      description: "Ocorrências com status em andamento",
      trend: "atendimentos ativos",
    },
    {
      title: "Recuperadas",
      value: metrics.ocorrenciasRecuperadas,
      icon: <ShieldCheck size={24} />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
      description: "Veículos recuperados no mês",
      trend: "taxa de sucesso",
    },
    {
      title: "Índice de Recuperação",
      value: `${metrics.indiceRecuperacao.toFixed(1)}%`,
      icon: <Percent size={24} />,
      color: getIndiceColor(metrics.indiceRecuperacao),
      bgColor: `bg-gradient-to-br ${getIndiceColor(metrics.indiceRecuperacao)}`,
      description: `${metrics.ocorrenciasRecuperadas} de ${metrics.ocorrenciasMes} ocorrências`,
      trend: getIndiceStatus(metrics.indiceRecuperacao),
    },
    {
      title: "Distribuição por Cliente",
      value: clientesOcorrencias.reduce((sum, c) => sum + c.ocorrencias_mes, 0),
      icon: <Users size={24} />,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-600",
      description: "Top 5 clientes do mês",
      trend: "ocorrências totais",
    },
    {
      title: "Prestadores Cadastrados",
      value: metrics.totalPrestadores,
      icon: <UserPlus size={24} />,
      color: "from-teal-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-teal-500 to-cyan-600",
      description: "Total de prestadores registrados",
      trend: "ativos",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header com loading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral dos atendimentos</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw size={16} className="animate-spin" />
            <span>Carregando...</span>
          </div>
        </div>

        {/* Cards loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral dos atendimentos</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos atendimentos</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Atualização automática</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <span>
              Última atualização: {lastUpdate ? formatLastUpdate(lastUpdate) : '--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`${card.bgColor} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <div className="p-2 bg-white/20 rounded-lg">
                  {card.icon}
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-3xl font-bold">{card.value}</span>
              </div>
              
              <p className="text-sm text-white/80 mb-3">{card.description}</p>
              
              <div className="flex items-center gap-1 text-xs text-white/70">
                <TrendingUp size={12} />
                <span>{card.trend}</span>
              </div>

              {/* Barra de progresso para o índice de recuperação */}
              {i === 3 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${Math.min(metrics.indiceRecuperacao, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Distribuição por cliente no 5º card */}
              {i === 4 && clientesOcorrencias.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {clientesOcorrencias.slice(0, 5).map((cliente) => {
                    
                    return (
                      <div key={cliente.cliente_id} className="flex items-center justify-between text-xs">
                        <span className="text-white/90 truncate flex-1 mr-2">{cliente.cliente_nome}</span>
                        <span className="text-white font-medium text-right">{cliente.ocorrencias_mes}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/ocorrencias')}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <FileText size={20} className="text-blue-600" />
            <span className="font-medium text-gray-700">Painel de Ocorrências</span>
          </button>
          <button 
            onClick={() => navigate('/prestadores')}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <User size={20} className="text-orange-600" />
            <span className="font-medium text-gray-700">Cadastro de Prestadores</span>
          </button>
          <button 
            onClick={() => navigate('/ocorrencias?status=em_andamento')}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Clock size={20} className="text-purple-600" />
            <span className="font-medium text-gray-700">Ocorrências em Andamento</span>
          </button>
          <button 
            onClick={() => navigate('/ocorrencias?status=recuperado')}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ShieldCheck size={20} className="text-green-600" />
            <span className="font-medium text-gray-700">Ocorrências Recuperadas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
