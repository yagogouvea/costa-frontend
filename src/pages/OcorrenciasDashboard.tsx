import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  MapPin, 
  User, 
  Users,
  DollarSign, 
  Image, 
  FileText, 
  Edit, 
  ClipboardCopy,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Flag,
  RefreshCw,
  Target,
  List,
  LayoutGrid,
  CheckSquare,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { Ocorrencia } from '@/types/ocorrencia';
// import { abreviarNomeCliente } from '@/utils/format';
import AdicionarOcorrenciaPopup from '@/components/ocorrencia/AdicionarOcorrenciaPopup';
import HorariosPopup from '@/components/ocorrencia/HorariosPopup';
import KMPopup from '@/components/ocorrencia/KMPopup';
import PrestadorPopup from '@/components/ocorrencia/PrestadorPopup';
import PrestadorAdicionalPopup from '@/components/ocorrencia/PrestadorAdicionalPopup';
import DespesasPopup from '@/components/ocorrencia/DespesasPopup';
import FotosPopup from '@/components/ocorrencia/FotosPopup';
import DescricaoPopup from '@/components/ocorrencia/DescricaoPopup';
import EditarDadosPopup from '@/components/ocorrencia/EditarDadosPopup';
import PassagemServicoPopup from '@/components/ocorrencia/PassagemServicoPopup';
import StatusRecuperacaoPopup from '@/components/ocorrencia/StatusRecuperacaoPopup';
import CheckListPopup from '@/components/ocorrencia/CheckListPopup';
import api from '@/services/api';
import { getClientes } from '@/services/clienteService';
import type { ClienteResumo } from '@/components/ocorrencia/AdicionarOcorrenciaPopup';

interface PopupData {
  id: number;
  type: 'horarios' | 'km' | 'prestador' | 'prestador-adicional' | 'despesas' | 'fotos' | 'descricao' | 'editar' | 'passagem' | 'status' | 'checklist';
}

// ✅ FUNÇÕES PARA VERIFICAR STATUS DOS POPUPS
const verificarChecklistCompleto = async (ocorrenciaId: number): Promise<boolean> => {
  try {
    const response = await api.get(`/api/v1/checklist/ocorrencia/${ocorrenciaId}`);
    const checklist = response.data;
    
    // Verificar se o checklist existe
    if (!checklist) return false;
    
    // ✅ NOVA LÓGICA: Se o checklist foi dispensado, considerar como completo
    if (checklist.dispensado_checklist) {
      console.log(`✅ Checklist dispensado para ocorrência ${ocorrenciaId} - considerando como completo`);
      return true;
    }
    
    // Verificar se pelo menos uma das seções principais está preenchida
    const temLoja = checklist.loja_selecionada && (
      checklist.nome_loja || 
      checklist.endereco_loja || 
      checklist.nome_atendente || 
      checklist.matricula_atendente
    );
    
    const temGuincho = checklist.guincho_selecionado && (
      checklist.tipo_guincho || 
      checklist.nome_empresa_guincho || 
      checklist.nome_motorista_guincho || 
      checklist.valor_guincho || 
      checklist.telefone_guincho
    );
    
    const temApreensao = checklist.apreensao_selecionada && (
      checklist.nome_dp_batalhao || 
      checklist.endereco_apreensao || 
      checklist.numero_bo_noc
    );
    
    const temInfoGerais = checklist.recuperado_com_chave || 
                          checklist.posse_veiculo || 
                          checklist.avarias || 
                          checklist.fotos_realizadas || 
                          checklist.observacao_ocorrencia;
    
    const temDados = temLoja || temGuincho || temApreensao || temInfoGerais;
    
    console.log(`🔍 Checklist ocorrência ${ocorrenciaId}:`, {
      dispensado: checklist.dispensado_checklist,
      temLoja,
      temGuincho,
      temApreensao,
      temInfoGerais,
      temDados,
      completo: temDados
    });
    
    return temDados;
  } catch (error) {
    console.debug('Erro ao verificar checklist:', error);
    return false;
  }
};

const verificarSegundoApoioCompleto = async (ocorrenciaId: number): Promise<boolean> => {
  try {
    const response = await api.get(`/api/v1/apoios-adicionais/${ocorrenciaId}`);
    const apoios = response.data || [];
    
    // Verificar se há pelo menos um apoio adicional com dados preenchidos
    return apoios.some((apoio: any) => {
      return apoio.nome_prestador && (
        apoio.hora_inicial || 
        apoio.hora_final || 
        apoio.hora_inicial_local || 
        apoio.km_inicial !== null || 
        apoio.km_final !== null || 
        apoio.observacoes
      );
    });
  } catch (error) {
    console.debug('Erro ao verificar segundo apoio:', error);
    return false;
  }
};

const OcorrenciasDashboard: React.FC = () => {
  const [ocorrenciasEmAndamento, setOcorrenciasEmAndamento] = useState<Ocorrencia[]>([]);
  const [ocorrenciasFinalizadas, setOcorrenciasFinalizadas] = useState<Ocorrencia[]>([]);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [layout, setLayout] = useState<'cards' | 'list'>('cards');
  const [activeTab, setActiveTab] = useState<'em-andamento' | 'finalizadas'>('em-andamento');

  // ✅ FILTROS SEPARADOS: Estados para os filtros de cada grid
  // Filtros para ocorrências em andamento
  const [filtroOperadorEmAndamento, setFiltroOperadorEmAndamento] = useState<string>('todos');
  const [filtroPlacaEmAndamento, setFiltroPlacaEmAndamento] = useState<string>('');
  const [mostrarFiltrosEmAndamento, setMostrarFiltrosEmAndamento] = useState<boolean>(false);
  
  // Filtros para ocorrências finalizadas
  const [filtroOperadorFinalizadas, setFiltroOperadorFinalizadas] = useState<string>('todos');
  const [filtroPlacaFinalizadas, setFiltroPlacaFinalizadas] = useState<string>('');
  const [mostrarFiltrosFinalizadas, setMostrarFiltrosFinalizadas] = useState<boolean>(false);
  
  // Estados compartilhados
  const [operadoresDisponiveis, setOperadoresDisponiveis] = useState<string[]>([]);
  
  // ✅ STATUS DOS POPUPS: Estados para armazenar se os popups estão completos
  const [checklistStatus, setChecklistStatus] = useState<Record<number, boolean>>({});
  const [segundoApoioStatus, setSegundoApoioStatus] = useState<Record<number, boolean>>({});
  
  // ✅ RECOLHIMENTO: Estado para controlar se o grid de finalizadas está expandido
  const [gridFinalizadasExpandido, setGridFinalizadasExpandido] = useState<boolean>(true);

  // ✅ DEBUG: Log quando operadoresDisponiveis muda
  useEffect(() => {
    console.log('🔄 DEBUG: Estado operadoresDisponiveis atualizado:', operadoresDisponiveis);
    console.log('🔄 DEBUG: Total no estado:', operadoresDisponiveis.length);
  }, [operadoresDisponiveis]);

  // Estados originais (sem filtros aplicados)
  const [ocorrenciasOriginaisEmAndamento, setOcorrenciasOriginaisEmAndamento] = useState<Ocorrencia[]>([]);
  const [ocorrenciasOriginaisFinalizadas, setOcorrenciasOriginaisFinalizadas] = useState<Ocorrencia[]>([]);

  // Status considerados como encerrados
  const STATUS_ENCERRADOS = [
    // Status antigos
    'concluida', 'finalizada', 'encerrada', 'finalizado', 'encerrado', 
    'recuperada', 'recuperado', 'nao_recuperado', 'cancelado', 'cancelada',
    'simples verificação', 'simples verificacao', 'localizado', 'localizada',
    // Novos status baseados nos resultados do popup
    'recuperado', 'nao_recuperado', 'cancelado', 'localizado'
  ];

  useEffect(() => {
    loadOcorrencias();
    carregarFiltrosPersistidos();
    
    // ✅ ADICIONAR TRATAMENTO DE ERRO PARA CLIENTES
    getClientes()
      .then(cs => {
        if (Array.isArray(cs)) {
          setClientes(cs.map(c => ({
            id: String(c.id ?? c.nome),
            nome: c.nome,
            nome_fantasia: c.nome_fantasia ?? null
          })));
        } else {
          console.error('❌ Clientes não é um array:', typeof cs);
          console.error('❌ Conteúdo de clientes:', cs);
        }
      })
      .catch(err => {
        console.error('❌ Erro ao carregar clientes:', err);
      });
  }, []);

  // ✅ FILTROS SEPARADOS: Carregar filtros persistidos do localStorage
  const carregarFiltrosPersistidos = () => {
    try {
      // Filtros para ocorrências em andamento
      const filtroOperadorEmAndamentoSalvo = localStorage.getItem('dashboard-filtro-operador-andamento');
      const filtroPlacaEmAndamentoSalvo = localStorage.getItem('dashboard-filtro-placa-andamento');
      const mostrarFiltrosEmAndamentoSalvo = localStorage.getItem('dashboard-mostrar-filtros-andamento');

      if (filtroOperadorEmAndamentoSalvo) {
        setFiltroOperadorEmAndamento(filtroOperadorEmAndamentoSalvo);
      }
      if (filtroPlacaEmAndamentoSalvo) {
        setFiltroPlacaEmAndamento(filtroPlacaEmAndamentoSalvo);
      }
      if (mostrarFiltrosEmAndamentoSalvo === 'true') {
        setMostrarFiltrosEmAndamento(true);
      }

      // Filtros para ocorrências finalizadas
      const filtroOperadorFinalizadasSalvo = localStorage.getItem('dashboard-filtro-operador-finalizadas');
      const filtroPlacaFinalizadasSalvo = localStorage.getItem('dashboard-filtro-placa-finalizadas');
      const mostrarFiltrosFinalizadasSalvo = localStorage.getItem('dashboard-mostrar-filtros-finalizadas');

      if (filtroOperadorFinalizadasSalvo) {
        setFiltroOperadorFinalizadas(filtroOperadorFinalizadasSalvo);
      }
      if (filtroPlacaFinalizadasSalvo) {
        setFiltroPlacaFinalizadas(filtroPlacaFinalizadasSalvo);
      }
      if (mostrarFiltrosFinalizadasSalvo === 'true') {
        setMostrarFiltrosFinalizadas(true);
      }

      // Estado do grid de finalizadas
      const gridFinalizadasExpandidoSalvo = localStorage.getItem('dashboard-grid-finalizadas-expandido');
      if (gridFinalizadasExpandidoSalvo === 'false') {
        setGridFinalizadasExpandido(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar filtros persistidos:', error);
    }
  };

  // ✅ FILTROS SEPARADOS: Salvar filtros no localStorage
  const salvarFiltrosEmAndamentoPersistidos = (operador: string, placa: string, mostrar: boolean) => {
    try {
      localStorage.setItem('dashboard-filtro-operador-andamento', operador);
      localStorage.setItem('dashboard-filtro-placa-andamento', placa);
      localStorage.setItem('dashboard-mostrar-filtros-andamento', mostrar.toString());
    } catch (error) {
      console.error('❌ Erro ao salvar filtros em andamento persistidos:', error);
    }
  };

  const salvarFiltrosFinalizadasPersistidos = (operador: string, placa: string, mostrar: boolean) => {
    try {
      localStorage.setItem('dashboard-filtro-operador-finalizadas', operador);
      localStorage.setItem('dashboard-filtro-placa-finalizadas', placa);
      localStorage.setItem('dashboard-mostrar-filtros-finalizadas', mostrar.toString());
    } catch (error) {
      console.error('❌ Erro ao salvar filtros finalizadas persistidos:', error);
    }
  };

  const salvarGridFinalizadasExpandidoPersistido = (expandido: boolean) => {
    try {
      localStorage.setItem('dashboard-grid-finalizadas-expandido', expandido.toString());
    } catch (error) {
      console.error('❌ Erro ao salvar estado do grid finalizadas:', error);
    }
  };

  // ✅ FILTROS SEPARADOS: Aplicar filtros nas ocorrências
  useEffect(() => {
    aplicarFiltros();
  }, [
    filtroOperadorEmAndamento, 
    filtroPlacaEmAndamento, 
    filtroOperadorFinalizadas, 
    filtroPlacaFinalizadas, 
    ocorrenciasOriginaisEmAndamento, 
    ocorrenciasOriginaisFinalizadas
  ]);

  const aplicarFiltros = () => {
    console.log('🔍 Aplicando filtros separados:', { 
      emAndamento: { operador: filtroOperadorEmAndamento, placa: filtroPlacaEmAndamento },
      finalizadas: { operador: filtroOperadorFinalizadas, placa: filtroPlacaFinalizadas }
    });
    
    // ✅ FILTRAR OCORRÊNCIAS EM ANDAMENTO
    let emAndamentoFiltradas = [...ocorrenciasOriginaisEmAndamento];
    
    // Filtro por operador (em andamento)
    if (filtroOperadorEmAndamento && filtroOperadorEmAndamento !== 'todos') {
      emAndamentoFiltradas = emAndamentoFiltradas.filter(o => 
        o.operador && o.operador.toLowerCase() === filtroOperadorEmAndamento.toLowerCase()
      );
    }
    
    // Filtro por placa (em andamento)
    if (filtroPlacaEmAndamento) {
      const placaLower = filtroPlacaEmAndamento.toLowerCase().replace(/[^a-z0-9]/g, '');
      emAndamentoFiltradas = emAndamentoFiltradas.filter(o => {
        const placa1 = (o.placa1 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const placa2 = (o.placa2 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const placa3 = (o.placa3 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return placa1.includes(placaLower) || 
               placa2.includes(placaLower) || 
               placa3.includes(placaLower);
      });
    }
    
    // ✅ FILTRAR OCORRÊNCIAS FINALIZADAS
    let finalizadasFiltradas = [...ocorrenciasOriginaisFinalizadas];
    
    // Filtro por operador (finalizadas)
    if (filtroOperadorFinalizadas && filtroOperadorFinalizadas !== 'todos') {
      finalizadasFiltradas = finalizadasFiltradas.filter(o => 
        o.operador && o.operador.toLowerCase() === filtroOperadorFinalizadas.toLowerCase()
      );
    }
    
    // Filtro por placa (finalizadas)
    if (filtroPlacaFinalizadas) {
      const placaLower = filtroPlacaFinalizadas.toLowerCase().replace(/[^a-z0-9]/g, '');
      finalizadasFiltradas = finalizadasFiltradas.filter(o => {
        const placa1 = (o.placa1 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const placa2 = (o.placa2 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const placa3 = (o.placa3 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return placa1.includes(placaLower) || 
               placa2.includes(placaLower) || 
               placa3.includes(placaLower);
      });
    }
    
    setOcorrenciasEmAndamento(emAndamentoFiltradas);
    setOcorrenciasFinalizadas(finalizadasFiltradas);
    
    console.log('📊 Resultados dos filtros separados:', {
      emAndamento: emAndamentoFiltradas.length,
      finalizadas: finalizadasFiltradas.length
    });
  };

  const loadOcorrencias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ OTIMIZAÇÃO: Usar nova rota otimizada que retorna status dos popups
      const [response, clientesResponse] = await Promise.all([
        api.get('/api/v1/ocorrencias/dashboard'), // ✅ NOVA ROTA OTIMIZADA
        getClientes()
      ]);
      
      const ocorrencias = response.data;
      setClientes(clientesResponse as unknown as ClienteResumo[]);
      
      // Separar ocorrências por status
      const emAndamento = ocorrencias.filter((o: Ocorrencia) => 
        !STATUS_ENCERRADOS.includes(o.resultado?.toLowerCase() || '')
      );
      const finalizadas = ocorrencias.filter((o: Ocorrencia) => 
        STATUS_ENCERRADOS.includes(o.resultado?.toLowerCase() || '')
      );
      
      setOcorrenciasEmAndamento(emAndamento);
      setOcorrenciasFinalizadas(finalizadas);
      setOcorrenciasOriginaisEmAndamento(emAndamento);
      setOcorrenciasOriginaisFinalizadas(finalizadas);
      
      // ✅ OTIMIZAÇÃO: Status dos popups já vem do backend
      const novoChecklistStatus: Record<number, boolean> = {};
      const novoSegundoApoioStatus: Record<number, boolean> = {};
      
      ocorrencias.forEach((ocorrencia: any) => {
        // ✅ Usar status já calculado pelo backend
        novoChecklistStatus[ocorrencia.id] = ocorrencia.checklistStatus?.completo || false;
        novoSegundoApoioStatus[ocorrencia.id] = false; // Por enquanto, manter como false
      });
      
      setChecklistStatus(novoChecklistStatus);
      setSegundoApoioStatus(novoSegundoApoioStatus);
      
      // Extrair operadores únicos
      const operadores = [...new Set(ocorrencias.map((o: Ocorrencia) => o.operador).filter(Boolean))] as string[];
      setOperadoresDisponiveis(operadores);
      
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
      setError('Erro ao carregar ocorrências');
    } finally {
      setLoading(false);
    }
  };



  // ✅ FILTROS SEPARADOS: Manipular filtros de em andamento
  const handleFiltroOperadorEmAndamentoChange = (operador: string) => {
    setFiltroOperadorEmAndamento(operador);
    salvarFiltrosEmAndamentoPersistidos(operador, filtroPlacaEmAndamento, mostrarFiltrosEmAndamento);
    console.log('🔄 Filtro operador em andamento alterado para:', operador);
  };

  const handleFiltroPlacaEmAndamentoChange = (placa: string) => {
    setFiltroPlacaEmAndamento(placa);
    salvarFiltrosEmAndamentoPersistidos(filtroOperadorEmAndamento, placa, mostrarFiltrosEmAndamento);
    console.log('🔄 Filtro placa em andamento alterado para:', placa);
  };

  const limparFiltrosEmAndamento = () => {
    setFiltroOperadorEmAndamento('todos');
    setFiltroPlacaEmAndamento('');
    salvarFiltrosEmAndamentoPersistidos('todos', '', mostrarFiltrosEmAndamento);
    console.log('🧹 Filtros em andamento limpos');
  };

  const toggleMostrarFiltrosEmAndamento = () => {
    const novoEstado = !mostrarFiltrosEmAndamento;
    setMostrarFiltrosEmAndamento(novoEstado);
    salvarFiltrosEmAndamentoPersistidos(filtroOperadorEmAndamento, filtroPlacaEmAndamento, novoEstado);
    console.log('👁️ Mostrar filtros em andamento:', novoEstado);
  };

  // ✅ FILTROS SEPARADOS: Manipular filtros de finalizadas
  const handleFiltroOperadorFinalizadasChange = (operador: string) => {
    setFiltroOperadorFinalizadas(operador);
    salvarFiltrosFinalizadasPersistidos(operador, filtroPlacaFinalizadas, mostrarFiltrosFinalizadas);
    console.log('🔄 Filtro operador finalizadas alterado para:', operador);
  };

  const handleFiltroPlacaFinalizadasChange = (placa: string) => {
    setFiltroPlacaFinalizadas(placa);
    salvarFiltrosFinalizadasPersistidos(filtroOperadorFinalizadas, placa, mostrarFiltrosFinalizadas);
    console.log('🔄 Filtro placa finalizadas alterado para:', placa);
  };

  const limparFiltrosFinalizadas = () => {
    setFiltroOperadorFinalizadas('todos');
    setFiltroPlacaFinalizadas('');
    salvarFiltrosFinalizadasPersistidos('todos', '', mostrarFiltrosFinalizadas);
    console.log('🧹 Filtros finalizadas limpos');
  };

  const toggleMostrarFiltrosFinalizadas = () => {
    const novoEstado = !mostrarFiltrosFinalizadas;
    setMostrarFiltrosFinalizadas(novoEstado);
    salvarFiltrosFinalizadasPersistidos(filtroOperadorFinalizadas, filtroPlacaFinalizadas, novoEstado);
    console.log('👁️ Mostrar filtros finalizadas:', novoEstado);
  };

  // ✅ RECOLHIMENTO: Controlar expansão do grid de finalizadas
  const toggleGridFinalizadasExpandido = () => {
    const novoEstado = !gridFinalizadasExpandido;
    setGridFinalizadasExpandido(novoEstado);
    salvarGridFinalizadasExpandidoPersistido(novoEstado);
    console.log('📋 Grid finalizadas expandido:', novoEstado);
  };

  const handlePopupOpen = (id: number, type: PopupData['type']) => {
    if (type === 'checklist') {
      console.log(`🎯 CHECKLIST - Clicou na ocorrência ID: ${id}`);
    }
    setPopupData({ id, type });
  };

  const handlePopupClose = () => {
    setPopupData(null);
  };

  // ✅ FUNÇÃO PARA ATUALIZAR STATUS DOS POPUPS
  const atualizarStatusPopups = async (ocorrenciaId: number) => {
    try {
      const [checklistCompleto, segundoApoioCompleto] = await Promise.all([
        verificarChecklistCompleto(ocorrenciaId),
        verificarSegundoApoioCompleto(ocorrenciaId)
      ]);
      
      setChecklistStatus(prev => ({ ...prev, [ocorrenciaId]: checklistCompleto }));
      setSegundoApoioStatus(prev => ({ ...prev, [ocorrenciaId]: segundoApoioCompleto }));
    } catch (error) {
      console.debug(`Erro ao atualizar status dos popups para ocorrência ${ocorrenciaId}:`, error);
    }
  };

  const handleNovaOcorrencia = (data: { placa1: string; cliente: string; tipo: string; ocorrencia?: any }) => {
    console.log('✅ [OcorrenciasDashboard] Nova ocorrência criada:', data);
    
    // ✅ CORREÇÃO: Se temos a ocorrência completa, adicionar diretamente ao estado
    if (data.ocorrencia) {
      console.log('✅ [OcorrenciasDashboard] Adicionando ocorrência ao estado:', data.ocorrencia);
      setOcorrenciasEmAndamento(prev => [data.ocorrencia, ...prev]);
    } else {
      // Fallback: recarregar todas as ocorrências
      console.log('⚠️ [OcorrenciasDashboard] Recarregando ocorrências (fallback)');
      loadOcorrencias();
    }
    
    setShowAddPopup(false);
  };

  const handleUpdate = (id: number, dadosAtualizados: any) => {
    console.log('🔄 [OcorrenciasDashboard] Atualizando ocorrência:', id, dadosAtualizados);
    console.log('🔍 [OcorrenciasDashboard] Resultado recebido:', dadosAtualizados.resultado);
    console.log('🔍 [OcorrenciasDashboard] STATUS_ENCERRADOS:', STATUS_ENCERRADOS);
    
    // ✅ VERIFICAÇÃO MAIS ROBUSTA: Verificar se a ocorrência foi finalizada
    const resultadoLower = dadosAtualizados.resultado ? dadosAtualizados.resultado.toLowerCase() : '';
    const isFinalizada = dadosAtualizados.resultado && STATUS_ENCERRADOS.includes(resultadoLower);
    
    console.log('🔍 [OcorrenciasDashboard] Resultado em lowercase:', resultadoLower);
    console.log('🔍 [OcorrenciasDashboard] É finalizada?', isFinalizada);
    
    if (isFinalizada) {
      console.log('✅ [OcorrenciasDashboard] Ocorrência finalizada, movendo para grid de finalizadas');
      
      // ✅ CORREÇÃO: Usar callback para garantir que temos o estado mais atual
      setOcorrenciasEmAndamento(prev => {
        const ocorrencia = prev.find(o => o.id === id);
        if (ocorrencia) {
          console.log('📦 [OcorrenciasDashboard] Ocorrência encontrada em andamento, movendo para finalizadas');
          
          // ✅ CORREÇÃO: Usar callback para adicionar à lista de finalizadas
          setOcorrenciasFinalizadas(prevFinalizadas => {
            // Verificar se já não está na lista de finalizadas
            const jaExiste = prevFinalizadas.find(o => o.id === id);
            if (jaExiste) {
              console.log('🔄 [OcorrenciasDashboard] Ocorrência já existe em finalizadas, apenas atualizando');
              return prevFinalizadas.map(o => o.id === id ? { ...o, ...dadosAtualizados, finalizada_em: dadosAtualizados.finalizada_em || new Date().toISOString() } : o);
            } else {
              console.log('➕ [OcorrenciasDashboard] Adicionando nova ocorrência às finalizadas');
              return [{
                ...ocorrencia,
                ...dadosAtualizados,
                // Adicionar timestamp de finalização se não existir
                finalizada_em: dadosAtualizados.finalizada_em || new Date().toISOString()
              }, ...prevFinalizadas];
            }
          });
        } else {
          console.log('⚠️ [OcorrenciasDashboard] Ocorrência não encontrada em andamento, pode já estar finalizada');
          // Se não está em andamento, pode estar sendo editada nas finalizadas
          setOcorrenciasFinalizadas(prev => 
            prev.map(o => o.id === id ? { ...o, ...dadosAtualizados } : o)
          );
        }
        return prev.filter(o => o.id !== id);
      });
    } else {
      console.log('🔄 [OcorrenciasDashboard] Ocorrência não finalizada, apenas atualizando');
      // Atualizar ocorrências em andamento
      setOcorrenciasEmAndamento(prev => 
        prev.map(o => o.id === id ? { ...o, ...dadosAtualizados } : o)
      );
      
      // Atualizar ocorrências finalizadas (caso esteja sendo editada)
      setOcorrenciasFinalizadas(prev => 
        prev.map(o => o.id === id ? { ...o, ...dadosAtualizados } : o)
      );
    }
    
    // ✅ ATUALIZAR STATUS DOS POPUPS: Verificar se checklist ou segundo apoio foram modificados
    if (dadosAtualizados.checklist || dadosAtualizados.apoios_adicionais) {
      atualizarStatusPopups(id);
    }
  };

  // ✅ OTIMIZAÇÃO: Memoizar formatação de data/hora para melhor performance
  const formatarDataHora = useCallback((iso?: string | null) => {
    if (!iso || typeof iso !== 'string') return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      console.error('Erro ao formatar data/hora:', error, 'valor:', iso);
      return '';
    }
  }, []);

  function getNomeCliente(cliente: string) {
    const c = clientes.find(c => c.nome === cliente);
    return c?.nome_fantasia || c?.nome || cliente;
  }


  // Filtro para mostrar apenas ocorrências finalizadas nas últimas 24 horas (excluindo canceladas)
  const agora = Date.now();
  const ha24h = agora - 24 * 60 * 60 * 1000;
  const ocorrenciasFinalizadasUltimas24h = ocorrenciasFinalizadas
    .filter(o => {
      const dataCriacao = o.criado_em ? new Date(o.criado_em).getTime() : null;
      // Excluir ocorrências canceladas do grid de finalizadas
      const isCancelada = String(o.resultado) === 'Cancelado';
      return dataCriacao && dataCriacao >= ha24h && !isCancelada;
    })
    .sort((a, b) => {
      // Ordenar por data de finalização (mais recente primeiro)
      const dataA = (a as any).finalizada_em ? new Date((a as any).finalizada_em).getTime() : 
                   a.termino ? new Date(a.termino).getTime() : 
                   a.criado_em ? new Date(a.criado_em).getTime() : 0;
      const dataB = (b as any).finalizada_em ? new Date((b as any).finalizada_em).getTime() : 
                   b.termino ? new Date(b.termino).getTime() : 
                   b.criado_em ? new Date(b.criado_em).getTime() : 0;
      return dataB - dataA; // Ordem decrescente (mais recente primeiro)
    });

  // ✅ OTIMIZAÇÃO: Memoizar formatação de despesas para melhor performance
  const formatarDespesas = useCallback((ocorrencia: Ocorrencia) => {
    try {
      if (ocorrencia.despesas_detalhadas && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length > 0) {
        return ocorrencia.despesas_detalhadas.map((d: any) => `${String(d.tipo || '')} R$ ${String(d.valor || '')}`).join(', ');
      } else if (ocorrencia.despesas !== null && ocorrencia.despesas !== undefined && ocorrencia.despesas > 0) {
        return `R$ ${String(ocorrencia.despesas)}`;
      }
      return '–';
    } catch (error) {
      console.debug('Erro ao formatar despesas:', error);
      return '–';
    }
  }, []);

  const temDespesasPreenchidas = (ocorrencia: Ocorrencia) => {
    // Só fica verde se há despesas detalhadas OU se foi explicitamente salvo com "Sem despesas" (despesas = 0 e despesas_detalhadas = [])
    return (ocorrencia.despesas_detalhadas && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length > 0) ||
           (ocorrencia.despesas === 0 && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length === 0);
  };

  // Função para validar se a ocorrência pode ser finalizada
  const podeFinalizarOcorrencia = (ocorrencia: Ocorrencia) => {
    const erros: string[] = [];

    // Verificar se já está finalizada
    if (ocorrencia.resultado && ['RECUPERADO', 'NAO_RECUPERADO', 'CANCELADO', 'LOCALIZADO'].includes(ocorrencia.resultado)) {
      return {
        podeFinalizar: true, // Pode alterar o resultado mesmo se já finalizada
        erros: []
      };
    }

    // Validar Horários
    if (!ocorrencia.inicio) erros.push('• Horário de início');
    if (!ocorrencia.chegada) erros.push('• Horário de chegada');
    if (!ocorrencia.termino) erros.push('• Horário de término');

    // Validar KM
    if (ocorrencia.km_inicial == null) erros.push('• KM inicial');
    if (ocorrencia.km_final == null) erros.push('• KM final');

    // Validar Despesas
    if (ocorrencia.despesas == null && (!ocorrencia.despesas_detalhadas || !Array.isArray(ocorrencia.despesas_detalhadas) || ocorrencia.despesas_detalhadas.length === 0)) {
      erros.push('• Despesas (preencher ou marcar "Sem despesas")');
    }

    // ✅ NOVA VALIDAÇÃO: Checklist (preencher ou marcar "dispensado")
    if (!checklistStatus[ocorrencia.id]) {
      erros.push('• Checklist (preencher ou marcar "Dispensado o checklist")');
    }

    // Validar Prestador
    if (!ocorrencia.prestador) erros.push('• Prestador');

    return {
      podeFinalizar: erros.length === 0,
      erros
    };
  };

  // Função para lidar com o clique no botão de status
  const handleStatusClick = (ocorrencia: Ocorrencia) => {
    const validacao = podeFinalizarOcorrencia(ocorrencia);
    
    if (!validacao.podeFinalizar) {
      alert(`❌ Não é possível finalizar a ocorrência.\n\nOs seguintes campos precisam ser preenchidos:\n\n${validacao.erros.join('\n')}\n\nPor favor, complete todos os campos obrigatórios antes de finalizar.`);
      return;
    }
    
    // Se tudo estiver válido, abre o popup de status
    handlePopupOpen(ocorrencia.id, 'status');
  };

  const renderOcorrenciaCard = (ocorrencia: Ocorrencia) => {
    try {
      // Determinar cor base baseada no status
      const getCardColor = () => {
        if ((ocorrencia.status || '').toLowerCase() === 'em_andamento') {
          return 'from-blue-500/10 to-indigo-500/10 border-blue-200/50';
        }
        if (ocorrencia.resultado === 'RECUPERADO') {
          return 'from-green-500/10 to-emerald-500/10 border-green-200/50';
        }
        if (ocorrencia.resultado === 'CANCELADO') {
          return 'from-red-500/10 to-pink-500/10 border-red-200/50';
        }
        if (ocorrencia.resultado === 'LOCALIZADO') {
          return 'from-blue-500/10 to-cyan-500/10 border-blue-200/50';
        }
        return 'from-slate-500/10 to-gray-500/10 border-slate-200/50';
      };

      const cardColor = getCardColor();
      
      // Verificar se a ocorrência está finalizada (tem resultado)
      const isFinalizada = ocorrencia.resultado && ['RECUPERADO', 'NAO_RECUPERADO', 'CANCELADO', 'LOCALIZADO'].includes(ocorrencia.resultado);
      const buttonText = isFinalizada ? 'Alterar Resultado' : 'Encerrar Ocorrência';

      return (
    <div key={ocorrencia.id} className={`bg-gradient-to-br ${cardColor} backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg border p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-2 sm:gap-3 mb-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-xs sm:text-sm font-bold">
                {String(ocorrencia.placa1 || '–')}
              </div>
              <span className="text-slate-500 text-xs md:text-xs sm:text-xs font-medium">#{ocorrencia.id}</span>
            </div>
            <p className="text-slate-700 text-xs md:text-xs sm:text-sm mb-1 font-medium truncate">{getNomeCliente(String(ocorrencia.cliente || '')) || '–'}</p>
            <p className="text-slate-500 text-xs flex items-center gap-1 md:gap-2">
              <User className="w-3 h-3" />
              <span className="truncate">{String(ocorrencia.operador || '–')}</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{String(ocorrencia.tipo || '–')}</span>
            </p>
          </div>
          <div className="flex-shrink-0 ml-2 md:ml-4">
            {(() => {
              if ((ocorrencia.status || '').toLowerCase() === 'em_andamento') {
                return (
                  <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full mr-1 md:mr-1.5 animate-pulse"></div>
                    <span className="hidden sm:inline">Em Andamento</span>
                    <span className="sm:hidden">Ativo</span>
                  </span>
                );
              }
                    if (ocorrencia.resultado && ['RECUPERADO', 'NAO_RECUPERADO', 'CANCELADO', 'LOCALIZADO'].includes(ocorrencia.resultado)) {
        const isRecuperado = ocorrencia.resultado === 'RECUPERADO';
        const isCancelado = ocorrencia.resultado === 'CANCELADO';
        const isLocalizado = ocorrencia.resultado === 'LOCALIZADO';
                return (
                  <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    isRecuperado ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 
                    isCancelado ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 
                    isLocalizado ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                    'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  }`}>
                    {isRecuperado && <CheckCircle className="w-3 h-3 mr-1" />}
                    {isCancelado && <XCircle className="w-3 h-3 mr-1" />}
                    {isLocalizado && <MapPin className="w-3 h-3 mr-1" />}
                    <span className="truncate">{String(ocorrencia.resultado)}</span>
                    {ocorrencia.sub_resultado && isRecuperado && (
                      <span className="ml-1 text-xs opacity-90">({ocorrencia.sub_resultado.replace(/_/g, ' ').toLowerCase()})</span>
                    )}
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-sm">
                  <span className="truncate">{String(ocorrencia.status || '–')}</span>
                </span>
              );
            })()}
          </div>
        </div>
        
        {/* Informações em destaque - Prestador e Horários para todos os dispositivos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
          {/* Prestador */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-2 sm:p-3 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
              <span className="text-indigo-800 font-semibold text-xs sm:text-sm">Prestador</span>
            </div>
            <p className="text-indigo-900 font-bold text-xs sm:text-sm truncate">{String(ocorrencia.prestador || '–')}</p>
          </div>
          
          {/* Horários */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-3 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              <span className="text-purple-800 font-semibold text-xs sm:text-sm">Horários</span>
            </div>
            <div className="text-xs text-purple-700 space-y-0.5">
              {ocorrencia.inicio ? <div className="truncate">Início: {formatarDataHora(ocorrencia.inicio)}</div> : null}
              {ocorrencia.chegada ? <div className="truncate">Chegada: {formatarDataHora(ocorrencia.chegada)}</div> : null}
              {ocorrencia.termino ? <div className="truncate">Término: {formatarDataHora(ocorrencia.termino)}</div> : null}
              {!ocorrencia.inicio && !ocorrencia.chegada && !ocorrencia.termino && <div>–</div>}
            </div>
          </div>
        </div>

        {/* Botões de ação uniformes - Responsivo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'horarios')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              ocorrencia.inicio && ocorrencia.chegada && ocorrencia.termino 
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${ocorrencia.inicio && ocorrencia.chegada && ocorrencia.termino ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1 leading-tight">Horários</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'km')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              (ocorrencia.km_inicial != null || ocorrencia.km_final != null)
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${(ocorrencia.km_inicial != null || ocorrencia.km_final != null) ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1 leading-tight">KM</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'prestador')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              ocorrencia.prestador
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <User className={`w-4 h-4 sm:w-5 sm:h-5 ${ocorrencia.prestador ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1 leading-tight">Prestador</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'prestador-adicional')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              segundoApoioStatus[ocorrencia.id]
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${segundoApoioStatus[ocorrencia.id] ? 'text-green-600' : 'text-purple-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1 leading-tight">2º Apoio</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'despesas')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              temDespesasPreenchidas(ocorrencia)
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <DollarSign className={`w-4 h-4 sm:w-5 sm:h-5 ${temDespesasPreenchidas(ocorrencia) ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1">Despesas</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'fotos')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              ocorrencia.fotos && ocorrencia.fotos.length > 0
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Image className={`w-4 h-4 sm:w-5 sm:h-5 ${ocorrencia.fotos && ocorrencia.fotos.length > 0 ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1">Fotos</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'descricao')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              ocorrencia.descricao
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${ocorrencia.descricao ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1">Descrição</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'editar')} 
            className="flex flex-col items-center gap-2 p-3 transition-all duration-200 rounded-xl text-xs font-medium min-h-[70px] sm:min-h-[60px] shadow-sm hover:shadow-md bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs font-semibold leading-tight text-center px-1">Editar</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'passagem')} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              ocorrencia.passagem_servico
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <ClipboardCopy className={`w-4 h-4 sm:w-5 sm:h-5 ${ocorrencia.passagem_servico ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1">Passagem</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              console.log(`🎯 BOTÃO CHECKLIST CLICADO - Card ocorrência ID: ${ocorrencia.id}, Placa: ${ocorrencia.placa1}`);
              handlePopupOpen(ocorrencia.id, 'checklist');
            }} 
            className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 transition-all duration-200 rounded-lg text-xs font-medium min-h-[70px] sm:min-h-[80px] w-full shadow-sm hover:shadow-md ${
              checklistStatus[ocorrencia.id]
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <CheckSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${checklistStatus[ocorrencia.id] ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="text-xs font-semibold leading-tight text-center px-1">Check-list</span>
          </Button>
        </div>
        
        {/* Botão Encerrar/Alterar Resultado centralizado e destacado */}
        <div className="flex justify-center mt-3 md:mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleStatusClick(ocorrencia)} 
            className="flex items-center gap-2 md:gap-2 sm:gap-3 px-4 md:px-8 py-2 md:py-3 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all duration-200 rounded-lg md:rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg hover:shadow-xl"
          >
            <Flag className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            <span className="font-medium text-xs md:text-xs sm:text-sm">{buttonText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
    } catch (error) {
      console.error('❌ Erro ao renderizar card da ocorrência:', ocorrencia.id, error);
      return (
        <div key={ocorrencia.id} className="bg-red-50 border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-3 sm:p-6">
          <div className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-xs sm:text-sm">Erro ao renderizar ocorrência {ocorrencia.id}</span>
          </div>
        </div>
      );
    }
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-slate-600/5 to-blue-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          {/* Header Elegante */}
          <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm text-white rounded-2xl p-3 sm:p-6 mb-8 shadow-xl border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                  <Activity className="w-8 h-8 text-blue-400" />
                  Painel de Ocorrências
                </h1>
                <p className="text-slate-300 mt-2 text-xs sm:text-sm lg:text-base">
                  Gerencie e acompanhe todas as ocorrências em tempo real
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-blue-500 transition"
                  onClick={() => setLayout(layout === 'cards' ? 'list' : 'cards')}
                  title={layout === 'cards' ? 'Ver como lista' : 'Ver como cards'}
                >
                  {layout === 'cards' ? <List className="w-4 h-4 sm:w-5 sm:h-5" /> : <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="hidden md:inline">{layout === 'cards' ? 'Lista' : 'Cards'}</span>
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => setShowAddPopup(true)}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Nova Ocorrência
                </Button>
              </div>
            </div>
          </div>



          {/* Cards de Status Informativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 sm:p-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-sm text-white rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-blue-100 text-xs sm:text-xs font-medium mb-1">Em Andamento</p>
                  <p className="text-3xl font-bold">{ocorrenciasEmAndamento.length}</p>
                  <p className="text-blue-200 text-xs mt-1">Ocorrências ativas</p>
                </div>
                <Clock className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/90 to-emerald-600/90 backdrop-blur-sm text-white rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-green-100 text-xs sm:text-xs font-medium mb-1">Finalizadas (24h)</p>
                  <p className="text-3xl font-bold">{ocorrenciasFinalizadasUltimas24h.length}</p>
                  <p className="text-green-200 text-xs mt-1">Últimas 24 horas</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </div>
          </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-lg">Carregando ocorrências...</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button 
              onClick={loadOcorrencias}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sistema de Guias (Tabs) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('em-andamento')}
                  className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors ${
                    activeTab === 'em-andamento'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
                >
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Em Andamento</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {ocorrenciasEmAndamento.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('finalizadas')}
                  className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors ${
                    activeTab === 'finalizadas'
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-slate-600 hover:text-green-600 hover:bg-green-50/50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Finalizadas</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {ocorrenciasFinalizadasUltimas24h.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Conteúdo das Guias */}
            {activeTab === 'em-andamento' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 sm:gap-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Ocorrências em Andamento
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-xs font-medium">
                      {ocorrenciasEmAndamento.length}
                    </span>
                  </h2>
                  
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition"
                      onClick={toggleMostrarFiltrosEmAndamento}
                      title={mostrarFiltrosEmAndamento ? 'Ocultar filtros' : 'Mostrar filtros'}
                    >
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Filtros</span>
                      {mostrarFiltrosEmAndamento ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    
                    {/* Indicador de filtros ativos para Em Andamento */}
                    {(filtroOperadorEmAndamento !== 'todos' || filtroPlacaEmAndamento) && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {[
                          filtroOperadorEmAndamento !== 'todos' ? 'Operador' : null,
                          filtroPlacaEmAndamento ? 'Placa' : null
                        ].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ FILTROS EM ANDAMENTO */}
                {mostrarFiltrosEmAndamento && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                      {/* Filtro por Operador */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-xs font-medium text-slate-700">
                          Operador
                        </label>
                        <Select value={filtroOperadorEmAndamento} onValueChange={handleFiltroOperadorEmAndamentoChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um operador" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os operadores</SelectItem>
                            {operadoresDisponiveis.map((operador) => (
                              <SelectItem key={operador} value={operador}>
                                {operador}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro por Placa */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-xs font-medium text-slate-700">
                          Placa
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Digite a placa..."
                            value={filtroPlacaEmAndamento}
                            onChange={(e) => handleFiltroPlacaEmAndamentoChange(e.target.value)}
                            className="pl-10"
                          />
                          {filtroPlacaEmAndamento && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
                              onClick={() => handleFiltroPlacaEmAndamentoChange('')}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Botão Limpar Filtros */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={limparFiltrosEmAndamento}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Limpar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {ocorrenciasEmAndamento.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma ocorrência em andamento</h3>
                  <p className="text-slate-500">Todas as ocorrências foram finalizadas ou ainda não foram iniciadas.</p>
                </div>
              ) : (
                <div className="p-4 md:p-3 sm:p-6">
                  {layout === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
                      {ocorrenciasEmAndamento.map((ocorrencia, index) => {
                        try {
                          // ✅ OTIMIZAÇÃO: Lazy loading - renderizar apenas cards visíveis
                          if (index < 20) { // Limitar a 20 cards iniciais para melhor performance
                            return renderOcorrenciaCard(ocorrencia);
                          }
                          return null;
                        } catch (error) {
                          console.error('❌ Erro ao renderizar card em andamento:', index, error);
                          return (
                            <div key={`error-${index}`} className="bg-red-50 border border-red-200 rounded-xl p-4">
                              <div className="text-red-600">
                                Erro ao renderizar ocorrência
                              </div>
                            </div>
                          );
                        }
                      })}
                      {/* ✅ OTIMIZAÇÃO: Mostrar indicador se há mais ocorrências */}
                      {ocorrenciasEmAndamento.length > 20 && (
                        <div className="col-span-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                          <p className="text-blue-700 font-medium">
                            Mostrando 20 de {ocorrenciasEmAndamento.length} ocorrências
                          </p>
                          <p className="text-blue-600 text-sm mt-1">
                            Use os filtros para encontrar ocorrências específicas
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-gradient-to-r from-white/80 to-slate-50/80 rounded-xl border border-slate-200">
                      <table className="min-w-[800px] md:min-w-[1100px] w-full divide-y divide-slate-200 text-slate-800 bg-transparent">
                        <thead>
                          <tr>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[30px] md:min-w-[40px]">#</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[70px] md:min-w-[90px]">Placa</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Cliente</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[80px] md:min-w-[100px]">Operador</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[70px] md:min-w-[90px]">Tipo</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Prestador</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[70px] md:min-w-[90px]">Status</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Horários</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[50px] md:min-w-[70px]">KM</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[80px] md:min-w-[100px]">Despesas</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ocorrenciasEmAndamento.map((o) => (
                            <tr key={o.id} className="hover:bg-blue-50/60">
                              <td className="px-2 md:px-3 py-2 text-xs">{o.id}</td>
                              <td className="px-2 md:px-3 py-2 text-xs font-medium">{o.placa1}</td>
                              <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[100px] md:max-w-[120px]">{getNomeCliente(String(o.cliente || ''))}</td>
                              <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[80px] md:max-w-[100px]" title={o.operador}>{o.operador}</td>
                              <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[70px] md:max-w-[90px]" title={o.tipo}>{o.tipo}</td>
                              <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[100px] md:max-w-[120px]" title={String(o.prestador || '')}>{o.prestador}</td>
                              <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[70px] md:max-w-[90px]" title={o.status}>{o.status}</td>
                              <td className="px-2 md:px-3 py-2 text-xs">
                                <div className="space-y-0.5">
                                  {o.inicio ? <div className="truncate" title={formatarDataHora(o.inicio)}>Início: {formatarDataHora(o.inicio)}</div> : null}
                                  {o.chegada ? <div className="truncate" title={formatarDataHora(o.chegada)}>Chegada: {formatarDataHora(o.chegada)}</div> : null}
                                  {o.termino ? <div className="truncate" title={formatarDataHora(o.termino)}>Término: {formatarDataHora(o.termino)}</div> : null}
                                  {!o.inicio && !o.chegada && !o.termino && <div>–</div>}
                                </div>
                              </td>
                              <td className="px-2 md:px-3 py-2 text-xs">
                                {o.km !== undefined && o.km !== null 
                                  ? (Number(o.km) === 0 || Number(o.km) <= 50 ? 'Franquia' : String(o.km))
                                  : '–'
                                }
                              </td>
                              <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[80px] md:max-w-[100px]" title={formatarDespesas(o)}>{formatarDespesas(o)}</td>
                              <td className="px-2 md:px-3 py-2 text-xs">
                                <div className="flex flex-wrap gap-0.5 md:gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'horarios')} title="Horários" className="p-1 md:p-2"><Clock className={`w-3 h-3 md:w-4 md:h-4 ${o.inicio && o.chegada && o.termino ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'km')} title="KM" className="p-1 md:p-2"><MapPin className={`w-3 h-3 md:w-4 md:h-4 ${(o.km_inicial != null || o.km_final != null) ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'prestador')} title="Prestador" className="p-1 md:p-2"><User className={`w-3 h-3 md:w-4 md:h-4 ${o.prestador ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'prestador-adicional')} title="Prestador Adicional" className="p-1 md:p-2"><Users className={`w-3 h-3 md:w-4 md:h-4 ${segundoApoioStatus[o.id] ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'despesas')} title="Despesas" className="p-1 md:p-2"><DollarSign className={`w-3 h-3 md:w-4 md:h-4 ${temDespesasPreenchidas(o) ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'fotos')} title="Fotos" className="p-1 md:p-2"><Image className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'descricao')} title="Descrição" className="p-1 md:p-2"><FileText className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'editar')} title="Editar" className="p-1 md:p-2"><Edit className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'passagem')} title="Passagem" className="p-1 md:p-2"><ClipboardCopy className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    console.log(`🎯 BOTÃO CHECKLIST CLICADO - Tabela ocorrência ID: ${o.id}, Placa: ${o.placa1}`);
                                    handlePopupOpen(o.id, 'checklist');
                                  }} title="Check-list" className="p-1 md:p-2"><CheckSquare className={`w-3 h-3 md:w-4 md:h-4 ${checklistStatus[o.id] ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleStatusClick(o)} title="Status" className="p-1 md:p-2"><Flag className="w-3 h-3 md:w-4 md:h-4 text-orange-600" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Guia Finalizadas */}
            {activeTab === 'finalizadas' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Finalizadas (últimas 24h)
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-xs font-medium">
                      {ocorrenciasFinalizadasUltimas24h.length}
                    </span>
                  </h2>
                  
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-green-600 transition"
                      onClick={toggleMostrarFiltrosFinalizadas}
                      title={mostrarFiltrosFinalizadas ? 'Ocultar filtros' : 'Mostrar filtros'}
                    >
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Filtros</span>
                      {mostrarFiltrosFinalizadas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-orange-600 transition"
                      onClick={toggleGridFinalizadasExpandido}
                      title={gridFinalizadasExpandido ? 'Recolher grid' : 'Expandir grid'}
                    >
                      {gridFinalizadasExpandido ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">{gridFinalizadasExpandido ? 'Recolher' : 'Expandir'}</span>
                    </Button>
                    
                    {/* Indicador de filtros ativos para Finalizadas */}
                    {(filtroOperadorFinalizadas !== 'todos' || filtroPlacaFinalizadas) && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {[
                          filtroOperadorFinalizadas !== 'todos' ? 'Operador' : null,
                          filtroPlacaFinalizadas ? 'Placa' : null
                        ].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ FILTROS FINALIZADAS */}
                {mostrarFiltrosFinalizadas && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                      {/* Filtro por Operador */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-xs font-medium text-slate-700">
                          Operador
                        </label>
                        <Select value={filtroOperadorFinalizadas} onValueChange={handleFiltroOperadorFinalizadasChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um operador" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os operadores</SelectItem>
                            {operadoresDisponiveis.map((operador) => (
                              <SelectItem key={operador} value={operador}>
                                {operador}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro por Placa */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-xs font-medium text-slate-700">
                          Placa
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Digite a placa..."
                            value={filtroPlacaFinalizadas}
                            onChange={(e) => handleFiltroPlacaFinalizadasChange(e.target.value)}
                            className="pl-10"
                          />
                          {filtroPlacaFinalizadas && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
                              onClick={() => handleFiltroPlacaFinalizadasChange('')}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Botão Limpar Filtros */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={limparFiltrosFinalizadas}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Limpar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* ✅ RECOLHIMENTO: Conteúdo condicional baseado no estado de expansão */}
              {gridFinalizadasExpandido ? (
                ocorrenciasFinalizadasUltimas24h.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma ocorrência finalizada</h3>
                    <p className="text-slate-500">Não há ocorrências finalizadas nas últimas 24 horas.</p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6">
                    {layout === 'cards' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
                        {ocorrenciasFinalizadasUltimas24h.map((ocorrencia, index) => {
                          try {
                            // ✅ OTIMIZAÇÃO: Lazy loading - renderizar apenas cards visíveis
                            if (index < 15) { // Limitar a 15 cards para finalizadas
                              return renderOcorrenciaCard(ocorrencia);
                            }
                            return null;
                          } catch (error) {
                            console.error('❌ Erro ao renderizar card finalizada:', index, error);
                            return (
                              <div key={`error-finalizada-${index}`} className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="text-red-600">
                                  Erro ao renderizar ocorrência
                                </div>
                              </div>
                            );
                          }
                        })}
                        {/* ✅ OTIMIZAÇÃO: Mostrar indicador se há mais ocorrências finalizadas */}
                        {ocorrenciasFinalizadasUltimas24h.length > 15 && (
                          <div className="col-span-full bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <p className="text-green-700 font-medium">
                              Mostrando 15 de {ocorrenciasFinalizadasUltimas24h.length} ocorrências finalizadas
                            </p>
                            <p className="text-green-600 text-sm mt-1">
                              Use os filtros para encontrar ocorrências específicas
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-gradient-to-r from-white/80 to-green-50/80 rounded-xl border border-green-200">
                        <table className="min-w-[800px] md:min-w-[1100px] w-full divide-y divide-slate-200 text-slate-800 bg-transparent">
                          <thead>
                            <tr>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[30px] md:min-w-[40px]">#</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[70px] md:min-w-[90px]">Placa</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Cliente</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[80px] md:min-w-[100px]">Operador</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[70px] md:min-w-[90px]">Tipo</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Prestador</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[90px] md:min-w-[110px]">Resultado</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Horários</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[50px] md:min-w-[70px]">KM</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[80px] md:min-w-[100px]">Despesas</th>
                              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold leading-tight text-center px-1 whitespace-nowrap min-w-[100px] md:min-w-[120px]">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ocorrenciasFinalizadasUltimas24h.map((o) => (
                              <tr key={o.id} className="hover:bg-green-50/60">
                                <td className="px-2 md:px-3 py-2 text-xs">{o.id}</td>
                                <td className="px-2 md:px-3 py-2 text-xs font-medium">{o.placa1}</td>
                                <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[100px] md:max-w-[120px]">{getNomeCliente(String(o.cliente || ''))}</td>
                                <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[80px] md:max-w-[100px]" title={o.operador}>{o.operador}</td>
                                <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[70px] md:max-w-[90px]" title={o.tipo}>{o.tipo}</td>
                                <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[100px] md:max-w-[120px]" title={String(o.prestador || '')}>{o.prestador}</td>
                                <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[90px] md:max-w-[110px]" title={o.resultado}>{o.resultado ? o.resultado : '-'}</td>
                                <td className="px-2 md:px-3 py-2 text-xs">
                                  <div className="space-y-0.5">
                                    {o.inicio ? <div className="truncate" title={formatarDataHora(o.inicio)}>Início: {formatarDataHora(o.inicio)}</div> : null}
                                    {o.chegada ? <div className="truncate" title={formatarDataHora(o.chegada)}>Chegada: {formatarDataHora(o.chegada)}</div> : null}
                                    {o.termino ? <div className="truncate" title={formatarDataHora(o.termino)}>Término: {formatarDataHora(o.termino)}</div> : null}
                                    {!o.inicio && !o.chegada && !o.termino && <div>–</div>}
                                  </div>
                                </td>
                                <td className="px-2 md:px-3 py-2 text-xs">
                                  {o.km !== undefined && o.km !== null 
                                    ? (Number(o.km) === 0 || Number(o.km) <= 50 ? 'Franquia' : String(o.km))
                                    : '–'
                                  }
                                </td>
                                <td className="px-2 md:px-3 py-2 text-xs truncate max-w-[80px] md:max-w-[100px]" title={formatarDespesas(o)}>{formatarDespesas(o)}</td>
                                <td className="px-2 md:px-3 py-2 text-xs">
                                  <div className="flex flex-wrap gap-0.5 md:gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'horarios')} title="Horários" className="p-1 md:p-2"><Clock className={`w-3 h-3 md:w-4 md:h-4 ${o.inicio && o.chegada && o.termino ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'km')} title="KM" className="p-1 md:p-2"><MapPin className={`w-3 h-3 md:w-4 md:h-4 ${(o.km_inicial != null || o.km_final != null) ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'prestador')} title="Prestador" className="p-1 md:p-2"><User className={`w-3 h-3 md:w-4 md:h-4 ${o.prestador ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'prestador-adicional')} title="Prestador Adicional" className="p-1 md:p-2"><Users className={`w-3 h-3 md:w-4 md:h-4 ${segundoApoioStatus[o.id] ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'despesas')} title="Despesas" className="p-1 md:p-2"><DollarSign className={`w-3 h-3 md:w-4 md:h-4 ${temDespesasPreenchidas(o) ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'fotos')} title="Fotos" className="p-1 md:p-2"><Image className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'descricao')} title="Descrição" className="p-1 md:p-2"><FileText className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'editar')} title="Editar" className="p-1 md:p-2"><Edit className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'passagem')} title="Passagem" className="p-1 md:p-2"><ClipboardCopy className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      console.log(`🎯 BOTÃO CHECKLIST CLICADO - Tabela ocorrência ID: ${o.id}, Placa: ${o.placa1}`);
                                      handlePopupOpen(o.id, 'checklist');
                                    }} title="Check-list" className="p-1 md:p-2"><CheckSquare className={`w-3 h-3 md:w-4 md:h-4 ${checklistStatus[o.id] ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleStatusClick(o)} title="Status" className="p-1 md:p-2"><Flag className="w-3 h-3 md:w-4 md:h-4 text-orange-600" /></Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* ✅ RECOLHIMENTO: Estado recolhido - mostrar apenas resumo */
                <div className="text-center py-8 bg-slate-50/50">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-slate-600">
                    <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-xs font-medium">
                      Grid recolhido - {ocorrenciasFinalizadasUltimas24h.length} ocorrência{ocorrenciasFinalizadasUltimas24h.length !== 1 ? 's' : ''} finalizada{ocorrenciasFinalizadasUltimas24h.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Clique em "Expandir" para ver as ocorrências
                  </p>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        <Dialog open={showAddPopup} onOpenChange={setShowAddPopup}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
            <AdicionarOcorrenciaPopup 
              onSave={handleNovaOcorrencia} 
              onClose={() => setShowAddPopup(false)} 
              clientes={clientes}
            />
          </DialogContent>
        </Dialog>

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
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'km' && (
                <KMPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'prestador' && (
                <PrestadorPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                  open={popupData.type === 'prestador'}
                  onOpenChange={(open) => {
                    if (!open) handlePopupClose();
                  }}
                />
              )}
              {popupData.type === 'prestador-adicional' && (
                <PrestadorAdicionalPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                  isOpen={popupData.type === 'prestador-adicional'}
                  onOpenChange={(open) => {
                    if (!open) handlePopupClose();
                  }}
                />
              )}
              {popupData.type === 'despesas' && (
                <DespesasPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                  open={popupData.type === 'despesas'}
                  onOpenChange={(open) => {
                    if (!open) handlePopupClose();
                  }}
                />
              )}
              {popupData.type === 'fotos' && (
                <FotosPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'descricao' && (
                <DescricaoPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'editar' && (
                <EditarDadosPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'passagem' && (
                <PassagemServicoPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'status' && (
                <StatusRecuperacaoPopup
                  ocorrencia={[...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas].find(o => o.id === popupData.id)!}
                  onUpdate={(dados) => {
                    console.log('🔄 [StatusRecuperacaoPopup] Dados recebidos:', dados);
                    // ✅ CORREÇÃO: Sempre usar handleUpdate para manter consistência
                    handleUpdate(popupData.id, dados);
                  }}
                  onClose={handlePopupClose}
                />
              )}
              {popupData.type === 'checklist' && (() => {
                const todasOcorrencias = [...ocorrenciasEmAndamento, ...ocorrenciasFinalizadas];
                const ocorrenciaEncontrada = todasOcorrencias.find(o => o.id === popupData.id);
                
                if (!ocorrenciaEncontrada) {
                  console.error('❌ Dashboard - Ocorrência não encontrada:', popupData.id);
                  return null;
                }
                
                return (
                  <CheckListPopup
                    ocorrencia={ocorrenciaEncontrada}
                    onUpdate={(dados) => handleUpdate(popupData.id, dados)}
                    onClose={handlePopupClose}
                  />
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro crítico no componente OcorrenciasDashboard:', error);
    return (
      <div className="w-full bg-gray-100 min-h-screen p-4 lg:p-3 sm:p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-xl text-red-500">
            Erro crítico no carregamento da página. Por favor, recarregue a página.
          </div>
        </div>
      </div>
    );
  }
};

export default OcorrenciasDashboard;
