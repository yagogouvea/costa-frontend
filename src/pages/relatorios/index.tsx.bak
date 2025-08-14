import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pdf } from '@react-pdf/renderer';
import RelatorioPDF from '@/components/pdf/RelatorioPDF';
import axios from 'axios';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import HorariosPopup from '@/components/ocorrencia/HorariosPopup';
import KMPopup from '@/components/ocorrencia/KMPopup';
import PrestadorPopup from '@/components/ocorrencia/PrestadorPopup';
import DespesasPopup from '@/components/ocorrencia/DespesasPopup';
import FotosPopup from '@/components/ocorrencia/FotosPopup';
import DescricaoPopup from '@/components/ocorrencia/DescricaoPopup';
import EditarDadosPopup from '@/components/ocorrencia/EditarDadosPopup';
import StatusRecuperacaoPopup from '@/components/ocorrencia/StatusRecuperacaoPopup';
import { Ocorrencia } from '@/types/ocorrencia';
import { Clock, MapPin, User, DollarSign, Image, FileText, Edit, Check, FileDown } from 'lucide-react';
import PassagemServicoPopup from '@/components/ocorrencia/PassagemServicoPopup';


const formatarDataHora = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function RelatoriosPage() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [filtros, setFiltros] = useState({ id: '', placa: '', cliente: '', prestador: '', inicio: '', fim: '' });
  const filtrosRef = useRef(filtros);
  const [openDespesaId, setOpenDespesaId] = useState<number | null>(null);

  const buscarOcorrencias = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosRef.current.id) params.append('id', filtrosRef.current.id);
      if (filtrosRef.current.placa) params.append('placa', filtrosRef.current.placa);
      if (filtrosRef.current.cliente) params.append('cliente', filtrosRef.current.cliente);
      if (filtrosRef.current.prestador) params.append('prestador', filtrosRef.current.prestador);
      if (filtrosRef.current.inicio) params.append('inicio', filtrosRef.current.inicio);
      if (filtrosRef.current.fim) params.append('fim', filtrosRef.current.fim);

      const res = await axios.get(`/api/ocorrencias?${params.toString()}`);
      setOcorrencias(res.data);
    } catch (err) {
      console.error('Erro ao buscar ocorrências:', err);
    }
  };

 const atualizarOcorrencia = async (atualizada: Ocorrencia) => {
  try {
    if (!atualizada?.id) {
      console.error('ID da ocorrência não definido. Dados recebidos:', atualizada);
      throw new Error('ID da ocorrência não definido');
    }

    const body = {
      km: atualizada.km,
      km_inicial: atualizada.km_inicial,
      km_final: atualizada.km_final,
      despesas: atualizada.despesas,
      prestador: atualizada.prestador,
      descricao: atualizada.descricao,
      status: atualizada.status,
      resultado: atualizada.resultado,
      inicio: atualizada.inicio,
      chegada: atualizada.chegada,
      termino: atualizada.termino
    };

    await axios.put(`/api/ocorrencias/${atualizada.id}`, body);
    await buscarOcorrencias();
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
  }
};


  const gerarPDF = async (ocorrencia: Ocorrencia) => {
    const blob = await pdf(<RelatorioPDF dados={ocorrencia} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Input placeholder="ID Ocorrência" value={filtros.id} onChange={e => setFiltros({ ...filtros, id: e.target.value })} />
        <Input placeholder="Placa" value={filtros.placa} onChange={e => setFiltros({ ...filtros, placa: e.target.value })} />
        <Input placeholder="Cliente" value={filtros.cliente} onChange={e => setFiltros({ ...filtros, cliente: e.target.value })} />
        <Input placeholder="Prestador" value={filtros.prestador} onChange={e => setFiltros({ ...filtros, prestador: e.target.value })} />
        <Input type="date" value={filtros.inicio} onChange={e => setFiltros({ ...filtros, inicio: e.target.value })} />
        <Input type="date" value={filtros.fim} onChange={e => setFiltros({ ...filtros, fim: e.target.value })} />
      </div>

      <Button className="mt-4" onClick={() => { filtrosRef.current = filtros; buscarOcorrencias(); }}>Buscar</Button>

      {ocorrencias.length > 0 && (
        <table className="w-full text-sm border mt-6">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Placa</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Prestador</th>
              <th className="p-2">Horários</th>
              <th className="p-2">KM</th>
              <th className="p-2">Despesas</th>
              <th className="p-2">Editar</th>
            </tr>
          </thead>
          <tbody>
            {ocorrencias.map((o: Ocorrencia) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.id}</td>
                <td className="p-2">{o.placa1}</td>
                <td className="p-2">{o.cliente}</td>
                <td className="p-2">{o.tipo}</td>
                <td className="p-2">{o.prestador}</td>
                <td className="p-2">
                  {o.inicio && <div>Início: {formatarDataHora(o.inicio)}</div>}
                  {o.chegada && <div>Local: {formatarDataHora(o.chegada)}</div>}
                  {o.termino && <div>Término: {formatarDataHora(o.termino)}</div>}
                </td>
                <td className="p-2">{o.km ?? '–'}</td>
                <td className="p-2">R$ {o.despesas?.toFixed(2) ?? '0,00'}</td>
                <td className="p-2 flex flex-wrap gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Horários"><Clock size={16} /></Button>
                    </DialogTrigger>
                    <DialogContent>
  <HorariosPopup
    ocorrencia={o}
    onUpdate={(updateFn) => {
      setOcorrencias((prev: Ocorrencia[]) => updateFn(prev));
    }}
    onClose={buscarOcorrencias}
  />
</DialogContent>

                  </Dialog>
                  <Dialog>
                    
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="KM"><MapPin size={16} /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <KMPopup
                        ocorrencia={o}
                        onUpdate={(atualizada: Ocorrencia) => {
                          atualizarOcorrencia({ ...o, ...atualizada });
                        }}
                        onClose={buscarOcorrencias}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm" title="Prestador"><User size={16} /></Button></DialogTrigger><DialogContent><PrestadorPopup ocorrencia={o} onUpdate={(dados) => atualizarOcorrencia({ ...o, ...dados })} onClose={buscarOcorrencias} /></DialogContent></Dialog>
                  <Dialog open={openDespesaId === o.id} onOpenChange={(open) => setOpenDespesaId(open ? o.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Despesas"><DollarSign size={16} /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DespesasPopup
                        ocorrencia={o}
                        onUpdate={(dados) => {
                          atualizarOcorrencia({ ...o, ...dados });
                          setOpenDespesaId(null);
                        }}
                        onClose={() => setOpenDespesaId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm" title="Fotos"><Image size={16} /></Button></DialogTrigger><DialogContent><FotosPopup ocorrencia={o} onUpdate={atualizarOcorrencia} onClose={buscarOcorrencias} /></DialogContent></Dialog>
                  <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm" title="Descrição"><FileText size={16} /></Button></DialogTrigger><DialogContent><DescricaoPopup ocorrencia={o} onUpdate={(dados) => atualizarOcorrencia({ ...o, ...dados })} onClose={buscarOcorrencias} /></DialogContent></Dialog>
                  <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm" title="Status"><Check size={16} /></Button></DialogTrigger><DialogContent><StatusRecuperacaoPopup ocorrencia={o} onUpdate={(dados) => atualizarOcorrencia({ ...o, ...dados })} onClose={buscarOcorrencias} /></DialogContent></Dialog>
                  <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm" title="Editar Dados"><Edit size={16} /></Button></DialogTrigger><DialogContent><EditarDadosPopup ocorrencia={o} onUpdate={atualizarOcorrencia} onClose={buscarOcorrencias} /></DialogContent></Dialog>
                  <Button variant="ghost" size="sm" onClick={() => gerarPDF(o)} title="PDF"><FileDown size={16} /></Button>
                </td>
                <Dialog>
  <DialogTrigger asChild>
    <Button variant="ghost" size="sm" title="Passagem de Serviço">
      <FileText size={16} />
    </Button>
  </DialogTrigger>
  <DialogContent>
    <PassagemServicoPopup
      ocorrencia={o}
      onUpdate={(dados) => atualizarOcorrencia({ ...o, ...dados })}
      onClose={buscarOcorrencias}
    />
  </DialogContent>
</Dialog>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 
