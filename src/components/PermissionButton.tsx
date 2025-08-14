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
  
  // Admin tem acesso total a tudo
  const isAdmin = user?.role === 'admin';
  const hasPermission = isAdmin || (Array.isArray(user?.permissions) && 
    user.permissions.includes(requiredPermission));

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