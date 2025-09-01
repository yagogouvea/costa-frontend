import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import PermissionSelector from "./PermissionSelector";
import { User, createUser, updateUser, updateUserPassword } from "../services/userService";
import { PERMISSIONS, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from "../constants/permissions";
import { toast } from "react-toastify";

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormData extends Partial<User> {
  password?: string;
  permissions: string[];
}

export default function UserForm({ user, onClose, onSave }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "operator",
    permissions: ROLE_PERMISSIONS.operator,
    active: true,
    password: "",
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      console.log('🔄 USERFORM - Usuário recebido:', user);
      console.log('🔄 USERFORM - Permissões do usuário:', user.permissions);
      console.log('🔄 USERFORM - Tipo das permissões:', typeof user.permissions);
      
      // Se for admin, define todas as permissões
      const permissions = user.role === 'admin' 
        ? PERMISSIONS.map(p => p.key) 
        : (Array.isArray(user.permissions) ? user.permissions : ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.operator);
      
      console.log('🔄 USERFORM - Permissões processadas:', permissions);
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "operator",
        permissions: permissions,
        active: user.active !== false,
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" && "checked" in target ? target.checked : value,
      };

      // Se mudar para admin, ativa todas as permissões
      if (name === "role") {
        if (value === "admin") {
          updated.permissions = PERMISSIONS.map(p => p.key);
        } else if (value in ROLE_PERMISSIONS) {
          updated.permissions = ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS];
          toast.info(`Permissões sugeridas para ${ROLE_DESCRIPTIONS[value] || 'Cargo selecionado'}. Você pode personalizar as permissões como quiser.`);
        }
      }

      return updated;
    });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionsChange = (permissions: string[]) => {
    setFormData(prev => ({
      ...prev,
      permissions
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Sempre envia exatamente as permissões selecionadas, independente do cargo
      const permissions = formData.permissions;

      console.log('🔄 USERFORM - Permissões antes de enviar:', permissions);
      console.log('🔄 USERFORM - FormData completo:', formData);

      const dataToSend: any = {
        ...formData,
        permissions
      };

      console.log('🔄 USERFORM - DataToSend:', dataToSend);

      // No update, nunca envie password (exceto se for alteração de senha)
      if (user?.id) {
        delete dataToSend.password;
      } else {
        dataToSend.password = formData.password;
      }

      // Se for alteração de senha
      if (user?.id && showPasswordChange) {
        await updateUserPassword(user.id, passwordData.password, passwordData.confirmPassword);
        toast.success("Senha alterada com sucesso!");
      }

      // Sempre atualize os dados do usuário (exceto senha)
      if (user?.id) {
        await updateUser(user.id, dataToSend);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await createUser(dataToSend);
        toast.success("Usuário criado com sucesso!");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário. Verifique os dados.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-3 sm:p-6 w-full max-w-4xl max-min-h-[80vh] max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {user ? "Editar Usuário" : "Novo Usuário"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INFORMAÇÕES BÁSICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 sm:p-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border p-2 rounded"
                value={formData.name || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border p-2 rounded"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* SENHA */}
          {user ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
              >
                {showPasswordChange ? "Cancelar alteração de senha" : "Alterar senha"}
              </button>

              {showPasswordChange && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 pt-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="w-full border p-2 rounded mt-1"
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="w-full border p-2 rounded mt-1"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full border p-2 rounded"
                value={formData.password || ""}
                onChange={handleChange}
              />
            </div>
          )}

          {/* CARGO */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Cargo</label>
            <select
              name="role"
              className="w-full border p-2 rounded"
              value={formData.role || ""}
              onChange={handleChange}
            >
              <option value="operator">Operador</option>
              <option value="manager">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs sm:text-sm text-gray-500">{ROLE_DESCRIPTIONS[formData.role || "operator"]}</p>
          </div>

          {/* PERMISSÕES */}
          <div className="border-t pt-6">
            <PermissionSelector
              selected={formData.permissions}
              onChange={handlePermissionsChange}
              availablePermissions={PERMISSIONS}
              disabled={false}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              {formData.role === 'admin' 
                ? "Administradores têm acesso total ao sistema automaticamente."
                : "Você pode personalizar as permissões independentemente do cargo selecionado."}
            </p>
          </div>

          {/* STATUS */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={formData.active ?? true}
                onChange={handleChange}
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Usuário ativo</span>
            </label>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-2 sm:gap-4 pt-6 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
