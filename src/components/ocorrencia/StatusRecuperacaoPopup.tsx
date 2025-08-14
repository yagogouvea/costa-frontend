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
}

const StatusRecuperacaoPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [status, setStatus] = useState<'Recuperado' | 'Não Recuperado' | 'Cancelado'>(
    (ocorrencia.resultado as any) || 'Recuperado'
  );
  const [loading, setLoading] = useState(false);

  // Função para mapear resultado para status
  const getStatusFromResultado = (resultado: string): string => {
    switch (resultado) {
      case 'Recuperado':
        return 'concluida';
      case 'Não Recuperado':
        return 'aguardando';
      case 'Cancelado':
        return 'cancelada';
      default:
        return 'concluida';
    }
  };

  const salvarStatus = async () => {
    setLoading(true);
    try {
      // Mapear o resultado para o status correto
      const statusMapeado = getStatusFromResultado(status);
      
      console.log('🔄 Salvando status de recuperação:', {
        ocorrenciaId: ocorrencia.id,
        resultado: status,
        statusMapeado: statusMapeado
      });

      const resposta = await api.put(`/api/ocorrencias/${ocorrencia.id}`, {
        resultado: status,
        status: statusMapeado // Usar o status mapeado em vez de sempre 'concluida'
      });

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

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Status de Recuperação</DialogTitle>
      </DialogHeader>

      <RadioGroup value={status} onValueChange={value => setStatus(value as any)}>
        {['Recuperado', 'Não Recuperado', 'Cancelado'].map(opcao => (
          <div key={opcao} className="flex items-center space-x-2">
            <RadioGroupItem value={opcao} id={opcao} />
            <Label htmlFor={opcao}>{opcao}</Label>
          </div>
        ))}
      </RadioGroup>

      {/* Informação sobre o mapeamento */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p><strong>Como será salvo:</strong></p>
        <p>• Recuperado → Status: "Concluída" (aparece como "Recuperada")</p>
        <p>• Não Recuperado → Status: "Aguardando" (aparece como "Não Recuperada")</p>
        <p>• Cancelado → Status: "Cancelada" (aparece como "Cancelada")</p>
      </div>

     <DialogFooter className="pt-4">
      <Button variant="destructive" onClick={onClose}>
        Cancelar
      </Button>
      <Button onClick={salvarStatus} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </DialogFooter>

    </div>
  );
};

export default StatusRecuperacaoPopup;
