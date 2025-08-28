import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PageAccessControlProps {
  pageKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PageAccessControl({ 
  pageKey, 
  children, 
  fallback 
}: PageAccessControlProps) {
  const { hasPageAccess } = usePermissions();

  if (!hasPageAccess(pageKey)) {
    return fallback || <AccessDenied pageKey={pageKey} />;
  }

  return <>{children}</>;
}

// Componente padrão para acesso negado
function AccessDenied({ pageKey }: { pageKey: string }) {
  const pageNames: Record<string, string> = {
    'access:dashboard': 'Dashboard',
    'access:ocorrencias': 'Ocorrências',
    'access:prestadores': 'Prestadores',
    'access:financeiro': 'Financeiro',
    'access:clientes': 'Clientes',
    'access:relatorios': 'Relatórios',
    'access:usuarios': 'Usuários'
  };

  const pageName = pageNames[pageKey] || 'esta página';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Acesso Negado
        </h2>
        
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar {pageName}.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Permissão Necessária
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Para acessar {pageName}, você precisa ter a permissão <code className="bg-red-100 px-1 rounded">{pageKey}</code> configurada no seu perfil.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
