import api from './api';

// Função para parsear permissões corretamente
function parseUserPermissions(permissions: any): string[] {
  if (Array.isArray(permissions)) {
    return permissions;
  }
  
  if (typeof permissions === 'string') {
    try {
      return JSON.parse(permissions);
    } catch (error) {
      console.error('Erro ao parsear permissões:', error);
      return [];
    }
  }
  
  return [];
}

// interface PermissionsObject {
//   users: { read: boolean; create: boolean; update: boolean; delete: boolean };
//   ocorrencias: { read: boolean; create: boolean; update: boolean; delete: boolean };
//   dashboard: { read: boolean };
//   prestadores: { read: boolean; create: boolean; update: boolean; delete: boolean };
//   relatorios: { read: boolean; create: boolean; update: boolean; delete: boolean };
//   clientes: { read: boolean; create: boolean; update: boolean; delete: boolean };
//   financeiro: { read: boolean };
// }

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Lista todos os usuários
export async function getUsers(): Promise<User[]> {
  console.log('Buscando usuários...');
  try {
    const response = await api.get('/api/users');
    console.log('✅ GETUSERS - Response data:', response.data);
    console.log('✅ GETUSERS - Permissions do primeiro usuário:', response.data[0]?.permissions);
    console.log('✅ GETUSERS - Tipo das permissions:', typeof response.data[0]?.permissions);
    
    // Parsear permissões para cada usuário
    const usersWithParsedPermissions = response.data.map((user: any) => ({
      ...user,
      permissions: parseUserPermissions(user.permissions)
    }));
    
    console.log('✅ GETUSERS - Usuários com permissões parseadas:', usersWithParsedPermissions);
    return usersWithParsedPermissions;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}

// Busca um usuário pelo ID
export async function getUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/api/users/${id}`);
    console.log('✅ GETUSER - Response data:', response.data);
    console.log('✅ GETUSER - Permissions:', response.data.permissions);
    
    // Parsear permissões
    const userWithParsedPermissions = {
      ...response.data,
      permissions: parseUserPermissions(response.data.permissions)
    };
    
    console.log('✅ GETUSER - Usuário com permissões parseadas:', userWithParsedPermissions);
    return userWithParsedPermissions;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

// Cria um novo usuário
export async function createUser(user: Partial<User>): Promise<User> {
  try {
    const response = await api.post('/api/users', user);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// Atualiza um usuário existente
export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  try {
    const response = await api.put(`/api/users/${id}`, user);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

// Exclui um usuário pelo ID
export async function deleteUser(id: string): Promise<void> {
  try {
    await api.delete(`/api/users/${id}`);
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
}

// Busca o usuário atual
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get('/api/users/me');
    console.log('✅ GETCURRENTUSER - Response data:', response.data);
    
    // Parsear permissões
    const userWithParsedPermissions = {
      ...response.data,
      permissions: parseUserPermissions(response.data.permissions)
    };
    
    console.log('✅ GETCURRENTUSER - Usuário com permissões parseadas:', userWithParsedPermissions);
    return userWithParsedPermissions;
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    throw error;
  }
}

// Altera a senha de um usuário
export async function updateUserPassword(id: string, password: string, confirmPassword: string): Promise<void> {
  try {
    await api.patch(`/api/users/${id}/password`, { password, confirmPassword });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
}
