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
      console.log('🔄 [DescricaoPopup] Auto-save iniciado...');
      const descricaoFormatada = formatarTexto(descricao);
      console.log('🔄 [DescricaoPopup] Auto-save - descrição formatada:', descricaoFormatada);
      
      await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, { 
        descricao: descricaoFormatada 
      });
      
      console.log('✅ [DescricaoPopup] Auto-save concluído com sucesso');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('❌ [DescricaoPopup] Erro no auto-save:', error);
      console.error('❌ [DescricaoPopup] Detalhes do erro auto-save:', {
        message: error instanceof Error ? error.message : String(error),
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
    }
  };

  const salvar = async () => {
    try {
      setIsSaving(true);
      const descricaoFormatada = formatarTexto(descricao);
      
      console.log('🔍 [DescricaoPopup] Tentando salvar descrição...');
      console.log('🔍 [DescricaoPopup] ID da ocorrência:', ocorrencia.id);
      console.log('🔍 [DescricaoPopup] Descrição original:', descricao);
      console.log('🔍 [DescricaoPopup] Descrição formatada:', descricaoFormatada);
      console.log('🔍 [DescricaoPopup] URL da API:', `/api/v1/ocorrencias/${ocorrencia.id}`);
      
      // Verificar token
      const token = localStorage.getItem('segtrack.token');
      console.log('🔍 [DescricaoPopup] Token disponível:', !!token);
      if (token) {
        console.log('🔍 [DescricaoPopup] Token (primeiros 20 chars):', token.substring(0, 20));
      }
      
      const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, { 
        descricao: descricaoFormatada 
      });
      
      console.log('✅ [DescricaoPopup] Resposta da API:', data);
      console.log('✅ [DescricaoPopup] Descrição salva:', data.descricao);
      
      onUpdate(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('❌ [DescricaoPopup] Erro ao salvar descrição:', error);
      console.error('❌ [DescricaoPopup] Detalhes do erro:', {
        message: error instanceof Error ? error.message : String(error),
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      alert('Erro ao salvar descrição. Verifique o console para mais detalhes.');
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
    <div className="p-0 max-w-6xl w-full mx-auto bg-white rounded-lg shadow-xl min-h-[80vh] max-h-[95vh] flex flex-col">
      {/* Header - Responsivo e compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <DialogTitle asChild>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Descrição da Ocorrência
              </h3>
            </DialogTitle>
            <DialogDescription asChild>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                Ocorrência #{ocorrencia.id} - {ocorrencia.placa1 || 'Sem placa'}
              </p>
            </DialogDescription>
          </div>
        </div>
        
        {/* Status indicators - Responsivo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            {lastSaved && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Salvo às {formatLastSaved()}</span>
                <span className="sm:hidden">Salvo</span>
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Alterações não salvas</span>
                <span className="sm:hidden">Não salvo</span>
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={cancelar}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cancelar</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button 
                onClick={salvar} 
                disabled={isSaving}
                className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
                <span className="sm:hidden">{isSaving ? '...' : 'Salvar'}</span>
              </Button>
            </DialogClose>
          </div>
        </div>
      </div>

      {/* Editor Area - Melhor responsividade */}
      <div className="flex-1 p-3 sm:p-6 overflow-hidden min-h-0">
        <div className="h-full flex flex-col">
          {/* Toolbar - Responsivo e compacto */}
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="font-medium">Editor de Texto</span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-xs sm:text-sm">Enter para parágrafos</span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-xs sm:text-sm">Ctrl+S para salvar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Auto-save ativo
                </span>
              </div>
            </div>
          </div>

          {/* Text Area - Melhor scroll e responsividade */}
          <div className="flex-1 relative min-h-0">
            <textarea
              className="w-full h-full border-2 border-gray-200 rounded-lg p-3 sm:p-6 text-sm sm:text-base resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 overflow-y-auto"
              placeholder="Digite aqui a descrição detalhada da ocorrência..."
              value={descricao}
              onChange={handleDescricaoChange}
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.6',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'inherit'
              }}
              onKeyDown={(e) => {
                // Ctrl+S para salvar
                if (e.ctrlKey && e.key === 's') {
                  e.preventDefault();
                  salvar();
                }
              }}
            />
            
            {/* Character count - Responsivo */}
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
              {descricao.length} chars
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Responsivo e compacto */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span>📝 Editor de descrição</span>
            <span className="hidden sm:inline">•</span>
            <span>Formatação automática</span>
            <span className="hidden sm:inline">•</span>
            <span>Auto-save a cada 2s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <span className="hidden sm:inline">Ctrl+S para salvar manualmente</span>
              <span className="sm:hidden">Ctrl+S</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescricaoPopup;
