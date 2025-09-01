import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Users, Table, BarChart2 } from 'lucide-react';
import PageAccessControl from '@/components/PageAccessControl';

// Mock de ocorrências finalizadas (Recuperado e Não Recuperado)
const mockFechamentos = [
  {
    id: 101,
    operador: 'João',
    data: '2024-06-10',
    placa: 'ABC-1234',
    modelo: 'Onix',
    cor: 'Prata',
    tipo: 'Roubo',
    local: 'Av. Brasil, 1000',
    prestador: 'Fox',
    inicio: '2024-06-10T08:00:00',
    chegada: '2024-06-10T08:30:00',
    termino: '2024-06-10T09:15:00',
    km_inicial: 10000,
    km_final: 10025,
    resultado: 'RECUPERADO',
  },
  {
    id: 102,
    operador: 'Maria',
    data: '2024-06-11',
    placa: 'XYZ-5678',
    modelo: 'HB20',
    cor: 'Preto',
    tipo: 'Furto',
    local: 'Rua das Flores, 200',
    prestador: 'Eagle',
    inicio: '2024-06-11T10:00:00',
    chegada: '2024-06-11T10:45:00',
    termino: '2024-06-11T12:00:00',
    km_inicial: 5000,
    km_final: 5000,
    resultado: 'NAO_RECUPERADO',
  },
  {
    id: 103,
    operador: 'Carlos',
    data: '2024-06-12',
    placa: 'DEF-4321',
    modelo: 'Corolla',
    cor: 'Branco',
    tipo: 'Roubo',
    local: 'Centro',
    prestador: 'Wolf',
    inicio: '2024-06-12T14:00:00',
    chegada: '2024-06-12T14:30:00',
    termino: '2024-06-12T15:00:00',
    km_inicial: null,
    km_final: null,
    resultado: 'RECUPERADO',
  },
];

function formatarTempoTotal(inicio: string, termino: string) {
  if (!inicio || !termino) return '-';
  const ini = new Date(inicio);
  const fim = new Date(termino);
  if (isNaN(ini.getTime()) || isNaN(fim.getTime())) return '-';
  const diff = Math.max(0, fim.getTime() - ini.getTime());
  const horas = Math.floor(diff / 3600000);
  const minutos = Math.floor((diff % 3600000) / 60000);
  const segundos = Math.floor((diff % 60000) / 1000);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function formatarKmTotal(km_inicial: number | null, km_final: number | null) {
  if (km_inicial && km_final && km_final >= km_inicial) {
    const kmTotal = km_final - km_inicial;
    if (kmTotal === 0 || kmTotal <= 50) {
      return 'Franquia';
    }
    return kmTotal;
  }
  return 'Franquia';
}

const FinanceiroPage: React.FC = () => {
  const [aba, setAba] = useState<'dashboard' | 'fechamentos' | 'prestadores'>('dashboard');

  return (
    <PageAccessControl pageKey="access:financeiro">
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho e Abas */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3 text-blue-900">
              <FileText className="w-8 h-8 text-blue-500" />
              Financeiro
            </h1>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm lg:text-base">
              Acompanhe receitas, despesas e o fluxo financeiro do sistema
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant={aba === 'dashboard' ? 'default' : 'ghost'} onClick={() => setAba('dashboard')} className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Dashboard
            </Button>
            <Button variant={aba === 'fechamentos' ? 'default' : 'ghost'} onClick={() => setAba('fechamentos')} className="flex items-center gap-2">
              <Table className="w-5 h-5" /> Fechamentos
            </Button>
            <Button variant={aba === 'prestadores' ? 'default' : 'ghost'} onClick={() => setAba('prestadores')} className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Prestadores
            </Button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {aba === 'dashboard' && (
          <div className="bg-white rounded-xl shadow border border-blue-100 p-8 text-center text-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2"><BarChart2 className="w-6 h-6 text-blue-500" /> Dashboard Financeiro</h2>
            <p>Resumo financeiro, gráficos e indicadores serão exibidos aqui.</p>
          </div>
        )}

        {aba === 'fechamentos' && (
          <div className="bg-white rounded-xl shadow border border-blue-100 p-4 overflow-x-auto">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Table className="w-5 h-5 text-blue-500" /> Fechamentos de Ocorrências</h2>
            <table className="min-w-full divide-y divide-blue-100 text-blue-900 text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">Operador</th>
                  <th className="px-2 py-1">Data</th>
                  <th className="px-2 py-1">Placa</th>
                  <th className="px-2 py-1">Modelo</th>
                  <th className="px-2 py-1">Cor</th>
                  <th className="px-2 py-1">Tipo</th>
                  <th className="px-2 py-1">Local</th>
                  <th className="px-2 py-1">Prestador</th>
                  <th className="px-2 py-1">Início</th>
                  <th className="px-2 py-1">Chegada</th>
                  <th className="px-2 py-1">Término</th>
                  <th className="px-2 py-1">Tempo Total</th>
                  <th className="px-2 py-1">KM Inicial</th>
                  <th className="px-2 py-1">KM Final</th>
                  <th className="px-2 py-1">KM Total</th>
                </tr>
              </thead>
              <tbody>
                {mockFechamentos.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/60">
                    <td className="px-2 py-1">{o.id}</td>
                    <td className="px-2 py-1">{o.operador}</td>
                    <td className="px-2 py-1">{o.data}</td>
                    <td className="px-2 py-1">{o.placa}</td>
                    <td className="px-2 py-1">{o.modelo}</td>
                    <td className="px-2 py-1">{o.cor}</td>
                    <td className="px-2 py-1">{o.tipo}</td>
                    <td className="px-2 py-1">{o.local}</td>
                    <td className="px-2 py-1">{o.prestador}</td>
                    <td className="px-2 py-1">{o.inicio ? new Date(o.inicio).toLocaleString('pt-BR') : '-'}</td>
                    <td className="px-2 py-1">{o.chegada ? new Date(o.chegada).toLocaleString('pt-BR') : '-'}</td>
                    <td className="px-2 py-1">{o.termino ? new Date(o.termino).toLocaleString('pt-BR') : '-'}</td>
                    <td className="px-2 py-1">{formatarTempoTotal(o.inicio, o.termino)}</td>
                    <td className="px-2 py-1">{o.km_inicial ?? '-'}</td>
                    <td className="px-2 py-1">{o.km_final ?? '-'}</td>
                    <td className="px-2 py-1">{formatarKmTotal(o.km_inicial, o.km_final)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {aba === 'prestadores' && (
          <div className="bg-white rounded-xl shadow border border-blue-100 p-8 text-center text-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2"><Users className="w-6 h-6 text-blue-500" /> Prestadores</h2>
            <p>Informações e relatórios de prestadores serão exibidos aqui.</p>
          </div>
        )}
      </div>
    </div>
      </PageAccessControl>
  );
};

export default FinanceiroPage;
