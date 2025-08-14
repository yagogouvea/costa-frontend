import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Clock, 
  MapPin, 
  User, 
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
  LayoutGrid
} from 'lucide-react';
import { Ocorrencia } from '@/types/ocorrencia';
// import { abreviarNomeCliente } from '@/utils/format';
import AdicionarOcorrenciaPopup from '@/components/ocorrencia/AdicionarOcorrenciaPopup';
import HorariosPopup from '@/components/ocorrencia/HorariosPopup';
import KMPopup from '@/components/ocorrencia/KMPopup';
import PrestadorPopup from '@/components/ocorrencia/PrestadorPopup';
import DespesasPopup from '@/components/ocorrencia/DespesasPopup';
import FotosPopup from '@/components/ocorrencia/FotosPopup';
import DescricaoPopup from '@/components/ocorrencia/DescricaoPopup';
import EditarDadosPopup from '@/components/ocorrencia/EditarDadosPopup';
import PassagemServicoPopup from '@/components/ocorrencia/PassagemServicoPopup';
import StatusRecuperacaoPopup from '@/components/ocorrencia/StatusRecuperacaoPopup';
import api from '@/services/api';
import { getClientes } from '@/services/clienteService';
import type { ClienteResumo } from '@/components/ocorrencia/AdicionarOcorrenciaPopup';

interface PopupData {
  id: number;
  type: 'horarios' | 'km' | 'prestador' | 'despesas' | 'fotos' | 'descricao' | 'editar' | 'passagem' | 'status';
}

const OcorrenciasDashboard: React.FC = () => {
  const [ocorrenciasEmAndamento, setOcorrenciasEmAndamento] = useState<Ocorrencia[]>([]);
  const [ocorrenciasFinalizadas, setOcorrenciasFinalizadas] = useState<Ocorrencia[]>([]);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [layout, setLayout] = useState<'cards' | 'list'>('cards');

  // Status considerados como encerrados
  const STATUS_ENCERRADOS = ['concluida', 'finalizada', 'encerrada', 'finalizado', 'encerrado', 'recuperada', 'recuperado'];

  useEffect(() => {
    loadOcorrencias();
    
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

  const loadOcorrencias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ocorrencias');
      const todasOcorrencias = response.data;
      
      console.debug('Todas ocorrências carregadas:', todasOcorrencias.length);
      
      // ✅ ADICIONAR VERIFICAÇÃO DE TIPO
      if (!Array.isArray(todasOcorrencias)) {
        console.error('❌ Resposta não é um array:', typeof todasOcorrencias);
        console.error('❌ Conteúdo da resposta:', todasOcorrencias);
        setError('Formato de resposta inválido - esperado array de ocorrências');
        return;
      }
      
      // Sanitizar dados para evitar erros de tipo
      const sanitizedOcorrencias = todasOcorrencias.map((o: any) => {
        // Sanitização silenciosa dos dados
        
        return {
          ...o,
          cliente: String(o.cliente || ''),
          operador: String(o.operador || ''),
          tipo: String(o.tipo || ''),
          status: String(o.status || ''),
          placa1: String(o.placa1 || ''),
          prestador: String(o.prestador || ''),
          inicio: o.inicio ? String(o.inicio) : null,
          chegada: o.chegada ? String(o.chegada) : null,
          termino: o.termino ? String(o.termino) : null,
          km: typeof o.km === 'number' ? o.km : null,
          despesas: o.despesas !== null && o.despesas !== undefined ? o.despesas : null,
          despesas_detalhadas: o.despesas_detalhadas !== null && o.despesas_detalhadas !== undefined ? o.despesas_detalhadas : null
        };
      });
      
      // Separar ocorrências em andamento e finalizadas
      const emAndamentoArr = sanitizedOcorrencias.filter((o: Ocorrencia) => (o.status || '').toLowerCase() === 'em_andamento');
      const finalizadasArr = sanitizedOcorrencias.filter(
        (o: Ocorrencia) =>
          STATUS_ENCERRADOS.includes((o.status || '').toLowerCase()) ||
          (o.resultado && String(o.resultado).trim() !== '')
      );
      console.debug('Ocorrências processadas:', { emAndamento: emAndamentoArr.length, finalizadas: finalizadasArr.length });
      setOcorrenciasEmAndamento(emAndamentoArr);
      setOcorrenciasFinalizadas(finalizadasArr);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar ocorrências:', err);
      setError('Erro ao carregar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  const handlePopupOpen = (id: number, type: PopupData['type']) => {
    setPopupData({ id, type });
  };

  const handlePopupClose = () => {
    setPopupData(null);
    // Não recarregar automaticamente para manter as atualizações
    // loadOcorrencias();
  };

  const handleNovaOcorrencia = () => {
    setShowAddPopup(false);
    loadOcorrencias();
  };

  const handleUpdate = (ocorrenciaId: number, dados: Partial<Ocorrencia>) => {
          console.debug('Atualizando ocorrência:', ocorrenciaId);
    
    setOcorrenciasEmAndamento(prev =>
      prev.map(o => o.id === ocorrenciaId ? { ...o, ...dados } : o)
    );
    setOcorrenciasFinalizadas(prev =>
      prev.map(o => o.id === ocorrenciaId ? { ...o, ...dados } : o)
    );
  };

  // Função utilitária para formatar data/hora no padrão DD/MM/YYYY HH:mm
  const formatarDataHora = (iso?: string | null) => {
    if (!iso || typeof iso !== 'string') return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      console.error('Erro ao formatar data/hora:', error, 'valor:', iso);
      return '';
    }
  };

  function getNomeCliente(cliente: string) {
    const c = clientes.find(c => c.nome === cliente);
    return c?.nome_fantasia || c?.nome || cliente;
  }

  // Filtro para mostrar apenas ocorrências finalizadas nas últimas 24 horas (excluindo canceladas)
  const agora = Date.now();
  const ha24h = agora - 24 * 60 * 60 * 1000;
  const ocorrenciasFinalizadasUltimas24h = ocorrenciasFinalizadas.filter(o => {
    const dataCriacao = o.criado_em ? new Date(o.criado_em).getTime() : null;
    // Excluir ocorrências canceladas do grid de finalizadas
    const isCancelada = String(o.resultado) === 'Cancelado';
    return dataCriacao && dataCriacao >= ha24h && !isCancelada;
  });

  const formatarDespesas = (ocorrencia: Ocorrencia) => {
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
  };

  const temDespesasPreenchidas = (ocorrencia: Ocorrencia) => {
    // Só fica verde se há despesas detalhadas OU se foi explicitamente salvo com "Sem despesas" (despesas = 0 e despesas_detalhadas = [])
    return (ocorrencia.despesas_detalhadas && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length > 0) ||
           (ocorrencia.despesas === 0 && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length === 0);
  };

  // Função para validar se a ocorrência pode ser finalizada
  const podeFinalizarOcorrencia = (ocorrencia: Ocorrencia) => {
    const erros: string[] = [];

    // Verificar se já está finalizada
    if (ocorrencia.resultado && ['Recuperado', 'Não Recuperado', 'Cancelado'].includes(String(ocorrencia.resultado))) {
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
        if (String(ocorrencia.resultado) === 'Recuperado') {
          return 'from-green-500/10 to-emerald-500/10 border-green-200/50';
        }
        if (String(ocorrencia.resultado) === 'Cancelado') {
          return 'from-red-500/10 to-pink-500/10 border-red-200/50';
        }
        return 'from-slate-500/10 to-gray-500/10 border-slate-200/50';
      };

      const cardColor = getCardColor();
      
      // Verificar se a ocorrência está finalizada (tem resultado)
      const isFinalizada = ocorrencia.resultado && ['Recuperado', 'Não Recuperado', 'Cancelado'].includes(String(ocorrencia.resultado));
      const buttonText = isFinalizada ? 'Alterar Resultado' : 'Encerrar Ocorrência';

      return (
    <div key={ocorrencia.id} className={`bg-gradient-to-br ${cardColor} backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg border p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                {String(ocorrencia.placa1 || '–')}
              </div>
              <span className="text-slate-500 text-xs md:text-sm font-medium">#{ocorrencia.id}</span>
            </div>
            <p className="text-slate-700 text-xs md:text-sm mb-1 font-medium truncate">{getNomeCliente(String(ocorrencia.cliente || '')) || '–'}</p>
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
              if (['Recuperado', 'Não Recuperado', 'Cancelado'].includes(String(ocorrencia.resultado))) {
                const isRecuperado = String(ocorrencia.resultado) === 'Recuperado';
                const isCancelado = String(ocorrencia.resultado) === 'Cancelado';
                return (
                  <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    isRecuperado ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 
                    isCancelado ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  }`}>
                    {isRecuperado && <CheckCircle className="w-3 h-3 mr-1" />}
                    {isCancelado && <XCircle className="w-3 h-3 mr-1" />}
                    <span className="truncate">{String(ocorrencia.resultado)}</span>
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
        
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-white/30 shadow-sm">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              <span className="text-slate-700 font-semibold text-xs md:text-sm">KM</span>
            </div>
            <p className="text-slate-900 font-bold text-sm md:text-lg truncate">
              {ocorrencia.km !== undefined && ocorrencia.km !== null 
                ? (Number(ocorrencia.km) === 0 || Number(ocorrencia.km) <= 50 ? 'Franquia' : String(ocorrencia.km))
                : '–'
              }
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-white/30 shadow-sm">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <User className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />
              <span className="text-slate-700 font-semibold text-xs md:text-sm">Prestador</span>
            </div>
            <p className="text-slate-900 font-bold text-xs md:text-sm truncate">{String(ocorrencia.prestador || '–')}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-white/30 shadow-sm">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              <span className="text-slate-700 font-semibold text-xs md:text-sm">Despesas</span>
            </div>
            <p className="text-slate-900 font-bold text-xs md:text-sm truncate">{formatarDespesas(ocorrencia)}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-white/30 shadow-sm">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
              <span className="text-slate-700 font-semibold text-xs md:text-sm">Horários</span>
            </div>
            <div className="text-xs text-slate-700 space-y-0.5">
              {ocorrencia.inicio ? <div className="truncate">Início: {formatarDataHora(ocorrencia.inicio)}</div> : null}
              {ocorrencia.chegada ? <div className="truncate">Chegada: {formatarDataHora(ocorrencia.chegada)}</div> : null}
              {ocorrencia.termino ? <div className="truncate">Término: {formatarDataHora(ocorrencia.termino)}</div> : null}
              {!ocorrencia.inicio && !ocorrencia.chegada && !ocorrencia.termino && <div>–</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'horarios')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <Clock className={`w-3 h-3 md:w-4 md:h-4 ${ocorrencia.inicio && ocorrencia.chegada && ocorrencia.termino ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Horários</span>
            <span className="sm:hidden">H</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'km')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <MapPin className={`w-3 h-3 md:w-4 md:h-4 ${(ocorrencia.km_inicial != null || ocorrencia.km_final != null) ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">KM</span>
            <span className="sm:hidden">K</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'prestador')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <User className={`w-3 h-3 md:w-4 md:h-4 ${ocorrencia.prestador ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Prestador</span>
            <span className="sm:hidden">P</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'despesas')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <DollarSign className={`w-3 h-3 md:w-4 md:h-4 ${temDespesasPreenchidas(ocorrencia) ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Despesas</span>
            <span className="sm:hidden">D</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'fotos')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <Image className={`w-3 h-3 md:w-4 md:h-4 ${ocorrencia.fotos && ocorrencia.fotos.length > 0 ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Fotos</span>
            <span className="sm:hidden">F</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'descricao')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <FileText className={`w-3 h-3 md:w-4 md:h-4 ${ocorrencia.descricao ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Descrição</span>
            <span className="sm:hidden">Desc</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'editar')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <Edit className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
            <span className="hidden sm:inline">Editar</span>
            <span className="sm:hidden">E</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handlePopupOpen(ocorrencia.id, 'passagem')} 
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
          >
            <ClipboardCopy className={`w-3 h-3 md:w-4 md:h-4 ${ocorrencia.passagem_servico ? 'text-green-600' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">Passagem</span>
            <span className="sm:hidden">PS</span>
          </Button>
        </div>
        
        {/* Botão Encerrar/Alterar Resultado centralizado e destacado */}
        <div className="flex justify-center mt-3 md:mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleStatusClick(ocorrencia)} 
            className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2 md:py-3 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all duration-200 rounded-lg md:rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg hover:shadow-xl"
          >
            <Flag className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            <span className="font-medium text-xs md:text-sm">{buttonText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
    } catch (error) {
      console.error('❌ Erro ao renderizar card da ocorrência:', ocorrencia.id, error);
      return (
        <div key={ocorrencia.id} className="bg-red-50 border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-6">
          <div className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Erro ao renderizar ocorrência {ocorrencia.id}</span>
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
          <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm text-white rounded-2xl p-6 mb-8 shadow-xl border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                  <Activity className="w-8 h-8 text-blue-400" />
                  Painel de Ocorrências
                </h1>
                <p className="text-slate-300 mt-2 text-sm lg:text-base">
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
                  {layout === 'cards' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                  <span className="hidden md:inline">{layout === 'cards' ? 'Lista' : 'Cards'}</span>
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={() => setShowAddPopup(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Ocorrência
                </Button>
              </div>
            </div>
          </div>

          {/* Cards de Status Informativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-sm text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Em Andamento</p>
                  <p className="text-3xl font-bold">{ocorrenciasEmAndamento.length}</p>
                  <p className="text-blue-200 text-xs mt-1">Ocorrências ativas</p>
                </div>
                <Clock className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/90 to-emerald-600/90 backdrop-blur-sm text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Finalizadas (24h)</p>
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
              <p className="text-slate-500 text-sm mt-2">Aguarde enquanto buscamos os dados</p>
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
          <div className="space-y-8">
            {/* Seção Em Andamento */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Ocorrências em Andamento
                  <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {ocorrenciasEmAndamento.length}
                  </span>
                </h2>
              </div>
              
              {ocorrenciasEmAndamento.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma ocorrência em andamento</h3>
                  <p className="text-slate-500">Todas as ocorrências foram finalizadas ou ainda não foram iniciadas.</p>
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  {layout === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {ocorrenciasEmAndamento.map((ocorrencia, index) => {
                        try {
                          return renderOcorrenciaCard(ocorrencia);
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
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-gradient-to-r from-white/80 to-slate-50/80 rounded-xl border border-slate-200">
                      <table className="min-w-[800px] md:min-w-[1100px] w-full divide-y divide-slate-200 text-slate-800 bg-transparent">
                        <thead>
                          <tr>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[30px] md:min-w-[40px]">#</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[70px] md:min-w-[90px]">Placa</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Cliente</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[80px] md:min-w-[100px]">Operador</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[70px] md:min-w-[90px]">Tipo</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Prestador</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[70px] md:min-w-[90px]">Status</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Horários</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[50px] md:min-w-[70px]">KM</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[80px] md:min-w-[100px]">Despesas</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Ações</th>
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
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'despesas')} title="Despesas" className="p-1 md:p-2"><DollarSign className={`w-3 h-3 md:w-4 md:h-4 ${temDespesasPreenchidas(o) ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'fotos')} title="Fotos" className="p-1 md:p-2"><Image className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'descricao')} title="Descrição" className="p-1 md:p-2"><FileText className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'editar')} title="Editar" className="p-1 md:p-2"><Edit className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'passagem')} title="Passagem" className="p-1 md:p-2"><ClipboardCopy className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
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

            {/* Seção Finalizadas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Finalizadas (últimas 24h)
                  <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {ocorrenciasFinalizadasUltimas24h.length}
                  </span>
                </h2>
              </div>
              
              {ocorrenciasFinalizadasUltimas24h.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhuma ocorrência finalizada</h3>
                  <p className="text-slate-500">Não há ocorrências finalizadas nas últimas 24 horas.</p>
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  {layout === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {ocorrenciasFinalizadasUltimas24h.map((ocorrencia, index) => {
                        try {
                          return renderOcorrenciaCard(ocorrencia);
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
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-gradient-to-r from-white/80 to-green-50/80 rounded-xl border border-green-200">
                      <table className="min-w-[800px] md:min-w-[1100px] w-full divide-y divide-slate-200 text-slate-800 bg-transparent">
                        <thead>
                          <tr>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[30px] md:min-w-[40px]">#</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[70px] md:min-w-[90px]">Placa</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Cliente</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[80px] md:min-w-[100px]">Operador</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[70px] md:min-w-[90px]">Tipo</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Prestador</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[90px] md:min-w-[110px]">Resultado</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Horários</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[50px] md:min-w-[70px]">KM</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[80px] md:min-w-[100px]">Despesas</th>
                            <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold whitespace-nowrap min-w-[100px] md:min-w-[120px]">Ações</th>
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
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'despesas')} title="Despesas" className="p-1 md:p-2"><DollarSign className={`w-3 h-3 md:w-4 md:h-4 ${temDespesasPreenchidas(o) ? 'text-green-600' : 'text-blue-600'}`} /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'fotos')} title="Fotos" className="p-1 md:p-2"><Image className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'descricao')} title="Descrição" className="p-1 md:p-2"><FileText className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'editar')} title="Editar" className="p-1 md:p-2"><Edit className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handlePopupOpen(o.id, 'passagem')} title="Passagem" className="p-1 md:p-2"><ClipboardCopy className="w-3 h-3 md:w-4 md:h-4 text-blue-600" /></Button>
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
                    if (["Recuperado", "Não Recuperado", "Cancelado"].includes(String(dados.resultado))) {
                      setOcorrenciasEmAndamento(prev => prev.filter(o => o.id !== popupData.id));
                      setOcorrenciasFinalizadas(prev => prev.map(o => o.id === popupData.id ? { ...o, ...dados } : o));
                    } else {
                      handleUpdate(popupData.id, dados);
                    }
                  }}
                  onClose={handlePopupClose}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro crítico no componente OcorrenciasDashboard:', error);
    return (
      <div className="w-full bg-gray-100 min-h-screen p-4 lg:p-6">
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
