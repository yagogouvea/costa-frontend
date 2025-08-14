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
      <DialogContent>
        <DialogTitle>Adicionar Despesas</DialogTitle>
        <DialogDescription>
          Preencha os campos com os valores correspondentes.
        </DialogDescription>

        {despesas.map((d, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <select
              value={d.tipo}
              onChange={(e) => handleChange(index, "tipo", e.target.value)}
              className="w-1/2 border p-2 rounded"
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
              className="w-1/2 border p-2 rounded text-right"
            />
            {despesas.length > 1 && (
              <button
                onClick={() => handleRemove(index)}
                className="text-red-600 font-bold"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAdd}
          className="text-blue-600 text-sm underline mb-4"
        >
          + Adicionar mais
        </button>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            disabled={isInvalid()}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DespesasPopup;