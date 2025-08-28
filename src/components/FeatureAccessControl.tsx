import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface FeatureAccessControlProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideIfNoAccess?: boolean;
}

export default function FeatureAccessControl({ 
  featureKey, 
  children, 
  fallback,
  hideIfNoAccess = false
}: FeatureAccessControlProps) {
  const { hasFeatureAccess } = usePermissions();

  if (!hasFeatureAccess(featureKey)) {
    if (hideIfNoAccess) {
      return null; // Não renderiza nada
    }
    return fallback || null;
  }

  return <>{children}</>;
}

// Hook para verificar se uma funcionalidade está disponível
export function useFeatureAccess(featureKey: string) {
  const { hasFeatureAccess } = usePermissions();
  return hasFeatureAccess(featureKey);
}
