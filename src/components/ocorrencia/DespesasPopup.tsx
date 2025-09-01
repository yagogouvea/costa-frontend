import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Ocorrencia, DespesaDetalhada } from "@/types/ocorrencia";
import api from '@/services/api';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tipos = ['Pedágio', 'Alimentação', 'Uber', 'Outros'] as const;

interface DespesaForm {
  id: string;
  tipo: string;
  valor: string;
}

const DespesasPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose, open, onOpenChange }) => {
  const [despesas, setDespesas] = useState<DespesaForm[]>([]);
  const [semDespesas, setSemDespesas] = useState(false);

  useEffect(() => {
    if (ocorrencia.despesas_detalhadas && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length > 0) {
      const detalhadas = ocorrencia.despesas_detalhadas.map((d: DespesaDetalhada, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        tipo: d.tipo,
        valor: d.valor.toFixed(2).replace('.', ',')
      }));
      setDespesas(detalhadas);
      setSemDespesas(false);
    } else if (ocorrencia.despesas && ocorrencia.despesas > 0 && (!ocorrencia.despesas_detalhadas || ocorrencia.despesas_detalhadas.length === 0)) {
      setDespesas([{ id: `${Date.now()}-${Math.random()}`, tipo: 'Outros', valor: ocorrencia.despesas.toFixed(2).replace('.', ',') }]);
      setSemDespesas(false);
    } else {
      setDespesas([]);
      setSemDespesas(true);
    }
  }, [ocorrencia]);

  const formatarMoeda = (valor: string) => {
    const numeros = String(valor ?? '').replace(/\D/g, '');
    const numero = parseFloat(numeros) / 100;
    return numero.toFixed(2).replace('.', ',');
  };

  const adicionarDespesa = () => {
    setDespesas([...despesas, { id: `${Date.now()}-${Math.random()}`, tipo: '', valor: '' }]);
  };

  const removerDespesa = (id: string) => {
    setDespesas(despesas.filter(d => d.id !== id));
  };

  const atualizarCampo = (id: string, campo: keyof DespesaForm, valor: string) => {
    const novas = [...despesas];
    const despesa = novas.find(d => d.id === id);
    if (!despesa) return;
    if (campo === 'valor') {
      despesa[campo] = formatarMoeda(valor);
    } else {
      despesa[campo] = valor;
    }
    setDespesas(novas);
  };

  const formatarParaNumero = (valor: string) => {
    return parseFloat(String(valor ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
  };

  const salvar = async () => {
    try {
      if (!semDespesas) {
        // Validar se todas as despesas têm tipo e valor
        for (const d of despesas) {
          if (!d.tipo || d.tipo === 'Tipo' || d.tipo === '') {
            alert('Por favor, selecione um tipo válido para todas as despesas.');
            return;
          }
          if (!d.valor || formatarParaNumero(d.valor) <= 0) {
            alert('Por favor, insira um valor válido para todas as despesas.');
            return;
          }
        }
      }

      const total = semDespesas ? 0 : despesas.reduce((acc, d) => acc + formatarParaNumero(d.valor), 0);
      const despesasDetalhadas = semDespesas ? [] : despesas.map(d => ({
        id: d.id,
        tipo: d.tipo,
        valor: formatarParaNumero(d.valor)
      }));

      const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, {
        despesas: total,
        despesas_detalhadas: despesasDetalhadas
      });

      onUpdate(data);
      onOpenChange(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar despesas:', error);
      alert('Erro ao salvar despesas. Tente novamente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Despesas da Ocorrência</DialogTitle>
        <DialogDescription>
          Formulário para editar despesas vinculadas à ocorrência
        </DialogDescription>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={semDespesas}
              onChange={() => {
                setSemDespesas(!semDespesas);
                if (!semDespesas) setDespesas([]);
              }}
            />
            <span className="text-sm">Sem despesas neste atendimento</span>
          </label>

          {!semDespesas && (
            <div className="space-y-3">
              {despesas.map((despesa) => (
                <div key={despesa.id} className="flex items-center gap-3">
                  <select
                    value={despesa.tipo}
                    onChange={(e) => atualizarCampo(despesa.id, 'tipo', e.target.value)}
                    className="border px-2 py-1 rounded flex-1"
                  >
                    <option value="">Tipo</option>
                    {tipos.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={despesa.valor}
                    onChange={(e) => atualizarCampo(despesa.id, 'valor', e.target.value)}
                    className="w-32"
                    inputMode="numeric"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removerDespesa(despesa.id)}
                    className="px-2 py-1"
                  >
                    ×
                  </Button>
                </div>
              ))}

              <Button onClick={adicionarDespesa} size="sm">
                + Adicionar nova despesa
              </Button>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => {
                onClose();
                onOpenChange(false);
              }}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={salvar}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DespesasPopup;
