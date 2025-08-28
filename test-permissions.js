// Teste da nova estrutura de permissões
const PERMISSIONS = [
  {
    key: 'access:dashboard',
    description: 'Dashboard',
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
  }
];

// Simulação da função togglePageAccess
function togglePageAccess(selected, key) {
  const permission = PERMISSIONS.find(p => p.key === key);
  if (!permission) return selected;
  
  if (selected.includes(key)) {
    // Ao desmarcar página, remove a página e todas as suas funcionalidades
    const toRemove = [key];
    if (permission.children) {
      toRemove.push(...permission.children.map(c => c.key));
    }
    return selected.filter(p => !toRemove.includes(p));
  } else {
    // Ao marcar página, adiciona apenas a página (sem funcionalidades)
    return [...selected, key];
  }
}

// Simulação da função toggleFeature
function toggleFeature(selected, mainKey, featureKey) {
  // Só permite marcar funcionalidades se a página estiver marcada
  if (!selected.includes(mainKey)) return selected;
  
  if (selected.includes(featureKey)) {
    // Remove apenas a funcionalidade
    return selected.filter(p => p !== featureKey);
  } else {
    // Adiciona apenas a funcionalidade
    return [...selected, featureKey];
  }
}

// Testes
console.log('=== TESTE DAS NOVAS PERMISSÕES ===');

let selected = [];

console.log('1. Estado inicial:', selected);

// Teste 1: Marcar acesso à página
selected = togglePageAccess(selected, 'access:prestadores');
console.log('2. Após marcar acesso a prestadores:', selected);

// Teste 2: Marcar funcionalidade específica
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:export');
console.log('3. Após marcar exportar prestadores:', selected);

// Teste 3: Marcar outra funcionalidade
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:create');
console.log('4. Após marcar novo prestador:', selected);

// Teste 4: Desmarcar página (deve remover todas as funcionalidades)
selected = togglePageAccess(selected, 'access:prestadores');
console.log('5. Após desmarcar acesso a prestadores:', selected);

// Teste 5: Tentar marcar funcionalidade sem acesso à página (não deve funcionar)
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:export');
console.log('6. Tentativa de marcar funcionalidade sem acesso à página:', selected);

// Teste 6: Marcar página novamente
selected = togglePageAccess(selected, 'access:prestadores');
console.log('7. Após marcar acesso a prestadores novamente:', selected);

// Teste 7: Marcar todas as funcionalidades
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:export');
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:create');
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:edit');
selected = toggleFeature(selected, 'access:prestadores', 'prestadores:delete');
console.log('8. Após marcar todas as funcionalidades:', selected);

console.log('=== FIM DOS TESTES ===');
