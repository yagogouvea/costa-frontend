import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredPermission: string; // ex: 'read:user', 'create:ocorrencia'
  fallback?: React.ReactNode;
}

export default function RequirePermission({ children, requiredPermission, fallback }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('🔒 RequirePermission - checking:', requiredPermission, 'user permissions:', user?.permissions);
  console.log('🔒 RequirePermission - user role:', user?.role);

  if (!isAuthenticated) {
    console.log('❌ Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin tem acesso total a tudo
  if (user?.role === 'admin') {
    console.log('✅ Usuário é admin, permitindo acesso total');
    return <>{children}</>;
  }

  // Verificar se o usuário tem a permissão específica
  const hasPermission = Array.isArray(user?.permissions) && user.permissions.includes(requiredPermission);

  if (!hasPermission) {
    console.log('❌ Usuário não tem permissão:', requiredPermission);
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Você não tem permissão para acessar esta página.
        </div>
      </div>
    );
  }

  console.log('✅ Usuário tem permissão:', requiredPermission);
  return <>{children}</>;
} 