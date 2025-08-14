import React, { useEffect, useState } from 'react';
import { Ocorrencia, OcorrenciaStatus } from '@/types/ocorrencia';
import { api } from '@/services/api';
import { formatarData } from '@/utils/prestadorUtils';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

interface Props {
  status?: OcorrenciaStatus;
  onSelect?: (ocorrencia: Ocorrencia) => void;
}

const OcorrenciaList: React.FC<Props> = ({ status, onSelect }) => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const carregarOcorrencias = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const resposta = await api.get<Ocorrencia[]>(`/api/ocorrencias?${params.toString()}`);
      setOcorrencias(resposta.data);
    } catch (erro: any) {
      console.error('❌ Erro ao buscar ocorrências:', erro);
      toast.error(erro.response?.data?.message || 'Erro ao carregar ocorrências');
      setOcorrencias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOcorrencias();
  }, [status]);

  const ocorrenciasFiltradas = ocorrencias.filter(o => {
    const searchLower = search.toLowerCase();
    return (
      o.placa1.toLowerCase().includes(searchLower) ||
      o.cliente.toLowerCase().includes(searchLower) ||
      (o.prestador && o.prestador.toLowerCase().includes(searchLower))
    );
  });

  const formatarStatus = (status: OcorrenciaStatus) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      case 'aguardando':
        return 'Aguardando';
      default:
        return status;
    }
  };

  const getStatusColor = (status: OcorrenciaStatus) => {
    switch (status) {
      case 'aguardando':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Buscar por placa, cliente ou prestador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : ocorrenciasFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhuma ocorrência encontrada</div>
      ) : (
        <div className="space-y-4">
          {ocorrenciasFiltradas.map((ocorrencia) => (
            <div
              key={ocorrencia.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect?.(ocorrencia)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Placa: {ocorrencia.placa1}</h3>
                  <p className="text-sm text-gray-500">Cliente: {ocorrencia.cliente}</p>
                  {ocorrencia.prestador && (
                    <p className="text-sm text-gray-500">Prestador: {ocorrencia.prestador}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ocorrencia.status)}`}>
                  {formatarStatus(ocorrencia.status)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Tipo: {ocorrencia.tipo}</p>
                <p>Criado em: {formatarData(ocorrencia.criado_em)}</p>
                {ocorrencia.encerrada_em && (
                  <p>Encerrado em: {formatarData(ocorrencia.encerrada_em)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OcorrenciaList; 