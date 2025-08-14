import React from 'react';
import MapaPrestadores from '@/components/mapa_prestadores/MapaPrestadores';
import { PrestadoresProvider } from '@/contexts/PrestadoresContext';
import { useMapaAutoUpdate } from '@/hooks/useMapaAutoUpdate';
import RequirePermission from '@/components/RequirePermission';

const MapaPrestadoresPage: React.FC = () => {
  console.log('🎯 MapaPrestadoresPage: Página renderizada');
  
  // Hook para atualização automática do mapa
  useMapaAutoUpdate();

  return (
    <RequirePermission requiredPermission="read:prestador">
      <PrestadoresProvider autoRefresh={true} refreshInterval={5000}>
        <MapaPrestadores />
      </PrestadoresProvider>
    </RequirePermission>
  );
};

export default MapaPrestadoresPage; 