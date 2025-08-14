import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Prestador } from '@/types/prestador';
import { formatarValorMonetario } from '@/utils/prestadorUtils';

interface Props {
  prestadores: Prestador[];
  onEdit: (prestador: Prestador) => void;
  onDelete: (id: number) => void;
}

const PrestadorTable: React.FC<Props> = ({ prestadores, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Funções</TableHead>
            <TableHead>Veículos</TableHead>
            <TableHead>Valor Acionamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prestadores.map(prestador => (
            <TableRow key={prestador.id}>
              <TableCell>
                {prestador.nome}
                <br />
                <span className="text-sm text-gray-500">
                  {prestador.cod_nome}
                </span>
              </TableCell>
              <TableCell>{prestador.cpf}</TableCell>
              <TableCell>{prestador.telefone}</TableCell>
              <TableCell>{prestador.email}</TableCell>
              <TableCell>{prestador.funcoes.join(', ')}</TableCell>
              <TableCell>{prestador.tipo_veiculo.join(', ')}</TableCell>
              <TableCell>
                {formatarValorMonetario(prestador.valor_acionamento)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => onEdit(prestador)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => prestador.id && onDelete(prestador.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PrestadorTable; 