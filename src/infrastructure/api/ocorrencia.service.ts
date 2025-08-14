import { api } from '@/services/api';
import { Ocorrencia } from '../../core/types/ocorrencia.types';

class OcorrenciaService {
  private baseUrl = '/v1/ocorrencias';

  async findAll(): Promise<Ocorrencia[]> {
    const { data } = await api.get<Ocorrencia[]>(this.baseUrl);
    return data;
  }

  async findById(id: number): Promise<Ocorrencia> {
    const { data } = await api.get<Ocorrencia>(`${this.baseUrl}/${id}`);
    return data;
  }

  async create(ocorrencia: Partial<Ocorrencia>): Promise<Ocorrencia> {
    const { data } = await api.post<Ocorrencia>(this.baseUrl, ocorrencia);
    return data;
  }

  async update(id: number, ocorrencia: Partial<Ocorrencia>): Promise<Ocorrencia> {
    const { data } = await api.put<Ocorrencia>(`${this.baseUrl}/${id}`, ocorrencia);
    return data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async findByStatus(status: string): Promise<Ocorrencia[]> {
    const { data } = await api.get<Ocorrencia[]>(`${this.baseUrl}/status/${status}`);
    return data;
  }

  async addPhotos(id: number, fotos: { url: string; legenda: string }[]): Promise<Ocorrencia> {
    const { data } = await api.post<Ocorrencia>(`${this.baseUrl}/${id}/fotos`, { fotos });
    return data;
  }

  async generateReport(id: number): Promise<{ url: string }> {
    const { data } = await api.post<{ url: string }>(`${this.baseUrl}/${id}/relatorio`);
    return data;
  }
}

export const ocorrenciaService = new OcorrenciaService(); 