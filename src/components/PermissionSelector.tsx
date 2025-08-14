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
    if (selected.includes(key)) {
      // Ao desmarcar principal, remove também todas as sub-permissões
      const toRemove = [key, ...(
        availablePermissions.find(p => p.key === key)?.children?.map(c => c.key) || []
      )];
      onChange(filterValidPermissions(selected.filter(p => !toRemove.includes(p))));
    } else {
      onChange(filterValidPermissions([...selected, key]));
    }
  };

  // Alterna sub-permissão
  const toggleSub = (mainKey: string, subKey: string) => {
    if (disabled) return;
    if (!selected.includes(mainKey)) return; // Não permite marcar sub se principal não está marcada
    if (selected.includes(subKey)) {
      onChange(filterValidPermissions(selected.filter(p => p !== subKey)));
    } else {
      onChange(filterValidPermissions([...selected, subKey]));
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Permissões:</label>
      <div className="space-y-2">
        {availablePermissions.map((perm) => (
          <div key={perm.key} className="">
            <label className={`flex items-center gap-2 text-base font-medium ${disabled ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                checked={selected.includes(perm.key)}
                onChange={() => toggleMain(perm.key)}
                disabled={disabled}
                className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              />
              {perm.description}
            </label>
            {perm.children && (
              <div className="pl-6 mt-1 space-y-1">
                {perm.children.map((child) => {
                  const isMainChecked = selected.includes(perm.key);
                  return (
                    <label
                      key={child.key}
                      className={`flex items-center gap-2 text-sm ${!isMainChecked ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(child.key)}
                        onChange={() => toggleSub(perm.key, child.key)}
                        disabled={disabled || !isMainChecked}
                        className={(!isMainChecked || disabled) ? 'cursor-not-allowed' : 'cursor-pointer'}
                      />
                      {child.description}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
