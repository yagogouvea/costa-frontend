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
  observacao?: string;
}

const DespesasPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose, open, onOpenChange }) => {
  const [despesas, setDespesas] = useState<DespesaForm[]>([]);
  const [semDespesas, setSemDespesas] = useState(false);

  useEffect(() => {
    if (ocorrencia.despesas_detalhadas && Array.isArray(ocorrencia.despesas_detalhadas) && ocorrencia.despesas_detalhadas.length > 0) {
      const detalhadas = ocorrencia.despesas_detalhadas.map((d: DespesaDetalhada, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        tipo: d.tipo,
        valor: d.valor.toFixed(2).replace('.', ','),
        observacao: d.descricao || ''
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
    setDespesas([...despesas, { id: `${Date.now()}-${Math.random()}`, tipo: '', valor: '', observacao: '' }]);
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
        valor: formatarParaNumero(d.valor),
        descricao: d.tipo === 'Outros' && d.observacao ? d.observacao.trim() : undefined
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

  const totalAtual = semDespesas
    ? 0
    : despesas.reduce((acc, d) => acc + formatarParaNumero(d.valor), 0);

  const formatarBRL = (valor: number) =>
    `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[92vw] md:max-w-[560px] lg:max-w-[640px] xl:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>Despesas da Ocorrência</DialogTitle>
        <DialogDescription>
          Formulário para editar despesas vinculadas à ocorrência
        </DialogDescription>

        {/* Barra de status compacta (desktop) */}
        <div className="hidden md:flex items-center justify-between mt-2 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <span>Total atual</span>
            <span className="inline-block px-2 py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800">
              {formatarBRL(totalAtual)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <span>ID:</span>
            <span className="font-medium text-slate-800">{ocorrencia.id}</span>
          </div>
        </div>

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
            <span className="text-xs sm:text-sm">Sem despesas neste atendimento</span>
          </label>

          {!semDespesas && (
            <div className="space-y-3">
              {/* Cabeçalho da grade (desktop) */}
              <div className="hidden md:grid grid-cols-[1fr,150px,40px] gap-2 text-xs text-slate-500 px-1">
                <div>Tipo</div>
                <div className="text-right pr-2">Valor</div>
                <div></div>
              </div>

              <div className="space-y-2">
                {despesas.map((despesa) => (
                  <div key={despesa.id} className="grid grid-cols-1 md:grid-cols-[1fr,150px,40px] gap-2 items-center p-2 border border-slate-200 rounded-lg bg-white/80">
                    <select
                      value={despesa.tipo}
                      onChange={(e) => atualizarCampo(despesa.id, 'tipo', e.target.value)}
                      className="border px-2 py-2 rounded w-full text-sm"
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
                      className="md:w-full w-32 text-right"
                      inputMode="numeric"
                    />

                    <div className="flex md:justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removerDespesa(despesa.id)}
                        className="h-8 w-8 p-0 rounded-full"
                        title="Remover"
                      >
                        ×
                      </Button>
                    </div>

                    {/* Observação para tipo Outros */}
                    {despesa.tipo === 'Outros' && (
                      <div className="md:col-span-3">
                        <Input
                          type="text"
                          placeholder="Observação (ex.: pedágio, taxa, etc.)"
                          value={despesa.observacao || ''}
                          onChange={(e) => atualizarCampo(despesa.id, 'observacao', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button onClick={adicionarDespesa} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  + Adicionar despesa
                </Button>
                <div className="md:hidden text-sm text-slate-700 font-medium">
                  Total: {formatarBRL(totalAtual)}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
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
