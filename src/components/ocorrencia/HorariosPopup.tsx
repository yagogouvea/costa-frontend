import { useState, useEffect } from 'react';
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
  // Modo de entrada no mobile: false = calendário (datetime-local), true = digitação manual (texto)
  const [mobileManual, setMobileManual] = useState(false);

  // Estados para digitação manual no mobile (dd/MM/aaaa e HH:mm)
  const [inicioDate, setInicioDate] = useState('');
  const [inicioTime, setInicioTime] = useState('');
  const [chegadaDate, setChegadaDate] = useState('');
  const [chegadaTime, setChegadaTime] = useState('');
  const [terminoDate, setTerminoDate] = useState('');
  const [terminoTime, setTerminoTime] = useState('');

  useEffect(() => {
    // Campos originais
    setInicio(ocorrencia.inicio ? toInputLocal(ocorrencia.inicio) : '');
    setChegada(ocorrencia.chegada ? toInputLocal(ocorrencia.chegada) : '');
    setTermino(ocorrencia.termino ? toInputLocal(ocorrencia.termino) : '');

    // Popular campos manuais no mobile
    const formatBR = (iso?: string | null) => {
      if (!iso) return { d: '', t: '' };
      try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return { d: '', t: '' };
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = String(date.getFullYear());
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return { d: `${dd}/${mm}/${yyyy}`, t: `${hh}:${mi}` };
      } catch {
        return { d: '', t: '' };
      }
    };

    const i = formatBR(ocorrencia.inicio || null);
    const c = formatBR(ocorrencia.chegada || null);
    const f = formatBR(ocorrencia.termino || null);
    setInicioDate(i.d); setInicioTime(i.t);
    setChegadaDate(c.d); setChegadaTime(c.t);
    setTerminoDate(f.d); setTerminoTime(f.t);
  }, [ocorrencia]);

  const salvar = async () => {
    try {
      const payload: any = {};
      
      // Helpers para montar ISO a partir de manual (dd/MM/aaaa + HH:mm)
      const buildIsoFromManual = (d: string, t: string): string | null => {
        if (!d && !t) return null;
        const [dd, mm, yyyy] = (d || '').split('/');
        const [hh, mi] = (t || '').split(':');
        if (!dd || !mm || !yyyy || !hh || !mi) return null;
        const isoLike = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${hh.padStart(2,'0')}:${mi.padStart(2,'0')}:00`;
        const date = new Date(isoLike);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      };

      // Campos de horários considerando modo mobile manual
      const inicioIso = mobileManual ? buildIsoFromManual(inicioDate, inicioTime) : (inicio ? new Date(inicio).toISOString() : null);
      const chegadaIso = mobileManual ? buildIsoFromManual(chegadaDate, chegadaTime) : (chegada ? new Date(chegada).toISOString() : null);
      const terminoIso = mobileManual ? buildIsoFromManual(terminoDate, terminoTime) : (termino ? new Date(termino).toISOString() : null);

      if (inicioIso) payload.inicio = inicioIso;
      if (chegadaIso) payload.chegada = chegadaIso;
      if (terminoIso) payload.termino = terminoIso;

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
          {/* Toggle de modo de entrada (somente mobile) */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <Button variant={mobileManual ? 'default' : 'outline'} size="sm" onClick={() => setMobileManual(true)}>Digitar</Button>
            <Button variant={!mobileManual ? 'default' : 'outline'} size="sm" onClick={() => setMobileManual(false)}>Calendário</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <div>
              <Label>Início da ocorrência</Label>
              {/* Desktop ou Mobile (Calendário) */}
              <div className="hidden md:block">
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2 md:p-2 rounded focus:ring focus:ring-blue-500 text-sm"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              </div>
              <div className="md:hidden">
                {mobileManual ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      value={inicioDate}
                      onChange={(e) => setInicioDate(e.target.value)}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="hh:mm"
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      value={inicioTime}
                      onChange={(e) => setInicioTime(e.target.value)}
                    />
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 p-2 rounded text-sm"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div>
              <Label>Chegada ao Local</Label>
              <div className="hidden md:block">
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2 md:p-2 rounded focus:ring focus:ring-blue-500 text-sm"
                  value={chegada}
                  onChange={(e) => setChegada(e.target.value)}
                />
              </div>
              <div className="md:hidden">
                {mobileManual ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      value={chegadaDate}
                      onChange={(e) => setChegadaDate(e.target.value)}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="hh:mm"
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      value={chegadaTime}
                      onChange={(e) => setChegadaTime(e.target.value)}
                    />
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 p-2 rounded text-sm"
                    value={chegada}
                    onChange={(e) => setChegada(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div>
              <Label>Término</Label>
              <div className="hidden md:block">
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2 md:p-2 rounded focus:ring focus:ring-blue-500 text-sm"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                />
              </div>
              <div className="md:hidden">
                {mobileManual ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      value={terminoDate}
                      onChange={(e) => setTerminoDate(e.target.value)}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="hh:mm"
                      className="w-full border border-gray-300 p-2 rounded text-sm"
                      value={terminoTime}
                      onChange={(e) => setTerminoTime(e.target.value)}
                    />
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 p-2 rounded text-sm"
                    value={termino}
                    onChange={(e) => setTermino(e.target.value)}
                  />
                )}
              </div>
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