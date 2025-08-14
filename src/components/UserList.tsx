import { User } from "../services/userService";
import PermissionButton from "./PermissionButton";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user: User) => (
            <tr key={user.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold capitalize">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={user.active ? "inline-flex px-2 py-1 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full" : "inline-flex px-2 py-1 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full"}>
                  {user.active ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex gap-2">
                  <PermissionButton
                    requiredPermission="update:user"
                    onClick={() => onEdit(user)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow transition-colors"
                    size="sm"
                    message="Você não tem permissão para editar usuários."
                  >
                    Editar
                  </PermissionButton>
                  <PermissionButton
                    requiredPermission="delete:user"
                    onClick={() => onDelete(user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow transition-colors"
                    size="sm"
                    message="Você não tem permissão para excluir usuários."
                  >
                    Excluir
                  </PermissionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
