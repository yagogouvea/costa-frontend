# 🔒 Sistema de Permissões - Guia de Implementação

## 📋 **Visão Geral**

O sistema de permissões foi reformulado para ser mais simples e eficiente, baseado em **acesso às páginas** e **funcionalidades específicas**.

## 🎯 **Estrutura das Permissões**

### **1. Permissões de Página (Page Access)**
```typescript
'access:dashboard'      // Acesso ao Dashboard
'access:ocorrencias'    // Acesso à página de Ocorrências
'access:prestadores'    // Acesso à página de Prestadores
'access:financeiro'     // Acesso à página Financeiro
'access:clientes'       // Acesso à página de Clientes
'access:relatorios'     // Acesso à página de Relatórios
'access:usuarios'       // Acesso à página de Usuários
```

### **2. Funcionalidades Específicas (Features)**
```typescript
// Apenas para a página de Prestadores
'prestadores:export'    // Botão de exportar
'prestadores:create'    // Botão de novo prestador
'prestadores:edit'      // Botão de editar
'prestadores:delete'    // Botão de excluir
```

## 🚀 **Como Implementar**

### **1. Proteger uma Página Inteira**

```tsx
import PageAccessControl from '../components/PageAccessControl';

export default function MinhaPage() {
  return (
    <PageAccessControl pageKey="access:minha-pagina">
      {/* Todo o conteúdo da página aqui */}
      <div>Conteúdo protegido...</div>
    </PageAccessControl>
  );
}
```

### **2. Controlar Funcionalidades Específicas**

```tsx
import FeatureAccessControl from '../components/FeatureAccessControl';

// Botão que só aparece com permissão
<FeatureAccessControl featureKey="prestadores:export" hideIfNoAccess>
  <button>Exportar</button>
</FeatureAccessControl>

// Botão que mostra fallback sem permissão
<FeatureAccessControl 
  featureKey="prestadores:edit" 
  fallback={<span>Sem permissão para editar</span>}
>
  <button>Editar</button>
</FeatureAccessControl>
```

### **3. Verificar Permissões no Código**

```tsx
import { usePermissions } from '../hooks/usePermissions';

function MeuComponente() {
  const { hasPageAccess, hasFeatureAccess } = usePermissions();
  
  // Verificar acesso à página
  if (!hasPageAccess('access:prestadores')) {
    return <div>Acesso negado</div>;
  }
  
  // Verificar funcionalidade específica
  const podeExportar = hasFeatureAccess('prestadores:export');
  
  return (
    <div>
      {podeExportar && <button>Exportar</button>}
    </div>
  );
}
```

## 🎨 **Componentes Disponíveis**

### **PageAccessControl**
- **Propósito**: Protege páginas inteiras
- **Props**:
  - `pageKey`: Chave da permissão de página
  - `children`: Conteúdo a ser protegido
  - `fallback`: Componente alternativo (opcional)

### **FeatureAccessControl**
- **Propósito**: Controla funcionalidades específicas
- **Props**:
  - `featureKey`: Chave da permissão de funcionalidade
  - `children`: Funcionalidade a ser protegida
  - `fallback`: Componente alternativo (opcional)
  - `hideIfNoAccess`: Se true, não renderiza nada sem permissão

### **usePermissions Hook**
- **Retorna**:
  - `hasPageAccess(pageKey)`: Verifica acesso à página
  - `hasFeatureAccess(featureKey)`: Verifica acesso à funcionalidade
  - `userPermissions`: Array de permissões do usuário
  - `isAdmin`: Se o usuário é administrador

## 📱 **Exemplo Completo**

```tsx
import React from 'react';
import PageAccessControl from '../components/PageAccessControl';
import FeatureAccessControl from '../components/FeatureAccessControl';
import { usePermissions } from '../hooks/usePermissions';

export default function PrestadoresPage() {
  const { hasFeatureAccess } = usePermissions();

  return (
    <PageAccessControl pageKey="access:prestadores">
      <div className="p-4">
        <h1>Gerenciamento de Prestadores</h1>
        
        {/* Botões baseados em permissões */}
        <div className="flex gap-2">
          <FeatureAccessControl featureKey="prestadores:export" hideIfNoAccess>
            <button className="btn-export">Exportar</button>
          </FeatureAccessControl>
          
          <FeatureAccessControl featureKey="prestadores:create" hideIfNoAccess>
            <button className="btn-create">Novo Prestador</button>
          </FeatureAccessControl>
        </div>
        
        {/* Lista de prestadores */}
        <div className="prestadores-list">
          {/* Cada card de prestador */}
          <div className="prestador-card">
            <h3>João Silva</h3>
            <p>Segurança</p>
            
            {/* Botões de ação */}
            <div className="actions">
              <FeatureAccessControl featureKey="prestadores:edit" hideIfNoAccess>
                <button className="btn-edit">Editar</button>
              </FeatureAccessControl>
              
              <FeatureAccessControl featureKey="prestadores:delete" hideIfNoAccess>
                <button className="btn-delete">Excluir</button>
              </FeatureAccessControl>
            </div>
          </div>
        </div>
      </div>
    </PageAccessControl>
  );
}
```

## 🔧 **Configuração de Usuários**

### **1. Cargos Disponíveis**
- **Operador**: Acesso às páginas (sem funcionalidades específicas)
- **Supervisor**: Acesso às páginas + funcionalidades de prestadores
- **Administrador**: Acesso total

### **2. Como Configurar**
1. Acesse a página de Usuários
2. Crie ou edite um usuário
3. Selecione o cargo
4. Configure as permissões específicas
5. Salve o usuário

## 🚨 **Comportamento do Sistema**

### **Sem Permissão de Página:**
- Usuário vê tela "Acesso Negado"
- Não consegue visualizar nenhum conteúdo
- Botão "Voltar" para retornar

### **Com Permissão de Página, Sem Funcionalidades:**
- Usuário vê a página normalmente
- Botões/funcionalidades específicas não aparecem
- Conteúdo principal é visível

### **Com Todas as Permissões:**
- Acesso total à página e funcionalidades
- Todos os botões e recursos disponíveis

## 🎯 **Boas Práticas**

1. **Sempre use `PageAccessControl`** para páginas que precisam de proteção
2. **Use `FeatureAccessControl`** para botões e funcionalidades específicas
3. **Configure `hideIfNoAccess={true}`** para funcionalidades que devem desaparecer sem permissão
4. **Use o hook `usePermissions`** para lógica condicional complexa
5. **Teste com diferentes níveis de usuário** para garantir o funcionamento

## 🔍 **Debug e Testes**

### **Verificar Permissões no Console:**
```tsx
const { userPermissions, hasPageAccess, hasFeatureAccess } = usePermissions();

console.log('Permissões do usuário:', userPermissions);
console.log('Acesso à página prestadores:', hasPageAccess('access:prestadores'));
console.log('Pode exportar:', hasFeatureAccess('prestadores:export'));
```

### **Testar Diferentes Usuários:**
1. Crie usuários com diferentes cargos
2. Teste o acesso às páginas
3. Verifique se as funcionalidades aparecem/desaparecem corretamente
4. Confirme que usuários sem permissão veem "Acesso Negado"

---

## 📞 **Suporte**

Para dúvidas ou problemas com o sistema de permissões:
1. Verifique o console do navegador para erros
2. Confirme que as permissões estão configuradas corretamente
3. Teste com diferentes usuários e cargos
4. Consulte este documento para implementações padrão
