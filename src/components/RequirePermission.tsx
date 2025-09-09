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

  // Verificação de permissão mais robusta: aceita array, string JSON, string com espaços, ou objeto estruturado
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const permissionsRaw = user?.permissions as any;
  let hasPermission = false;

  const parsePermissions = (raw: any): { arr: string[]; obj: Record<string, any> } => {
    // Saídas normalizadas
    let arr: string[] = [];
    let obj: Record<string, any> = {};

    if (Array.isArray(raw)) {
      arr = raw as string[];
    } else if (typeof raw === 'string') {
      const s = raw.trim();
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          arr = parsed as string[];
        } else if (parsed && typeof parsed === 'object') {
          obj = parsed as Record<string, any>;
        }
      } catch {
        // fallback: string de escopos separada por espaço ou vírgula
        arr = s.split(/[\s,]+/).filter(Boolean);
      }
    } else if (raw && typeof raw === 'object') {
      obj = raw as Record<string, any>;
    }

    // Normalizar chaves do objeto: lower-case e recursos uniformes
    if (obj && typeof obj === 'object') {
      const norm: Record<string, any> = {};
      Object.keys(obj).forEach((k) => {
        norm[normalizarResource(k)] = obj[k];
      });
      obj = norm;
    }

    return { arr, obj };
  };

  const { arr: permsArray, obj: permsObj } = parsePermissions(permissionsRaw);

  // 1) Checar match direto na lista (read:recurso | access:recurso | recurso:read)
  if (permsArray.length > 0) {
    const rp = requiredPermission.toLowerCase();
    hasPermission = permsArray.some(p => String(p).toLowerCase() === rp);
  }

  // 2) Checar objeto estruturado (ex.: { prestadores: { read: true, create: false } })
  if (!hasPermission && permsObj && Object.keys(permsObj).length > 0) {
    const accessMatch = requiredPermission.match(/^access:(.+)$/i);
    const crudMatch = requiredPermission.match(/^(read|create|update|delete):(.+)$/i);
    const resourceActionMatch = requiredPermission.match(/^([a-z_\-]+):(read|create|update|edit|delete|remove|export)$/i);

    if (accessMatch) {
      const resource = accessMatch[1];
      const resourceKey = normalizarResource(resource);
      hasPermission = !!permsObj[resourceKey]?.read;
    } else if (crudMatch) {
      const action = crudMatch[1].toLowerCase();
      const resource = crudMatch[2];
      const resourceKey = normalizarResource(resource);
      hasPermission = !!permsObj[resourceKey]?.[action];
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
        export: 'export'
      };
      const action = actionMap[actionRaw] || actionRaw;
      hasPermission = !!permsObj[resourceKey]?.[action];
    }
  }

  // Admin sempre pode
  if (isAdmin) {
    hasPermission = true;
  }

  function normalizarResource(res: string): string {
    // Alinhar nomes como 'prestador'/'prestadores' e hifen/underscore
    const base = (res || '').toString().toLowerCase().replace(/-/g, '_');
    const singular = base.replace(/s$/i, '');
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