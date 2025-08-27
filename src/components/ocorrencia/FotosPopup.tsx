import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Ocorrencia, Foto as FotoType } from '@/types/ocorrencia';
import { createImage, getCroppedImg } from '@/utils/cropImage';
import { Area } from 'react-easy-crop';
import api from '@/services/api';
import axios from 'axios';
import { supabase } from '@/services/supabaseClient';
import { API_URL } from '@/config/api';
import { useMediaQuery } from 'react-responsive';
import CropEditor from './CropEditor';
import PreviewGrid from './PreviewGrid';
import { X, Upload, Eye, Trash2, Save } from 'lucide-react';

// Configuração da API baseada no ambiente
const API_BASE = API_URL;

// Instância específica para uploads sem Content-Type padrão
const uploadApi = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    // Não definir Content-Type para deixar o navegador definir automaticamente
  }
});

// Adicionar token de autenticação
uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('segtrack.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface FotoResponse {
  id: number;
  url: string;
  legenda: string;
  cropX?: number;
  cropY?: number;
  zoom?: number;
  cropArea?: any;
  arquivoExiste?: boolean;
  erroArquivo?: string | null;
}

interface FotoState extends FotoType {
  crop: { x: number; y: number };
  zoom: number;
  croppedArea?: Area;
  croppedImageUrl?: string;
  tempCrop?: { x: number; y: number };
  tempZoom?: number;
  tempCroppedArea?: Area;
  isEdited: boolean;
  file?: File;
  blobUrl?: string;
}

interface FotosPopupProps {
  ocorrencia: Ocorrencia;
  onClose: () => void;
  onUpdate?: (atualizada: Ocorrencia) => void;
}

// Função para resolver a URL da foto corretamente, sem duplicar /api/
const resolveFotoUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Se já começa com /api/uploads, remove o /api extra do API_URL
  if (url.startsWith('/api/uploads')) {
    // Remove /api do final do API_URL se existir
    return `${API_URL.replace(/\/api$/, '')}${url}`;
  }
  // Se começa com /uploads, só concatena
  if (url.startsWith('/uploads')) {
    return `${API_URL.replace(/\/api$/, '')}${url}`;
  }
  // Caso contrário, comportamento padrão
  return `${API_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

// Função para garantir área de crop padrão
const getDefaultCropArea = (imageWidth: number, imageHeight: number): Area => {
  const minSize = Math.min(imageWidth, imageHeight);
  const cropSize = Math.min(minSize * 0.8, 300); // 80% do menor lado ou 300px máximo
  
  return {
    x: (imageWidth - cropSize) / 2,
    y: (imageHeight - cropSize) / 2,
    width: cropSize,
    height: cropSize
  };
};

export default function FotosPopup({ ocorrencia, onClose, onUpdate }: FotosPopupProps) {
  const [fotos, setFotos] = useState<FotoState[]>([]);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Prevenir saída acidental no mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (fotos.some(f => f.isEdited)) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (fotos.some(f => f.isEdited)) {
        e.preventDefault();
        setShowExitConfirm(true);
        // Restaurar o histórico
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobile, fotos]);

  useEffect(() => {
    const carregarFotos = async () => {
      try {
        setLoading(true);
        console.log('📷 Carregando fotos para ocorrência:', ocorrencia.id);
        const res = await api.get<FotoResponse[]>(`/api/v1/fotos/por-ocorrencia/${ocorrencia.id}`);
        console.log('📷 Fotos recebidas da API:', res.data);
        
        const carregadas = await Promise.all(res.data.map(async (f) => {
          // Garante que não haja duplicidade de fotos pelo id
          const url = resolveFotoUrl(f.url);
          try {
            const img = await createImage(url);
            
            // Garantir que temos valores válidos de crop e zoom
            const cropX = Number(f.cropX) || 0;
            const cropY = Number(f.cropY) || 0;
            const zoom = Number(f.zoom) || 1;
            
            // Parse cropArea com tratamento de erro
            let croppedArea = null;
            try {
              if (f.cropArea) {
                croppedArea = typeof f.cropArea === 'string' ? JSON.parse(f.cropArea) : f.cropArea;
              }
            } catch (parseError) {
              console.warn('Erro ao parsear cropArea:', parseError);
              croppedArea = null;
            }
            
            // Se não há área de crop definida, criar uma padrão
            let finalCroppedArea = croppedArea;
            if (!finalCroppedArea) {
              finalCroppedArea = getDefaultCropArea(img.naturalWidth, img.naturalHeight);
            }
            
            console.log('📸 Foto carregada:', {
              id: f.id,
              url,
              cropX,
              cropY,
              zoom,
              croppedArea: finalCroppedArea
            });
            
            return {
              id: f.id,
              url,
              legenda: f.legenda || '',
              crop: { x: cropX, y: cropY },
              zoom: zoom,
              croppedArea: finalCroppedArea,
              croppedImageUrl: undefined,
              tempCrop: { x: cropX, y: cropY },
              tempZoom: zoom,
              tempCroppedArea: finalCroppedArea,
              isEdited: false,
              file: undefined,
              blobUrl: undefined
            } as FotoState;
          } catch (error) {
            // Fallback para URL alternativa
            try {
              const alternativeUrl = f.url.startsWith('http') ? f.url : `http://localhost:8080${f.url}`;
              const img = await createImage(alternativeUrl);
              
              // Garantir que temos valores válidos de crop e zoom
              const cropX = Number(f.cropX) || 0;
              const cropY = Number(f.cropY) || 0;
              const zoom = Number(f.zoom) || 1;
              const croppedArea = typeof f.cropArea === 'string' ? JSON.parse(f.cropArea) : f.cropArea;
              
              // Se não há área de crop definida, criar uma padrão
              let finalCroppedArea = croppedArea;
              if (!finalCroppedArea) {
                finalCroppedArea = getDefaultCropArea(img.naturalWidth, img.naturalHeight);
              }
              
              return {
                id: f.id,
                url: alternativeUrl,
                legenda: f.legenda || '',
                crop: { x: cropX, y: cropY },
                zoom: zoom,
                croppedArea: finalCroppedArea,
                croppedImageUrl: undefined,
                tempCrop: { x: cropX, y: cropY },
                tempZoom: zoom,
                tempCroppedArea: finalCroppedArea,
                isEdited: false,
                file: undefined,
                blobUrl: undefined
              } as FotoState;
            } catch (secondError) {
              return null;
            }
          }
        }));
        // Remove duplicadas pelo id e limpa o estado antes de setar
        const fotosUnicas = carregadas
          .filter((foto): foto is FotoState => foto !== null && !!foto.id && !!foto.url) // só fotos válidas
          .filter((foto, idx, arr) => arr.findIndex(f => f.id === foto.id) === idx);
        setFotos(fotosUnicas as FotoState[]);
        setFotoIndex(0);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          console.log('📷 Nenhuma foto encontrada para esta ocorrência');
          setFotos([]); // Nenhuma foto encontrada, não trava
        } else {
          console.error('❌ Erro ao carregar fotos:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    carregarFotos();
  }, [ocorrencia.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      const novasFotos: FotoState[] = await Promise.all(files.map(async (f) => {
        const blobUrl = URL.createObjectURL(f);
        const img = await createImage(blobUrl); // Garante que a imagem é válida
        const defaultArea = getDefaultCropArea(img.naturalWidth, img.naturalHeight);
        return {
          id: null,
          url: blobUrl, // Usar blobUrl como url para preview
          file: f,
          blobUrl, // Salvar blobUrl para preview
          legenda: '',
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedArea: defaultArea,
          croppedImageUrl: undefined,
          tempCrop: { x: 0, y: 0 },
          tempZoom: 1,
          tempCroppedArea: defaultArea,
          isEdited: true
        };
      }));
      setFotos(prev => [...prev, ...novasFotos]);
      setFotoIndex(prev => prev + novasFotos.length); // abre o editor para a primeira nova foto
      setPreviewMode(false); // garante que está no modo editor
      e.target.value = '';
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
    }
  };

  const handleDelete = async (index: number) => {
    const foto = fotos[index];
    if (foto.id) {
      try {
        await api.delete(`/api/v1/fotos/${foto.id}`);
      } catch (error) {
        console.error('Erro ao deletar foto:', error);
      }
    }
    // Revogar blobUrl se existir
    if (foto.blobUrl) {
      URL.revokeObjectURL(foto.blobUrl);
    }
    const atualizadas = fotos.filter((_, i) => i !== index);
    setFotos(atualizadas);
    if (fotoIndex >= atualizadas.length) {
      setFotoIndex(Math.max(atualizadas.length - 1, 0));
    }
  };

  const handleCropChange = (crop: { x: number; y: number }) => {
    if (fotos[fotoIndex]) {
      setFotos(prev => prev.map((f, idx) => 
        idx === fotoIndex 
          ? { ...f, tempCrop: crop, isEdited: true }
          : f
      ));
    }
  };

  const handleZoomChange = (zoom: number) => {
    if (fotos[fotoIndex]) {
      setFotos(prev => prev.map((f, idx) => 
        idx === fotoIndex 
          ? { ...f, tempZoom: zoom, isEdited: true }
          : f
      ));
    }
  };

  const handleCropComplete = (area: Area) => {
    if (fotos[fotoIndex]) {
      console.log('📐 Crop completo:', {
        fotoIndex,
        area,
        isMobile
      });
      setFotos(prev => prev.map((f, idx) => 
        idx === fotoIndex 
          ? { ...f, tempCroppedArea: area, isEdited: true }
          : f
      ));
    }
  };

  const handleLegendaChange = (legenda: string) => {
    if (fotos[fotoIndex]) {
      setFotos(prev => prev.map((f, idx) => 
        idx === fotoIndex 
          ? { ...f, legenda, isEdited: true }
          : f
      ));
    }
  };

  const handleLegendaChangeInGrid = (index: number, legenda: string) => {
    setFotos(prev => prev.map((f, idx) => 
      idx === index 
        ? { ...f, legenda, isEdited: true }
        : f
    ));
  };

  const handleClose = () => {
    if (isMobile && fotos.some(f => f.isEdited)) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const salvarFinal = async () => {
    try {
      setLoading(true);
      // Verificar se o Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        alert('❌ Supabase não está configurado! Verifique o arquivo .env do frontend e as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
        return;
      }
      
      for (const foto of fotos) {
        if (!foto || foto === null) { continue; } // Garante que não é null
        const legendaFinal = foto.legenda || '';

        if (!foto.id) {
          // Nova foto: gerar imagem já cortada/zoomada antes do upload
          let publicUrl: string | null = null;
          let isSupabase = false;
          
          // Tentar Supabase primeiro
          try {
            let area = (foto.tempCroppedArea || foto.croppedArea);
            if (!area) {
              try {
                let img;
                if (foto.file) {
                  const tempUrl = URL.createObjectURL(foto.file);
                  img = await createImage(tempUrl);
                  URL.revokeObjectURL(tempUrl);
                } else {
                  img = await createImage(foto.url);
                }
                area = getDefaultCropArea(img.naturalWidth, img.naturalHeight);
                console.log('🔧 Usando área de crop padrão:', area);
              } catch (error) {
                console.warn('⚠️ Erro ao criar área de crop padrão:', error);
                continue;
              }
            }
            
            console.log('🔧 Aplicando crop/zoom:', {
              area,
              zoom: foto.tempZoom || foto.zoom,
              url: foto.url
            });
            
            let imageSrc = foto.file ? URL.createObjectURL(foto.file) : foto.url;
            const croppedBlob = await getCroppedImg(
              imageSrc,
              area
            );
            if (foto.file) URL.revokeObjectURL(imageSrc);
            
            const fileToSend = new File([croppedBlob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
            console.log('📤 Upload para Supabase:', filename);
            
            const { error: uploadError } = await supabase.storage.from('segtrackfotos').upload(filename, fileToSend, {
              contentType: fileToSend.type || 'image/jpeg',
            });
            
            if (uploadError) {
              throw new Error(`Supabase upload failed: ${uploadError.message}`);
            }
            
            const { data: urlData } = supabase.storage.from('segtrackfotos').getPublicUrl(filename);
            publicUrl = urlData?.publicUrl;
            
            if (!publicUrl) {
              throw new Error('Supabase retornou URL vazia!');
            }
            
            isSupabase = true;
            console.log('✅ Upload para Supabase bem-sucedido:', publicUrl);
            
          } catch (supabaseError) {
            console.error('❌ Erro no upload para Supabase:', supabaseError);
            
            // Perguntar se quer tentar o backend local
            const useBackend = confirm(
              '❌ Erro ao conectar com o Supabase!\n\n' +
              'Possíveis causas:\n' +
              '• URL do Supabase incorreta\n' +
              '• Bucket "segtrackfotos" não existe\n' +
              '• Problema de conectividade\n\n' +
              'Deseja tentar fazer upload para o servidor local (Railway)?\n\n' +
              'Clique OK para usar Railway ou Cancelar para abortar.'
            );
            
            if (!useBackend) {
              return;
            }
            
            try {
              // Fallback para backend local
              console.log('🔄 Tentando upload para backend local...');
              let area = (foto.tempCroppedArea || foto.croppedArea);
              if (!area) {
                // Se não há área de crop definida, criar uma padrão
                try {
                  let img;
                  if (foto.file) {
                    const tempUrl = URL.createObjectURL(foto.file);
                    img = await createImage(tempUrl);
                    URL.revokeObjectURL(tempUrl);
                  } else {
                    img = await createImage(foto.url);
                  }
                  area = getDefaultCropArea(img.naturalWidth, img.naturalHeight);
                  console.log('🔧 Usando área de crop padrão (fallback):', area);
                } catch (error) {
                  console.warn('⚠️ Erro ao criar área de crop padrão (fallback):', error);
                  continue;
                }
              }
              
              console.log('🔧 Aplicando crop/zoom (fallback):', {
                area,
                zoom: foto.tempZoom || foto.zoom,
                url: foto.url
              });
              
              let imageSrc = foto.file ? URL.createObjectURL(foto.file) : foto.url;
              const croppedBlob = await getCroppedImg(
                imageSrc,
                area
              );
              if (foto.file) URL.revokeObjectURL(imageSrc);
              const fileToSend = new File([croppedBlob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
              const formData = new FormData();
              formData.append('foto', fileToSend, `foto-${Date.now()}.jpg`);
              formData.append('legenda', legendaFinal);
              formData.append('ocorrenciaId', ocorrencia.id.toString());
              const response = await uploadApi.post('/api/fotos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              publicUrl = response.data.url;
              isSupabase = false;
              console.log('✅ Upload para backend local bem-sucedido:', publicUrl);
            } catch (backendError) {
              console.error('❌ Erro no backend local também:', backendError);
              alert('❌ Erro ao salvar foto: Não foi possível conectar com Supabase nem com o servidor local.\n\nVerifique:\n1. Se o Supabase está configurado corretamente\n2. Se o servidor local está rodando\n3. Sua conexão com a internet');
              return;
            }
          }
          
          if (!publicUrl || !ocorrencia.id) {
            alert('Erro: URL da imagem ou ocorrência não definida!');
            return;
          }
          
          // Salvar no backend a URL completa se for Supabase, relativa se for local
          const urlToSave = isSupabase ? publicUrl : publicUrl.replace(/^https?:\/\/[^\/]+/, '');
          console.log('💾 Salvando foto no backend:', {
            url: urlToSave,
            legenda: legendaFinal,
            ocorrenciaId: ocorrencia.id,
            isSupabase
          });
          
          const fotoSalva = await api.post('/api/v1/fotos/create', {
            url: urlToSave,
            legenda: legendaFinal,
            ocorrenciaId: ocorrencia.id
          });
          
          // Atualiza o id e a url da foto no estado local para evitar novo POST e garantir URL pública
          foto.id = fotoSalva.data.id;
          if (isSupabase && publicUrl) {
            foto.url = publicUrl;
          } else if (!isSupabase && publicUrl) {
            foto.url = publicUrl.replace(/^https?:\/\/[^\/]+/, '');
          }
        } else if (foto.isEdited) {
          // Atualizar foto existente
          const updateData: any = { legenda: legendaFinal };
          
          // Sempre salvar os dados de crop/zoom, mesmo se não houver área de crop
          const currentCrop = foto.tempCrop || foto.crop;
          const currentZoom = foto.tempZoom || foto.zoom;
          const currentCroppedArea = foto.tempCroppedArea || foto.croppedArea;
          
          updateData.cropX = currentCrop.x;
          updateData.cropY = currentCrop.y;
          updateData.zoom = currentZoom;
          
          if (currentCroppedArea) {
            updateData.cropArea = JSON.stringify(currentCroppedArea);
          }
          
          console.log('💾 Atualizando foto:', {
            id: foto.id,
            updateData
          });
          
          await api.put(`/api/v1/fotos/${foto.id}`, updateData);
        }
      }
      if (onUpdate) {
        const ocorrenciaAtualizada = {
          ...ocorrencia,
          fotos: fotos.map(({ id, url, legenda, cropX, cropY, zoom, cropArea }) => ({
            id,
            url,
            legenda,
            cropX,
            cropY,
            zoom,
            cropArea
          }))
        };
        onUpdate(ocorrenciaAtualizada);
      }
      onClose();
    } catch (error: any) {
      if (error.response) {
        console.error('Erro ao salvar edições:', error.response.status, error.response.data);
        alert('Erro ao salvar edições das fotos: ' + error.response.status + ' - ' + JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('Erro ao salvar edições (request):', error.request);
        alert('Erro ao salvar edições das fotos: erro de request');
      } else {
        console.error('Erro ao salvar edições (outro):', error.message);
        alert('Erro ao salvar edições das fotos: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    setPreviewMode(false);
  };

  const handleSalvar = () => {
    salvarFinal();
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header moderno - responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Fotos da Ocorrência</h2>
          <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full">
            {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Fechar</span>
          </Button>
          {!previewMode && (
            <Button
              onClick={salvarFinal}
              disabled={loading}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{loading ? 'Salvando...' : 'Salvar'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Carregando fotos...</p>
            </div>
          </div>
        ) : previewMode ? (
          // Modo Preview - mostrar PreviewGrid
          <div className="flex-1 overflow-hidden">
            <PreviewGrid
              fotos={fotos}
              onLegendaChange={handleLegendaChangeInGrid}
              onVoltar={handleVoltar}
              onSalvar={handleSalvar}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          // Modo Editor - mostrar CropEditor
          <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 sm:gap-4 lg:gap-6 overflow-hidden p-3 sm:p-4 lg:p-6`}>
            {/* Galeria de fotos - Container com scroll */}
            <div className={`${isMobile ? 'w-full' : 'w-64 sm:w-72 lg:w-80'} flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Galeria</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Upload size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </div>
              
              <div className={`${isMobile ? 'flex flex-row overflow-x-auto pb-2 sm:pb-3' : 'flex flex-col overflow-y-auto'} gap-2 sm:gap-3 ${isMobile ? 'max-h-28 sm:max-h-32' : 'max-h-[calc(100vh-280px)]'}`} 
                   style={{ 
                     scrollbarWidth: 'thin',
                     msOverflowStyle: 'none'
                   }}>
                <style>{`
                  .mobile-gallery::-webkit-scrollbar {
                    height: 3px;
                  }
                  .mobile-gallery::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 2px;
                  }
                  .mobile-gallery::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 2px;
                  }
                  .desktop-gallery::-webkit-scrollbar {
                    width: 4px;
                  }
                  .desktop-gallery::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 2px;
                  }
                  .desktop-gallery::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 2px;
                  }
                  .desktop-gallery::-webkit-scrollbar-thumb:hover {
                    background: #a1a1a1;
                  }
                `}</style>
                <div className={`flex ${isMobile ? 'flex-row gap-2 sm:gap-3 mobile-gallery' : 'flex-col gap-2 sm:gap-3 desktop-gallery'} items-center`}>
                  {fotos.map((foto, idx) => (
                    <div
                      key={foto.id || idx}
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        fotoIndex === idx 
                          ? 'ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2' 
                          : 'hover:ring-2 hover:ring-gray-300 ring-offset-1 sm:ring-offset-2'
                      }`}
                      onClick={() => setFotoIndex(idx)}
                    >
                      <img
                        src={foto.url}
                        alt={foto.legenda || `Foto ${idx + 1}`}
                        className={`object-cover rounded-lg ${isMobile ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32'} transition-transform duration-200 group-hover:scale-105`}
                      />
                      {foto.isEdited && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    className={`flex items-center justify-center ${isMobile ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32'} border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200`}
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400" />
                  </Button>
                </div>
              </div>
              
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
            </div>

            {/* Área de edição da foto selecionada */}
            {fotos[fotoIndex] && (
              <div className={`flex-1 flex flex-col ${isMobile ? 'min-h-0' : 'min-h-[60vh] sm:min-h-[70vh]'} bg-white rounded-xl shadow-sm border border-gray-200`}>
                <div className={`flex-1 ${isMobile ? 'min-h-0 overflow-hidden' : 'min-h-[50vh] sm:min-h-[60vh]'} p-3 sm:p-4`}>
                  {(() => {
                    const currentFoto = fotos[fotoIndex];
                    console.log('🔍 Debug CropEditor:', {
                      fotoIndex,
                      fotoId: currentFoto.id,
                      imageUrl: currentFoto.url,
                      hasImage: !!currentFoto.url,
                      crop: currentFoto.tempCrop || currentFoto.crop,
                      zoom: currentFoto.tempZoom || currentFoto.zoom
                    });
                    
                    return (
                      <CropEditor
                        image={currentFoto.url}
                        crop={currentFoto.tempCrop || currentFoto.crop}
                        zoom={currentFoto.tempZoom || currentFoto.zoom}
                        onCropChange={handleCropChange}
                        onZoomChange={handleZoomChange}
                        onCropComplete={handleCropComplete}
                        legenda={currentFoto.legenda}
                        onLegendaChange={handleLegendaChange}
                      />
                    );
                  })()}
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(fotoIndex)}
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Eye size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmação para sair */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-sm w-full mx-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Atenção</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Você tem alterações não salvas. Deseja sair mesmo assim?
            </p>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button variant="ghost" onClick={handleCancelExit} size="sm" className="text-xs sm:text-sm">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmExit} size="sm" className="text-xs sm:text-sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
