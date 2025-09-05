interface PermissionsObject {
  users: { read: boolean; create: boolean; update: boolean; delete: boolean };
  ocorrencias: { read: boolean; create: boolean; update: boolean; delete: boolean };
  dashboard: { read: boolean };
  prestadores: { read: boolean; create: boolean; update: boolean; delete: boolean };
  relatorios: { read: boolean; create: boolean; update: boolean; delete: boolean };
  clientes: { read: boolean; create: boolean; update: boolean; delete: boolean };
  financeiro: { read: boolean };
  fotos: { read: boolean; create: boolean; update: boolean; delete: boolean; upload: boolean };
  contratos: { read: boolean; create: boolean; update: boolean; delete: boolean };
  veiculos: { read: boolean; create: boolean; update: boolean; delete: boolean };
  config: { read: boolean; update: boolean };
}

/**
 * Converte permissões do formato array ['read:user', 'create:user'] 
 * para objeto estruturado { users: { read: true, create: true } }
 */
export function convertPermissionsArrayToObject(permissions: string[] | PermissionsObject): PermissionsObject {
  // Se já é um objeto, retorna como está
  if (!Array.isArray(permissions)) {
    return permissions;
  }

  // Inicializa o objeto de permissões com todos os valores false
  const permissionsObj: PermissionsObject = {
    users: { read: false, create: false, update: false, delete: false },
    ocorrencias: { read: false, create: false, update: false, delete: false },
    dashboard: { read: false },
    prestadores: { read: false, create: false, update: false, delete: false },
    relatorios: { read: false, create: false, update: false, delete: false },
    clientes: { read: false, create: false, update: false, delete: false },
    financeiro: { read: false },
    fotos: { read: false, create: false, update: false, delete: false, upload: false },
    contratos: { read: false, create: false, update: false, delete: false },
    veiculos: { read: false, create: false, update: false, delete: false },
    config: { read: false, update: false }
  };

  // Mapeamento de permissões para o objeto estruturado
  const permissionMapping: Record<string, { resource: keyof PermissionsObject; action: string }> = {
    // Usuários
    'read:user': { resource: 'users', action: 'read' },
    'create:user': { resource: 'users', action: 'create' },
    'update:user': { resource: 'users', action: 'update' },
    'delete:user': { resource: 'users', action: 'delete' },

    // Ocorrências
    'read:ocorrencia': { resource: 'ocorrencias', action: 'read' },
    'create:ocorrencia': { resource: 'ocorrencias', action: 'create' },
    'update:ocorrencia': { resource: 'ocorrencias', action: 'update' },
    'delete:ocorrencia': { resource: 'ocorrencias', action: 'delete' },

    // Dashboard
    'read:dashboard': { resource: 'dashboard', action: 'read' },

    // Prestadores
    'read:prestador': { resource: 'prestadores', action: 'read' },
    'create:prestador': { resource: 'prestadores', action: 'create' },
    'update:prestador': { resource: 'prestadores', action: 'update' },
    'delete:prestador': { resource: 'prestadores', action: 'delete' },

    // Relatórios
    'read:relatorio': { resource: 'relatorios', action: 'read' },
    'create:relatorio': { resource: 'relatorios', action: 'create' },
    'update:relatorio': { resource: 'relatorios', action: 'update' },
    'delete:relatorio': { resource: 'relatorios', action: 'delete' },

    // Clientes
    'read:cliente': { resource: 'clientes', action: 'read' },
    'create:cliente': { resource: 'clientes', action: 'create' },
    'update:cliente': { resource: 'clientes', action: 'update' },
    'delete:cliente': { resource: 'clientes', action: 'delete' },

    // Financeiro
    'read:financeiro': { resource: 'financeiro', action: 'read' },
    'update:financeiro': { resource: 'financeiro', action: 'update' },

    // Fotos
    'read:foto': { resource: 'fotos', action: 'read' },
    'create:foto': { resource: 'fotos', action: 'create' },
    'update:foto': { resource: 'fotos', action: 'update' },
    'delete:foto': { resource: 'fotos', action: 'delete' },
    'upload:foto': { resource: 'fotos', action: 'upload' },

    // Contratos
    'read:contrato': { resource: 'contratos', action: 'read' },
    'create:contrato': { resource: 'contratos', action: 'create' },
    'update:contrato': { resource: 'contratos', action: 'update' },
    'delete:contrato': { resource: 'contratos', action: 'delete' },

    // Veículos
    'read:veiculo': { resource: 'veiculos', action: 'read' },
    'create:veiculo': { resource: 'veiculos', action: 'create' },
    'update:veiculo': { resource: 'veiculos', action: 'update' },
    'delete:veiculo': { resource: 'veiculos', action: 'delete' },

    // Configurações
    'read:config': { resource: 'config', action: 'read' },
    'update:config': { resource: 'config', action: 'update' }
  };

  // Processa cada permissão do array
  permissions.forEach((permission) => {
    const mapping = permissionMapping[permission];
    if (mapping) {
      const resource = permissionsObj[mapping.resource];
      if (resource && typeof resource === 'object' && mapping.action in resource) {
        (resource as any)[mapping.action] = true;
      }
    }
  });

  return permissionsObj;
}

/**
 * Hook para verificar permissões específicas de um recurso
 */
export function usePermissions(userPermissions: string[] | PermissionsObject | undefined) {
  // Cargo não concede mais permissões automaticamente; tudo é via lista de permissões

  if (!userPermissions) {
    return {
      users: { read: false, create: false, update: false, delete: false },
      ocorrencias: { read: false, create: false, update: false, delete: false },
      dashboard: { read: false },
      prestadores: { read: false, create: false, update: false, delete: false },
      relatorios: { read: false, create: false, update: false, delete: false },
      clientes: { read: false, create: false, update: false, delete: false },
      financeiro: { read: false },
      fotos: { read: false, create: false, update: false, delete: false, upload: false },
      contratos: { read: false, create: false, update: false, delete: false },
      veiculos: { read: false, create: false, update: false, delete: false },
      config: { read: false, update: false }
    };
  }

  return convertPermissionsArrayToObject(userPermissions);
} 