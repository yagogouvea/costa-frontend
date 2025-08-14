import api from './api';

export interface Prestador {
  id: string;
  nome: string;
  cod_nome?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  ativo?: boolean;
  cep?: string;
  regioes?: any[];
}

export async function getPrestadores(): Promise<Prestador[]> {
  try {
    const response = await api.get('/api/prestadores');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    throw error;
  }
}

export async function getPrestador(id: string): Promise<Prestador> {
  try {
    const response = await api.get(`/api/prestadores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar prestador:', error);
    throw error;
  }
}

export async function createPrestador(prestador: Partial<Prestador>): Promise<Prestador> {
  try {
    const response = await api.post('/api/prestadores', prestador);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar prestador:', error);
    throw error;
  }
}

export async function updatePrestador(id: string, prestador: Partial<Prestador>): Promise<Prestador> {
  try {
    const response = await api.put(`/api/prestadores/${id}`, prestador);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar prestador:', error);
    throw error;
  }
}

export async function deletePrestador(id: string): Promise<void> {
  try {
    await api.delete(`/api/prestadores/${id}`);
  } catch (error) {
    console.error('Erro ao excluir prestador:', error);
    throw error;
  }
}

export async function buscarPrestadorPorNome(nome: string): Promise<Prestador | null> {
  try {
    const response = await api.get(`/api/prestadores/buscar-por-nome/${encodeURIComponent(nome)}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar prestador por nome:', error);
    return null;
  }
}

export async function getPrestadoresPopup(): Promise<Prestador[]> {
  try {
    const response = await api.get('/api/prestadores/popup');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar prestadores para popup:', error);
    throw error;
  }
} 