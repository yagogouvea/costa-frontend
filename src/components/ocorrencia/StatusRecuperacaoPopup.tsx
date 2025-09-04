import React, { useState } from 'react';
import {
  DialogHeader,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Ocorrencia } from '@/types/ocorrencia';
import api from '@/services/api';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
  restritoCancelar?: boolean;
  pendencias?: string[];
}

const StatusRecuperacaoPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose, restritoCancelar, pendencias = [] }) => {
  const [resultado, setResultado] = useState<string>(
    restritoCancelar ? 'CANCELADO' : (ocorrencia.resultado || 'RECUPERADO')
  );
  const [subResultado, setSubResultado] = useState<string | undefined>(
    ocorrencia.sub_resultado
  );
  const [loading, setLoading] = useState(false);

  // Função para mapear resultado para status
  const getStatusFromResultado = (resultado: string): string => {
    switch (resultado) {
      case 'RECUPERADO':
        return 'concluida';
      case 'NAO_RECUPERADO':
        return 'aguardando';
      case 'CANCELADO':
        return 'cancelada';
      case 'LOCALIZADO':
        return 'concluida';
      default:
        return 'concluida';
    }
  };

  const salvarStatus = async () => {
    setLoading(true);
    try {
      // Mapear o resultado para o status correto
      const statusMapeado = getStatusFromResultado(resultado);
      
      console.log('🔄 Salvando status de recuperação:', {
        ocorrenciaId: ocorrencia.id,
        resultado: resultado,
        sub_resultado: subResultado,
        statusMapeado: statusMapeado
      });

      const dadosAtualizacao: any = {
        resultado: resultado,
        status: statusMapeado
      };

      // Adicionar sub_resultado apenas se for RECUPERADO
      if (resultado === 'RECUPERADO' && subResultado) {
        dadosAtualizacao.sub_resultado = subResultado;
      } else {
        dadosAtualizacao.sub_resultado = null;
      }

      const resposta = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, dadosAtualizacao);

      const dados = resposta.data;
      console.log('✅ Resultado salvo com sucesso:', dados);
      console.log('📊 Status atualizado para:', statusMapeado);

      onUpdate(dados);
      onClose();
    } catch (erro) {
      console.error('❌ Erro ao salvar resultado:', erro);
      alert('Erro ao salvar resultado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const opcoesResultado = [
    { value: 'RECUPERADO', label: 'Recuperado' },
    { value: 'NAO_RECUPERADO', label: 'Não Recuperado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'LOCALIZADO', label: 'Localizado (simples verificação)' }
  ];

  const opcoesSubResultado = [
    { value: 'COM_RASTREIO', label: 'Com Rastreio' },
    { value: 'SEM_RASTREIO', label: 'Sem Rastreio' },
    { value: 'SEM_RASTREIO_COM_CONSULTA_APOIO', label: 'Sem Rastreio e com Consulta do Apoio' }
  ];

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Status de Recuperação</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label className="text-xs sm:text-sm font-medium">Resultado:</Label>
          <RadioGroup value={resultado} onValueChange={value => {
            setResultado(value);
            // Limpar sub_resultado se não for RECUPERADO
            if (value !== 'RECUPERADO') {
              setSubResultado(undefined);
            }
          }}>
            {opcoesResultado.map(opcao => (
              <div key={opcao.value} className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value={opcao.value} id={opcao.value} disabled={!!restritoCancelar && opcao.value !== 'CANCELADO'} />
                <Label htmlFor={opcao.value}>{opcao.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {resultado === 'RECUPERADO' && !restritoCancelar && (
          <div>
            <Label className="text-xs sm:text-sm font-medium">Tipo de Recuperação:</Label>
            <RadioGroup value={subResultado || ''} onValueChange={value => setSubResultado(value)}>
              {opcoesSubResultado.map(opcao => (
                <div key={opcao.value} className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value={opcao.value} id={opcao.value} />
                  <Label htmlFor={opcao.value}>{opcao.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>

      {/* Informação sobre o mapeamento */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p><strong>Como será salvo:</strong></p>
        <p>• Recuperado → Status: "Concluída" (aparece como "Recuperada")</p>
        <p>• Não Recuperado → Status: "Aguardando" (aparece como "Não Recuperada")</p>
        <p>• Cancelado → Status: "Cancelada" (aparece como "Cancelada")</p>
        <p>• Localizado → Status: "Concluída" (aparece como "Localizada")</p>
        {restritoCancelar && (
          <p className="mt-2 text-red-600">Somente a opção "Cancelado" está disponível até preencher os campos obrigatórios.</p>
        )}
        {!restritoCancelar && resultado !== 'CANCELADO' && pendencias.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            <p className="font-semibold text-xs">Preencha antes de finalizar:</p>
            <ul className="list-disc ml-4 text-xs">
              {pendencias.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

     <DialogFooter className="pt-4">
      <Button variant="destructive" onClick={onClose}>
        Cancelar
      </Button>
      <Button onClick={salvarStatus} disabled={
        loading ||
        (resultado === 'RECUPERADO' && !subResultado) ||
        (!!restritoCancelar && resultado !== 'CANCELADO') ||
        (!restritoCancelar && resultado !== 'CANCELADO' && pendencias.length > 0)
      }>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </DialogFooter>

    </div>
  );
};

export default StatusRecuperacaoPopup;
