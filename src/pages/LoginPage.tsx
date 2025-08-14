import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import LogoSegtrack from '@/components/LogoSegtrack';

type ApiStatus = 'checking' | 'connected' | 'error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Verificar conexão com o backend
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const checkApiConnection = async () => {
      try {
        await api.get('/api/health', { signal: controller.signal });
        if (mounted) {
          setApiStatus('connected');
        }
      } catch (error: any) {
        if (!mounted) return;
        if (error.response) {
          setApiStatus('connected');
        } else if (error.name === 'AbortError') {
        } else {
          setApiStatus('error');
          setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
        }
      }
    };
    checkApiConnection();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      await signIn(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/ocorrencias');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErro('Email ou senha incorretos');
      } else if (error.response?.data?.message) {
        setErro(error.response.data.message);
      } else {
        setErro('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (message: string) => {
    if (message.includes('\n-')) {
      const [title, ...items] = message.split('\n-');
      return (
        <>
          <p className="font-medium mb-2">{title}</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {items.map((item, index) => (
              <li key={index}>{item.trim()}</li>
            ))}
          </ul>
        </>
      );
    }
    return <span className="block sm:inline">{message}</span>;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-100 via-white to-blue-200 overflow-hidden px-4 sm:px-6"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-full max-w-sm sm:max-w-md space-y-6 z-10">
        <div className="flex flex-col items-center">
          {/* Logo no topo do card */}
          <LogoSegtrack
            variant="original"
            className="w-32 h-24 sm:w-40 sm:h-32 lg:w-48 lg:h-36 object-contain mb-4 drop-shadow-lg"
          />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Login
          </h2>
        </div>

        {apiStatus === 'error' && (
          <div className="rounded-md bg-red-50 p-4 shadow">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro de Conexão
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {erro && formatErrorMessage(erro)}
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          className="space-y-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl px-6 sm:px-8 py-6 sm:py-8 border border-blue-100"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 sm:py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-sm sm:text-base bg-white/80"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={apiStatus !== 'connected'}
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 sm:py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-sm sm:text-base bg-white/80"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={apiStatus !== 'connected'}
              />
            </div>
          </div>

          {erro && apiStatus === 'connected' && (
            <div className="rounded-md bg-red-50 p-4 shadow">
              <div className="flex">
                <div className="ml-3">
                  <div className="text-sm text-red-700">
                    {formatErrorMessage(erro)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || apiStatus !== 'connected'}
              className={`group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-lg text-white transition-all duration-200
                ${loading || apiStatus !== 'connected'
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
