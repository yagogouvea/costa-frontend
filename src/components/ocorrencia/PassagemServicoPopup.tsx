import api from '@/services/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DialogTitle } from '@/components/ui/dialog';
import { Ocorrencia } from '@/types/ocorrencia';
import { CopyCheck, Copy, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
}

const formatarData = (data: string | Date | null | undefined): string => {
  if (!data) return '-';
  // Criar uma nova data e ajustar para o fuso horário local
  const dataObj = new Date(data);
  // Adicionar o offset do fuso horário para garantir que a data seja correta
  const dataLocal = new Date(dataObj.getTime() + (dataObj.getTimezoneOffset() * 60000));
  return dataLocal.toLocaleDateString('pt-BR');
};

const formatarDataHora = (data: string | Date | null | undefined): string => {
  if (!data) return '-';
  return new Date(data).toLocaleString('pt-BR');
};

const normalizarEstado = (estado: string = ''): string => {
  const estadoNormalizado = estado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  const mapaEstados: Record<string, string> = {
    'ACRE': 'AC', 'AC': 'AC',
    'ALAGOAS': 'AL', 'AL': 'AL',
    'AMAPA': 'AP', 'AP': 'AP',
    'AMAZONAS': 'AM', 'AM': 'AM',
    'BAHIA': 'BA', 'BA': 'BA',
    'CEARA': 'CE', 'CE': 'CE',
    'DISTRITO FEDERAL': 'DF', 'DF': 'DF',
    'ESPIRITO SANTO': 'ES', 'ES': 'ES',
    'GOIAS': 'GO', 'GO': 'GO',
    'MARANHAO': 'MA', 'MA': 'MA',
    'MATO GROSSO': 'MT', 'MT': 'MT',
    'MATO GROSSO DO SUL': 'MS', 'MS': 'MS',
    'MINAS GERAIS': 'MG', 'MG': 'MG',
    'PARA': 'PA', 'PA': 'PA',
    'PARAIBA': 'PB', 'PB': 'PB',
    'PARANA': 'PR', 'PR': 'PR',
    'PERNAMBUCO': 'PE', 'PE': 'PE',
    'PIAUI': 'PI', 'PI': 'PI',
    'RIO DE JANEIRO': 'RJ', 'RJ': 'RJ',
    'RIO GRANDE DO NORTE': 'RN', 'RN': 'RN',
    'RIO GRANDE DO SUL': 'RS', 'RS': 'RS',
    'RONDONIA': 'RO', 'RO': 'RO',
    'RORAIMA': 'RR', 'RR': 'RR',
    'SANTA CATARINA': 'SC', 'SC': 'SC',
    'SAO PAULO': 'SP', 'SP': 'SP',
    'SERGIPE': 'SE', 'SE': 'SE',
    'TOCANTINS': 'TO', 'TO': 'TO'
  };

  return mapaEstados[estadoNormalizado] || estadoNormalizado;
};

const definirMacro = (estado?: string | null, cidade?: string | null): string => {
  const estadoUF = normalizarEstado(estado || '');
  const cidadeNome = (cidade || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  if (!estadoUF || estadoUF !== 'SP') return 'OUTROS ESTADOS';

  if (cidadeNome.includes('SAO PAULO')) return 'CAPITAL';

  const cidadesGrandeSP = [
    'SANTO ANDRE', 'SAO BERNARDO', 'SAO CAETANO', 'DIADEMA',
    'MAUA', 'GUARULHOS', 'OSASCO', 'TABOAO DA SERRA',
    'CARAPICUIBA', 'EMBU DAS ARTES', 'ITAPEVI', 'COTIA', 'BARUERI'
  ];

  if (cidadesGrandeSP.some(c => cidadeNome.includes(c))) {
    return 'GRANDE SP';
  }

  return 'INTERIOR';
};

const gerarTextoPassagem = (o: Ocorrencia, telefone?: string): string => {
  const despesas = o.despesas_detalhadas || [];
  const isIturan = (o.cliente || '').toLowerCase().includes('ituran');
  const isMarfrig = (o.cliente || '').toLowerCase().includes('marfrig');
  const isOpentech = (o.cliente || '').toLowerCase().includes('open tech') || (o.cliente || '').toLowerCase().includes('opentech');
  const isBrk = (o.cliente || '').toLowerCase().includes('brk');
  const isACL = (o.tipo || '').toUpperCase() === 'ACL';
  
  // Determinar status: se não tem resultado ou está vazio, é "Em andamento"
  const statusRecuperacao = o.resultado?.trim() || 'Em andamento';

  // Gerar texto das despesas dinamicamente
  const textoDespesas = despesas && Array.isArray(despesas) && despesas.length > 0 
    ? despesas.map((desp, index) => `• Despesa ${index + 1}: R$ ${desp.valor?.toFixed(2)} (${desp.tipo})`).join('\n')
    : '';

  // Bloco extra para Marfrig + ACL
  let blocoMarfrigACL = '';
  if (isMarfrig && isACL) {
    blocoMarfrigACL = [
      '',
      '🏁 *DESTINO E KM ACL*',
      `• *Cidade de destino:* ${o.cidade_destino || '-'}`,
      `• *KM ACL:* ${o.km_acl || '-'}`,
      ''
    ].join('\n');
  }

  // Função para formatar KM total com regra "Franquia"
  const formatarKmTotal = (km: any) => {
    if (km === null || km === undefined || km === '') return '-';
    const kmNumero = Number(km);
    if (isNaN(kmNumero)) return String(km);
    if (kmNumero === 0 || kmNumero <= 50) return 'Franquia';
    return `${kmNumero} KM`;
  };

  return `🚨 *PASSAGEM DE SERVIÇO* 🚨\n\n📆 *DATA:* ${formatarData(o.data_acionamento)}\n🏢 *CLIENTE:* ${(o.cliente || '-').toUpperCase()}\n${isBrk && o.conta ? `🏢 *CONTA:* ${o.conta.toUpperCase()}\n` : ''}${isOpentech && o.operacao ? `🏢 *OPERAÇÃO:* ${o.operacao.toUpperCase()}\n` : ''}👤 *OPERADOR:* ${(o.operador || '-').toUpperCase()}\n📊 *STATUS:* ${statusRecuperacao.toUpperCase()}\n\n🚗 *VEÍCULO*\n• *PLACA:* ${(o.placa1 || '-').toUpperCase()}\n• *TIPO:* ${(o.tipo || '-').toUpperCase()}\n${isIturan && o.os ? `• *OS:* ${(o.os || '').toUpperCase()}` : ''}\n• *MODELO:* ${(o.modelo1 || '-').toUpperCase()}\n• *COR:* ${(o.cor1 || '-').toUpperCase()}\n\n🕐 *HORÁRIOS*\n• *INÍCIO:* ${formatarDataHora(o.inicio)}\n• *CHEGADA:* ${formatarDataHora(o.chegada)}\n• *TÉRMINO:* ${formatarDataHora(o.termino)}\n\n👥 *APOIO*\n• *NOME:* ${(o.prestador || '-').toUpperCase()}\n• *TELEFONE:* ${(telefone || '-').toUpperCase()}\n\n🌍 *LOCALIZAÇÃO*\n• *MACRO:* ${definirMacro(o.estado, o.cidade).toUpperCase()}\n• *ORIGEM:* ${(o.origem_bairro || '-').toUpperCase()}, ${(o.origem_cidade || '-').toUpperCase()}, ${normalizarEstado(o.origem_estado || '') || '-'}\n• *DESTINO:* ${(o.bairro || '-').toUpperCase()}, ${(o.cidade || '-').toUpperCase()}, ${normalizarEstado(o.estado || '') || '-'}\n${blocoMarfrigACL}\n📏 *QUILOMETRAGEM*\n• *INICIAL:* ${o.km_inicial || '-'}\n• *FINAL:* ${o.km_final || '-'}\n• *TOTAL:* ${formatarKmTotal(o.km)}\n\n💸 *DESPESAS*\n${textoDespesas}`.trim();
};

const PassagemServicoPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [texto, setTexto] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      let telefone = '';
      let resultadoAtualizado = ocorrencia.resultado;

      try {
        // Buscar telefone do prestador apenas se necessário
        if (ocorrencia.prestador && !ocorrencia.prestador.includes('@')) {
          const res = await api.get(`/api/v1/prestadores/buscar-por-nome/${encodeURIComponent(ocorrencia.prestador)}`);
          telefone = res.data?.telefone || '';
        }

        // Buscar resultado atualizado apenas se não tiver resultado
        if (!ocorrencia.resultado || ocorrencia.resultado.trim() === '') {
          const resResultado = await api.get(`/api/ocorrencias/${ocorrencia.id}/resultado`);
          resultadoAtualizado = resResultado.data?.resultado || ocorrencia.resultado;
        }
      } catch (err) {
        // Silenciar erros para não poluir o console
        console.debug('Erro ao buscar dados adicionais:', err);
      }

      const ocorrenciaAtualizada = { ...ocorrencia, resultado: resultadoAtualizado };
      const textoGerado = gerarTextoPassagem(ocorrenciaAtualizada, telefone);
      setTexto(textoGerado);

      // Copiar automaticamente apenas se o texto foi gerado com sucesso
      if (textoGerado.trim()) {
        try {
          await navigator.clipboard.writeText(textoGerado);
          toast.success('Texto copiado automaticamente!');
        } catch (err) {
          console.debug('Falha ao copiar automaticamente:', err);
        }
      }
    };

    carregarDados();
  }, [ocorrencia]);

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      toast.success('Texto copiado para a área de transferência!');
      
      // Resetar o estado após 2 segundos
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('❌ Erro ao copiar texto:', err);
      toast.error('Erro ao copiar texto');
    }
  };

  const salvar = async () => {
    try {
      const { data } = await api.put(`/api/ocorrencias/${ocorrencia.id}`, {
        passagem_servico: texto,
        despesas_detalhadas: ocorrencia.despesas_detalhadas
      });
      onUpdate(data);
      onClose();
      toast.success('Passagem de serviço salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar passagem de serviço:', error);
      toast.error('Erro ao salvar passagem de serviço');
    }
  };

  const cancelar = () => {
    onClose();
  };

  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <DialogTitle className="text-xl font-semibold text-gray-900">
          📋 Passagem de Serviço
        </DialogTitle>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Área de texto responsiva */}
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={texto}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
            className="min-h-[400px] md:min-h-[500px] lg:min-h-[600px] text-sm md:text-base resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4"
            placeholder="Gerando passagem de serviço..."
          />
          
          {/* Botão de copiar flutuante */}
          <button
            onClick={copiarTexto}
            className="absolute top-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            title="Copiar texto"
          >
            {copiado ? (
              <CheckCircle size={18} className="text-green-300" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>

        {/* Informações da ocorrência */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Cliente:</span>
              <span className="ml-2 text-gray-900">{ocorrencia.cliente || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Placa:</span>
              <span className="ml-2 text-gray-900">{ocorrencia.placa1 || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tipo:</span>
              <span className="ml-2 text-gray-900">{ocorrencia.tipo || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-gray-900">{ocorrencia.resultado || 'Em andamento'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Prestador:</span>
              <span className="ml-2 text-gray-900">{ocorrencia.prestador || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Operador:</span>
              <span className="ml-2 text-gray-900">{ocorrencia.operador || '-'}</span>
            </div>
            {/* Campo Operação - Apenas para Opentech */}
            {((ocorrencia.cliente || '').toLowerCase().includes('open tech') || (ocorrencia.cliente || '').toLowerCase().includes('opentech')) && ocorrencia.operacao && (
              <div>
                <span className="font-medium text-gray-700">Operação:</span>
                <span className="ml-2 text-gray-900">{ocorrencia.operacao}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          onClick={copiarTexto}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          {copiado ? (
            <>
              <CheckCircle size={16} className="text-green-600" />
              Copiado!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copiar Texto
            </>
          )}
        </Button>
        
        <Button
          onClick={cancelar}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <X size={16} />
          Cancelar
        </Button>
        
        <Button
          onClick={salvar}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700"
        >
          <CopyCheck size={16} />
          Salvar Passagem
        </Button>
      </div>
    </div>
  );
};

export default PassagemServicoPopup;
