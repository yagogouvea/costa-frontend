import React, { useCallback, memo } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { useMediaQuery } from 'react-responsive';

interface CropEditorProps {
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (area: Area) => void;
  legenda: string;
  onLegendaChange: (legenda: string) => void;
}

const CropEditor = memo(({
  image,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  legenda,
  onLegendaChange
}: CropEditorProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Debug logs
  console.log('🔍 CropEditor props:', {
    image,
    hasImage: !!image,
    imageLength: image?.length,
    crop,
    zoom,
    legenda
  });

  const handleCropChange = useCallback((newCrop: { x: number; y: number }) => {
    onCropChange(newCrop);
  }, [onCropChange]);

  const handleZoomChange = useCallback((newZoom: number) => {
    const limitedZoom = Math.min(Math.max(newZoom, 1), 3);
    onZoomChange(limitedZoom);
  }, [onZoomChange]);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    onCropComplete(croppedAreaPixels);
  }, [onCropComplete]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleZoomChange(parseFloat(e.target.value));
  }, [handleZoomChange]);

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'gap-3' : 'gap-4'}`}>
      {/* Crop Area */}
      <div className={`flex-1 relative w-full bg-black rounded-lg overflow-hidden border border-gray-300`} style={{ minHeight: isMobile ? '300px' : '400px' }}>
        {image ? (
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={undefined}
            onCropChange={handleCropChange}
            onZoomChange={handleZoomChange}
            onCropComplete={handleCropComplete}
            objectFit="contain"
            restrictPosition={true}
            minZoom={1}
            maxZoom={3}
            cropShape="rect"
            showGrid={true}
            classes={{
              containerClassName: 'relative h-full w-full',
              mediaClassName: 'max-h-full object-contain',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p>Nenhuma imagem selecionada</p>
              <p className="text-sm mt-1">URL: {image || 'undefined'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`flex-shrink-0 space-y-4 ${isMobile ? 'p-2' : 'p-4'} bg-gray-50 rounded-lg border border-gray-200`}>
        {/* Zoom Control */}
        <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-3'}`}>
          <div className="flex items-center justify-between">
            <label className={`font-medium text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Zoom
            </label>
            <span className={`text-sm font-mono text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 1) / 2) * 100}%, #e5e7eb ${((zoom - 1) / 2) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Legenda Input */}
        <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-3'}`}>
          <div className="relative">
            <label 
              htmlFor="legenda-input"
              className={`absolute -top-2.5 left-3 px-1 font-medium text-gray-600 bg-gray-50 z-10 ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              Legenda da Foto
            </label>
            <input
              id="legenda-input"
              type="text"
              value={legenda}
              onChange={(e) => onLegendaChange(e.target.value)}
              className={`w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-white shadow-sm ${isMobile ? 'py-2 text-sm' : 'py-3 text-base'}`}
              placeholder="Descreva esta imagem..."
            />
          </div>
        </div>

        {/* Instructions */}
        <div className={`text-xs text-gray-500 ${isMobile ? 'text-center' : ''}`}>
          <p>💡 Dica: Arraste para mover, use o slider para zoom, clique e arraste para recortar</p>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
});

CropEditor.displayName = 'CropEditor';

export default CropEditor;
