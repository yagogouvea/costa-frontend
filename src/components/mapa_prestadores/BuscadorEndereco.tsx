import React, { useState, useEffect, useRef } from 'react';
import { geocodingService, type SugestaoEndereco } from '@/services/geocodingService';
import { useDebounce } from '@/hooks/useDebounce';

console.log('📦 BuscadorEndereco: Imports carregados');
console.log('🔧 geocodingService:', geocodingService);

interface BuscadorEnderecoProps {
  onBuscar: (valor: string) => void;
}

const BuscadorEndereco: React.FC<BuscadorEnderecoProps> = ({ onBuscar }) => {
  console.log('🎯 BuscadorEndereco: Componente renderizado');
  
  const [valor, setValor] = useState('');
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const sugestoesRef = useRef<HTMLDivElement>(null);

  // Debounce para evitar muitas requisições
  const debouncedValor = useDebounce(valor, 100);

  const handleSugestaoClick = (sugestao: SugestaoEndereco) => {
    setValor(sugestao.enderecoCompleto);
    onBuscar(sugestao.enderecoCompleto);
    setShowSugestoes(false);
    setSugestaoSelecionada(-1);
  };

  // Buscar sugestões quando o valor mudar
  useEffect(() => {
    const buscarSugestoes = async () => {
      console.log('🔍 Buscando sugestões para:', debouncedValor);
      
      if (debouncedValor.length < 3) {
        console.log('❌ Texto muito curto, não buscando');
        setSugestoes([]);
        setShowSugestoes(false);
        return;
      }

      // Não buscar se for coordenada ou CEP
      if (geocodingService.isCoordenada(debouncedValor) || geocodingService.isCEP(debouncedValor)) {
        console.log('❌ É coordenada ou CEP, não buscando sugestões');
        setSugestoes([]);
        setShowSugestoes(false);
        return;
      }

      console.log('✅ Iniciando busca de sugestões...');
      setCarregando(true);
      try {
        const sugestoesEncontradas = await geocodingService.buscarSugestoes(debouncedValor);
        console.log('📋 Sugestões encontradas:', sugestoesEncontradas);
        setSugestoes(sugestoesEncontradas);
        setShowSugestoes(sugestoesEncontradas.length > 0);
        setSugestaoSelecionada(-1);
      } catch (error) {
        console.error('❌ Erro ao buscar sugestões:', error);
        setSugestoes([]);
        setShowSugestoes(false);
      } finally {
        setCarregando(false);
      }
    };

    buscarSugestoes();
  }, [debouncedValor]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        sugestoesRef.current && 
        !sugestoesRef.current.contains(event.target as Node)
      ) {
        setShowSugestoes(false);
        setSugestaoSelecionada(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor.trim()) {
      onBuscar(valor.trim());
      setShowSugestoes(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (sugestaoSelecionada >= 0 && sugestoes[sugestaoSelecionada]) {
        // Selecionar sugestão
        const sugestao = sugestoes[sugestaoSelecionada];
        setValor(sugestao.enderecoCompleto);
        onBuscar(sugestao.enderecoCompleto);
        setShowSugestoes(false);
      } else if (valor.trim()) {
        // Buscar valor atual
        onBuscar(valor.trim());
        setShowSugestoes(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSugestaoSelecionada(prev => 
        prev < sugestoes.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSugestaoSelecionada(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSugestoes(false);
      setSugestaoSelecionada(-1);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleBuscar} className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm"
              placeholder="🔍 Endereço, coordenadas ou CEP..."
              value={valor}
              onChange={e => {
                console.log('📝 Input onChange:', e.target.value);
                setValor(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => {}}
              onBlur={() => setTimeout(() => {}, 200)}
            />
            
            {/* Indicador de carregamento */}
            {carregando && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
              </div>
            )}
            
            {/* Indicador de tipo de busca dentro do input */}
            {valor.trim() && !carregando && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm">
                {valor.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) ? (
                  <span className="text-blue-600" title="Coordenadas detectadas">📍</span>
                ) : valor.match(/^\d{5}-?\d{3}$/) ? (
                  <span className="text-green-600" title="CEP detectado">📮</span>
                ) : (
                  <span className="text-gray-400" title="Endereço">🏠</span>
                )}
              </div>
            )}
          </div>
          
          {/* Sugestões de endereço modernizadas */}
          {showSugestoes && sugestoes.length > 0 && (
            <div 
              ref={sugestoesRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50"
            >
              <div className="p-1">
                <div className="text-xs text-gray-500 px-3 py-2 font-medium">Sugestões:</div>
                {sugestoes.map((sugestao, index) => (
                  <div
                    key={sugestao.id}
                    className={`px-3 py-2 cursor-pointer rounded-md transition-all duration-150 ${
                      index === sugestaoSelecionada 
                        ? 'bg-blue-50 border-l-3 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSugestaoClick(sugestao)}
                  >
                    <div className="font-medium text-gray-900 text-sm">{sugestao.descricao}</div>
                    <div className="text-xs text-gray-600 mt-0.5 truncate">{sugestao.enderecoCompleto}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5 shadow-sm hover:shadow-md text-sm"
          onClick={() => {
            if (valor.trim()) {
              onBuscar(valor.trim());
              setShowSugestoes(false);
            }
          }}
        >
          <span>🎯</span>
          <span>Buscar</span>
        </button>
      </form>
    </div>
  );
};

export default BuscadorEndereco; 