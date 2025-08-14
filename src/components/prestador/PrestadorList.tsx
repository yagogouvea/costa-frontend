import React from 'react';
import { Prestador } from '@/types/prestador';
import { Button } from '@/components/ui/button';
import { formatarValorMonetario } from '@/utils/prestadorUtils';

interface Props {
  prestadores: Prestador[];
  onEdit: (prestador: Prestador) => void;
  onDelete: (id: number) => void;
}

const PrestadorList: React.FC<Props> = ({ prestadores, onEdit, onDelete }) => {
  return (
    <div className="grid gap-4">
      {prestadores.map(prestador => (
        <div
          key={prestador.id}
          className="p-4 border rounded-lg shadow-sm bg-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {prestador.nome} ({prestador.cod_nome})
              </h3>
              <p className="text-sm text-gray-500">
                {prestador.email} - {prestador.telefone}
              </p>
            </div>
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
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">CPF:</span> {prestador.cpf}
            </div>
            <div>
              <span className="font-medium">PIX:</span> {prestador.tipo_pix} - {prestador.chave_pix}
            </div>
            <div>
              <span className="font-medium">Endereço:</span>{' '}
              {prestador.endereco}, {prestador.bairro}, {prestador.cidade} - {prestador.estado}
            </div>
            <div>
              <span className="font-medium">Funções:</span>{' '}
              {prestador.funcoes.join(', ')}
            </div>
            <div>
              <span className="font-medium">Veículos:</span>{' '}
              {prestador.tipo_veiculo.join(', ')}
            </div>
            <div>
              <span className="font-medium">Valor Acionamento:</span>{' '}
              {formatarValorMonetario(prestador.valor_acionamento)}
            </div>
            <div>
              <span className="font-medium">Valor Hora Adicional:</span>{' '}
              {formatarValorMonetario(prestador.valor_hora_adc)}
            </div>
            <div>
              <span className="font-medium">Valor KM Adicional:</span>{' '}
              {formatarValorMonetario(prestador.valor_km_adc)}
            </div>
            <div>
              <span className="font-medium">Franquia KM:</span>{' '}
              {formatarValorMonetario(prestador.franquia_km)}
            </div>
            {prestador.franquia_horas && (
              <div>
                <span className="font-medium">Franquia Horas:</span>{' '}
                {prestador.franquia_horas}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrestadorList; 