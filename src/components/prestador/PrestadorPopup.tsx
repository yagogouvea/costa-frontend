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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {prestadorEdicao ? 'Editar Prestador' : 'Novo Prestador'}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
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