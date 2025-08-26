import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PrestadorFormComponent from './PrestadorForm';
import { PrestadorForm } from '@/types/prestador';

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  prestadorEdicao?: PrestadorForm | null;
  onSave?: (prestador: PrestadorForm) => void;
}

const PrestadorPopup: React.FC<Props> = ({
  open,
  onOpenChange,
  prestadorEdicao,
  onSave
}) => {
  // Garante que tipo_veiculo seja sempre array de TipoVeiculo
  const prestadorTratado = prestadorEdicao
    ? {
        ...prestadorEdicao,
        tipo_veiculo: Array.isArray(prestadorEdicao.veiculos)
          ? prestadorEdicao.veiculos.map((v: any) => v.tipo).filter((v: any) => v === 'Carro' || v === 'Moto')
          : []
      }
    : undefined;

  const handleCancel = () => {
    onOpenChange?.(false);
  };

  const handleSubmit = (prestador: PrestadorForm) => {
    onSave?.(prestador);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl">
        <DialogHeader className="text-center py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <DialogTitle className="text-2xl font-bold">
            {prestadorEdicao ? 'Editar Prestador' : 'Novo Prestador'}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)] pr-2 pl-2">
          <PrestadorFormComponent
            prestador={prestadorTratado}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrestadorPopup; 