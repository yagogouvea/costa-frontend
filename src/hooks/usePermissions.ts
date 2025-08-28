import { useAuth } from '../contexts/AuthContext';
import { hasPageAccess, hasFeatureAccess } from '../constants/permissions';

export function usePermissions() {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
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

  const isAdmin = user.role === 'admin';

  const hasPageAccessResult = (pageKey: string) => {
    return isAdmin || hasPageAccess(userPermissions, pageKey);
  };

  const hasFeatureAccessResult = (featureKey: string) => {
    return isAdmin || hasFeatureAccess(userPermissions, featureKey);
  };

  return {
    hasPageAccess: hasPageAccessResult,
    hasFeatureAccess: hasFeatureAccessResult,
    userPermissions,
    isAdmin
  };
}
