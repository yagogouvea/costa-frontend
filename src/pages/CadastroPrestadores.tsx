import React, { useState, useEffect } from 'react';
import { PrestadorForm, Prestador } from '@/types/prestador';
import { Button } from '@/components/ui/button';
import PermissionButton from '@/components/PermissionButton';
import { Input } from '@/components/ui/input';
import PrestadorPopup from '@/components/prestador/PrestadorPopup';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';
import { formatarValorMonetario } from '@/utils/prestadorUtils';
import { normalizarTexto } from '@/utils/textUtils';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dispararAtualizacaoMapa } from '@/hooks/useMapaAutoUpdate';
import { UserCog } from 'lucide-react';
import { Phone, MapPin, User, CheckCircle, DollarSign, Clock, Edit, XCircle } from 'lucide-react';

// Adicionar declaração global para evitar erro TS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    atualizarPrestadoresMapa?: () => void;
  }
}

const convertPrestadorToPrestadorForm = (prestador: any): PrestadorForm => {
  return {
    ...prestador,
    valor_acionamento: prestador.valor_acionamento?.toString(),
    valor_hora_adc: prestador.valor_hora_adc?.toString(),
    valor_km_adc: prestador.valor_km_adc?.toString(),
    franquia_km: prestador.franquia_km?.toString()
  };
};

const tiposApoio = [
  'Pronta resposta',
  'Apoio armado',
  'Policial',
  'Antenista',
  'Drone',
];

function extrairBairroCidadeUF(regiaoStr: string) {
  const estadosParaUF: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
    'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
    'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
    'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
    'Sergipe': 'SE', 'Tocantins': 'TO'
  };

  const partes = regiaoStr.split(',').map(p => p.trim());
  let uf = '';
  let cidade = '';
  let bairro = '';

  // Normalizar a string de região para comparação
  const regiaoNormalizada = normalizarTexto(regiaoStr);

  // Procura o estado na string (insensível a acentos)
  for (const nomeEstado in estadosParaUF) {
    const estadoNormalizado = normalizarTexto(nomeEstado);
    if (regiaoNormalizada.includes(estadoNormalizado)) {
      uf = estadosParaUF[nomeEstado];
      break;
    }
  }

  // Procura por palavras-chave típicas de cidade e bairro (insensível a acentos)
  for (let i = 0; i < partes.length; i++) {
    const parteNormalizada = normalizarTexto(partes[i]);
    
    if (!cidade && (
      parteNormalizada.includes('paulista') || 
      parteNormalizada.includes('campinas') || 
      parteNormalizada.includes('atibaia') || 
      parteNormalizada.includes('braganca') ||
      parteNormalizada.includes('sao paulo') ||
      parteNormalizada.includes('santos') ||
      parteNormalizada.includes('guarulhos')
    )) {
      cidade = partes[i];
    }
    if (!bairro && (
      parteNormalizada.includes('centro') || 
      parteNormalizada.includes('bairro') || 
      parteNormalizada.includes('jardim') || 
      parteNormalizada.includes('vila') ||
      parteNormalizada.includes('zona') ||
      parteNormalizada.includes('distrito')
    )) {
      bairro = partes[i];
    }
  }

  // fallback: cidade = penúltimo, uf = já encontrado
  if (!cidade && partes.length > 1) cidade = partes[partes.length - 2];

  if (bairro) {
    return `${bairro}, ${cidade}, ${uf}`;
  }
  return `${cidade}, ${uf}`;
}

const CadastroPrestadores: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prestadores, setPrestadores] = useState<PrestadorForm[]>([]);
  const [popupAberto, setPopupAberto] = useState(false);
  const [prestadorSelecionado, setPrestadorSelecionado] = useState<PrestadorForm | null>(null);
  const [filtros, setFiltros] = useState({ 
    busca: '', 
    regioes: [] as string[], 
    funcoes: [] as string[],
    validacaoPendente: false 
  });
  const [buscou, setBuscou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regiaoInput, setRegiaoInput] = useState('');
  
  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalPrestadores, setTotalPrestadores] = useState(0);

  // Estados para gerenciamento de usuários
  const [usuariosStatus, setUsuariosStatus] = useState<Record<number, any>>({});
  const [gerandoUsuario, setGerandoUsuario] = useState<number | null>(null);

  // Verificar se o usuário tem permissão para exportar (apenas supervisores e admins)
  const podeExportar = user?.role === 'admin' || user?.role === 'supervisor';

  // Função para verificar status do usuário de um prestador
  const verificarUsuarioPrestador = async (prestadorId: number) => {
    try {
      const response = await api.get(`/api/v1/prestadores/${prestadorId}/verificar-usuario`);
      setUsuariosStatus(prev => ({
        ...prev,
        [prestadorId]: response.data
      }));
    } catch (error) {
      console.error('Erro ao verificar usuário do prestador:', error);
    }
  };

  // Função para gerar usuário para um prestador
  const gerarUsuarioPrestador = async (prestadorId: number) => {
    try {
      setGerandoUsuario(prestadorId);
      const response = await api.post(`/api/v1/prestadores/${prestadorId}/gerar-usuario`);
      
      // Atualizar status do usuário
      setUsuariosStatus(prev => ({
        ...prev,
        [prestadorId]: {
          tem_usuario: true,
          pode_gerar: false,
          usuario: response.data.usuario
        }
      }));

      toast.success(`Usuário criado com sucesso! Email: ${response.data.credenciais.email}, Senha: ${response.data.credenciais.senha}`);
    } catch (error: any) {
      console.error('Erro ao gerar usuário:', error);
      toast.error(error.response?.data?.error || 'Erro ao gerar usuário');
    } finally {
      setGerandoUsuario(null);
    }
  };

  // Verificar usuários quando prestadores são carregados
  useEffect(() => {
    if (prestadores.length > 0) {
      prestadores.forEach(prestador => {
        if (prestador.id) {
          verificarUsuarioPrestador(prestador.id);
        }
      });
    }
  }, [prestadores]);

  // Buscar prestadores quando página ou itens por página mudarem
  useEffect(() => {
    if (buscou) {
      buscarPrestadores();
    }
  }, [paginaAtual, itensPorPagina]);

  // Buscar prestadores iniciais
  useEffect(() => {
    aplicarFiltros();
  }, []);

  const handleAddRegiao = () => {
    const valor = regiaoInput.trim();
    if (valor && !filtros.regioes.includes(valor)) {
      setFiltros(f => ({ ...f, regioes: [...f.regioes, valor] }));
    }
    setRegiaoInput('');
  };

  const handleRemoveRegiao = (regiao: string) => {
    setFiltros(f => ({ ...f, regioes: f.regioes.filter(r => r !== regiao) }));
  };

  const handleRegiaoInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddRegiao();
    }
  };

  const handleFuncaoChange = (funcao: string) => {
    setFiltros(f => {
      const jaSelecionada = f.funcoes.includes(funcao);
      return {
        ...f,
        funcoes: jaSelecionada ? f.funcoes.filter(fx => fx !== funcao) : [...f.funcoes, funcao],
      };
    });
  };

  const limparFiltros = () => {
    setFiltros({ busca: '', regioes: [], funcoes: [], validacaoPendente: false });
    setRegiaoInput('');
    setBuscou(false);
    setPrestadores([]);
    setPaginaAtual(1);
  };

  // Funções de paginação
  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalPrestadores / itensPorPagina);

  // Resetar página quando aplicar filtros
  const aplicarFiltros = () => {
    setPaginaAtual(1);
    buscarPrestadores();
  };

  const buscarPrestadores = async () => {
    setLoading(true);
    setBuscou(true);
    try {
      const params: any = {};
      if (filtros.busca) {
        params.nome = filtros.busca;
        params.cod_nome = filtros.busca;
      }
      
      // Melhorado: normalizar texto de região para busca mais precisa
      if (regiaoInput.trim().length > 0) {
        // Enviar tanto o texto original quanto o normalizado para melhor compatibilidade
        const textoOriginal = regiaoInput.trim();
        params.local = textoOriginal; // Backend já trata normalização
      } else if (filtros.regioes.length > 0) {
        // Normalizar cada região antes de enviar
        const regioesNormalizadas = filtros.regioes.map(regiao => 
          normalizarTexto(regiao)
        );
        params.local = regioesNormalizadas.join(',');
      }
      
      if (filtros.funcoes.length > 0) params.funcoes = filtros.funcoes.join(',');
      
      // Filtro de validação pendente - buscar prestadores sem valores monetários
      if (filtros.validacaoPendente) {
        params.sem_valores = true; // Parâmetro para backend filtrar prestadores sem valores
      }
      
      // Parâmetros de paginação
      params.page = paginaAtual;
      params.pageSize = itensPorPagina;
      
      console.log('🔍 Parâmetros de busca:', params);
      
      const resposta = await api.get<Prestador[]>('/api/v1/prestadores', { params });
      const dados = resposta.data;
      
      // O backend agora sempre retorna formato paginado
      if (dados && typeof dados === 'object' && 'data' in dados && 'total' in dados) {
        const prestadoresArray = (dados as any).data;
        setTotalPrestadores((dados as any).total);
        
        if (prestadoresArray.length === 0) {
          setPrestadores([]);
          toast.error('Nenhum prestador encontrado');
          return;
        }
        
        const prestadoresForm = prestadoresArray.map(convertPrestadorToPrestadorForm);
        setPrestadores(prestadoresForm);
      } else {
        // Fallback caso o backend retorne formato antigo
        const prestadoresArray = Array.isArray(dados) ? dados : [];
        setTotalPrestadores(prestadoresArray.length);
        setPrestadores(prestadoresArray.map(convertPrestadorToPrestadorForm));
      }
    } catch (erro: any) {
      console.error('❌ Erro ao buscar prestadores:', erro);
      toast.error(erro.response?.data?.message || 'Erro ao carregar prestadores');
      setPrestadores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (prestador: PrestadorForm) => {
    // Garante que regioes seja array de string para o popup
    const regioesTratadas = (prestador.regioes || []).map((r: any) =>
      typeof r === 'object' && r !== null && r.regiao ? r.regiao : r
    );
    setPrestadorSelecionado({ ...prestador, regioes: regioesTratadas });
    setPopupAberto(true);
  };

  const handleExcluir = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja excluir este prestador?')) return;
    try {
              await api.delete(`/api/v1/prestadores/${id}`);
      toast.success('Prestador excluído com sucesso!');
      dispararAtualizacaoMapa('excluido');
      buscarPrestadores();
    } catch (erro: any) {
      console.error('❌ Erro ao excluir prestador:', erro);
      toast.error(erro.response?.data?.message || 'Erro ao excluir prestador');
    }
  };

  const exportarParaExcel = async () => {
    // Verificar permissão antes de exportar
    if (!podeExportar) {
      toast.error('Apenas supervisores e administradores podem exportar planilhas.');
      return;
    }

    // Se não há prestadores carregados, buscar todos primeiro
    if (prestadores.length === 0) {
      try {
        setLoading(true);
        const resposta = await api.get<Prestador[]>('/api/v1/prestadores');
        const dados = resposta.data;
        if (!Array.isArray(dados) || dados.length === 0) {
          toast.error('Nenhum prestador encontrado para exportar.');
          return;
        }
        const prestadoresParaExportar = dados.map(convertPrestadorToPrestadorForm);
        exportarDados(prestadoresParaExportar);
      } catch (erro: any) {
        console.error('❌ Erro ao buscar prestadores para exportação:', erro);
        toast.error('Erro ao buscar prestadores para exportação');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Se já há prestadores carregados, exportar eles
    exportarDados(prestadores);
  };

  const exportarDados = (dadosPrestadores: PrestadorForm[]) => {
    try {
      // Preparar os dados para exportação
      const dadosParaExportar = dadosPrestadores.map(prestador => ({
        'ID': prestador.id || '',
        'Nome': prestador.nome || '',
        'CPF': prestador.cpf || '',
        'Codinome': prestador.cod_nome || '',
        'Telefone': prestador.telefone || '',
        'E-mail': prestador.email || '',
        'Tipo PIX': prestador.tipo_pix || '',
        'Chave PIX': prestador.chave_pix || '',
        'CEP': prestador.cep || '',
        'Endereço': prestador.endereco || '',
        'Bairro': prestador.bairro || '',
        'Cidade': prestador.cidade || '',
        'Estado': prestador.estado || '',
        'Valor Acionamento': prestador.valor_acionamento ? formatarValorMonetario(Number(prestador.valor_acionamento)) : 'Não definido',
        'Valor Hora Adicional': prestador.valor_hora_adc ? formatarValorMonetario(Number(prestador.valor_hora_adc)) : 'Não definido',
        'Valor KM Adicional': prestador.valor_km_adc ? formatarValorMonetario(Number(prestador.valor_km_adc)) : 'Não definido',
        'Franquia KM': prestador.franquia_km || 'Não definido',
        'Franquia Horas': prestador.franquia_horas || 'Não definido',
        'Aprovado': prestador.aprovado ? 'Sim' : 'Não',
        'Origem': prestador.origem || 'Sistema interno',
        'Tipos de Apoio': Array.isArray(prestador.funcoes) 
          ? prestador.funcoes.map((f: any) => typeof f === 'string' ? f : f.funcao || f.nome || String(f)).join(', ')
          : 'Não definido',
        'Regiões de Atendimento': Array.isArray(prestador.regioes)
          ? prestador.regioes.map((r: any) => {
              let regiaoStr = '';
              if (typeof r === 'string') {
                regiaoStr = r;
              } else if (typeof r === 'object' && r !== null) {
                regiaoStr = r.regiao || r.nome || String(r);
              } else {
                regiaoStr = String(r);
              }
              // Usar a mesma função de formatação dos cards
              return extrairBairroCidadeUF(regiaoStr);
            }).join('; ')
          : 'Não definido',
        'Tipos de Veículo': Array.isArray(prestador.veiculos)
          ? prestador.veiculos.map((v: any) => v.tipo || v.nome || String(v)).join(', ')
          : Array.isArray(prestador.tipo_veiculo)
            ? prestador.tipo_veiculo.join(', ')
            : 'Não definido',
        'Tipo de Antena': prestador.modelo_antena || 'Não definido'
      }));

      // Criar o workbook e worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);

      // Ajustar largura das colunas
      const columnWidths = [
        { wch: 5 },   // ID
        { wch: 25 },  // Nome
        { wch: 15 },  // CPF
        { wch: 15 },  // Codinome
        { wch: 15 },  // Telefone
        { wch: 25 },  // E-mail
        { wch: 12 },  // Tipo PIX
        { wch: 20 },  // Chave PIX
        { wch: 10 },  // CEP
        { wch: 30 },  // Endereço
        { wch: 20 },  // Bairro
        { wch: 20 },  // Cidade
        { wch: 8 },   // Estado
        { wch: 15 },  // Valor Acionamento
        { wch: 18 },  // Valor Hora Adicional
        { wch: 16 },  // Valor KM Adicional
        { wch: 12 },  // Franquia KM
        { wch: 12 },  // Franquia Horas
        { wch: 10 },  // Aprovado
        { wch: 15 },  // Origem
        { wch: 30 },  // Tipos de Apoio
        { wch: 40 },  // Regiões de Atendimento
        { wch: 20 },  // Tipos de Veículo
        { wch: 20 }   // Tipo de Antena
      ];
      worksheet['!cols'] = columnWidths;

      // Adicionar a planilha ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Prestadores');

      // Gerar nome do arquivo com data/hora
      const agora = new Date();
      const dataHora = agora.toLocaleString('pt-BR').replace(/[\/\s:]/g, '-');
      const nomeArquivo = `prestadores-segtrack-${dataHora}.xlsx`;

      // Fazer download do arquivo
      XLSX.writeFile(workbook, nomeArquivo);
      
      toast.success(`Planilha exportada com sucesso! ${dadosPrestadores.length} prestadores exportados.`);
    } catch (error) {
      console.error('Erro ao exportar planilha:', error);
      toast.error('Erro ao exportar planilha. Tente novamente.');
    }
  };

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
                <UserCog className="w-8 h-8 text-blue-400" />
                Cadastro de Prestadores
              </h1>
              <p className="text-slate-300 mt-2 text-sm lg:text-base">
                Gerencie e cadastre todos os prestadores de serviço
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                className="border-2 border-blue-600 bg-white/10 text-white hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium"
                onClick={() => navigate('/mapa-prestadores')}
              >
                🗺️ Ver Mapa de Prestadores
              </Button>
              <PermissionButton
                requiredPermission="read:prestador"
                onClick={exportarParaExcel}
                variant="ghost"
                className="flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white w-full sm:w-auto"
                disabled={loading}
                message="Você não tem permissão para exportar dados de prestadores."
              >
                <Download className="w-4 h-4" />
                {loading ? 'Exportando...' : 'Exportar Excel'}
              </PermissionButton>
              <PermissionButton
                requiredPermission="create:prestador"
                onClick={() => {
                  setPrestadorSelecionado(null);
                  setPopupAberto(true);
                }}
                message="Você não tem permissão para criar novos prestadores."
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                + Novo Prestador
              </PermissionButton>
            </div>
          </div>
        </div>

        {/* Filtros de busca */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 lg:p-6 flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Filtros de Busca</h3>
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              💡 Dica: Use múltiplos filtros para resultados mais precisos
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Nome ou Codinome</label>
              <Input
                placeholder="Digite nome ou codinome do prestador"
                value={filtros.busca}
                onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))}
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Busca parcial - não precisa digitar o nome completo
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Regiões de Atendimento</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filtros.regioes.map(regiao => (
                  <span key={regiao} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1 text-xs">
                    {regiao}
                    <button type="button" onClick={() => handleRemoveRegiao(regiao)} className="text-red-500 hover:text-red-700">&times;</button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Ex: Centro, Jardim Paulista, São Paulo..."
                value={regiaoInput}
                onChange={e => setRegiaoInput(e.target.value)}
                onKeyDown={handleRegiaoInputKeyDown}
                onBlur={handleAddRegiao}
                className="text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
              {filtros.regioes.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Nenhuma região selecionada - serão mostrados todos os prestadores
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Tipos de Apoio</label>
              <div className="text-xs text-slate-600 mb-2">
                <p className="mb-1">💡 <strong>Selecione os tipos:</strong></p>
                <p className="text-slate-500">Marque uma ou mais opções para filtrar</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tiposApoio.map(funcao => (
                  <label key={funcao} className="flex items-center gap-1 cursor-pointer select-none text-xs">
                    <input
                      type="checkbox"
                      checked={filtros.funcoes.includes(funcao)}
                      onChange={() => handleFuncaoChange(funcao)}
                      className="accent-blue-600"
                    />
                    {funcao}
                  </label>
                ))}
              </div>
              {filtros.funcoes.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Nenhum tipo selecionado - serão mostrados todos os tipos
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Validação Pendente</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filtros.validacaoPendente}
                  onChange={(e) => setFiltros(f => ({ ...f, validacaoPendente: e.target.checked }))}
                  className="accent-blue-600"
                />
                <span className="text-xs text-slate-600">Mostrar apenas prestadores com valores pendentes de validação</span>
              </div>
              {filtros.validacaoPendente && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Mostrando apenas prestadores sem valores monetários configurados
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-xs text-slate-500">
              {filtros.busca || filtros.regioes.length > 0 || filtros.funcoes.length > 0 || filtros.validacaoPendente ? (
                <span className="text-blue-600">
                  🔍 Filtros ativos: {[
                    filtros.busca && 'Nome/Codinome', 
                    filtros.regioes.length > 0 && `${filtros.regioes.length} região(ões)`,
                    filtros.funcoes.length > 0 && `${filtros.funcoes.length} tipo(s)`,
                    filtros.validacaoPendente && 'Validação pendente'
                  ].filter(Boolean).join(', ')}
                </span>
              ) : (
                'Nenhum filtro aplicado - clique em Buscar para ver todos os prestadores'
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {(filtros.busca || filtros.regioes.length > 0 || filtros.funcoes.length > 0 || filtros.validacaoPendente) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={limparFiltros}
                  className="text-slate-600 hover:text-slate-800 border border-slate-300"
                >
                  🗑️ Limpar
                </Button>
              )}
              <Button 
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                onClick={aplicarFiltros} 
                disabled={loading}
              >
                {loading ? '🔍 Buscando...' : '🔍 Buscar Prestadores'}
              </Button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-lg">Carregando prestadores...</p>
              <p className="text-slate-500 text-sm mt-2">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        ) : !buscou ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserCog className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum prestador carregado</h3>
            <p className="text-slate-500">Use os filtros acima para pesquisar prestadores.</p>
          </div>
        ) : prestadores.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserCog className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-lg mb-2">🔍 Nenhum prestador encontrado</div>
            <div className="text-sm text-slate-400">
              Tente ajustar os filtros ou verificar se os dados estão corretos
            </div>
          </div>
        ) : (
          <div>
            {/* Controles de paginação */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="text-sm text-slate-600">
                📊 <strong>{totalPrestadores}</strong> prestador{totalPrestadores !== 1 ? 'es' : ''} encontrado{totalPrestadores !== 1 ? 's' : ''}
                {(filtros.busca || filtros.regioes.length > 0 || filtros.funcoes.length > 0 || filtros.validacaoPendente) && (
                  <span className="text-blue-600"> com os filtros aplicados</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Seletor de itens por página */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Itens por página:</label>
                  <select
                    value={itensPorPagina}
                    onChange={(e) => setItensPorPagina(Number(e.target.value))}
                    className="border border-slate-300 rounded px-2 py-1 text-sm bg-white/60 backdrop-blur-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                {/* Navegação de páginas */}
                {totalPaginas > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={paginaAnterior}
                      disabled={paginaAtual === 1}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      ← Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let pagina;
                        if (totalPaginas <= 5) {
                          pagina = i + 1;
                        } else if (paginaAtual <= 3) {
                          pagina = i + 1;
                        } else if (paginaAtual >= totalPaginas - 2) {
                          pagina = totalPaginas - 4 + i;
                        } else {
                          pagina = paginaAtual - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pagina}
                            variant={pagina === paginaAtual ? "default" : "ghost"}
                            size="sm"
                            onClick={() => irParaPagina(pagina)}
                            className={pagina === paginaAtual ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-800"}
                          >
                            {pagina}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={proximaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="text-slate-600 hover:text-slate-800"
                    >
                      Próxima →
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {prestadores.map((prestador) => {
                // Verificar se faltam valores monetários
                const faltamValores = !prestador.valor_acionamento || 
                                     !prestador.valor_hora_adc || 
                                     !prestador.valor_km_adc || 
                                     !prestador.franquia_km || 
                                     !prestador.franquia_horas;
                
                return (
                  <div key={prestador.id} className={`bg-gradient-to-br ${faltamValores ? 'from-amber-500/20 to-orange-500/20 border-amber-200/50' : 'from-emerald-500/20 to-green-500/20 border-emerald-200/50'} backdrop-blur-sm rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    {/* Indicador de valores faltantes */}
                    {faltamValores && (
                      <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Valores pendentes
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                              {prestador.cod_nome || '–'}
                            </div>
                            <span className="text-slate-500 text-sm font-medium">#{prestador.id}</span>
                          </div>
                          <p className="text-slate-900 text-lg font-bold mb-1">{prestador.nome}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {prestador.telefone || '–'}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {faltamValores ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                              <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                              Valores Pendentes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Configurado
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-700 font-semibold">Localização</span>
                          </div>
                          <p className="text-slate-900 font-bold truncate">
                            {[prestador.bairro, prestador.cidade, prestador.estado].filter(Boolean).join(', ') || '–'}
                          </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-indigo-600" />
                            <span className="text-slate-700 font-semibold">Funções</span>
                          </div>
                          <p className="text-slate-900 font-bold truncate">
                            {prestador.funcoes && prestador.funcoes.length > 0
                              ? prestador.funcoes.map((f: any) => {
                                  if (typeof f === 'string') return f;
                                  if (typeof f === 'object' && f !== null) {
                                    return f.nome || f.funcao || JSON.stringify(f);
                                  }
                                  return String(f);
                                }).join(', ')
                              : '–'}
                          </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-slate-700 font-semibold">Acionamento</span>
                          </div>
                          <p className="text-slate-900 font-bold">
                            {prestador.valor_acionamento ? formatarValorMonetario(Number(prestador.valor_acionamento)) : '–'}
                          </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="text-slate-700 font-semibold">Franquia</span>
                          </div>
                          <div className="text-xs text-slate-700 space-y-0.5">
                            <div>KM: {prestador.franquia_km || '–'}</div>
                            <div>Horas: {prestador.franquia_horas || '–'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditar(prestador)} 
                          className="flex items-center gap-2 p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                          <span>Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleExcluir(prestador.id)} 
                          className="flex items-center gap-2 p-2 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Excluir</span>
                        </Button>
                        {prestador.telefone && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`https://wa.me/55${prestador.telefone?.replace(/\D/g, '')}`, '_blank')} 
                            className="flex items-center gap-2 p-2 hover:bg-green-50 hover:text-green-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                          >
                            <Phone className="w-4 h-4 text-green-600" />
                            <span>WhatsApp</span>
                          </Button>
                        )}
                        {(prestador.bairro || prestador.cidade || prestador.estado) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([prestador.bairro, prestador.cidade, prestador.estado].filter(Boolean).join(', '))}`, '_blank')} 
                            className="flex items-center gap-2 p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                          >
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>Maps</span>
                          </Button>
                        )}
                      </div>
                      
                      {/* Seção de Status do Usuário */}
                      <div className="mt-4 pt-3 border-t border-slate-300/60">
                        {prestador.id && usuariosStatus[prestador.id] ? (
                          usuariosStatus[prestador.id].tem_usuario ? (
                            <div className="bg-green-100/95 backdrop-blur-sm p-3 rounded-lg border border-green-300/70">
                              <p className="text-green-900 font-bold text-xs mb-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                Usuário cadastrado no APP
                              </p>
                              <div className="text-xs text-green-800 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Email:</span>
                                  <span className="font-bold text-green-900">{usuariosStatus[prestador.id].usuario.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Status:</span>
                                  <span className="font-bold text-green-900">
                                    {usuariosStatus[prestador.id].usuario.ativo ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>
                                {usuariosStatus[prestador.id].usuario.primeiro_acesso && (
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">Primeiro acesso:</span>
                                    <span className="font-bold text-amber-600">Pendente</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : usuariosStatus[prestador.id].pode_gerar ? (
                            <div className="bg-amber-100/95 backdrop-blur-sm p-3 rounded-lg border border-amber-300/70">
                              <p className="text-amber-900 font-bold text-xs mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                Usuário não cadastrado no APP
                              </p>
                              <p className="text-xs text-amber-800 mb-3">
                                Este prestador pode ter um usuário gerado automaticamente para acessar o app.
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => gerarUsuarioPrestador(prestador.id!)}
                                disabled={gerandoUsuario === prestador.id}
                                className="flex items-center gap-2 p-2 hover:bg-amber-200 hover:text-amber-800 transition-colors rounded-lg text-xs bg-amber-200/50 backdrop-blur-sm border border-amber-300/70 w-full"
                              >
                                {gerandoUsuario === prestador.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Gerando usuário...</span>
                                  </>
                                ) : (
                                  <>
                                    <User className="w-4 h-4 text-amber-600" />
                                    <span>Gerar Usuário e Senha</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="bg-red-100/95 backdrop-blur-sm p-3 rounded-lg border border-red-300/70">
                              <p className="text-red-900 font-bold text-xs mb-2 flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-600" />
                                Não é possível gerar usuário
                              </p>
                              <p className="text-xs text-red-800">
                                Este prestador não possui email ou CPF cadastrado. É necessário editar o prestador para adicionar essas informações.
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="bg-slate-100/95 backdrop-blur-sm p-3 rounded-lg border border-slate-300/70">
                            <p className="text-slate-700 font-bold text-xs mb-2 flex items-center gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                              Verificando status do usuário...
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Seção de valores detalhados */}
                      <div className="mt-4 pt-3 border-t border-slate-300/60">
                        <div className="space-y-1 text-sm">
                          {faltamValores ? (
                            <div className="bg-amber-100/95 backdrop-blur-sm p-3 rounded-lg border border-amber-300/70">
                              <p className="text-amber-900 font-bold text-xs mb-2">⚠️ Valores monetários pendentes:</p>
                              <ul className="text-xs text-amber-800 space-y-1 font-medium">
                                {!prestador.valor_acionamento && <li>• Valor de acionamento</li>}
                                {!prestador.valor_hora_adc && <li>• Valor hora adicional</li>}
                                {!prestador.valor_km_adc && <li>• Valor KM adicional</li>}
                                {!prestador.franquia_km && <li>• Franquia KM</li>}
                                {!prestador.franquia_horas && <li>• Franquia horas</li>}
                              </ul>
                              <p className="text-xs text-amber-700 mt-2 font-bold">Clique em "Editar" para adicionar</p>
                            </div>
                          ) : (
                            <div className="bg-slate-50/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200/70">
                              <p className="text-slate-800 font-semibold text-xs mb-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                Valores configurados
                              </p>
                              <div className="text-xs text-slate-700 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Acionamento:</span>
                                  <span className="font-bold text-slate-900">{formatarValorMonetario(Number(prestador.valor_acionamento))}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Hora adicional:</span>
                                  <span className="font-bold text-slate-900">{formatarValorMonetario(Number(prestador.valor_hora_adc))}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">KM adicional:</span>
                                  <span className="font-bold text-slate-900">{formatarValorMonetario(Number(prestador.valor_km_adc))}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Franquia:</span>
                                  <span className="font-bold text-slate-900">{prestador.franquia_km}km / {prestador.franquia_horas}h</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PrestadorPopup
          open={popupAberto}
          onOpenChange={setPopupAberto}
          prestadorEdicao={prestadorSelecionado}
          onSave={async (prestador) => {
            try {
              // Garantir formato correto para o backend
              const payload = {
                ...prestador,
                funcoes: (prestador.funcoes || []).map(f => typeof f === 'string' ? { funcao: f } : f),
                regioes: (prestador.regioes || []).map(r => typeof r === 'string' ? { regiao: r } : r),
                veiculos: (prestador.tipo_veiculo || []).map(v => typeof v === 'string' ? { tipo: v } : v),
                tipo_veiculo: undefined // não enviar duplicado
              };
              if (prestador.id) {
                await api.put(`/api/v1/prestadores/${prestador.id}`, payload);
                toast.success('Prestador atualizado com sucesso!');
                dispararAtualizacaoMapa('atualizado');
                if (window.atualizarPrestadoresMapa) window.atualizarPrestadoresMapa();
              } else {
                await api.post('/api/v1/prestadores', payload);
                toast.success('Prestador cadastrado com sucesso!');
                dispararAtualizacaoMapa('criado');
                if (window.atualizarPrestadoresMapa) window.atualizarPrestadoresMapa();
              }
              setPopupAberto(false);
              buscarPrestadores();
            } catch (erro: any) {
              console.error('❌ Erro ao salvar prestador:', erro);
              toast.error(erro.response?.data?.message || 'Erro ao salvar prestador');
            }
          }}
        />
      </div>
    </div>
  );
};

export default CadastroPrestadores;
