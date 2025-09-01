import { useState, useEffect } from "react";
import {
  Pencil,
  Clock,
  MapPin,
  User,
  Camera,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AutocompletePrestador from "../components/AutocompletePrestador";
import DespesasPopup from "@/components/ocorrencia/DespesasPopup";
import { Ocorrencia } from "@/types/ocorrencia";
import api from '@/services/api';

const formatarStatus = (status: string) => {
  switch (status) {
    case "em_andamento":
      return "Em Andamento";
    case "concluida":
      return "Concluída";
    case "cancelada":
      return "Cancelada";
    case "aguardando":
      return "Aguardando";
    default:
      return status;
  }
};

// Função utilitária para formatar data/hora no padrão DD/MM/YYYY HH:mm
const formatarDataHora = (iso?: string | null) => {
  if (!iso) return '–';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const OcorrenciasDashboard = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [popupData, setPopupData] = useState<{ id: number; type: string } | null>(null);
  const [form, setForm] = useState<any>({ inicio: "", chegada: "", termino: "", kmInicial: "", kmFinal: "", prestador: "" });
  const [openDespesaId, setOpenDespesaId] = useState<number | null>(null);

  // Filtro para status de ocorrências encerradas
  const STATUS_ENCERRADOS = ['concluida', 'finalizada', 'encerrada', 'finalizado', 'encerrado', 'recuperada', 'recuperado'];

  useEffect(() => {
    const buscarOcorrencias = async () => {
      try {
        const res = await api.get('/api/ocorrencias');
        setOcorrencias(res.data);
      } catch (err) {
        console.error('Erro ao buscar ocorrências:', err);
      }
    };
    buscarOcorrencias();
  }, []);

  // Função para converter ISO string para formato datetime-local
  const toInputLocal = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Ajusta para o timezone local
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (["kmInicial", "kmFinal"].includes(name)) {
      setForm((prev: any) => ({ ...prev, [name]: value }));
      return;
    }
    // Para campos de horário, salva diretamente o valor do input
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const savePopupData = () => {
    if (!popupData) return;
    setOcorrencias((prev) =>
      prev.map((oc) => {
        if (oc.id !== popupData.id) return oc;
        switch (popupData.type) {
          case "horarios":
            const payload: any = {};
            if (form.inicio) {
              const localDate = new Date(form.inicio);
              payload.inicio = localDate.toISOString();
            }
            if (form.chegada) {
              const localDate = new Date(form.chegada);
              payload.chegada = localDate.toISOString();
            }
            if (form.termino) {
              const localDate = new Date(form.termino);
              payload.termino = localDate.toISOString();
            }
            return { ...oc, ...payload };
          case "km":
            const km = form.kmInicial && form.kmFinal ? `${parseInt(form.kmFinal) - parseInt(form.kmInicial)}` : "";
            return { ...oc, km };
          case "prestador":
            return { ...oc, prestador: form.prestador };
          default:
            return oc;
        }
      })
    );
    setPopupData(null);
    setForm({ inicio: "", chegada: "", termino: "", kmInicial: "", kmFinal: "", prestador: "" });
  };

  // Log para depuração das ocorrências encerradas
  const encerradas = ocorrencias.filter(oc => STATUS_ENCERRADOS.includes((oc.status || '').toLowerCase()));
  console.log('Ocorrências encerradas:', encerradas);

  const formatarDespesas = (ocorrencia: Ocorrencia) => {
    if (ocorrencia.despesas_detalhadas && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length > 0) {
      return ocorrencia.despesas_detalhadas.map((d: any) => `${d.tipo} R$ ${d.valor}`).join(', ');
    } else if (ocorrencia.despesas && ocorrencia.despesas > 0) {
      return `R$ ${ocorrencia.despesas}`;
    }
    return '–';
  };

  const renderOcorrencias = (data: Ocorrencia[]) => (
    <table className="min-w-full text-xs sm:text-sm">
      <thead className="text-gray-600 text-xs uppercase border-b">
        <tr>
          <th className="px-4 py-2 text-left">Placa</th>
          <th className="px-4 py-2 text-left">Cliente</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-left">Início</th>
          <th className="px-4 py-2 text-left">Chegada</th>
          <th className="px-4 py-2 text-left">Término</th>
          <th className="px-4 py-2 text-left">Km</th>
          <th className="px-4 py-2 text-left">Prestador</th>
          <th className="px-4 py-2 text-left">Despesas</th>
          <th className="px-4 py-2 text-left">Etapas</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((oc) => (
          <tr key={oc.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-semibold text-gray-900">{oc.placa1 || "–"}</td>
            <td className="px-4 py-3 text-gray-700">{oc.cliente || "–"}</td>
            <td className="px-4 py-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-300 ${oc.status === "em_andamento" ? "bg-yellow-100 text-yellow-800" : oc.status === "concluida" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{formatarStatus(oc.status) || "–"}</span>
            </td>
            <td className="px-4 py-3">{formatarDataHora(oc.inicio)}</td>
            <td className="px-4 py-3">{formatarDataHora(oc.chegada)}</td>
            <td className="px-4 py-3">{formatarDataHora(oc.termino)}</td>
            <td className="px-4 py-3">
              {oc.km !== undefined && oc.km !== null 
                ? (Number(oc.km) === 0 || Number(oc.km) <= 50 ? 'Franquia' : String(oc.km))
                : "–"
              }
            </td>
            <td className="px-4 py-3">{oc.prestador || "–"}</td>
            <td className="px-4 py-3">{formatarDespesas(oc)}</td>
            <td className="px-4 py-3 flex gap-2 flex-wrap">
              <button title="Horários" onClick={() => { setPopupData({ id: oc.id, type: "horarios" }); setForm({ ...form, inicio: oc.inicio, chegada: oc.chegada, termino: oc.termino }); }} className="text-blue-600 hover:text-blue-800"><Clock size={18} /></button>
              <button title="Odômetro" onClick={() => { setPopupData({ id: oc.id, type: "km" }); setForm({ ...form, kmInicial: "", kmFinal: "" }); }} className="text-blue-600 hover:text-blue-800"><MapPin size={18} /></button>
              <button title="Prestador" onClick={() => { setPopupData({ id: oc.id, type: "prestador" }); setForm({ ...form, prestador: "" }); }} className="text-blue-600 hover:text-blue-800"><User size={18} /></button>
              <Dialog open={openDespesaId === oc.id} onOpenChange={(open) => setOpenDespesaId(open ? oc.id : null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Despesas"><DollarSign size={16} className="text-blue-600" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DespesasPopup
                    ocorrencia={oc}
                    onUpdate={(dados) => {
                      setOcorrencias(prev => prev.map(o => o.id === oc.id ? { ...o, ...dados } : o));
                      setOpenDespesaId(null);
                    }}
                    onClose={() => setOpenDespesaId(null)}
                    open={openDespesaId === oc.id}
                    onOpenChange={(open) => setOpenDespesaId(open ? oc.id : null)}
                  />
                </DialogContent>
              </Dialog>
              <button title="Fotos" className={`hover:text-blue-800 ${oc.fotos ? "text-green-600" : "text-blue-600"}`}><Camera size={18} /></button>
              <button title="Descrição" className={`hover:text-blue-800 ${oc.descricao ? "text-green-600" : "text-blue-600"}`}><Pencil size={18} /></button>
              <button title="Recuperado" className="text-green-600 hover:text-green-800"><CheckCircle size={18} /></button>
              <button title="Não Recuperado" className="text-red-600 hover:text-red-800"><XCircle size={18} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex flex-col gap-2 sm:gap-4 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800">Ocorrências em Andamento</h1>
      <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
        {renderOcorrencias(ocorrencias.filter(oc => !STATUS_ENCERRADOS.includes((oc.status || '').toLowerCase())))}
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-2">Finalizadas (todas)</h2>
      <div className="overflow-x-auto bg-white p-4 rounded-lg shadow border border-gray-200">
        {renderOcorrencias(ocorrencias.filter(oc => STATUS_ENCERRADOS.includes((oc.status || '').toLowerCase())))}
      </div>

      {popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              {popupData.type === "horarios" ? "Horários" : popupData.type === "km" ? "Odômetro" : "Selecionar Prestador"}
            </h3>
            <div className="space-y-3">
              {popupData.type === "horarios" && (
                <>
                  <input type="datetime-local" name="inicio" value={toInputLocal(form.inicio)} onChange={handleFieldChange} className="w-full border p-2 rounded" />
                  <input type="datetime-local" name="chegada" value={toInputLocal(form.chegada)} onChange={handleFieldChange} className="w-full border p-2 rounded" />
                  <input type="datetime-local" name="termino" value={toInputLocal(form.termino)} onChange={handleFieldChange} className="w-full border p-2 rounded" />
                </>
              )}
              {popupData.type === "km" && (
                <>
                  <input type="number" name="kmInicial" placeholder="KM Inicial" value={form.kmInicial} onChange={handleFieldChange} className="w-full border p-2 rounded" />
                  <input type="number" name="kmFinal" placeholder="KM Final" value={form.kmFinal} onChange={handleFieldChange} className="w-full border p-2 rounded" />
                </>
              )}
              {popupData.type === "prestador" && (
                <AutocompletePrestador onSelect={(nome: string) => setForm((prev: any) => ({ ...prev, prestador: nome }))} />
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setPopupData(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancelar</button>
              <button onClick={savePopupData} className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcorrenciasDashboard;
