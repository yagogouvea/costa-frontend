import { useState, useEffect } from 'react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ocorrencia } from '../../types/ocorrencia';
import api from '@/services/api';
import { useMediaQuery } from 'react-responsive';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate?: (dados: Partial<Ocorrencia>) => void;
  onClose: () => void;
}

// 🔧 Converte para o formato que o input datetime-local espera, considerando o timezone local
const toInputLocal = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn('Data inválida recebida:', isoString);
      return '';
    }
    // Ajusta para o timezone local
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Erro ao converter data:', error, isoString);
    return '';
  }
};

// Converte data para formato dd/MM/yyyy
const toDateOnly = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return '';
  }
};

// Converte de dd/MM/yyyy para yyyy-MM-dd
const fromDateOnly = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
};

const HorariosPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  // Campos originais
  const [inicio, setInicio] = useState('');
  const [chegada, setChegada] = useState('');
  const [termino, setTermino] = useState('');
  
  // Campos removidos: tipoRemocao, enderecoLoja, nomeLoja, nomeGuincho, enderecoBase, detalhesLocal

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    // Campos originais
    setInicio(ocorrencia.inicio ? toInputLocal(ocorrencia.inicio) : '');
    setChegada(ocorrencia.chegada ? toInputLocal(ocorrencia.chegada) : '');
    setTermino(ocorrencia.termino ? toInputLocal(ocorrencia.termino) : '');
  }, [ocorrencia]);

  const salvar = async () => {
    try {
      const payload: any = {};
      
      // Campos de horários
      if (inicio) {
        const localDate = new Date(inicio);
        payload.inicio = localDate.toISOString();
      }
      if (chegada) {
        const localDate = new Date(chegada);
        payload.chegada = localDate.toISOString();
      }
      if (termino) {
        const localDate = new Date(termino);
        payload.termino = localDate.toISOString();
      }

      if (Object.keys(payload).length === 0) {
        alert('Preencha pelo menos um horário.');
        return;
      }

      console.log('🔍 Payload sendo enviado:', payload);
      
      const response = await api.put(`/api/ocorrencias/${ocorrencia.id}`, payload);
      console.log('✅ Resposta do servidor:', response.data);
      
      if (onUpdate) {
        onUpdate({ ...ocorrencia, ...payload });
      }
      
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao salvar horários:', error);
      
      let errorMessage = 'Erro ao salvar horários.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erro: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6 rounded-lg bg-white shadow-lg w-full max-w-2xl mx-auto my-auto border border-gray-200 max-h-[90vh] overflow-y-auto">
      <DialogTitle className="text-lg font-bold text-blue-700 text-center">Editar Horários</DialogTitle>
      <DialogDescription className="sr-only">
        Informe os horários e informações complementares da ocorrência.
      </DialogDescription>

      <div className="space-y-4 mt-4">
        {/* Seção: Horários */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Horários da Ocorrência</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Início da ocorrência</Label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-500"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div>
              <Label>Chegada ao Local</Label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-500"
                value={chegada}
                onChange={(e) => setChegada(e.target.value)}
              />
            </div>
            <div>
              <Label>Término</Label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-500"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="destructive" onClick={onClose}>Cancelar</Button>
        <Button onClick={salvar}>Salvar</Button>
      </div>
    </div>
  );
};

export default HorariosPopup;