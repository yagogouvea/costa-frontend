import { useAuth } from '../contexts/AuthContext';
import { hasPageAccess, hasFeatureAccess } from '../constants/permissions';

export function usePermissions() {
  const { user } = useAuth();
  
  console.log('🔍 usePermissions - Debug:');
  console.log('🔍 usePermissions - User:', user);
  console.log('🔍 usePermissions - User permissions:', user?.permissions);
  console.log('🔍 usePermissions - User role:', user?.role);
  
  if (!user || !user.permissions) {
    console.log('🔍 usePermissions - Usuário ou permissões não encontradas');
    return {
      hasPageAccess: () => false,
      hasFeatureAccess: () => false,
      userPermissions: [],
      isAdmin: false
    };
  }

  const userPermissions = Array.isArray(user.permissions) 
    ? user.permissions 
    : typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : [];

  console.log('🔍 usePermissions - Permissões processadas:', userPermissions);
  console.log('🔍 usePermissions - É admin?', user.role === 'admin');

  const isAdmin = user.role === 'admin';

  const hasPageAccessResult = (pageKey: string) => {
    const result = isAdmin || hasPageAccess(userPermissions, pageKey);
    console.log(`🔍 usePermissions - hasPageAccess(${pageKey}):`, result);
    return result;
  };

  const hasFeatureAccessResult = (featureKey: string) => {
    const result = isAdmin || hasFeatureAccess(userPermissions, featureKey);
    console.log(`🔍 usePermissions - hasFeatureAccess(${featureKey}):`, result);
    return result;
  };

  return {
    hasPageAccess: hasPageAccessResult,
    hasFeatureAccess: hasFeatureAccessResult,
    userPermissions,
    isAdmin
  };
}
