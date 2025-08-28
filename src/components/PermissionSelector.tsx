import { Permission } from "../constants/permissions";

interface PermissionSelectorProps {
  selected: string[];
  onChange: (permissions: string[]) => void;
  availablePermissions: Permission[];
  disabled?: boolean;
}

// Função utilitária para filtrar apenas permissões válidas
function filterValidPermissions(perms: string[]): string[] {
  return perms.filter(p => /^[a-z]+:[a-z]+$/.test(p));
}

export default function PermissionSelector({
  selected = [],
  onChange,
  availablePermissions = [],
  disabled = false
}: PermissionSelectorProps) {
  // Alterna permissão principal (página)
  const togglePageAccess = (key: string) => {
    if (disabled) return;
    
    const permission = availablePermissions.find(p => p.key === key);
    if (!permission) return;
    
    if (selected.includes(key)) {
      // Ao desmarcar página, remove a página e todas as suas funcionalidades
      const toRemove = [key];
      if (permission.children) {
        toRemove.push(...permission.children.map(c => c.key));
      }
      onChange(filterValidPermissions(selected.filter(p => !toRemove.includes(p))));
    } else {
      // Ao marcar página, adiciona apenas a página (sem funcionalidades)
      onChange(filterValidPermissions([...selected, key]));
    }
  };

  // Alterna funcionalidade específica
  const toggleFeature = (mainKey: string, featureKey: string) => {
    if (disabled) return;
    
    const mainPermission = availablePermissions.find(p => p.key === mainKey);
    if (!mainPermission || !mainPermission.children) return;
    
    // Só permite marcar funcionalidades se a página estiver marcada
    if (!selected.includes(mainKey)) return;
    
    if (selected.includes(featureKey)) {
      // Remove apenas a funcionalidade
      onChange(filterValidPermissions(selected.filter(p => p !== featureKey)));
    } else {
      // Adiciona apenas a funcionalidade
      onChange(filterValidPermissions([...selected, featureKey]));
    }
  };

  // Verifica se todas as funcionalidades de uma página estão marcadas
  const areAllFeaturesSelected = (permission: Permission): boolean => {
    if (!permission.children || permission.children.length === 0) return true;
    return permission.children.every(child => selected.includes(child.key));
  };

  // Verifica se algumas funcionalidades estão marcadas (para estado indeterminado)
  const areSomeFeaturesSelected = (permission: Permission): boolean => {
    if (!permission.children || permission.children.length === 0) return false;
    const selectedFeatures = permission.children.filter(child => selected.includes(child.key));
    return selectedFeatures.length > 0 && selectedFeatures.length < permission.children.length;
  };

  // Separa permissões por categoria
  const pagePermissions = availablePermissions.filter(p => p.category === 'page');
  const featurePermissions = availablePermissions.filter(p => p.category === 'feature');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração de Permissões</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure quais páginas e funcionalidades este usuário pode acessar.
        </p>
      </div>

      {/* PERMISSÕES DE ACESSO ÀS PÁGINAS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <h4 className="text-base font-semibold text-gray-900">Acesso às Páginas</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Selecione as páginas que o usuário pode acessar. Sem acesso à página, o usuário não conseguirá visualizar o conteúdo.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagePermissions.map((permission) => (
            <div key={permission.key} className="flex items-center">
              <input
                type="checkbox"
                id={permission.key}
                checked={selected.includes(permission.key)}
                onChange={() => togglePageAccess(permission.key)}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
              />
              <label 
                htmlFor={permission.key}
                className={`ml-3 text-sm font-medium ${
                  disabled ? 'text-gray-400' : 'text-gray-700'
                } cursor-pointer select-none`}
              >
                {permission.description}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* FUNCIONALIDADES ESPECÍFICAS */}
      {pagePermissions.some(p => p.children && p.children.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <h4 className="text-base font-semibold text-gray-900">Funcionalidades Específicas</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configure funcionalidades específicas dentro das páginas. Estas opções só aparecem se o usuário tiver acesso à página correspondente.
          </p>
          
          <div className="space-y-6">
            {pagePermissions.map((permission) => {
              if (!permission.children || permission.children.length === 0) return null;
              
              const isPageAccessible = selected.includes(permission.key);
              const allFeaturesSelected = areAllFeaturesSelected(permission);
              const someFeaturesSelected = areSomeFeaturesSelected(permission);
              
              return (
                <div key={permission.key} className={`border-l-4 pl-4 ${
                  isPageAccessible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className={`text-sm font-medium ${
                      isPageAccessible ? 'text-green-800' : 'text-gray-500'
                    }`}>
                      {permission.description}
                    </h5>
                    {isPageAccessible && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={allFeaturesSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = someFeaturesSelected && !allFeaturesSelected;
                            }
                          }}
                          onChange={() => {
                            if (allFeaturesSelected) {
                              // Remove todas as funcionalidades
                              const toRemove = permission.children!.map(c => c.key);
                              onChange(filterValidPermissions(selected.filter(p => !toRemove.includes(p))));
                            } else {
                              // Adiciona todas as funcionalidades
                              const toAdd = permission.children!.map(c => c.key);
                              onChange(filterValidPermissions([...selected, ...toAdd]));
                            }
                          }}
                          disabled={disabled}
                          className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-xs text-gray-500">Todas</span>
                      </div>
                    )}
                  </div>
                  
                  {isPageAccessible && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permission.children.map((feature) => (
                        <div key={feature.key} className="flex items-center">
                          <input
                            type="checkbox"
                            id={feature.key}
                            checked={selected.includes(feature.key)}
                            onChange={() => toggleFeature(permission.key, feature.key)}
                            disabled={disabled}
                            className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                          />
                          <label 
                            htmlFor={feature.key}
                            className={`ml-2 text-xs ${
                              disabled ? 'text-gray-400' : 'text-gray-700'
                            } cursor-pointer select-none`}
                          >
                            {feature.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!isPageAccessible && (
                    <p className="text-xs text-gray-500 italic">
                      Marque o acesso à página para configurar funcionalidades
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESUMO DAS PERMISSÕES */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <h5 className="text-sm font-medium text-blue-900">Resumo das Permissões</h5>
        </div>
        <p className="text-xs text-blue-700">
          Páginas acessíveis: <span className="font-medium">{selected.filter(p => p.startsWith('access:')).length}</span> de {pagePermissions.length} | 
          Funcionalidades: <span className="font-medium">{selected.filter(p => !p.startsWith('access:')).length}</span>
        </p>
      </div>
    </div>
  );
}
