import { useEffect } from 'react';

// Hook para atualizar automaticamente o mapa quando prestadores são modificados
export const useMapaAutoUpdate = () => {
  useEffect(() => {
    console.log('🎯 [useMapaAutoUpdate] Hook inicializado');
    
    // Função para forçar atualização do mapa
    const forcarAtualizacaoMapa = () => {
      console.log('🔄 [useMapaAutoUpdate] Tentando forçar atualização do mapa...');
      if (typeof window !== 'undefined' && (window as any).atualizarPrestadoresMapa) {
        console.log('✅ [useMapaAutoUpdate] Função global encontrada, executando...');
        (window as any).atualizarPrestadoresMapa();
      } else {
        console.log('❌ [useMapaAutoUpdate] Função global não encontrada:', {
          windowExists: typeof window !== 'undefined',
          functionExists: typeof (window as any)?.atualizarPrestadoresMapa !== 'undefined'
        });
      }
    };

    // Listener para eventos de modificação de prestadores
    const handlePrestadorModificado = (event: Event) => {
      console.log('🎯 [useMapaAutoUpdate] Evento capturado:', event.type);
      // Aguardar um pouco para garantir que o backend processou a atualização
      setTimeout(() => {
        console.log('⏰ [useMapaAutoUpdate] Executando atualização após delay...');
        forcarAtualizacaoMapa();
      }, 1000);
    };

    // Adicionar listener para eventos customizados
    console.log('🎯 [useMapaAutoUpdate] Adicionando listeners para eventos...');
    window.addEventListener('prestador-atualizado', handlePrestadorModificado);
    window.addEventListener('prestador-criado', handlePrestadorModificado);
    window.addEventListener('prestador-excluido', handlePrestadorModificado);

    return () => {
      console.log('🎯 [useMapaAutoUpdate] Removendo listeners...');
      window.removeEventListener('prestador-atualizado', handlePrestadorModificado);
      window.removeEventListener('prestador-criado', handlePrestadorModificado);
      window.removeEventListener('prestador-excluido', handlePrestadorModificado);
    };
  }, []);
};

// Função para disparar evento de atualização
export const dispararAtualizacaoMapa = (tipo: 'atualizado' | 'criado' | 'excluido') => {
  if (typeof window !== 'undefined') {
    console.log(`🔄 [dispararAtualizacaoMapa] Disparando evento: prestador-${tipo}`);
    const event = new CustomEvent(`prestador-${tipo}`);
    window.dispatchEvent(event);
    console.log(`✅ [dispararAtualizacaoMapa] Evento disparado com sucesso: prestador-${tipo}`);
  } else {
    console.log('❌ [dispararAtualizacaoMapa] Window não está disponível');
  }
}; 