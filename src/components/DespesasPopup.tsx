import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface Despesa {
  tipo: string;
  valor: string;
}

interface Props {
  onSave: (despesas: { tipo: string; valor: number }[]) => void;
  despesasExistentes?: { tipo: string; valor: number }[];
}

const DespesasPopup = ({ onSave, despesasExistentes = [] }: Props) => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (despesasExistentes.length > 0) {
        const parsed = despesasExistentes.map((d) => ({
          tipo: d.tipo,
          valor: formatCurrency((d.valor * 100).toString()),
        }));
        setDespesas(parsed);
      } else {
        setDespesas([{ tipo: "", valor: "" }]);
      }
    }
  }, [open]);

  const formatCurrency = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    const number = Number(digits) / 100;
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const parseCurrency = (formatted: string): number => {
    return parseFloat(formatted.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
  };

  const handleChange = (index: number, field: keyof Despesa, value: string) => {
    const updated = [...despesas];
    updated[index][field] = field === "valor" ? formatCurrency(value) : value;
    setDespesas(updated);
  };

  const handleAdd = () => {
    setDespesas([...despesas, { tipo: "", valor: "" }]);
  };

  const handleRemove = (index: number) => {
    const updated = despesas.filter((_, i) => i !== index);
    setDespesas(updated);
  };

  const handleSave = () => {
    const final = despesas
      .map((d) => ({
        tipo: d.tipo,
        valor: parseCurrency(d.valor),
      }))
      .filter((d) => d.tipo && d.valor > 0);
    if (final.length > 0) {
      onSave(final);
      setOpen(false);
    }
  };

  const isInvalid = () => despesas.some((d) => !d.tipo || parseCurrency(d.valor) <= 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-blue-600 underline">Despesas</button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 via-white to-blue-50 border-0 shadow-2xl">
        <DialogTitle className="text-2xl font-bold text-center py-6 bg-gradient-to-r from-green-600 to-blue-700 text-white rounded-t-lg -mx-6 -mt-6 px-6">
          Adicionar Despesas
        </DialogTitle>
        <DialogDescription className="text-center text-green-100 text-base mt-2 -mx-6 px-6 pb-4">
          Preencha os campos com os valores correspondentes.
        </DialogDescription>

        <div className="px-6 pb-6">
          {despesas.map((d, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <select
                value={d.tipo}
                onChange={(e) => handleChange(index, "tipo", e.target.value)}
                className="w-1/2 border-2 border-gray-200 p-3 rounded-lg text-base focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              >
                <option value="">Tipo</option>
                <option value="Pedágio">Pedágio</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Uber">Uber</option>
                <option value="Outros">Outros</option>
              </select>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={d.valor}
                onChange={(e) => handleChange(index, "valor", e.target.value)}
                className="w-1/2 border-2 border-gray-200 p-3 rounded-lg text-right text-base focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              />
              {despesas.length > 1 && (
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-600 font-bold text-xl hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="text-green-600 text-base underline mb-6 hover:text-green-700 transition-colors duration-200"
          >
            + Adicionar mais
          </button>

          <div className="flex justify-end gap-4">
            <DialogClose asChild>
              <button className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-base font-medium">
                Cancelar
              </button>
            </DialogClose>
            <button
              onClick={handleSave}
              disabled={isInvalid()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg disabled:opacity-50 hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-base font-medium shadow-lg"
            >
              Salvar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DespesasPopup;