import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Car } from 'lucide-react';

interface DadosGrafico {
  nome: string;
  valor: number;
  ocorrencias: number;
}

interface Props {
  topClientes: DadosGrafico[];
  topPrestadores: DadosGrafico[];
  dadosMensais: Array<{ mes: string; faturado: number; pago: number; lucro: number }>;
}

const FinanceiroCharts: React.FC<Props> = ({ topClientes, topPrestadores, dadosMensais }) => {
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 sm:p-6">
      {/* Top Clientes */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Top 5 Clientes</h3>
          </div>
          <div className="space-y-3">
            {topClientes.map((cliente, index) => (
              <div key={cliente.nome} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{cliente.nome}</p>
                    <p className="text-xs text-gray-500">{cliente.ocorrencias} ocorrências</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs sm:text-sm text-green-600">{formatarValor(cliente.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Prestadores */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Top 5 Prestadores</h3>
          </div>
          <div className="space-y-3">
            {topPrestadores.map((prestador) => (
              <div key={prestador.nome} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                    {/* Se quiser mostrar o índice, adicione aqui: */}
                  </div>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{prestador.nome}</p>
                    <p className="text-xs text-gray-500">{prestador.ocorrencias} ocorrências</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs sm:text-sm text-blue-600">{formatarValor(prestador.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evolução Mensal */}
      <Card className="lg:col-span-2">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Evolução Mensal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dadosMensais.slice(-3).map((dado) => (
              <div key={dado.mes} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-2">{dado.mes}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-600">Faturado:</span>
                    <span className="font-medium">{formatarValor(dado.faturado)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-red-600">Pago:</span>
                    <span className="font-medium">{formatarValor(dado.pago)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-blue-600">Lucro:</span>
                    <span className="font-medium">{formatarValor(dado.lucro)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroCharts; 