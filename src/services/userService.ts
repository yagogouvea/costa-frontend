import api from './api';

interface PermissionsObject {
  users: { read: boolean; create: boolean; update: boolean; delete: boolean };
  ocorrencias: { read: boolean; create: boolean; update: boolean; delete: boolean };
  dashboard: { read: boolean };
  prestadores: { read: boolean; create: boolean; update: boolean; delete: boolean };
  relatorios: { read: boolean; create: boolean; update: boolean; delete: boolean };
  clientes: { read: boolean; create: boolean; update: boolean; delete: boolean };
  financeiro: { read: boolean };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[] | PermissionsObject;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Lista todos os usuários
export async function getUsers(): Promise<User[]> {
  console.log('Buscando usuários...');
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}

// Busca um usuário pelo ID
export async function getUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
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
    return response.data;
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
