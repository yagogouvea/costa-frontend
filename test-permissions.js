// Teste da lógica de permissões CORRIGIDA
const PERMISSIONS = [
  {
    key: 'read:dashboard',
    description: 'Acessar Dashboard'
  },
  {
    key: 'read:user',
    description: 'Acessar Gerenciamento de Usuários',
    children: [
      { key: 'create:user', description: 'Adicionar Usuário' },
      { key: 'update:user', description: 'Editar Usuário' },
      { key: 'delete:user', description: 'Excluir Usuário' }
    ]
  }
];

// Simulação da função toggleMain CORRIGIDA
function toggleMain(selected, key) {
  const permission = PERMISSIONS.find(p => p.key === key);
  if (!permission) return selected;
  
  if (selected.includes(key)) {
    // Ao desmarcar principal, remove apenas a principal
    return selected.filter(p => p !== key);
  } else {
    // Ao marcar principal, adiciona a principal e todas as sub-permissões
    // Evita duplicações verificando se já existem
    const toAdd = [key];
    if (permission.children) {
      permission.children.forEach(child => {
        if (!selected.includes(child.key)) {
          toAdd.push(child.key);
        }
      });
    }
    return [...selected, ...toAdd];
  }
}

// Simulação da função toggleSub
function toggleSub(selected, mainKey, subKey) {
  if (selected.includes(subKey)) {
    // Remove apenas a sub-permissão
    return selected.filter(p => p !== subKey);
  } else {
    // Adiciona apenas a sub-permissão
    return [...selected, subKey];
  }
}

// Testes
console.log('=== TESTE DE PERMISSÕES CORRIGIDAS ===');

let selected = [];

console.log('1. Estado inicial:', selected);

// Teste 1: Marcar permissão principal
selected = toggleMain(selected, 'read:user');
console.log('2. Após marcar read:user:', selected);

// Teste 2: Desmarcar permissão principal
selected = toggleMain(selected, 'read:user');
console.log('3. Após desmarcar read:user:', selected);

// Teste 3: Marcar permissão principal novamente
selected = toggleMain(selected, 'read:user');
console.log('4. Após marcar read:user novamente:', selected);

// Teste 4: Desmarcar sub-permissão
selected = toggleSub(selected, 'read:user', 'create:user');
console.log('5. Após desmarcar create:user:', selected);

// Teste 5: Marcar sub-permissão
selected = toggleSub(selected, 'read:user', 'create:user');
console.log('6. Após marcar create:user:', selected);

// Teste 6: Desmarcar permissão principal (deve manter sub-permissões)
selected = toggleMain(selected, 'read:user');
console.log('7. Após desmarcar read:user (deve manter sub-permissões):', selected);

// Teste 7: Marcar permissão principal novamente (não deve duplicar)
selected = toggleMain(selected, 'read:user');
console.log('8. Após marcar read:user novamente (sem duplicação):', selected);

console.log('=== FIM DOS TESTES ===');
