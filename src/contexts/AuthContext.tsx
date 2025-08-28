import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  permissions?: string[] | {
    users?: {
      [key: string]: boolean;
    };
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  token?: string;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

// Função simples para decodificar JWT sem dependência externa
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar JWT:', e);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('segtrack.token');
    console.log('🔍 Token inicial do localStorage:', storedToken ? 'PRESENTE' : 'AUSENTE');
    return storedToken;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const t = localStorage.getItem('segtrack.token');
    if (t) {
      const decodedToken = parseJwt(t);
      console.log('🔍 Token decodificado inicial:', decodedToken);
      if (decodedToken) {
        return {
          id: decodedToken.sub || decodedToken.id,
          nome: decodedToken.nome || decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role,
          permissions: decodedToken.permissions
        };
      }
    }
    return null;
  });

  useEffect(() => {
    console.log('🔄 useEffect do AuthContext - token mudou:', token ? 'PRESENTE' : 'AUSENTE');
    if (token) {
      const decodedToken = parseJwt(token);
      console.log('🔍 Decodificando token no useEffect:', decodedToken);
      if (decodedToken) {
        const userData = {
          id: decodedToken.sub || decodedToken.id,
          nome: decodedToken.nome || decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role,
          permissions: decodedToken.permissions
        };
        console.log('👤 Definindo usuário:', userData);
        setUser(userData);
        api.defaults.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log('❌ Removendo usuário e token');
      setUser(null);
      api.defaults.headers.Authorization = '';
    }
  }, [token]);

  async function signIn(email: string, password: string) {
    try {
      console.log('🚀 Iniciando signIn com:', { email, passwordLength: password.length });
      const response = await api.post('/api/auth/login', {
        email,
        senha: password,
      });

      console.log('✅ Resposta do login:', response.data);
      const { token } = response.data;
      const decodedToken = parseJwt(token);

      console.log('🔍 Token recebido decodificado:', decodedToken);
      if (decodedToken) {
        console.log('💾 Salvando token no localStorage');
        localStorage.setItem('segtrack.token', token);
        setToken(token);
        const userData = {
          id: decodedToken.sub || decodedToken.id,
          nome: decodedToken.nome || decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role,
          permissions: decodedToken.permissions
        };
        console.log('👤 Definindo usuário no signIn:', userData);
        setUser(userData);
        api.defaults.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Erro no signIn:', error);
      throw new Error('Falha na autenticação');
    }
  }

  function signOut() {
    console.log('🚪 Fazendo signOut');
    setUser(null);
    setToken(null);
    localStorage.removeItem('segtrack.token');
    api.defaults.headers.Authorization = '';
  }

  const isAuthenticated = !!token;
  console.log('🔐 isAuthenticated:', isAuthenticated, 'token:', token ? 'PRESENTE' : 'AUSENTE', 'user:', user ? 'PRESENTE' : 'AUSENTE');
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signOut, 
      isAuthenticated,
      token: token || undefined,
      logout: signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
