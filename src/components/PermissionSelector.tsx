import { Permission } from "../constants/permissions";

interface PermissionSelectorProps {
  selected: string[];
  onChange: (permissions: string[]) => void;
  availablePermissions: Permission[];
  disabled?: boolean;
}

// Função utilitária para filtrar apenas permissões no padrão action:resource
function filterValidPermissions(perms: string[]): string[] {
  return perms.filter(p => /^[a-z]+:[a-z]+$/.test(p));
}

export default function PermissionSelector({
  selected = [],
  onChange,
  availablePermissions = [],
  disabled = false
}: PermissionSelectorProps) {
  // Alterna permissão principal
  const toggleMain = (key: string) => {
    if (disabled) return;
    
    const permission = availablePermissions.find(p => p.key === key);
    if (!permission) return;
    
    if (selected.includes(key)) {
      // Ao desmarcar principal, remove apenas a principal
      // As sub-permissões permanecem se foram marcadas individualmente
      onChange(filterValidPermissions(selected.filter(p => p !== key)));
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
      onChange(filterValidPermissions([...selected, ...toAdd]));
    }
  };

  // Alterna sub-permissão
  const toggleSub = (mainKey: string, subKey: string) => {
    if (disabled) return;
    
    const mainPermission = availablePermissions.find(p => p.key === mainKey);
    if (!mainPermission || !mainPermission.children) return;
    
    if (selected.includes(subKey)) {
      // Remove apenas a sub-permissão
      onChange(filterValidPermissions(selected.filter(p => p !== subKey)));
    } else {
      // Adiciona apenas a sub-permissão
      onChange(filterValidPermissions([...selected, subKey]));
    }
  };

  // Verifica se todas as sub-permissões de uma permissão principal estão marcadas
  const areAllSubPermissionsSelected = (permission: Permission): boolean => {
    if (!permission.children || permission.children.length === 0) return true;
    return permission.children.every(child => selected.includes(child.key));
  };

  // Verifica se algumas sub-permissões estão marcadas (para estado indeterminado)
  const areSomeSubPermissionsSelected = (permission: Permission): boolean => {
    if (!permission.children || permission.children.length === 0) return false;
    const selectedSubs = permission.children.filter(child => selected.includes(child.key));
    return selectedSubs.length > 0 && selectedSubs.length < permission.children.length;
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Permissões:</label>
      <div className="space-y-2">
        {availablePermissions.map((perm) => {
          const isMainChecked = selected.includes(perm.key);
          const allSubsSelected = areAllSubPermissionsSelected(perm);
          const someSubsSelected = areSomeSubPermissionsSelected(perm);
          
          return (
            <div key={perm.key} className="">
              <label className={`flex items-center gap-2 text-base font-medium ${disabled ? 'opacity-60' : ''}`}>
                <input
                  type="checkbox"
                  checked={isMainChecked}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSubsSelected && !isMainChecked;
                    }
                  }}
                  onChange={() => toggleMain(perm.key)}
                  disabled={disabled}
                  className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                />
                {perm.description}
              </label>
              {perm.children && (
                <div className="pl-6 mt-1 space-y-1">
                  {perm.children.map((child) => (
                    <label
                      key={child.key}
                      className={`flex items-center gap-2 text-sm`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(child.key)}
                        onChange={() => toggleSub(perm.key, child.key)}
                        disabled={disabled}
                        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                      />
                      {child.description}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
