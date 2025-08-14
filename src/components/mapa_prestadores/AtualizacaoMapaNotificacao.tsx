import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface AtualizacaoMapaNotificacaoProps {
  isVisible: boolean;
  onClose: () => void;
  tipo: 'atualizado' | 'criado' | 'excluido' | 'automatico';
}

const AtualizacaoMapaNotificacao: React.FC<AtualizacaoMapaNotificacaoProps> = ({
  isVisible,
  onClose,
  tipo
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getMensagem = () => {
    switch (tipo) {
      case 'atualizado':
        return 'Prestador atualizado no mapa!';
      case 'criado':
        return 'Novo prestador adicionado ao mapa!';
      case 'excluido':
        return 'Prestador removido do mapa!';
      case 'automatico':
        return 'Mapa atualizado automaticamente!';
      default:
        return 'Mapa atualizado!';
    }
  };

  const getIcone = () => {
    switch (tipo) {
      case 'automatico':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${isAnimating ? 'animate-pulse' : ''}
    `}>
      <div className="flex items-center gap-2">
        {getIcone()}
        <span className="text-sm font-medium">{getMensagem()}</span>
      </div>
    </div>
  );
};

export default AtualizacaoMapaNotificacao; 