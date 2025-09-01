import api from '@/services/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Ocorrencia } from "@/types/ocorrencia";
import { Calculator, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
}

const KMPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [inicial, setInicial] = useState('');
  const [final, setFinal] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<{ inicial?: string; final?: string; total?: string }>({});

  useEffect(() => {
    setInicial(ocorrencia.km_inicial != null ? String(ocorrencia.km_inicial) : '');
    setFinal(ocorrencia.km_final != null ? String(ocorrencia.km_final) : '');
    setErrors({});
  }, [ocorrencia.id]);

  // Validar KM inicial
  const validateInicial = (value: string) => {
    const km = parseFloat(value);
    if (value === '') return '';
    if (isNaN(km)) return 'KM inicial deve ser um número válido';
    // Removida validação de valor negativo - permite qualquer número
    return '';
  };

  // Validar KM final
  const validateFinal = (value: string) => {
    const km = parseFloat(value);
    if (value === '') return '';
    if (isNaN(km)) return 'KM final deve ser um número válido';
    // Removida validação de valor negativo - permite qualquer número
    return '';
  };

  // Validar KM total
  const validateTotal = (inicial: string, final: string) => {
    const kmInicial = parseFloat(inicial);
    const kmFinal = parseFloat(final);
    
    if (inicial === '' || final === '') return '';
    if (isNaN(kmInicial) || isNaN(kmFinal)) return '';
    // Removida a validação que impedia KM final ser menor que KM inicial
    return '';
  };

  // Calcular KM total
  const calculateTotal = () => {
    const kmInicial = parseFloat(inicial);
    const kmFinal = parseFloat(final);
    
    if (isNaN(kmInicial) || isNaN(kmFinal)) return null;
    // Removida a validação que impedia KM final ser menor que KM inicial
    
    return kmFinal - kmInicial;
  };

  // Atualizar KM inicial
  const handleInicialChange = (value: string) => {
    setInicial(value);
    const error = validateInicial(value);
    setErrors(prev => ({ ...prev, inicial: error }));
    
    // Validar total quando ambos os campos estão preenchidos
    if (value !== '' && final !== '') {
      const totalError = validateTotal(value, final);
      setErrors(prev => ({ ...prev, total: totalError }));
    }
  };

  // Atualizar KM final
  const handleFinalChange = (value: string) => {
    setFinal(value);
    const error = validateFinal(value);
    setErrors(prev => ({ ...prev, final: error }));
    
    // Validar total quando ambos os campos estão preenchidos
    if (inicial !== '' && value !== '') {
      const totalError = validateTotal(inicial, value);
      setErrors(prev => ({ ...prev, total: totalError }));
    }
  };

  // Verificar se pode salvar
  const canSave = () => {
    // Pode salvar se tiver KM inicial preenchido
    const temKmInicial = inicial !== '';
    
    // Se tiver KM final preenchido, ambos devem estar preenchidos
    if (final !== '') {
      const temKmFinal = true; // Sempre true se final não está vazio
      
      // Pode salvar se ambos KM inicial e final estão preenchidos (independente dos valores)
      return temKmInicial && temKmFinal;
    }
    
    // Se só tiver KM inicial, pode salvar
    return temKmInicial;
  };

  const salvar = async () => {
    if (!canSave()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    setIsCalculating(true);
    
    try {
      const kmInicial = parseFloat(inicial);
      const kmFinal = parseFloat(final);
      
      // Preparar dados para envio
      const dadosParaEnviar: any = {
        km_inicial: kmInicial
      };
      
      // Se tiver KM final, calcular e enviar o total
      if (final !== '' && !isNaN(kmFinal)) {
        const kmTotal = kmFinal - kmInicial;
        dadosParaEnviar.km = kmTotal;
        dadosParaEnviar.km_final = kmFinal;
      }

      const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, dadosParaEnviar);

      console.log("Resposta do PUT:", data);
      
      onUpdate(data);
      onClose();
      
      if (final !== '' && !isNaN(kmFinal)) {
        toast.success('KM inicial e final atualizados com sucesso!');
      } else {
        toast.success('KM inicial registrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar KM:', error);
      toast.error('Erro ao salvar KM. Tente novamente.');
    } finally {
      setIsCalculating(false);
    }
  };

  const cancelar = () => {
    onClose();
  };

  const kmTotal = calculateTotal();

  return (
    <div className="p-6 w-96 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calculator size={20} className="text-blue-600" />
          Editar Quilometragem
        </DialogTitle>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <DialogDescription className="text-gray-600 mb-4">
        Informe o KM inicial e/ou final para registrar a quilometragem. 
        Você pode salvar apenas o KM inicial e completar com o KM final posteriormente.
        KM inicial e final podem ser 0.
      </DialogDescription>

      <div className="space-y-4">
        {/* KM Inicial */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            KM Inicial
          </label>
                     <input
             type="number"
             step="0.1"
             className={`w-full border-2 p-3 rounded-lg transition-colors ${
               errors.inicial 
                 ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
             }`}
             value={inicial}
             onChange={e => handleInicialChange(e.target.value)}
             placeholder="Ex: 0, 12345.6"
           />
          {errors.inicial && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertCircle size={14} />
              {errors.inicial}
            </div>
          )}
        </div>

        {/* KM Final */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            KM Final <span className="text-gray-500 text-xs">(opcional)</span>
          </label>
                     <input
             type="number"
             step="0.1"
             className={`w-full border-2 p-3 rounded-lg transition-colors ${
               errors.final 
                 ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
             }`}
             value={final}
             onChange={e => handleFinalChange(e.target.value)}
             placeholder="Ex: 0, 12450.2 (deixe vazio se não souber)"
           />
          {errors.final && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertCircle size={14} />
              {errors.final}
            </div>
          )}
          {final === '' && inicial !== '' && (
            <div className="flex items-center gap-1 mt-1 text-blue-600 text-sm">
              <CheckCircle size={14} />
              KM final pode ser registrado posteriormente
            </div>
          )}
        </div>

        {/* Resultado do cálculo */}
        {inicial !== '' && (
          <div className={`p-4 rounded-lg border-2 ${
            kmTotal !== null
              ? kmTotal === 0 || kmTotal <= 50
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Status do KM:
              </span>
              <span className={`text-lg font-bold ${
                kmTotal !== null
                  ? kmTotal === 0 || kmTotal <= 50
                    ? 'text-yellow-600'
                    : 'text-green-600'
                  : 'text-blue-600'
              }`}>
                {final === '' 
                  ? 'Apenas KM Inicial'
                  : kmTotal !== null
                  ? kmTotal === 0 || kmTotal <= 50
                    ? 'Franquia'
                    : `${kmTotal.toFixed(1)} km`
                  : 'Inválido'
                }
              </span>
            </div>
            
            {final === '' && inicial !== '' && (
              <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm">
                <CheckCircle size={14} />
                KM inicial registrado - pode completar com KM final posteriormente
              </div>
            )}
            
            {errors.total && (
              <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.total}
              </div>
            )}
            
            {kmTotal !== null && final !== '' && (
              <div className="flex items-center gap-1 mt-2 text-sm">
                {kmTotal === 0 || kmTotal <= 50 ? (
                  <span className="text-yellow-600">
                    <CheckCircle size={14} />
                    Franquia - KM total: {kmTotal.toFixed(1)} km
                  </span>
                ) : (
                  <span className="text-green-600">
                    <CheckCircle size={14} />
                    Cálculo válido - KM completo: {kmTotal.toFixed(1)} km
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Informações da ocorrência */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Ocorrência:</span> {ocorrencia.id}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Placa:</span> {ocorrencia.placa1 || '-'}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Cliente:</span> {ocorrencia.cliente || '-'}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 mt-6">
        <Button
          onClick={cancelar}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <X size={16} />
          Cancelar
        </Button>
        
        <Button
          onClick={salvar}
          disabled={!canSave() || isCalculating}
          className={`flex items-center justify-center gap-2 px-6 py-2 ${
            canSave() 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : (
            <>
              <Calculator size={16} />
              {final !== '' ? 'Salvar KM Completo' : 'Salvar KM Inicial'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default KMPopup;
