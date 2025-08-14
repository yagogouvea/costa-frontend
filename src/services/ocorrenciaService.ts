import api from './api';
import { Ocorrencia, CreateOcorrenciaDTO, OcorrenciaStatus } from '../types/ocorrencia';

export async function getOcorrencias(): Promise<Ocorrencia[]> {
  try {
    const response = await api.get('/api/ocorrencias');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    throw error;
  }
}

export async function getOcorrencia(id: number): Promise<Ocorrencia> {
  try {
    const response = await api.get(`/api/ocorrencias/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ocorrência:', error);
    throw error;
  }
}

export async function createOcorrencia(ocorrencia: CreateOcorrenciaDTO): Promise<Ocorrencia> {
  try {
    const response = await api.post('/api/ocorrencias', ocorrencia);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    throw error;
  }
}

export async function updateOcorrencia(id: number, ocorrencia: Partial<Ocorrencia>): Promise<Ocorrencia> {
  try {
    const response = await api.put(`/api/ocorrencias/${id}`, ocorrencia);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    throw error;
  }
}

export async function deleteOcorrencia(id: number): Promise<void> {
  try {
    await api.delete(`/api/ocorrencias/${id}`);
  } catch (error) {
    console.error('Erro ao excluir ocorrência:', error);
    throw error;
  }
}

export async function encerrarOcorrencia(id: number, resultado: string): Promise<Ocorrencia> {
  try {
    const response = await api.post(`/api/ocorrencias/${id}/encerrar`, { resultado });
    return response.data;
  } catch (error) {
    console.error('Erro ao encerrar ocorrência:', error);
    throw error;
  }
}

export async function buscarOcorrenciasPorFiltro(filtros: {
  cliente?: string;
  status?: OcorrenciaStatus;
  dataInicio?: string;
  dataFim?: string;
}): Promise<Ocorrencia[]> {
  try {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/api/ocorrencias?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ocorrências com filtros:', error);
    throw error;
  }
}

export async function adicionarFotos(id: number, fotos: { url: string; legenda?: string }[]): Promise<Ocorrencia> {
  try {
    const response = await api.post(`/api/ocorrencias/${id}/fotos`, { fotos });
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar fotos:', error);
    throw error;
  }
}

export async function gerarRelatorio(id: number): Promise<{ url: string }> {
  try {
    const response = await api.post(`/api/ocorrencias/${id}/relatorio`);
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw error;
  }
} 