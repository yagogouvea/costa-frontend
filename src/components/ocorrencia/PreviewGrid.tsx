import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '@/utils/cropImage';
import { Area } from 'react-easy-crop';
import { API_URL } from '@/config/api';

interface Foto {
  id: number | null;
  url: string;
  legenda: string;
  crop: { x: number; y: number };
  zoom: number;
  croppedArea?: Area;
  tempCrop?: { x: number; y: number };
  tempZoom?: number;
  tempCroppedArea?: Area;
  file?: File;
  blobUrl?: string;
}

interface PreviewGridProps {
  fotos: Foto[];
  onLegendaChange: (index: number, legenda: string) => void;
  onVoltar: () => void;
  onSalvar: () => void;
  onDelete: (index: number) => void;
}

function getFotoUrl(foto: Foto | null): string {
  if (!foto) return '';
  if (foto.blobUrl) return foto.blobUrl;
  if (foto.url && (foto.url.startsWith('blob:') || foto.url.startsWith('http'))) {
    return foto.url;
  }
  if (!foto.url) return '';
  
  // Remove duplicidade de /api/api/ se houver
  let cleanUrl = foto.url.replace(/^\/api\/api\//, '/api/');
  // Remove barra final do API_URL e barra inicial do url
  return `${API_URL.replace(/\/$/, '')}/${cleanUrl.replace(/^\//, '')}`;
}

export default function PreviewGrid({
  fotos,
  onLegendaChange,
  onVoltar,
  onSalvar,
  onDelete
}: PreviewGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [previewImages, setPreviewImages] = useState<Record<number, string>>({});

  const handleImageError = (index: number) => {
    console.error(`Erro ao carregar imagem ${index}:`, fotos[index].url);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Gerar preview cropado quando a foto mudar
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: Record<number, string> = {};

      for (let index = 0; index < fotos.length; index++) {
        const foto = fotos[index];
        const croppedArea = foto.tempCroppedArea || foto.croppedArea;
        const zoom = foto.tempZoom || foto.zoom;
        
        // Use blobUrl se existir
        let imageUrl = getFotoUrl(foto);
        
        console.log('🖼️ [PreviewGrid] Gerando preview para foto', index, {
          url: foto.url,
          file: !!foto.file,
          blobUrl: foto.blobUrl,
          imageUrl,
          croppedArea,
          zoom,
          hasTempCroppedArea: !!foto.tempCroppedArea,
          hasCroppedArea: !!foto.croppedArea
        });
        
        if (croppedArea) {
          try {
            const croppedImage = await getCroppedImg(
              imageUrl,
              croppedArea
            );
            console.log('🟢 Blob cropado:', croppedImage, 'Tamanho:', croppedImage.size);
            if (previewImages[index]) {
              URL.revokeObjectURL(previewImages[index]);
            }
            newPreviews[index] = URL.createObjectURL(croppedImage);
            console.log('✅ [PreviewGrid] Preview cropado gerado para foto', index);
          } catch (error) {
            console.error('❌ [PreviewGrid] Erro ao gerar preview cropado:', error);
            newPreviews[index] = imageUrl;
          }
        } else {
          newPreviews[index] = imageUrl;
          console.log('📷 [PreviewGrid] Usando imagem original para foto', index);
        }
      }

      setPreviewImages(newPreviews);
    };

    generatePreviews();

    // Cleanup
    return () => {
      Object.values(previewImages).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [fotos]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Preview das Fotos</h3>
        <p className="text-sm text-gray-600 mt-1">
          Visualize todas as fotos com suas legendas antes de salvar
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {fotos.map((foto, i) => (
          <div key={foto.id ?? i} className="flex gap-4 items-start bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* Thumbnail */}
            <div className="w-48 h-36 rounded overflow-hidden border bg-gray-50 shadow-sm flex-shrink-0">
              {imageErrors[i] ? (
                <div className="w-full h-full flex items-center justify-center text-red-500 text-sm p-2 text-center">
                  Erro ao carregar imagem
                </div>
              ) : (
                <img
                  src={previewImages[i] || getFotoUrl(foto)}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(i)}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Foto info */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Foto {i + 1} de {fotos.length}
                </span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(i)}
                  className="flex-shrink-0"
                >
                  Excluir
                </Button>
              </div>

              {/* Legenda input */}
              <div className="relative">
                <label 
                  htmlFor={`legenda-${i}`}
                  className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-600 bg-white z-10"
                >
                  Legenda
                </label>
                <input
                  id={`legenda-${i}`}
                  type="text"
                  value={foto.legenda}
                  onChange={(e) => onLegendaChange(i, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-white shadow-sm"
                  placeholder="Descreva esta imagem..."
                />
              </div>

              {/* Foto details */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Zoom: {Math.round((foto.tempZoom || foto.zoom) * 100)}%</span>
                <span>Crop: {foto.tempCroppedArea ? 'Aplicado' : 'Original'}</span>
              </div>
            </div>
          </div>
        ))}

        {fotos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma foto adicionada ainda.</p>
            <p className="text-sm mt-1">Adicione fotos no modo editor.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {fotos.length} foto{fotos.length !== 1 ? 's' : ''} no total
          </div>
          <div className="flex gap-2">
            <Button onClick={onVoltar} variant="ghost">
              Voltar ao Editor
            </Button>
            <Button onClick={onSalvar}>
              Salvar Todas as Fotos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
