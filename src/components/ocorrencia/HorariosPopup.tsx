import { useState, useEffect, useRef } from 'react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ocorrencia } from '../../types/ocorrencia';
import api from '@/services/api';
// import { useMediaQuery } from 'react-responsive';

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

// Converte data para formato dd/MM/yyyy (não utilizada)
// const toDateOnly = (isoString: string): string => {
//   if (!isoString) return '';
//   try {
//     const date = new Date(isoString);
//     if (isNaN(date.getTime())) return '';
//     return date.toLocaleDateString('pt-BR');
//   } catch (error) {
//     return '';
//   }
// };

// Converte de dd/MM/yyyy para yyyy-MM-dd (não utilizada)
// const fromDateOnly = (dateStr: string): string => {
//   if (!dateStr) return '';
//   const parts = dateStr.split('/');
//   if (parts.length === 3) {
//     return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
//   }
//   return dateStr;
// };

const HorariosPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  // Campos originais
  const [inicio, setInicio] = useState('');
  const [chegada, setChegada] = useState('');
  const [termino, setTermino] = useState('');
  
  // Campos removidos: tipoRemocao, enderecoLoja, nomeLoja, nomeGuincho, enderecoBase, detalhesLocal

  // const isMobile = useMediaQuery({ maxWidth: 767 });
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  // Estados auxiliares para mobile (entrada texto com máscara dd/MM/aaaa HH:mm)
  const [inicioBR, setInicioBR] = useState('');
  const [chegadaBR, setChegadaBR] = useState('');
  const [terminoBR, setTerminoBR] = useState('');
  // Refs para abrir picker nativo quando desejar
  const inicioRef = useRef<HTMLInputElement | null>(null);
  const chegadaRef = useRef<HTMLInputElement | null>(null);
  const terminoRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Campos originais
    setInicio(ocorrencia.inicio ? toInputLocal(ocorrencia.inicio) : '');
    setChegada(ocorrencia.chegada ? toInputLocal(ocorrencia.chegada) : '');
    setTermino(ocorrencia.termino ? toInputLocal(ocorrencia.termino) : '');
    // Popular campos BR também
    const toBR = (iso?: string | null) => {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = String(d.getFullYear());
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
      } catch {
        return '';
      }
    };
    setInicioBR(toBR(ocorrencia.inicio || null));
    setChegadaBR(toBR(ocorrencia.chegada || null));
    setTerminoBR(toBR(ocorrencia.termino || null));
  }, [ocorrencia]);

  // Formata sequência de dígitos em yyyy-MM-ddTHH:mm de forma progressiva
  const formatDigitsToDateTimeLocal = (digits: string): string => {
    const d = digits.replace(/\D/g, '').slice(0, 12); // YYYY MM DD HH mm
    const y = d.slice(0, 4);
    const m = d.slice(4, 6);
    const day = d.slice(6, 8);
    const hh = d.slice(8, 10);
    const mi = d.slice(10, 12);
    let out = '';
    if (y) out += y;
    if (m) out += `-${m}`;
    if (day) out += `-${day}`;
    if (hh) out += `T${hh}`;
    if (mi) out += `:${mi}`;
    return out;
  };

  // Handler genérico para autoformatação no mobile
  const handleDateTimeInput = (next: string, setFn: (v: string) => void) => {
    if (isMobile) {
      const onlyDigits = next.replace(/\D/g, '');
      if (onlyDigits.length > 0 && onlyDigits.length <= 12) {
        setFn(formatDigitsToDateTimeLocal(onlyDigits));
        return;
      }
    }
    setFn(next);
  };

  // Máscara BR dd/MM/aaaa HH:mm
  const maskBR = (value: string): string => {
    const d = value.replace(/\D/g, '').slice(0, 12); // dd MM yyyy HH mm
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2,4)}`;
    if (d.length <= 8) return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)}`;
    if (d.length <= 10) return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)} ${d.slice(8,10)}`;
    return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)} ${d.slice(8,10)}:${d.slice(10,12)}`;
  };

  const parseBRToISO = (br: string): string | null => {
    const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!m) return null;
    const dd = m[1], mm = m[2], yyyy = m[3], hh = m[4], mi = m[5];
    const isoLike = `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;
    const date = new Date(isoLike);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const salvar = async () => {
    try {
      const payload: any = {};
      
      // Campos de horários: no mobile priorizar texto BR se válido
      if (isMobile) {
        const i = parseBRToISO(inicioBR) || (inicio ? new Date(inicio).toISOString() : null);
        const c = parseBRToISO(chegadaBR) || (chegada ? new Date(chegada).toISOString() : null);
        const f = parseBRToISO(terminoBR) || (termino ? new Date(termino).toISOString() : null);
        if (i) payload.inicio = i;
        if (c) payload.chegada = c;
        if (f) payload.termino = f;
      } else {
        if (inicio) payload.inicio = new Date(inicio).toISOString();
        if (chegada) payload.chegada = new Date(chegada).toISOString();
        if (termino) payload.termino = new Date(termino).toISOString();
      }

      if (Object.keys(payload).length === 0) {
        alert('Preencha pelo menos um horário.');
        return;
      }

      console.log('🔍 Payload sendo enviado:', payload);
      
      const response = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, payload);
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
    <div className="p-3 sm:p-6 rounded-lg bg-white shadow-lg w-full md:max-w-xl lg:max-w-lg xl:max-w-[720px] mx-auto my-auto border border-gray-200 max-min-h-[80vh] max-h-[95vh] overflow-y-auto">
      <DialogTitle className="text-base sm:text-lg font-bold text-blue-700 text-center md:text-left">Editar Horários</DialogTitle>
      <DialogDescription className="sr-only">
        Informe os horários e informações complementares da ocorrência.
      </DialogDescription>

      <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
        {/* Seção: Horários */}
        <div>
          <h3 className="text-sm md:text-md font-semibold text-gray-800 mb-2 md:mb-3">Horários da Ocorrência</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <div>
              <Label>Início da ocorrência</Label>
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded text-sm"
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa hh:mm"
                    value={inicioBR}
                    onChange={(e) => setInicioBR(maskBR(e.target.value))}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => inicioRef.current?.showPicker?.()} title="Calendário">📅</Button>
                  <input ref={inicioRef} type="datetime-local" className="hidden" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </div>
              ) : (
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2 md:p-2 rounded focus:ring focus:ring-blue-500 text-sm"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Chegada ao Local</Label>
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded text-sm"
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa hh:mm"
                    value={chegadaBR}
                    onChange={(e) => setChegadaBR(maskBR(e.target.value))}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => chegadaRef.current?.showPicker?.()} title="Calendário">📅</Button>
                  <input ref={chegadaRef} type="datetime-local" className="hidden" value={chegada} onChange={(e) => setChegada(e.target.value)} />
                </div>
              ) : (
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2 md:p-2 rounded focus:ring focus:ring-blue-500 text-sm"
                  value={chegada}
                  onChange={(e) => setChegada(e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Término</Label>
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded text-sm"
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa hh:mm"
                    value={terminoBR}
                    onChange={(e) => setTerminoBR(maskBR(e.target.value))}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => terminoRef.current?.showPicker?.()} title="Calendário">📅</Button>
                  <input ref={terminoRef} type="datetime-local" className="hidden" value={termino} onChange={(e) => setTermino(e.target.value)} />
                </div>
              ) : (
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2 md:p-2 rounded focus:ring focus:ring-blue-500 text-sm"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 flex justify-end gap-2">
        <Button variant="destructive" onClick={onClose} className="h-9 px-3 md:h-9 md:px-4">Cancelar</Button>
        <Button onClick={salvar} className="h-9 px-3 md:h-9 md:px-4">Salvar</Button>
      </div>
    </div>
  );
};

export default HorariosPopup;