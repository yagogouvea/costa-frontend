// Interface para permissão principal e sub-permissões
export interface Permission {
  key: string;
  description: string;
  children?: Permission[];
  category: 'page' | 'feature';
}

export const PERMISSIONS: Permission[] = [
  // PERMISSÕES DE ACESSO ÀS PÁGINAS
  {
    key: 'access:dashboard',
    description: 'Dashboard',
    category: 'page'
  },
  {
    key: 'access:ocorrencias',
    description: 'Ocorrências',
    category: 'page'
  },
  {
    key: 'access:prestadores',
    description: 'Prestadores',
    category: 'page',
    children: [
      { key: 'prestadores:export', description: 'Exportar Prestadores', category: 'feature' },
      { key: 'prestadores:create', description: 'Novo Prestador', category: 'feature' },
      { key: 'prestadores:edit', description: 'Editar Prestador', category: 'feature' },
      { key: 'prestadores:delete', description: 'Excluir Prestador', category: 'feature' }
    ]
  },
  {
    key: 'access:financeiro',
    description: 'Financeiro',
    category: 'page'
  },
  {
    key: 'access:clientes',
    description: 'Clientes',
    category: 'page'
  },
  {
    key: 'access:relatorios',
    description: 'Relatórios',
    category: 'page'
  },
  {
    key: 'access:usuarios',
    description: 'Usuários',
    category: 'page'
  }
];

// Permissões padrão para operador (todas as páginas, sem funcionalidades específicas)
export const DEFAULT_OPERATOR_PERMISSIONS: string[] = [
  'access:dashboard',
  'access:ocorrencias',
  'access:prestadores',
  'access:financeiro',
  'access:clientes',
  'access:relatorios',
  'access:usuarios'
];

// Permissões para supervisor (todas as páginas + funcionalidades de prestadores)
export const SUPERVISOR_PERMISSIONS: string[] = [
  'access:dashboard',
  'access:ocorrencias',
  'access:prestadores',
  'prestadores:export',
  'prestadores:create',
  'prestadores:edit',
  'prestadores:delete',
  'access:financeiro',
  'access:clientes',
  'access:relatorios',
  'access:usuarios'
];

// Permissões para administrador (acesso total)
export const ADMIN_PERMISSIONS: string[] = PERMISSIONS.map(p => {
  const perms = [p.key];
  if (p.children) {
    perms.push(...p.children.map(c => c.key));
  }
  return perms;
}).flat();

// Mapeamento de permissões por cargo
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  operator: DEFAULT_OPERATOR_PERMISSIONS,
  manager: SUPERVISOR_PERMISSIONS, // Mudou de 'supervisor' para 'manager'
  admin: ADMIN_PERMISSIONS
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  operator: "Operador - Acesso às páginas do sistema",
  manager: "Supervisor - Acesso às páginas + funcionalidades de prestadores", // Mudou de 'supervisor' para 'manager'
  admin: "Administrador - Acesso total ao sistema"
};

// Função para verificar se usuário tem acesso a uma página
export function hasPageAccess(userPermissions: string[], pageKey: string): boolean {
  return userPermissions.includes(pageKey);
}

// Função para verificar se usuário tem uma funcionalidade específica
export function hasFeatureAccess(userPermissions: string[], featureKey: string): boolean {
  return userPermissions.includes(featureKey);
}

// Função para obter todas as permissões de uma página específica
export function getPagePermissions(pageKey: string): string[] {
  const page = PERMISSIONS.find(p => p.key === pageKey);
  if (!page || !page.children) return [pageKey];
  
  return [pageKey, ...page.children.map(c => c.key)];
}
