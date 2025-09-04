import { useState, useEffect } from 'react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ocorrencia } from '../../types/ocorrencia';
import { CheckList, CreateCheckListDTO } from '../../types/checklist';
import api from '@/services/api';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate?: (dados: any) => void;
  onClose: () => void;
}

const CheckListPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [checklistExistente, setChecklistExistente] = useState<CheckList | null>(null);
  const [dispensarChecklist, setDispensarChecklist] = useState<boolean>(false);

  // Removido: destinoVeiculo - agora é título do popup

  // Tipo de destino (radio button - seleção única)
  const [tipoDestino, setTipoDestino] = useState(''); // 'loja', 'guincho', 'apreensao'
  
  // Loja
  const [nomeLoja, setNomeLoja] = useState('');
  const [enderecoLoja, setEnderecoLoja] = useState('');
  const [nomeAtendente, setNomeAtendente] = useState('');
  const [matriculaAtendente, setMatriculaAtendente] = useState('');

  // Guincho
  const [tipoGuincho, setTipoGuincho] = useState('');
  const [valorGuincho, setValorGuincho] = useState('');
  const [telefoneGuincho, setTelefoneGuincho] = useState('');
  const [nomeEmpresaGuincho, setNomeEmpresaGuincho] = useState('');
  const [nomeMotoristaGuincho, setNomeMotoristaGuincho] = useState('');
  const [destinoGuincho, setDestinoGuincho] = useState('');
  const [enderecoDestinoGuincho, setEnderecoDestinoGuincho] = useState('');

  // Apreensão
  const [nomeDpBatalhao, setNomeDpBatalhao] = useState('');
  const [enderecoApreensao, setEnderecoApreensao] = useState('');
  const [numeroBoNoc, setNumeroBoNoc] = useState('');

  // Recuperado com chave
  const [recuperadoComChave, setRecuperadoComChave] = useState('');

  // Posse do veículo
  const [posseVeiculo, setPosseVeiculo] = useState('');
  const [observacaoPosse, setObservacaoPosse] = useState('');

  // Avarias
  const [avarias, setAvarias] = useState('');
  const [detalhesAvarias, setDetalhesAvarias] = useState('');

  // Fotos
  const [fotosRealizadas, setFotosRealizadas] = useState('');
  const [justificativaFotos, setJustificativaFotos] = useState('');

  // Observação geral
  const [observacaoOcorrencia, setObservacaoOcorrencia] = useState('');

  // ✅ VALIDAÇÕES: Estados para controlar erros de campos obrigatórios
  const [erros, setErros] = useState<Record<string, string>>({});

  // ✅ PROTEÇÃO: Congelar TODA a ocorrência no início para evitar mudanças
  // Isso garante que o ID da ocorrência não seja alterado durante o processo
  const [ocorrenciaFixa] = useState(ocorrencia);
  const ocorrenciaIdFixo = ocorrenciaFixa.id;

  useEffect(() => {
    console.log('🎯 CHECKLIST - Popup aberto para ocorrência fixa:', { id: ocorrenciaFixa.id, placa1: ocorrenciaFixa.placa1 });
    console.log('🔒 CHECKLIST - ID da ocorrência protegido/fixo:', ocorrenciaIdFixo);
    carregarChecklistComId(ocorrenciaIdFixo);
  }, [ocorrenciaIdFixo]);

  // Sincronizar estado local do toggle quando carregar/alterar o checklist existente
  useEffect(() => {
    if (checklistExistente) {
      setDispensarChecklist(!!checklistExistente.dispensado_checklist);
    }
  }, [checklistExistente]);

  // Log para monitorar mudanças de estado
  useEffect(() => {
    if (nomeLoja || enderecoLoja || nomeAtendente) {
      console.log('🔄 Estados atualizados:', {
        tipoDestino,
        nomeLoja,
        enderecoLoja,
        nomeAtendente,
        matriculaAtendente
      });
    }
  }, [tipoDestino, nomeLoja, enderecoLoja, nomeAtendente, matriculaAtendente]);

  const carregarChecklistComId = async (idFixo: number) => {
    try {
      const response = await api.get(`/api/v1/checklist/ocorrencia/${idFixo}`);
      console.log(`📋 CheckList ID ${idFixo}:`, response.data ? 'ENCONTRADO' : 'NÃO EXISTE');
      if (response.data) {
        const checklist = response.data;
        setChecklistExistente(checklist);
        
        // Carregar dados existentes
        // Removido: setDestinoVeiculo - agora é título
        
        // Determinar tipo de destino baseado nos dados existentes
        console.log('🎯 Determinando tipo de destino:', {
          loja_selecionada: checklist.loja_selecionada,
          guincho_selecionado: checklist.guincho_selecionado,
          apreensao_selecionada: checklist.apreensao_selecionada
        });
        
        if (checklist.loja_selecionada) {
          console.log('✅ Definindo tipo: loja');
          setTipoDestino('loja');
        } else if (checklist.guincho_selecionado) {
          console.log('✅ Definindo tipo: guincho');
          setTipoDestino('guincho');
        } else if (checklist.apreensao_selecionada) {
          console.log('✅ Definindo tipo: apreensao');
          setTipoDestino('apreensao');
        }
        
        // Loja
        console.log('🏪 Carregando dados da loja:', {
          nome_loja: checklist.nome_loja,
          endereco_loja: checklist.endereco_loja,
          nome_atendente: checklist.nome_atendente,
          matricula_atendente: checklist.matricula_atendente
        });
        setNomeLoja(checklist.nome_loja || '');
        setEnderecoLoja(checklist.endereco_loja || '');
        setNomeAtendente(checklist.nome_atendente || '');
        setMatriculaAtendente(checklist.matricula_atendente || '');
        
        // Guincho
        setTipoGuincho(checklist.tipo_guincho || '');
        setValorGuincho(checklist.valor_guincho || '');
        setTelefoneGuincho(checklist.telefone_guincho || '');
        setNomeEmpresaGuincho(checklist.nome_empresa_guincho || '');
        setNomeMotoristaGuincho(checklist.nome_motorista_guincho || '');
        setDestinoGuincho(checklist.destino_guincho || '');
        setEnderecoDestinoGuincho(checklist.endereco_destino_guincho || '');
        
        // Apreensão
        setNomeDpBatalhao(checklist.nome_dp_batalhao || '');
        setEnderecoApreensao(checklist.endereco_apreensao || '');
        setNumeroBoNoc(checklist.numero_bo_noc || '');
        
        // Outros campos
        setRecuperadoComChave(checklist.recuperado_com_chave || '');
        setPosseVeiculo(checklist.posse_veiculo || '');
        setObservacaoPosse(checklist.observacao_posse || '');
        setAvarias(checklist.avarias || '');
        setDetalhesAvarias(checklist.detalhes_avarias || '');
        setFotosRealizadas(checklist.fotos_realizadas || '');
        setJustificativaFotos(checklist.justificativa_fotos || '');
        setObservacaoOcorrencia(checklist.observacao_ocorrencia || '');
      }
    } catch (error) {
      console.log('❌ Erro ao carregar checklist:', error);
      console.log('📝 Checklist não encontrado, será criado um novo');
    }
  };

  // ✅ FUNÇÃO DE VALIDAÇÃO: Verifica campos obrigatórios baseado na opção selecionada
  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    // 1. VALIDAÇÃO OBRIGATÓRIA: Deve selecionar uma das três opções
    if (!tipoDestino) {
      novosErros.tipoDestino = 'Selecione uma das opções: Loja, Guincho ou Apreensão';
    }
    
    // 2. VALIDAÇÕES ESPECÍFICAS POR TIPO SELECIONADO
    if (tipoDestino === 'loja') {
      if (!nomeLoja.trim()) novosErros.nomeLoja = 'Nome da loja é obrigatório';
      if (!enderecoLoja.trim()) novosErros.enderecoLoja = 'Endereço da loja é obrigatório';
      if (!nomeAtendente.trim()) novosErros.nomeAtendente = 'Nome do atendente é obrigatório';
      if (!matriculaAtendente.trim()) novosErros.matriculaAtendente = 'Matrícula do atendente é obrigatória';
    }
    
    if (tipoDestino === 'guincho') {
      if (!tipoGuincho) novosErros.tipoGuincho = 'Tipo de guincho é obrigatório';
      if (!nomeEmpresaGuincho.trim()) novosErros.nomeEmpresaGuincho = 'Nome da empresa é obrigatório';
      if (!nomeMotoristaGuincho.trim()) novosErros.nomeMotoristaGuincho = 'Nome do motorista é obrigatório';
      if (!destinoGuincho) novosErros.destinoGuincho = 'Destino é obrigatório';
      
      // Campos condicionais para guincho particular
      if (tipoGuincho === 'particular') {
        if (!valorGuincho.trim()) novosErros.valorGuincho = 'Valor é obrigatório para guincho particular';
        if (!telefoneGuincho.trim()) novosErros.telefoneGuincho = 'Telefone é obrigatório para guincho particular';
      }
      
      // Endereço obrigatório se destino for "outro endereço"
      if (destinoGuincho === 'outro_endereco' && !enderecoDestinoGuincho.trim()) {
        novosErros.enderecoDestinoGuincho = 'Endereço é obrigatório quando destino é "outro endereço"';
      }
    }
    
    if (tipoDestino === 'apreensao') {
      if (!nomeDpBatalhao.trim()) novosErros.nomeDpBatalhao = 'Nome do DP/Batalhão é obrigatório';
      if (!enderecoApreensao.trim()) novosErros.enderecoApreensao = 'Endereço é obrigatório';
      if (!numeroBoNoc.trim()) novosErros.numeroBoNoc = 'Número do B.O/NOC é obrigatório';
    }
    
    // 3. VALIDAÇÕES PADRÃO (obrigatórias para todas as opções)
    if (!recuperadoComChave) novosErros.recuperadoComChave = 'Recuperado com chave é obrigatório';
    if (!posseVeiculo) novosErros.posseVeiculo = 'Posse do veículo é obrigatória';
    if (!avarias) novosErros.avarias = 'Avarias é obrigatório';
    if (!fotosRealizadas) novosErros.fotosRealizadas = 'Fotos realizadas é obrigatório';
    
    // 4. VALIDAÇÕES CONDICIONAIS
    if (avarias === 'sim' && !detalhesAvarias.trim()) {
      novosErros.detalhesAvarias = 'Detalhes das avarias são obrigatórios quando há avarias';
    }
    
    if (fotosRealizadas === 'nao' && !justificativaFotos.trim()) {
      novosErros.justificativaFotos = 'Justificativa é obrigatória quando fotos não foram realizadas';
    }
    
    if (posseVeiculo === 'terceiros' && !observacaoPosse.trim()) {
      novosErros.observacaoPosse = 'Observação da abordagem é obrigatória';
    }
    
    // Atualizar estado de erros
    setErros(novosErros);
    
    // Retorna true se não há erros
    return Object.keys(novosErros).length === 0;
  };

  // ✅ FUNÇÃO PARA LIMPAR ERROS: Remove mensagens de erro quando usuário começa a digitar
  const limparErro = (campo: string) => {
    if (erros[campo]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
    }
  };

  const salvar = async () => {
    // ✅ VALIDAR FORMULÁRIO ANTES DE SALVAR
    if (!dispensarChecklist && !validarFormulario()) {
      console.log('❌ Formulário com erros de validação:', erros);
      return; // Não prossegue se há erros
    }
    
    try {
      setLoading(true);
      
      console.log(`💾 Salvando CheckList na ocorrência ID ${ocorrenciaIdFixo}`);
      
      const payload: CreateCheckListDTO = {
        ocorrencia_id: ocorrenciaIdFixo, // Usar ID fixo, não o mutável
        dispensado_checklist: dispensarChecklist,
        
        // Loja
        loja_selecionada: dispensarChecklist ? false : (tipoDestino === 'loja'),
        nome_loja: (tipoDestino === 'loja') ? nomeLoja || undefined : undefined,
        endereco_loja: (tipoDestino === 'loja') ? enderecoLoja || undefined : undefined,
        nome_atendente: (tipoDestino === 'loja') ? nomeAtendente || undefined : undefined,
        matricula_atendente: (tipoDestino === 'loja') ? matriculaAtendente || undefined : undefined,
        
        // Guincho
        guincho_selecionado: dispensarChecklist ? false : (tipoDestino === 'guincho'),
        tipo_guincho: (tipoDestino === 'guincho') ? tipoGuincho || undefined : undefined,
        valor_guincho: (tipoDestino === 'guincho' && tipoGuincho === 'particular') ? valorGuincho || undefined : undefined,
        telefone_guincho: (tipoDestino === 'guincho' && tipoGuincho === 'particular') ? telefoneGuincho || undefined : undefined,
        nome_empresa_guincho: (tipoDestino === 'guincho') ? nomeEmpresaGuincho || undefined : undefined,
        nome_motorista_guincho: (tipoDestino === 'guincho') ? nomeMotoristaGuincho || undefined : undefined,
        destino_guincho: (tipoDestino === 'guincho') ? destinoGuincho || undefined : undefined,
        endereco_destino_guincho: (tipoDestino === 'guincho') ? enderecoDestinoGuincho || undefined : undefined,
        
        // Apreensão
        apreensao_selecionada: dispensarChecklist ? false : (tipoDestino === 'apreensao'),
        nome_dp_batalhao: (tipoDestino === 'apreensao') ? nomeDpBatalhao || undefined : undefined,
        endereco_apreensao: (tipoDestino === 'apreensao') ? enderecoApreensao || undefined : undefined,
        numero_bo_noc: (tipoDestino === 'apreensao') ? numeroBoNoc || undefined : undefined,
        
        // Outros campos
        recuperado_com_chave: recuperadoComChave || undefined,
        posse_veiculo: posseVeiculo || undefined,
        observacao_posse: observacaoPosse,
        avarias: avarias || undefined,
        detalhes_avarias: (avarias === 'sim') ? detalhesAvarias : undefined,
        fotos_realizadas: fotosRealizadas || undefined,
        justificativa_fotos: (fotosRealizadas === 'nao') ? justificativaFotos : undefined,
        observacao_ocorrencia: observacaoOcorrencia
      };

      console.log('🔍 Payload checklist:', payload);

      let response;
      if (checklistExistente) {
        console.log('🔄 Atualizando checklist existente:', checklistExistente.id);
        response = await api.put(`/api/v1/checklist/${checklistExistente.id}`, payload);
      } else {
        console.log('➕ Criando novo checklist');
        response = await api.post('/api/v1/checklist', payload);
      }

      console.log('✅ Checklist salvo:', response.data);
      
      // Atualizar o estado local para refletir que agora existe um checklist
      setChecklistExistente(response.data);
      
      // ✅ SINALIZAR AO CHAMADOR QUE O CHECKLIST FOI ATUALIZADO
      // Envia apenas uma flag para evitar sobrescrita de dados da ocorrência
      if (onUpdate) {
        onUpdate({ checklist: true });
      }
      
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao salvar checklist:', error);
      
      let errorMessage = 'Erro ao salvar checklist.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg bg-white shadow-lg w-full max-w-4xl mx-auto my-auto border border-gray-200 max-h-[90vh] overflow-y-auto">
      <DialogTitle className="text-lg font-bold text-blue-700 text-center">
        Check-list - ID: {ocorrenciaFixa.id} | Placa: {ocorrenciaFixa.placa1}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Preencha o checklist com as informações da ocorrência.
      </DialogDescription>

      <div className="space-y-6 mt-4">
        {/* Seleção do Tipo de Destino */}
        <div className="border-b pb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Selecione o tipo de destino: <span className="text-red-500">*</span>
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="loja_radio"
                name="tipo_destino"
                value="loja"
                checked={tipoDestino === 'loja'}
                onChange={(e) => {
                  if (dispensarChecklist) return;
                  setTipoDestino(e.target.value);
                  limparErro('tipoDestino');
                }}
                className="text-blue-600"
              />
              <Label htmlFor="loja_radio" className="font-semibold">Loja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="guincho_radio"
                name="tipo_destino"
                value="guincho"
                checked={tipoDestino === 'guincho'}
                onChange={(e) => {
                  if (dispensarChecklist) return;
                  setTipoDestino(e.target.value);
                  limparErro('tipoDestino');
                }}
                className="text-blue-600"
              />
              <Label htmlFor="guincho_radio" className="font-semibold">Guincho</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="apreensao_radio"
                name="tipo_destino"
                value="apreensao"
                checked={tipoDestino === 'apreensao'}
                onChange={(e) => {
                  if (dispensarChecklist) return;
                  setTipoDestino(e.target.value);
                  limparErro('tipoDestino');
                }}
                className="text-blue-600"
              />
              <Label htmlFor="apreensao_radio" className="font-semibold">Apreensão</Label>
            </div>
          </div>
          {/* ✅ MENSAGEM DE ERRO PARA TIPO DE DESTINO */}
          {erros.tipoDestino && (
            <p className="text-red-500 text-sm mt-2">{erros.tipoDestino}</p>
          )}
        </div>

        {/* Dispensar Checklist */}
        <div className="border-b pb-4">
          <div
            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer select-none ${dispensarChecklist ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50 border border-gray-200'}`}
            onClick={() => setDispensarChecklist((v) => !v)}
          >
            <input
              type="checkbox"
              id="dispensar_checklist"
              checked={dispensarChecklist}
              onChange={(e) => setDispensarChecklist(e.target.checked)}
              className="mt-0.5 h-5 w-5 text-yellow-600 cursor-pointer"
            />
            <div>
              <Label htmlFor="dispensar_checklist" className="font-semibold text-gray-800 cursor-pointer">
                Dispensar Checklist
              </Label>
              <p className="text-sm mt-1 ${dispensarChecklist ? 'text-yellow-800' : 'text-gray-600'}">
                {dispensarChecklist ? 'Checklist DISPENSADO para esta ocorrência.' : 'Marque esta opção quando não for necessário preencher o checklist completo.'}
              </p>
            </div>
          </div>
        </div>

        {/* Seções Condicionais */}
        {dispensarChecklist && (
          <div className="mt-3 mb-2 p-3 bg-yellow-50 border border-yellow-300 rounded text-yellow-900 text-sm">
            Campos do checklist bloqueados porque a opção "Dispensar Checklist" está ativa.
          </div>
        )}
        <div className={`space-y-6 ${dispensarChecklist ? 'pointer-events-none opacity-60' : ''}`}>
          {/* Loja */}
          {tipoDestino === 'loja' && (
            <div className="border p-4 rounded-lg bg-blue-50">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Informações da Loja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Nome da loja <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o nome da loja"
                    value={nomeLoja}
                    onChange={(e) => {
                      setNomeLoja(e.target.value);
                      limparErro('nomeLoja');
                    }}
                    className={erros.nomeLoja ? 'border-red-500' : ''}
                  />
                  {erros.nomeLoja && (
                    <p className="text-red-500 text-sm mt-1">{erros.nomeLoja}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Endereço da loja <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o endereço da loja"
                    value={enderecoLoja}
                    onChange={(e) => {
                      setEnderecoLoja(e.target.value);
                      limparErro('enderecoLoja');
                    }}
                    className={erros.enderecoLoja ? 'border-red-500' : ''}
                  />
                  {erros.enderecoLoja && (
                    <p className="text-red-500 text-sm mt-1">{erros.enderecoLoja}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Nome do atendente/Colaborador <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o nome do atendente"
                    value={nomeAtendente}
                    onChange={(e) => {
                      setNomeAtendente(e.target.value);
                      limparErro('nomeAtendente');
                    }}
                    className={erros.nomeAtendente ? 'border-red-500' : ''}
                  />
                  {erros.nomeAtendente && (
                    <p className="text-red-500 text-sm mt-1">{erros.nomeAtendente}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Matrícula do atendente/Colaborador <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite a matrícula"
                    value={matriculaAtendente}
                    onChange={(e) => {
                      setMatriculaAtendente(e.target.value);
                      limparErro('matriculaAtendente');
                    }}
                    className={erros.matriculaAtendente ? 'border-red-500' : ''}
                  />
                  {erros.matriculaAtendente && (
                    <p className="text-red-500 text-sm mt-1">{erros.matriculaAtendente}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guincho */}
          {tipoDestino === 'guincho' && (
            <div className="border p-4 rounded-lg bg-green-50">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Informações do Guincho</h3>
              <div className="space-y-4">
                <div>
                  <Label>
                    Tipo de guincho <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="particular"
                        name="tipo_guincho"
                        value="particular"
                        checked={tipoGuincho === 'particular'}
                        onChange={(e) => {
                          setTipoGuincho(e.target.value);
                          limparErro('tipoGuincho');
                        }}
                      />
                      <Label htmlFor="particular">Particular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="credenciado"
                        name="tipo_guincho"
                        value="credenciado"
                        checked={tipoGuincho === 'credenciado'}
                        onChange={(e) => {
                          setTipoGuincho(e.target.value);
                          limparErro('tipoGuincho');
                        }}
                      />
                      <Label htmlFor="credenciado">Credenciado</Label>
                    </div>
                  </div>
                  {erros.tipoGuincho && (
                    <p className="text-red-500 text-sm mt-1">{erros.tipoGuincho}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tipoGuincho === 'particular' && (
                    <>
                      <div>
                        <Label>
                          Valor do guincho <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="Digite o valor"
                          value={valorGuincho}
                          onChange={(e) => {
                            setValorGuincho(e.target.value);
                            limparErro('valorGuincho');
                          }}
                          className={erros.valorGuincho ? 'border-red-500' : ''}
                        />
                        {erros.valorGuincho && (
                          <p className="text-red-500 text-sm mt-1">{erros.valorGuincho}</p>
                        )}
                      </div>
                      <div>
                        <Label>
                          Telefone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="Digite o telefone"
                          value={telefoneGuincho}
                          onChange={(e) => {
                            setTelefoneGuincho(e.target.value);
                            limparErro('telefoneGuincho');
                          }}
                          className={erros.telefoneGuincho ? 'border-red-500' : ''}
                        />
                        {erros.telefoneGuincho && (
                          <p className="text-red-500 text-sm mt-1">{erros.telefoneGuincho}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div>
                    <Label>
                      Nome da empresa de guincho <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Digite o nome da empresa"
                      value={nomeEmpresaGuincho}
                      onChange={(e) => {
                        setNomeEmpresaGuincho(e.target.value);
                        limparErro('nomeEmpresaGuincho');
                      }}
                      className={erros.nomeEmpresaGuincho ? 'border-red-500' : ''}
                    />
                    {erros.nomeEmpresaGuincho && (
                      <p className="text-red-500 text-sm mt-1">{erros.nomeEmpresaGuincho}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Nome do motorista/guincho <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Digite o nome do motorista"
                      value={nomeMotoristaGuincho}
                      onChange={(e) => {
                        setNomeMotoristaGuincho(e.target.value);
                        limparErro('nomeMotoristaGuincho');
                      }}
                      className={erros.nomeMotoristaGuincho ? 'border-red-500' : ''}
                    />
                    {erros.nomeMotoristaGuincho && (
                      <p className="text-red-500 text-sm mt-1">{erros.nomeMotoristaGuincho}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>
                    Destino <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="base_guincho"
                        name="destino_guincho"
                        value="base_guincho"
                        checked={destinoGuincho === 'base_guincho'}
                        onChange={(e) => {
                          setDestinoGuincho(e.target.value);
                          limparErro('destinoGuincho');
                        }}
                      />
                      <Label htmlFor="base_guincho">Base do guincho</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="outro_endereco"
                        name="destino_guincho"
                        value="outro_endereco"
                        checked={destinoGuincho === 'outro_endereco'}
                        onChange={(e) => {
                          setDestinoGuincho(e.target.value);
                          limparErro('destinoGuincho');
                        }}
                      />
                      <Label htmlFor="outro_endereco">Outro endereço</Label>
                    </div>
                  </div>
                  {erros.destinoGuincho && (
                    <p className="text-red-500 text-sm mt-1">{erros.destinoGuincho}</p>
                  )}
                  
                  {destinoGuincho && (
                    <div className="mt-2">
                      <Label>
                        Endereço {destinoGuincho === 'outro_endereco' && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        type="text"
                        placeholder="Digite o endereço"
                        value={enderecoDestinoGuincho}
                        onChange={(e) => {
                          setEnderecoDestinoGuincho(e.target.value);
                          limparErro('enderecoDestinoGuincho');
                        }}
                        className={erros.enderecoDestinoGuincho ? 'border-red-500' : ''}
                      />
                      {erros.enderecoDestinoGuincho && (
                        <p className="text-red-500 text-sm mt-1">{erros.enderecoDestinoGuincho}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Apreensão */}
          {tipoDestino === 'apreensao' && (
            <div className="border p-4 rounded-lg bg-red-50">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Informações da Apreensão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Nome do DP/Batalhão/Pátio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o nome"
                    value={nomeDpBatalhao}
                    onChange={(e) => {
                      setNomeDpBatalhao(e.target.value);
                      limparErro('nomeDpBatalhao');
                    }}
                    className={erros.nomeDpBatalhao ? 'border-red-500' : ''}
                  />
                  {erros.nomeDpBatalhao && (
                    <p className="text-red-500 text-sm mt-1">{erros.nomeDpBatalhao}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Endereço <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o endereço"
                    value={enderecoApreensao}
                    onChange={(e) => {
                      setEnderecoApreensao(e.target.value);
                      limparErro('enderecoApreensao');
                    }}
                    className={erros.enderecoApreensao ? 'border-red-500' : ''}
                  />
                  {erros.enderecoApreensao && (
                    <p className="text-red-500 text-sm mt-1">{erros.enderecoApreensao}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Número do B.O/NOC/Token/Talão <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Digite o número"
                    value={numeroBoNoc}
                    onChange={(e) => {
                      setNumeroBoNoc(e.target.value);
                      limparErro('numeroBoNoc');
                    }}
                    className={erros.numeroBoNoc ? 'border-red-500' : ''}
                  />
                  {erros.numeroBoNoc && (
                    <p className="text-red-500 text-sm mt-1">{erros.numeroBoNoc}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção: Informações Gerais */}
        <div className={`space-y-4 border-t pt-4 ${dispensarChecklist ? 'pointer-events-none opacity-60' : ''}`}>
          <h3 className="text-md font-semibold text-gray-800">Informações Gerais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recuperado com chave */}
            <div>
              <Label>
                Recuperado com chave <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="chave_sim"
                    name="recuperado_chave"
                    value="sim"
                    checked={recuperadoComChave === 'sim'}
                    onChange={(e) => {
                      setRecuperadoComChave(e.target.value);
                      limparErro('recuperadoComChave');
                    }}
                  />
                  <Label htmlFor="chave_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="chave_nao"
                    name="recuperado_chave"
                    value="nao"
                    checked={recuperadoComChave === 'nao'}
                    onChange={(e) => {
                      setRecuperadoComChave(e.target.value);
                      limparErro('recuperadoComChave');
                    }}
                  />
                  <Label htmlFor="chave_nao">Não</Label>
                </div>
              </div>
              {erros.recuperadoComChave && (
                <p className="text-red-500 text-sm mt-1">{erros.recuperadoComChave}</p>
              )}
            </div>

            {/* Avarias */}
            <div>
              <Label>
                Avarias <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="avarias_sim"
                    name="avarias"
                    value="sim"
                    checked={avarias === 'sim'}
                    onChange={(e) => {
                      setAvarias(e.target.value);
                      limparErro('avarias');
                    }}
                  />
                  <Label htmlFor="avarias_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="avarias_nao"
                    name="avarias"
                    value="nao"
                    checked={avarias === 'nao'}
                    onChange={(e) => {
                      setAvarias(e.target.value);
                      limparErro('avarias');
                    }}
                  />
                  <Label htmlFor="avarias_nao">Não</Label>
                </div>
              </div>
              {erros.avarias && (
                <p className="text-red-500 text-sm mt-1">{erros.avarias}</p>
              )}
              
              {avarias === 'sim' && (
                <div className="mt-2">
                  <Label>
                    Detalhes das avarias <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Descreva as avarias encontradas"
                    value={detalhesAvarias}
                    onChange={(e) => {
                      setDetalhesAvarias(e.target.value);
                      limparErro('detalhesAvarias');
                    }}
                    className={erros.detalhesAvarias ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {erros.detalhesAvarias && (
                    <p className="text-red-500 text-sm mt-1">{erros.detalhesAvarias}</p>
                  )}
                </div>
              )}
            </div>

            {/* Fotos realizadas */}
            <div>
              <Label>
                Realizado fotos internas e externas <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fotos_sim"
                    name="fotos_realizadas"
                    value="sim"
                    checked={fotosRealizadas === 'sim'}
                    onChange={(e) => {
                      setFotosRealizadas(e.target.value);
                      limparErro('fotosRealizadas');
                    }}
                  />
                  <Label htmlFor="fotos_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fotos_nao"
                    name="fotos_realizadas"
                    value="nao"
                    checked={fotosRealizadas === 'nao'}
                    onChange={(e) => {
                      setFotosRealizadas(e.target.value);
                      limparErro('fotosRealizadas');
                    }}
                  />
                  <Label htmlFor="fotos_nao">Não</Label>
                </div>
              </div>
              {erros.fotosRealizadas && (
                <p className="text-red-500 text-sm mt-1">{erros.fotosRealizadas}</p>
              )}
              
              {fotosRealizadas === 'nao' && (
                <div className="mt-2">
                  <Label>
                    Justificativa <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Justifique por que as fotos não foram realizadas"
                    value={justificativaFotos}
                    onChange={(e) => {
                      setJustificativaFotos(e.target.value);
                      limparErro('justificativaFotos');
                    }}
                    className={erros.justificativaFotos ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {erros.justificativaFotos && (
                    <p className="text-red-500 text-sm mt-1">{erros.justificativaFotos}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Posse do veículo */}
          <div>
            <Label>
              Posse do veículo no momento da abordagem <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                { value: 'locatario_proprietario', label: 'Locatário/Proprietário' },
                { value: 'terceiros', label: 'Terceiros' },
                { value: 'policiamento', label: 'Policiamento' },
                { value: 'abandonado_via', label: 'Abandonado em via' },
                { value: 'local_fechado', label: 'Local fechado sem contato' }
              ].map((opcao) => (
                <div key={opcao.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={opcao.value}
                    name="posse_veiculo"
                    value={opcao.value}
                    checked={posseVeiculo === opcao.value}
                    onChange={(e) => {
                      if (dispensarChecklist) return;
                      setPosseVeiculo(e.target.value);
                      limparErro('posseVeiculo');
                    }}
                  />
                  <Label htmlFor={opcao.value} className="text-sm">{opcao.label}</Label>
                </div>
              ))}
            </div>
            {erros.posseVeiculo && (
              <p className="text-red-500 text-sm mt-1">{erros.posseVeiculo}</p>
            )}
            
            {posseVeiculo === 'terceiros' && (
              <div className="mt-3">
                <Label>
                  Observação da abordagem <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Adicione observações sobre a posse do veículo"
                  value={observacaoPosse}
                  onChange={(e) => {
                    if (dispensarChecklist) return;
                    setObservacaoPosse(e.target.value);
                    limparErro('observacaoPosse');
                  }}
                  className={erros.observacaoPosse ? 'border-red-500' : ''}
                  rows={2}
                />
                {erros.observacaoPosse && (
                  <p className="text-red-500 text-sm mt-1">{erros.observacaoPosse}</p>
                )}
              </div>
            )}
          </div>

          {/* Observação da ocorrência */}
          <div>
            <Label>Observação da ocorrência</Label>
            <Textarea
              placeholder="Adicione observações gerais sobre a ocorrência"
              value={observacaoOcorrencia}
              onChange={(e) => {
                if (dispensarChecklist) return;
                setObservacaoOcorrencia(e.target.value);
              }}
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="destructive" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

export default CheckListPopup;
