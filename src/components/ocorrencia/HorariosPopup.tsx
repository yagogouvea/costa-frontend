import { useState, useEffect } from 'react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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



const formatDateTimeForText = (value: string) => {
  if (!value) return '';
  // yyyy-MM-ddTHH:mm => dd/MM/yyyy HH:mm
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(',', '');
};

// Função para normalizar datas digitadas manualmente (aceita vários formatos)
function normalizeDateTimeInput(input: string): string {
  if (!input) return '';
  // Remove espaços extras
  input = input.trim();

  // Tenta dd/mm/yyyy hh:mm ou dd/mm/yy hh:mm
  let match = input.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[ T]?(\d{0,2})[:h]?(\d{0,2})?/);
  if (match) {
    let [_, d, m, y, h, min] = match;
    if (y.length === 2) y = '20' + y;
    if (!h) h = '00';
    if (!min) min = '00';
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${min.padStart(2, '0')}`;
  }
  // Tenta ddmmyyyy hhmm
  match = input.match(/(\d{2})(\d{2})(\d{4})[ T]?(\d{2})?(\d{2})?/);
  if (match) {
    let [_, d, m, y, h, min] = match;
    if (!h) h = '00';
    if (!min) min = '00';
    return `${y}-${m}-${d}T${h}:${min}`;
  }
  // Tenta yyyy-mm-ddThh:mm
  match = input.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (match) {
    return match[0];
  }
  // Tenta só hora/minuto
  match = input.match(/(\d{2}):(\d{2})/);
  if (match) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${match[1]}:${match[2]}`;
  }
  return '';
}

const HorariosPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [inicio, setInicio] = useState('');
  const [chegada, setChegada] = useState('');
  const [termino, setTermino] = useState('');
  const [inicioTexto, setInicioTexto] = useState('');
  const [chegadaTexto, setChegadaTexto] = useState('');
  const [terminoTexto, setTerminoTexto] = useState('');
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setInicio(ocorrencia.inicio ? toInputLocal(ocorrencia.inicio) : '');
    setChegada(ocorrencia.chegada ? toInputLocal(ocorrencia.chegada) : '');
    setTermino(ocorrencia.termino ? toInputLocal(ocorrencia.termino) : '');
    setInicioTexto(ocorrencia.inicio ? formatDateTimeForText(toInputLocal(ocorrencia.inicio)) : '');
    setChegadaTexto(ocorrencia.chegada ? formatDateTimeForText(toInputLocal(ocorrencia.chegada)) : '');
    setTerminoTexto(ocorrencia.termino ? formatDateTimeForText(toInputLocal(ocorrencia.termino)) : '');
  }, [ocorrencia]);

  // Sincronizar campos texto e nativo
  useEffect(() => {
    setInicioTexto(formatDateTimeForText(inicio));
  }, [inicio]);
  useEffect(() => {
    setChegadaTexto(formatDateTimeForText(chegada));
  }, [chegada]);
  useEffect(() => {
    setTerminoTexto(formatDateTimeForText(termino));
  }, [termino]);

  const salvar = async () => {
    try {
      const payload: any = {};
      // Antes de salvar, normaliza os campos texto se estiver no mobile
      if (isMobile) {
        if (inicioTexto) {
          const norm = normalizeDateTimeInput(inicioTexto);
          if (norm) setInicio(norm);
        }
        if (chegadaTexto) {
          const norm = normalizeDateTimeInput(chegadaTexto);
          if (norm) setChegada(norm);
        }
        if (terminoTexto) {
          const norm = normalizeDateTimeInput(terminoTexto);
          if (norm) setTermino(norm);
        }
      }
      if (inicio) {
        // Converte do timezone local para UTC
        const localDate = new Date(inicio);
        payload.inicio = localDate.toISOString();
      }
      if (chegada) {
        // Converte do timezone local para UTC
        const localDate = new Date(chegada);
        payload.chegada = localDate.toISOString();
      }
      if (termino) {
        // Converte do timezone local para UTC
        const localDate = new Date(termino);
        payload.termino = localDate.toISOString();
      }

      if (Object.keys(payload).length === 0) {
        alert('Preencha pelo menos um horário.');
        return;
      }

      console.log('🔍 Payload sendo enviado:', payload);
      console.log('🔍 URL da requisição:', `/api/ocorrencias/${ocorrencia.id}`);
      console.log('🔍 API URL base:', api.defaults.baseURL);
      
      const response = await api.put(`/api/ocorrencias/${ocorrencia.id}`, payload);
      console.log('✅ Resposta do servidor:', response.data);
      
      if (onUpdate) {
        onUpdate({ ...ocorrencia, ...payload });
      }
      
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao salvar horários:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
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
    <div className="p-6 rounded-lg bg-white shadow-lg w-full max-w-sm mx-auto my-auto border border-gray-200">
      <DialogTitle className="text-lg font-bold text-blue-700 text-center">Editar Horários</DialogTitle>
      <DialogDescription className="sr-only">
        Informe os horários de início, local e término da ocorrência.
      </DialogDescription>

      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Início</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-500"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Local</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-500"
            value={chegada}
            onChange={(e) => setChegada(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Término</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-blue-500"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
          />
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
