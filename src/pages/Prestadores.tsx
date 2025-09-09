import { useEffect, useState } from "react";
import { User, Loader2, Link as LinkIcon } from "lucide-react";
import api from "@/services/api";

interface Prestador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
}

const Prestadores = () => {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const EXTERNAL_SIGNUP_URL = 'https://painel.costaecamargo.seg.br/cadastro-prestador';

  const handleCopyExternalLink = async () => {
    try {
      await navigator.clipboard.writeText(EXTERNAL_SIGNUP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link para a área de transferência:', err);
    }
  };

  useEffect(() => {
    const fetchPrestadores = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/v1/prestadores');
        setPrestadores(response.data);
      } catch (err) {
        console.error('Erro ao carregar prestadores:', err);
        setError('Não foi possível carregar os prestadores. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrestadores();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User size={20} /> Prestadores de Serviço
          </h1>
          <p className="text-gray-500 mt-2">Lista de prestadores cadastrados</p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleCopyExternalLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            title="Copiar link de cadastro externo"
          >
            <LinkIcon size={16} />
            Link cadastro externo
            {copied && (
              <span className="ml-2 text-xs text-white/90">Copiado!</span>
            )}
          </button>
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
      ) : prestadores.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Nenhum prestador cadastrado.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prestadores.map((prestador) => (
                <tr key={prestador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prestador.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prestador.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prestador.telefone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      prestador.status === 'ATIVO' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prestador.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Prestadores;
