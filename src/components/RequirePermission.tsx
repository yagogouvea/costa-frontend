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

  // Verificação de permissão mais robusta: aceita array, string JSON ou objeto estruturado
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const permissionsRaw = user?.permissions as any;
  let hasPermission = false;

  // 1) Array simples de strings
  if (Array.isArray(permissionsRaw)) {
    hasPermission = permissionsRaw.includes(requiredPermission);
  } else if (typeof permissionsRaw === 'string') {
    // 2) String JSON contendo array
    try {
      const parsed = JSON.parse(permissionsRaw);
      if (Array.isArray(parsed)) {
        hasPermission = parsed.includes(requiredPermission);
      }
    } catch {
      // ignora
    }
  } else if (permissionsRaw && typeof permissionsRaw === 'object') {
    // 3) Objeto estruturado (ex.: { prestadores: { read: true, create: false } })
    const accessMatch = requiredPermission.match(/^access:(.+)$/);
    const crudMatch = requiredPermission.match(/^(read|create|update|delete):(.+)$/);
    const resourceActionMatch = requiredPermission.match(/^([a-z_]+):(read|create|update|edit|delete|remove|export)$/i);

    if (accessMatch) {
      const resource = accessMatch[1];
      const resourceKey = normalizarResource(resource);
      hasPermission = !!permissionsRaw[resourceKey]?.read;
    } else if (crudMatch) {
      const action = crudMatch[1];
      const resource = crudMatch[2];
      const resourceKey = normalizarResource(resource);
      hasPermission = !!permissionsRaw[resourceKey]?.[action];
    } else if (resourceActionMatch) {
      const resource = resourceActionMatch[1];
      const actionRaw = resourceActionMatch[2].toLowerCase();
      const resourceKey = normalizarResource(resource);
      const actionMap: Record<string, string> = {
        read: 'read',
        create: 'create',
        update: 'update',
        edit: 'update',
        delete: 'delete',
        remove: 'delete',
        export: 'read'
      };
      const action = actionMap[actionRaw] || actionRaw;
      hasPermission = !!permissionsRaw[resourceKey]?.[action];
    }
  }

  // Admin sempre pode
  if (isAdmin) {
    hasPermission = true;
  }

  function normalizarResource(res: string): string {
    // Alinhar nomes como 'prestador'/'prestadores'
    const singular = res.replace(/s$/i, '');
    switch (singular) {
      case 'prestador':
        return 'prestadores';
      case 'usuario':
        return 'users';
      case 'ocorrencia':
        return 'ocorrencias';
      case 'relatorio':
        return 'relatorios';
      case 'cliente':
        return 'clientes';
      case 'veiculo':
        return 'veiculos';
      case 'foto':
        return 'fotos';
      case 'contrato':
        return 'contratos';
      case 'financeiro':
        return 'financeiro';
      case 'dashboard':
        return 'dashboard';
      case 'config':
        return 'config';
      default:
        return singular;
    }
  }

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