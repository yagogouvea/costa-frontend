import { useEffect, useState, useCallback } from "react";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import PermissionButton from "../components/PermissionButton";
import { User, getUsers, deleteUser } from "../services/userService";
import { toast } from "react-toastify";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageAccessControl from "../components/PageAccessControl";
import { usePermissions } from "../hooks/usePermissions";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  // Hook para verificar permissões
  const { hasPageAccess, hasFeatureAccess } = usePermissions();
  
  // Função auxiliar para verificar permissões específicas de usuários
  const hasUserPermission = useCallback((_action: 'read' | 'create' | 'delete' | 'update') => {
    // Para o novo sistema, verificamos se tem acesso à página de usuários
    return hasPageAccess('access:usuarios');
  }, [hasPageAccess]);

  // Logs de debug
  console.log('🔍 UsersPage Debug:');
  console.log('Token:', token ? 'PRESENTE' : 'AUSENTE');
  console.log('User:', user);
  console.log('User permissions:', user?.permissions);
  console.log('Has page access:', hasPageAccess('access:usuarios'));
  console.log('Has feature access:', hasFeatureAccess('prestadores:export'));

  // Salvar logs no localStorage para debug
  const debugInfo = {
    timestamp: new Date().toISOString(),
    token: token ? 'PRESENTE' : 'AUSENTE',
    user: user ? 'PRESENTE' : 'AUSENTE',
    userPermissions: user?.permissions,
    hasPageAccess: hasPageAccess('access:usuarios'),
    hasFeatureAccess: hasFeatureAccess('prestadores:export')
  };
  localStorage.setItem('debug_users_page', JSON.stringify(debugInfo));

  // Efeito para verificar o token e carregar usuários
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Função interna para evitar dependências externas
    const fetchUsers = async () => {
      // Usar o hook de permissões em vez de verificar manualmente
      if (!hasUserPermission('read')) {
        setError("Você não tem permissão para visualizar usuários.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fazendo requisição para /users...');
        const response = await getUsers();
        console.log('✅ Resposta da API:', response);
        setUsers(response);
      } catch (error: any) {
        console.error("❌ Erro ao carregar usuários:", error);
        console.error("❌ Status:", error.response?.status);
        console.error("❌ Data:", error.response?.data);
        if (error.response?.status === 401) {
          console.warn('Token expirado ou inválido');
          logout();
          return;
        }
        if (error.response?.status === 403) {
          setError("Você não tem permissão para acessar esta página.");
          toast.error("Acesso negado. Verifique suas permissões.");
        } else {
          setError("Não foi possível carregar os usuários. Tente novamente mais tarde.");
          toast.error("Erro ao carregar usuários.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Efeito para verificar permissões
  useEffect(() => {
    if (!hasUserPermission('read')) {
      setError("Você não tem permissão para visualizar usuários.");
    } else {
      setError(null);
    }
  }, [hasUserPermission]);

  const handleDelete = async (userId: string) => {
    if (!token) {
      navigate('/login');
      return;
    }

    const confirm = window.confirm("Tem certeza que deseja excluir este usuário?");
    if (!confirm) return;

    try {
      await deleteUser(userId);
      toast.success("Usuário excluído com sucesso!");
      window.location.reload();
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        return;
      }
      console.error("Erro ao excluir usuário:", error);
      toast.error(error.response?.data?.message || "Erro ao excluir usuário.");
    }
  };

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  }, []);

  // Renderização condicional baseada no token
  if (!token) {
    return null;
  }

  // Adicionar log para depuração
  console.log('Lista de usuários recebida:', users);

  // Renderização condicional baseada nas permissões
  if (!hasUserPermission('read')) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Você não tem permissão para acessar esta página.
        </div>
      </div>
    );
  }

  return (
    <PageAccessControl pageKey="access:usuarios">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Gerenciamento de Usuários
            </h1>
            <p className="text-gray-500 mt-2">Gerencie os usuários do sistema</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const debugInfo = localStorage.getItem('debug_users_page');
                const apiRequest = localStorage.getItem('debug_api_request');
                const apiError = localStorage.getItem('debug_api_error');
                        console.log('=== DEBUG INFO ===');
        console.log('Users Page Debug:', debugInfo ? JSON.parse(debugInfo) : 'N/A');
        console.log('API Request Debug:', apiRequest ? JSON.parse(apiRequest) : 'N/A');
        console.log('API Error Debug:', apiError ? JSON.parse(apiError) : 'N/A');
        console.log('Current Permissions:', { hasPageAccess: hasPageAccess('access:usuarios'), hasFeatureAccess: hasFeatureAccess('prestadores:export') });
        alert('Debug info logged to console. Check DevTools > Console');
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm"
            >
              Debug Info
            </button>
            <PermissionButton
              requiredPermission="create:user"
              onClick={() => {
                setSelectedUser(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              message="Você não tem permissão para criar novos usuários."
            >
              <UserPlus size={20} />
              Novo Usuário
            </PermissionButton>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <UserList
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <UserForm
            user={selectedUser}
            onClose={() => setShowForm(false)}
            onSave={() => {
              window.location.reload();
              setShowForm(false);
            }}
          />
        )}
      </div>
    </PageAccessControl>
  );
}
