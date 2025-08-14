import api from '@/services/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Ocorrencia } from '@/types/ocorrencia';
import { DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Save, X, CheckCircle } from 'lucide-react';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
}

const DescricaoPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  const [descricao, setDescricao] = useState(ocorrencia.descricao || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save quando o usuário para de digitar
  useEffect(() => {
    if (hasUnsavedChanges && descricao !== ocorrencia.descricao) {
      const timeoutId = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save após 2 segundos de inatividade

      return () => clearTimeout(timeoutId);
    }
  }, [descricao, hasUnsavedChanges]);

  const formatarTexto = (texto: string): string => {
    return texto
      // Garante que parágrafos tenham espaçamento adequado
      .replace(/\n\s*\n/g, '\n\n')
      // Remove espaços extras no início e fim das linhas
      .split('\n')
      .map(linha => linha.trim())
      .join('\n')
      // Remove múltiplos espaços entre palavras
      .replace(/\s+/g, ' ')
      // Garante que não há múltiplas quebras de linha consecutivas
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const autoSave = async () => {
    if (!hasUnsavedChanges || descricao === ocorrencia.descricao) return;
    
    try {
      const descricaoFormatada = formatarTexto(descricao);
      await api.put(`/api/ocorrencias/${ocorrencia.id}`, { 
        descricao: descricaoFormatada 
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro no auto-save:', error);
    }
  };

  const salvar = async () => {
    try {
      setIsSaving(true);
      const descricaoFormatada = formatarTexto(descricao);
      const { data } = await api.put(`/api/ocorrencias/${ocorrencia.id}`, { 
        descricao: descricaoFormatada 
      });
      onUpdate(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar descrição:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelar = () => {
    if (hasUnsavedChanges) {
      if (confirm('Você tem alterações não salvas. Deseja realmente cancelar?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescricao(e.target.value);
    setHasUnsavedChanges(true);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    return lastSaved.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-0 max-w-6xl w-full mx-auto bg-white rounded-lg shadow-xl h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <DialogTitle asChild>
              <h3 className="text-xl font-semibold text-gray-900">Descrição da Ocorrência</h3>
            </DialogTitle>
            <DialogDescription asChild>
              <p className="text-sm text-gray-600 mt-1">
                Ocorrência #{ocorrencia.id} - {ocorrencia.placa1 || 'Sem placa'}
              </p>
            </DialogDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {lastSaved && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Salvo às {formatLastSaved()}</span>
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Alterações não salvas</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={cancelar}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button 
                onClick={salvar} 
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogClose>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="font-medium">Editor de Texto</span>
                <span className="text-gray-400">|</span>
                <span>Use Enter para novos parágrafos</span>
                <span className="text-gray-400">|</span>
                <span>Ctrl+S para salvar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Auto-save ativo
                </span>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              className="w-full h-full border-2 border-gray-200 rounded-lg p-6 text-base resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="Digite aqui a descrição detalhada da ocorrência..."
              value={descricao}
              onChange={handleDescricaoChange}
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.8',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '16px'
              }}
              onKeyDown={(e) => {
                // Ctrl+S para salvar
                if (e.ctrlKey && e.key === 's') {
                  e.preventDefault();
                  salvar();
                }
              }}
            />
            
            {/* Character count */}
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
              {descricao.length} caracteres
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>📝 Editor de descrição</span>
            <span>•</span>
            <span>Formatação automática</span>
            <span>•</span>
            <span>Auto-save a cada 2s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Ctrl+S para salvar manualmente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescricaoPopup;
