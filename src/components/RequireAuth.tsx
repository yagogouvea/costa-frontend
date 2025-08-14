import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('🔒 RequireAuth - isAuthenticated:', isAuthenticated, 'pathname:', location.pathname);

  if (!isAuthenticated) {
    console.log('❌ Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ Usuário autenticado, renderizando conteúdo');
  return <>{children}</>;
}
