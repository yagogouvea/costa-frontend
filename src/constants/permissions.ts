// Interface para permissão principal e sub-permissões
export interface Permission {
  key: string;
  description: string;
  children?: Permission[];
}

export const PERMISSIONS: Permission[] = [
  {
    key: 'read:dashboard',
    description: 'Acessar Dashboard'
  },
  {
    key: 'read:prestador',
    description: 'Acessar Prestadores',
    children: [
      { key: 'create:prestador', description: 'Adicionar Prestador' },
      { key: 'update:prestador', description: 'Editar Prestador' },
      { key: 'delete:prestador', description: 'Excluir Prestador' }
    ]
  },
  {
    key: 'read:cliente',
    description: 'Acessar Clientes',
    children: [
      { key: 'create:cliente', description: 'Adicionar Cliente' },
      { key: 'update:cliente', description: 'Editar Cliente' },
      { key: 'delete:cliente', description: 'Excluir Cliente' }
    ]
  },
  {
    key: 'read:ocorrencia',
    description: 'Acessar Ocorrências',
    children: [
      { key: 'create:ocorrencia', description: 'Criar Ocorrência' },
      { key: 'update:ocorrencia', description: 'Editar Ocorrência' },
      { key: 'delete:ocorrencia', description: 'Excluir Ocorrência' }
    ]
  },
  {
    key: 'read:relatorio',
    description: 'Acessar Relatórios',
    children: [
      { key: 'create:relatorio', description: 'Criar Relatório' },
      { key: 'update:relatorio', description: 'Editar Relatório' },
      { key: 'delete:relatorio', description: 'Excluir Relatório' }
    ]
  },
  {
    key: 'read:user',
    description: 'Acessar Gerenciamento de Usuários',
    children: [
      { key: 'create:user', description: 'Adicionar Usuário' },
      { key: 'update:user', description: 'Editar Usuário' },
      { key: 'delete:user', description: 'Excluir Usuário' }
    ]
  },
  {
    key: 'read:contrato',
    description: 'Acessar Contratos',
    children: [
      { key: 'create:contrato', description: 'Criar Contrato' },
      { key: 'update:contrato', description: 'Editar Contrato' },
      { key: 'delete:contrato', description: 'Excluir Contrato' }
    ]
  },
  {
    key: 'read:foto',
    description: 'Acessar Fotos',
    children: [
      { key: 'upload:foto', description: 'Fazer Upload de Fotos' },
      { key: 'create:foto', description: 'Criar Foto' },
      { key: 'update:foto', description: 'Editar Foto' },
      { key: 'delete:foto', description: 'Excluir Foto' }
    ]
  },
  {
    key: 'read:veiculo',
    description: 'Acessar Veículos',
    children: [
      { key: 'create:veiculo', description: 'Adicionar Veículo' },
      { key: 'update:veiculo', description: 'Editar Veículo' },
      { key: 'delete:veiculo', description: 'Excluir Veículo' }
    ]
  },
  {
    key: 'read:financeiro',
    description: 'Acessar Financeiro',
    children: [
      { key: 'update:financeiro', description: 'Editar Financeiro' }
    ]
  },
  {
    key: 'read:config',
    description: 'Acessar Configurações',
    children: [
      { key: 'update:config', description: 'Editar Configurações' }
    ]
  }
];

// Permissões por cargo (exemplo, pode ser ajustado)
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  operator: [
    'read:dashboard',
    'read:prestador',
    'read:cliente',
    'read:ocorrencia',
    'read:relatorio'
  ],
  manager: [
    'read:dashboard',
    'read:prestador', 'create:prestador', 'update:prestador',
    'read:cliente', 'create:cliente', 'update:cliente',
    'read:ocorrencia', 'create:ocorrencia', 'update:ocorrencia',
    'read:relatorio', 'create:relatorio', 'update:relatorio',
    'read:contrato', 'create:contrato', 'update:contrato',
    'read:foto', 'upload:foto', 'create:foto', 'update:foto'
  ],
  admin: [
    // Dashboard
    'read:dashboard',
    
    // Usuários
    'read:user', 'create:user', 'update:user', 'delete:user',
    
    // Prestadores
    'read:prestador', 'create:prestador', 'update:prestador', 'delete:prestador',
    
    // Clientes
    'read:cliente', 'create:cliente', 'update:cliente', 'delete:cliente',
    
    // Ocorrências
    'read:ocorrencia', 'create:ocorrencia', 'update:ocorrencia', 'delete:ocorrencia',
    
    // Relatórios
    'read:relatorio', 'create:relatorio', 'update:relatorio', 'delete:relatorio',
    
    // Contratos
    'read:contrato', 'create:contrato', 'update:contrato', 'delete:contrato',
    
    // Fotos
    'read:foto', 'upload:foto', 'create:foto', 'update:foto', 'delete:foto',
    
    // Veículos
    'read:veiculo', 'create:veiculo', 'update:veiculo', 'delete:veiculo',
    
    // Financeiro
    'read:financeiro', 'update:financeiro',
    
    // Configurações
    'read:config', 'update:config'
  ]
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Administrador - Acesso total ao sistema",
  manager: "Supervisor - Gerenciamento de prestadores e clientes",
  operator: "Operador - Acesso básico"
};
