import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface PermissionButtonProps {
  children: React.ReactNode;
  requiredPermission: string;
  variant?: "default" | "destructive" | "ghost";
  size?: "default" | "sm";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  showMessage?: boolean;
  message?: string;
  showTooltip?: boolean;
}

export default function PermissionButton({
  children,
  requiredPermission,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled = false,
  showMessage = true,
  message = "Você não tem permissão para executar esta ação.",
  showTooltip = true
}: PermissionButtonProps) {
  const { user } = useAuth();

  function normalizarResource(res: string): string {
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

  // Autorização baseada em permissões: aceita array, string JSON ou objeto estruturado
  const permissionsRaw = user?.permissions as any;
  let hasPermission = false;

  if (Array.isArray(permissionsRaw)) {
    hasPermission = permissionsRaw.includes(requiredPermission);
  } else if (typeof permissionsRaw === 'string') {
    try {
      const parsed = JSON.parse(permissionsRaw);
      if (Array.isArray(parsed)) {
        hasPermission = parsed.includes(requiredPermission);
      }
    } catch {}
  } else if (permissionsRaw && typeof permissionsRaw === 'object') {
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
        export: 'read' // export requer ao menos leitura no modelo estruturado
      };
      const action = actionMap[actionRaw] || actionRaw;
      hasPermission = !!permissionsRaw[resourceKey]?.[action];
    }
  }

  const handleClick = () => {
    if (!hasPermission) {
      if (showMessage) {
        toast.error(message, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
      }
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  if (!hasPermission) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled={true}
        onClick={handleClick}
        title={showTooltip ? message : undefined}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
} 