import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import LogoClienteCosta from '@/components/LogoClienteCosta';
import './LoginPage.css';

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
      className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 overflow-hidden px-4 sm:px-6"
      style={{ minHeight: '100vh' }}
    >
             <div className="w-full max-w-4xl space-y-6 z-10">
         {/* Card principal dividido em duas seções */}
         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
           <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Seção lateral esquerda - Logo e Boas-vindas */}
                         <div className="lg:w-1/2 bg-gradient-to-br from-gray-800 via-gray-700 to-slate-600 p-6 sm:p-8 lg:p-12 flex flex-col justify-center items-center text-center">
              <div className="mb-8">
                                 <LogoClienteCosta
                   className="logo-costa-login object-contain mb-4 sm:mb-6 drop-shadow-lg"
                   style={{
                     '--logo-size': '3rem',
                     '--logo-size-sm': '4rem',
                     '--logo-size-lg': '20rem'
                   } as React.CSSProperties}
                 />
              </div>
                             <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                 Bem-vindo!
               </h1>
               <p className="text-base sm:text-lg text-gray-200 leading-relaxed px-2">
                 Entre na sua conta para acessar todas as funcionalidades do sistema.
               </p>
            </div>

            {/* Seção direita - Formulário de Login */}
                         <div className="lg:w-1/2 bg-white p-6 sm:p-8 lg:p-12">
                             <div className="mb-6 sm:mb-8">
                 <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                   Login
                 </h2>
                 <p className="text-sm sm:text-base text-gray-600">
                   Acesse sua conta
                 </p>
               </div>

              {apiStatus === 'error' && (
                <div className="rounded-md bg-red-50 p-4 shadow mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erro de Conexão
                      </h3>
                      <div className="text-sm text-red-700">
                        {erro && formatErrorMessage(erro)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form
                className="space-y-6"
                onSubmit={handleSubmit}
              >
                     <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2.5 sm:py-3 lg:py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 text-sm sm:text-base bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={apiStatus !== 'connected'}
                />
              </div>
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2.5 sm:py-3 lg:py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 focus:z-10 text-sm sm:text-base bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={apiStatus !== 'connected'}
                />
              </div>
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
                             className={`group relative w-full flex justify-center items-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white transition-all duration-200
                ${loading || apiStatus !== 'connected'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-700 to-slate-600 hover:from-gray-600 hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-lg'}`}
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
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
