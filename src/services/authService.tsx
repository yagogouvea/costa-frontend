import api from './api';

interface LoginResponse {
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

// Função para testar endpoints de registro
export async function testRegistrationEndpoints() {
  const endpoints = [
    'auth/register',
    'auth/signup',
    'users',
    'users/create',
    'register'
  ];

  const testData: RegisterRequest = {
    email: 'test@segtrackpr.com.br',
    password: 'Test123!@#',
    name: 'Test User',
    role: 'admin'
  };

  console.log('Testando endpoints de registro...');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testando endpoint: ${endpoint}`);
      const response = await api.post(endpoint, testData);
      console.log(`Endpoint ${endpoint} encontrado! Status:`, response.status);
      console.log('Resposta:', response.data);
      return { endpoint, status: response.status, data: response.data };
    } catch (error: any) {
      if (error.response) {
        // Se recebemos uma resposta do servidor, mesmo que seja erro,
        // significa que o endpoint existe
        console.log(`Endpoint ${endpoint} respondeu com status:`, error.response.status);
        console.log('Dados do erro:', error.response.data);
        
        // Se recebemos 401 ou 403, significa que o endpoint existe mas precisa de autenticação
        if (error.response.status === 401 || error.response.status === 403) {
          return { 
            endpoint, 
            status: error.response.status, 
            requiresAuth: true,
            message: 'Endpoint encontrado, mas requer autenticação'
          };
        }
      } else {
        console.log(`Endpoint ${endpoint} não encontrado ou erro de conexão`);
      }
    }
  }

  return null;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  // Validação básica
  if (!email || !email.includes('@')) {
    throw new Error('Por favor, insira um email válido.');
  }

  if (!password) {
    throw new Error('Por favor, insira sua senha.');
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres. Verifique se não esqueceu nenhum caractere.');
  }

  console.log('Iniciando tentativa de login com:', { 
    email,
    emailLength: email.length,
    passwordLength: password.length 
  });

  const loginData: LoginRequest = {
    email: email.trim().toLowerCase(), // Normaliza o email
    password: password
  };

  try {
    console.log('Enviando requisição para:', '/api/auth/login');
    console.log('Dados da requisição:', { 
      email: loginData.email,
      passwordLength: loginData.password.length
    });

    const response = await api.post('/api/auth/login', loginData);

    console.log('Resposta do servidor:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data ? { 
        ...response.data,
        token: response.data.token ? '[PRESENTE]' : '[AUSENTE]'
      } : null
    });

    if (!response.data) {
      throw new Error('Resposta vazia do servidor');
    }

    if (!response.data.token) {
      throw new Error('Token não recebido do servidor');
    }

    // Salva o token no localStorage
    localStorage.setItem('segtrack.token', response.data.token);
    return response.data;
  } catch (error: any) {
    console.error('Erro detalhado no login:', {
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : null,
      request: error.config ? {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers,
        data: JSON.stringify(error.config.data)
      } : null
    });

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Se recebemos 401, significa que o usuário existe mas a senha está errada
          throw new Error(
            'Senha incorreta. Verifique se:\n' +
            '- A tecla Caps Lock está desativada\n' +
            '- Você está usando a senha correta (diferencia maiúsculas e minúsculas)\n' +
            '- Não há espaços extras no início ou fim da senha'
          );
        case 403:
          throw new Error('Acesso negado. Sua conta pode estar desativada ou bloqueada. Entre em contato com o administrador.');
        case 404:
          // Se recebemos 404, pode significar que o email não existe
          throw new Error('Email não encontrado no sistema. Verifique se:\n' +
            '- O email está digitado corretamente\n' +
            '- Você está usando o email corporativo correto (@segtrackpr.com.br)\n' +
            '- Sua conta já foi cadastrada no sistema'
          );
        case 422:
          throw new Error(data?.message || 'Dados inválidos. Verifique o formato do email e senha.');
        case 429:
          throw new Error('Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.');
        case 500:
          throw new Error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
        default:
          throw new Error(data?.message || `Erro ${status}: ${data?.error || 'Falha na autenticação'}`);
      }
    } else if (error.request) {
      throw new Error('Servidor não respondeu à solicitação. Verifique sua conexão com a internet.');
    }
    
    throw new Error(`Erro inesperado ao fazer login: ${error.message}`);
  }
}

export function logout() {
  localStorage.removeItem('segtrack.token');
  window.location.href = '/login';
}
