import { Cliente } from '@/types/cliente';
import api from '@/services/api';

export async function getClientes(): Promise<Cliente[]> {
  const response = await api.get("/api/clientes");
  return response.data;
}

export async function getClientePorId(id: number): Promise<Cliente> {
  const response = await api.get(`/api/clientes/${id}`);
  return response.data;
}

export async function criarCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
  const response = await api.post("/api/clientes", cliente);
  return response.data;
}

export async function atualizarCliente(cliente: Cliente): Promise<Cliente> {
  if (!cliente.id) {
    throw new Error('ID do cliente é necessário para atualização');
  }

  const response = await api.put(`/api/clientes/${cliente.id}`, cliente);
  return response.data;
}

export async function excluirCliente(id: number): Promise<void> {
  await api.delete(`/api/clientes/${id}`);
} 