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

const gerarTextoPassagem = async (o: Ocorrencia): Promise<string> => {
  const despesas = o.despesas_detalhadas || [];
  const isIturan = (o.cliente || '').toLowerCase().includes('ituran');
  const isMarfrig = (o.cliente || '').toLowerCase().includes('marfrig');
  const isOpentech = (o.cliente || '').toLowerCase().includes('open tech') || (o.cliente || '').toLowerCase().includes('opentech');
  const isBrk = (o.cliente || '').toLowerCase().includes('brk');
  const isSimplesVerificacao = (o.tipo || '').toLowerCase() === 'simples verificação';
  
  // Determinar status com informações detalhadas
  let statusRecuperacao = 'Em andamento';
  
  if (o.resultado?.trim()) {
    switch (o.resultado.toUpperCase()) {
      case 'RECUPERADO':
        if (o.sub_resultado) {
          // Mapear sub_resultado para texto legível
          const subResultadoMap: Record<string, string> = {
            'COM_RASTREIO': 'Com Rastreio',
            'SEM_RASTREIO': 'Sem Rastreio',
            'SEM_RASTREIO_COM_CONSULTA_APOIO': 'Sem Rastreio e com Consulta do Apoio'
          };
          const submotivo = subResultadoMap[o.sub_resultado] || o.sub_resultado;
          statusRecuperacao = `Recuperado (${submotivo})`;
        } else {
          statusRecuperacao = 'Recuperado';
        }
        break;
      case 'NAO_RECUPERADO':
        statusRecuperacao = 'Não Recuperado';
        break;
      case 'CANCELADO':
        statusRecuperacao = 'Cancelado';
        break;
      case 'LOCALIZADO':
        statusRecuperacao = 'Localizado (simples verificação)';
        break;
      default:
        statusRecuperacao = o.resultado;
    }
  }

  // Gerar texto das despesas dinamicamente
  const textoDespesas = despesas && Array.isArray(despesas) && despesas.length > 0 
    ? despesas.map((desp, index) => `• Despesa ${index + 1}: R$ ${desp.valor?.toFixed(2)} (${desp.tipo})`).join('\n')
    : '';

  // Bloco extra para Marfrig + Simples Verificação
  let blocoMarfrigSimplesVerificacao = '';
  if (isMarfrig && isSimplesVerificacao) {
    blocoMarfrigSimplesVerificacao = [
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

  // ✅ BUSCAR INFORMAÇÕES DO CHECKLIST
  let checklistInfo = '';
  try {
    const checklistResponse = await api.get(`/api/v1/checklist/ocorrencia/${o.id}`);
    if (checklistResponse.data) {
      const checklist = checklistResponse.data;
      const checklistSections = [];

      // Seção LOJA
      if (checklist.loja_selecionada) {
        const lojaInfo = [
          '🏪 *LOJA*'
        ];
        if (checklist.nome_loja) lojaInfo.push(`• *NOME:* ${checklist.nome_loja.toUpperCase()}`);
        if (checklist.endereco_loja) lojaInfo.push(`• *ENDEREÇO:* ${checklist.endereco_loja.toUpperCase()}`);
        if (checklist.nome_atendente) lojaInfo.push(`• *ATENDENTE:* ${checklist.nome_atendente.toUpperCase()}`);
        if (checklist.matricula_atendente) lojaInfo.push(`• *MATRÍCULA:* ${checklist.matricula_atendente.toUpperCase()}`);
        checklistSections.push(lojaInfo.join('\n'));
      }

      // Seção GUINCHO
      if (checklist.guincho_selecionado) {
        const guinchoInfo = [
          '🚛 *GUINCHO*'
        ];
        if (checklist.tipo_guincho) guinchoInfo.push(`• *TIPO:* ${checklist.tipo_guincho.toUpperCase()}`);
        if (checklist.nome_empresa_guincho) guinchoInfo.push(`• *EMPRESA:* ${checklist.nome_empresa_guincho.toUpperCase()}`);
        if (checklist.nome_motorista_guincho) guinchoInfo.push(`• *MOTORISTA:* ${checklist.nome_motorista_guincho.toUpperCase()}`);
        if (checklist.valor_guincho) guinchoInfo.push(`• *VALOR:* R$ ${checklist.valor_guincho}`);
        if (checklist.telefone_guincho) guinchoInfo.push(`• *TELEFONE:* ${checklist.telefone_guincho}`);
        if (checklist.destino_guincho === 'base_guincho') guinchoInfo.push(`• *DESTINO:* BASE DO GUINCHO`);
        else if (checklist.destino_guincho === 'outro_endereco') guinchoInfo.push(`• *DESTINO:* OUTRO ENDEREÇO`);
        if (checklist.endereco_destino_guincho) guinchoInfo.push(`• *ENDEREÇO DESTINO:* ${checklist.endereco_destino_guincho.toUpperCase()}`);
        checklistSections.push(guinchoInfo.join('\n'));
      }

      // Seção APREENSÃO
      if (checklist.apreensao_selecionada) {
        const apreensaoInfo = [
          '🚨 *APREENSÃO*'
        ];
        if (checklist.nome_dp_batalhao) apreensaoInfo.push(`• *DP/BATALHÃO:* ${checklist.nome_dp_batalhao.toUpperCase()}`);
        if (checklist.endereco_apreensao) apreensaoInfo.push(`• *ENDEREÇO:* ${checklist.endereco_apreensao.toUpperCase()}`);
        if (checklist.numero_bo_noc) apreensaoInfo.push(`• *B.O/NOC:* ${checklist.numero_bo_noc.toUpperCase()}`);
        checklistSections.push(apreensaoInfo.join('\n'));
      }

      // Seção INFORMAÇÕES GERAIS
      const infoGerais = [];
      if (checklist.recuperado_com_chave) {
        infoGerais.push(`• *RECUPERADO COM CHAVE:* ${checklist.recuperado_com_chave.toUpperCase()}`);
      }
      if (checklist.posse_veiculo) {
        const posseMap: Record<string, string> = {
          'locatario_proprietario': 'LOCATÁRIO/PROPRIETÁRIO',
          'terceiros': 'TERCEIROS',
          'policiamento': 'POLICIAMENTO',
          'abandonado_via': 'ABANDONADO EM VIA',
          'local_fechado': 'LOCAL FECHADO SEM CONTATO'
        };
        infoGerais.push(`• *POSSE DO VEÍCULO:* ${posseMap[checklist.posse_veiculo] || checklist.posse_veiculo.toUpperCase()}`);
      }
      // ✅ NOVA LÓGICA: Observação da posse só aparece quando "Terceiros" é selecionado
      if (checklist.posse_veiculo === 'terceiros' && checklist.observacao_posse) {
        infoGerais.push(`• *OBSERVAÇÃO POSSE:* ${checklist.observacao_posse.toUpperCase()}`);
      }
      if (checklist.avarias) {
        infoGerais.push(`• *AVARIAS:* ${checklist.avarias.toUpperCase()}`);
        if (checklist.avarias === 'sim' && checklist.detalhes_avarias) {
          infoGerais.push(`• *DETALHES AVARIAS:* ${checklist.detalhes_avarias.toUpperCase()}`);
        }
      }
      if (checklist.fotos_realizadas) {
        infoGerais.push(`• *FOTOS REALIZADAS:* ${checklist.fotos_realizadas.toUpperCase()}`);
        if (checklist.fotos_realizadas === 'nao' && checklist.justificativa_fotos) {
          infoGerais.push(`• *JUSTIFICATIVA FOTOS:* ${checklist.justificativa_fotos.toUpperCase()}`);
        }
      }
      if (checklist.observacao_ocorrencia) {
        infoGerais.push(`• *OBSERVAÇÃO:* ${checklist.observacao_ocorrencia.toUpperCase()}`);
      }

      if (infoGerais.length > 0) {
        checklistSections.push(`📋 *INFORMAÇÕES GERAIS*\n${infoGerais.join('\n')}`);
      }

      // ✅ NOVA LÓGICA: Adicionar informação sobre checklist dispensado
      if (checklist.dispensado_checklist) {
        checklistSections.push('📋 *CHECKLIST DISPENSADO*\n• *STATUS:* Checklist foi dispensado para esta ocorrência');
      }
      
      if (checklistSections.length > 0) {
        checklistInfo = '\n\n' + checklistSections.join('\n\n');
      }
    }
  } catch (error) {
    console.debug('Checklist não encontrado ou erro ao buscar:', error);
  }

  // ✅ CONSTRUIR SEÇÃO VEÍCULO COM CAMPOS CONDICIONAIS
  const veiculoInfo = [
    `• *PLACA:* ${(o.placa1 || '-').toUpperCase()}`
  ];

  // Adicionar OS apenas para ITURAN
  if (isIturan && o.os) {
    veiculoInfo.push(`• *OS:* ${(o.os || '').toUpperCase()}`);
  }

  // Adicionar MODELO apenas se preenchido
  if (o.modelo1 && o.modelo1.trim() !== '' && o.modelo1 !== '-') {
    veiculoInfo.push(`• *MODELO:* ${o.modelo1.toUpperCase()}`);
  }

  // Adicionar COR apenas se preenchida
  if (o.cor1 && o.cor1.trim() !== '' && o.cor1 !== '-') {
    veiculoInfo.push(`• *COR:* ${o.cor1.toUpperCase()}`);
  }

  // ✅ CONSTRUIR ENDEREÇO COMPLETO PARA LOCAL DA ABORDAGEM
  const construirEnderecoCompleto = (endereco?: string | null, bairro?: string | null, cidade?: string | null, estado?: string | null): string => {
    const partes = [];
    if (endereco && endereco.trim() !== '' && endereco !== '-') partes.push(endereco.toUpperCase());
    if (bairro && bairro.trim() !== '' && bairro !== '-') partes.push(bairro.toUpperCase());
    if (cidade && cidade.trim() !== '' && cidade !== '-') partes.push(cidade.toUpperCase());
    if (estado && estado.trim() !== '' && estado !== '-') partes.push(normalizarEstado(estado));
    
    return partes.length > 0 ? partes.join(', ') : '-';
  };

  const enderecoCompleto = construirEnderecoCompleto(o.endereco, o.bairro, o.cidade, o.estado);

  // ✅ ADICIONAR INFORMAÇÕES DO POPUP DESCRIÇÃO
  let resumoAbordagem = '';
  if (o.descricao && o.descricao.trim() !== '' && o.descricao !== '-') {
    resumoAbordagem = `\n\n📝 *RESUMO ABORDAGEM/DEVOLUÇÃO*\n${o.descricao.toUpperCase()}`;
  }

  // ✅ ADICIONAR APOIOS ADICIONAIS
  let apoiosAdicionais = '';
  try {
    const resApoios = await api.get(`/api/v1/apoios-adicionais/${o.id}`);
    const apoios = resApoios.data || [];
    
    if (apoios.length > 0) {
      const apoiosFormatados = apoios.map((apoio: any, index: number) => {
        const ordem = index + 2; // Começa do 2º apoio
        const ordinais = ['', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º'];
        const titulo = ordinais[ordem] || `${ordem}º`;
        
        let apoioTexto = `\n\n👥 *${titulo} APOIO*\n• *NOME:* ${apoio.nome_prestador.toUpperCase()}`;
        
        // Seção de Horários
        if (apoio.hora_inicial || apoio.hora_inicial_local || apoio.hora_final) {
          apoioTexto += `\n\n🕐 *HORÁRIOS*`;
          
          if (apoio.hora_inicial) {
            const horaInicial = new Date(apoio.hora_inicial).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            apoioTexto += `\n• *INICIAL:* ${horaInicial}`;
          }
          
          if (apoio.hora_inicial_local) {
            const horaLocal = new Date(apoio.hora_inicial_local).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            apoioTexto += `\n• *LOCAL:* ${horaLocal}`;
          } else {
            apoioTexto += `\n• *LOCAL:* Não informado`;
          }
          
          if (apoio.hora_final) {
            const horaFinal = new Date(apoio.hora_final).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            apoioTexto += `\n• *TÉRMINO:* ${horaFinal}`;
          }
        }
        
        // Seção de Quilometragem
        if (apoio.km_inicial !== null && apoio.km_inicial !== undefined && 
            apoio.km_final !== null && apoio.km_final !== undefined) {
          const kmTotal = (apoio.km_final - apoio.km_inicial).toFixed(1);
          
          apoioTexto += `\n\n📏 *QUILOMETRAGEM*`;
          apoioTexto += `\n• *KM INICIAL:* ${apoio.km_inicial}`;
          apoioTexto += `\n• *KM FINAL:* ${apoio.km_final}`;
          
          if (apoio.franquia_km) {
            apoioTexto += `\n• *TOTAL:* Franquia`;
          } else {
            apoioTexto += `\n• *TOTAL:* ${kmTotal} km`;
          }
        }
        
        if (apoio.observacoes) {
          apoioTexto += `\n• *OBSERVAÇÕES:* ${apoio.observacoes.toUpperCase()}`;
        }
        
        return apoioTexto;
      });
      
      apoiosAdicionais = apoiosFormatados.join('');
    }
  } catch (error) {
    console.debug('Apoios adicionais não encontrados ou erro ao buscar:', error);
  }

  return `🚨 *PASSAGEM DE SERVIÇO* 🚨

📆 *DATA:* ${formatarData(o.data_acionamento)}
🏢 *CLIENTE:* ${(o.cliente || '-').toUpperCase()}${o.sub_cliente && o.sub_cliente.trim() !== '' && o.sub_cliente !== '-' ? `\n🏢 *SUBCLIENTE:* ${o.sub_cliente.toUpperCase()}` : ''}${isBrk && o.conta ? `\n🏢 *CONTA:* ${o.conta.toUpperCase()}` : ''}${isOpentech && o.operacao ? `\n🏢 *OPERAÇÃO:* ${o.operacao.toUpperCase()}` : ''}
📋 *MOTIVO DA OCORRÊNCIA:* ${(o.tipo || '-').toUpperCase()}
📊 *STATUS:* ${statusRecuperacao.toUpperCase()}
👤 *OPERADOR:* ${(o.operador || '-').toUpperCase()}

🚗 *VEÍCULO*
${veiculoInfo.join('\n')}

🕐 *HORÁRIOS*
• *INÍCIO DO CHAMADO:* ${formatarDataHora(o.inicio)}
• *CHEGADA AO LOCAL:* ${formatarDataHora(o.chegada)}
• *HORA DA FINALIZAÇÃO:* ${formatarDataHora(o.termino)}

👥 *APOIO*
• *NOME:* ${(o.prestador || '-').toUpperCase()}

🌍 *LOCALIZAÇÃO*
• *MACRO:* ${definirMacro(o.estado, o.cidade).toUpperCase()}
• *LOCAL DA ABORDAGEM:* ${enderecoCompleto}${checklistInfo}${blocoMarfrigSimplesVerificacao}

📏 *QUILOMETRAGEM*
• *INICIAL:* ${o.km_inicial || '-'}
• *FINAL:* ${o.km_final || '-'}
• *TOTAL:* ${formatarKmTotal(o.km)}

💸 *DESPESAS*
${textoDespesas}${resumoAbordagem}${apoiosAdicionais}`.trim();
};

const PassagemServicoPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [texto, setTexto] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      let resultadoAtualizado = ocorrencia.resultado;

      try {
        // Buscar resultado atualizado apenas se não tiver resultado
        if (!ocorrencia.resultado || ocorrencia.resultado.trim() === '') {
          const resResultado = await api.get(`/api/v1/ocorrencias/${ocorrencia.id}/resultado`);
          resultadoAtualizado = resResultado.data?.resultado || ocorrencia.resultado;
        }
      } catch (err) {
        // Silenciar erros para não poluir o console
        console.debug('Erro ao buscar dados adicionais:', err);
      }

      const ocorrenciaAtualizada = { ...ocorrencia, resultado: resultadoAtualizado };
      
      // ✅ AGUARDAR A FUNÇÃO ASYNC
      const textoGerado = await gerarTextoPassagem(ocorrenciaAtualizada);
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
              const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, {
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
