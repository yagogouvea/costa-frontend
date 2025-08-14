import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ocorrenciaService } from '../../infrastructure/api/ocorrencia.service';
import type { Ocorrencia } from '@/core/types/ocorrencia.types';
import { DataTable } from '../../shared/components/DataTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';

export function OcorrenciaList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const query = useQuery({
    queryKey: ['ocorrencias'] as const,
    queryFn: () => ocorrenciaService.findAll()
  });

  const ocorrencias = query.data ?? [];

  const columns: ColumnDef<Ocorrencia>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorFn: (row) => row.id
    },
    {
      id: 'cliente',
      header: 'Cliente',
      accessorFn: (row) => row.cliente
    },
    {
      id: 'placa',
      header: 'Placa',
      accessorFn: (row) => row.placa1
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(row.original.status || '')}`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'data',
      header: 'Data',
      accessorFn: (row) => row.data_acionamento,
      cell: ({ row }) => row.original.data_acionamento ? format(new Date(row.original.data_acionamento), 'dd/MM/yyyy HH:mm') : '-'
    },
    {
      id: 'actions',
      header: 'Ações',
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ocorrencias/${row.original.id}`)}
          >
            Detalhes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ocorrencias/${row.original.id}/edit`)}
          >
            Editar
          </Button>
        </div>
      )
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Em andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Finalizada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      case 'Aguardando prestador':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (query.isLoading) {
    return <div>Carregando...</div>;
  }

  if (query.error) {
    return <div>Erro ao carregar ocorrências</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ocorrências</h1>
        <Button onClick={() => navigate('/ocorrencias/new')}>
          Nova Ocorrência
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar ocorrências..."
          className="w-full p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <DataTable
        data={ocorrencias}
        columns={columns}
        globalFilter={filter}
        setGlobalFilter={setFilter}
      />
    </div>
  );
} 