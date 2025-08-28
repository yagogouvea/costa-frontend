const axios = require('axios');

// Configurações de teste local
const CONFIG = {
  BACKEND_LOCAL: 'http://localhost:3001',
  FRONTEND_LOCAL: 'http://localhost:5173',
  ENDPOINTS: [
    '/api/prestadores-publico/test',
    '/api/prestadores-publico',
    '/api/health'
  ]
};

// Dados de teste para cadastro
const TEST_DATA = {
  nome: 'Teste Local',
  cpf: '12345678901',
  cod_nome: 'Teste',
  telefone: '11999999999',
  email: 'teste@local.com',
  tipo_pix: 'cpf',
  chave_pix: '12345678901',
  cep: '01234-567',
  endereco: 'Rua Teste Local',
  bairro: 'Bairro Teste',
  cidade: 'São Paulo',
  estado: 'SP',
  funcoes: ['Pronta resposta'],
  regioes: ['São Paulo'],
  tipo_veiculo: ['Carro']
};

class TesteRotaPrestadoresPublico {
  constructor() {
    this.results = {
      backend: {},
      cors: {},
      cadastro: {}
    };
  }

  async runTestes() {
    console.log('🔍 TESTANDO ROTA PRESTADORES PÚBLICOS LOCALMENTE\n');
    console.log('=' .repeat(70));

    try {
      // 1. Teste de conectividade com backend
      await this.testarBackend();
      
      // 2. Teste de CORS
      await this.testarCORS();
      
      // 3. Teste de cadastro
      await this.testarCadastro();
      
      // 4. Resumo dos resultados
      this.mostrarResumo();
      
    } catch (error) {
      console.error('❌ Erro durante os testes:', error.message);
    }
  }

  async testarBackend() {
    console.log('\n1️⃣ TESTANDO CONECTIVIDADE COM BACKEND');
    console.log('-'.repeat(40));

    for (const endpoint of CONFIG.ENDPOINTS) {
      try {
        console.log(`\n🔍 Testando endpoint: ${endpoint}`);
        
        const response = await axios.get(`${CONFIG.BACKEND_LOCAL}${endpoint}`, {
          timeout: 10000
        });

        console.log('✅ Backend respondendo:', {
          status: response.status,
          data: response.data?.message || 'OK'
        });

        this.results.backend[endpoint] = {
          status: 'success',
          response: response.status
        };

      } catch (error) {
        console.log('❌ Backend não respondeu:', {
          status: error.response?.status,
          message: error.response?.data?.error || error.message
        });

        this.results.backend[endpoint] = {
          status: 'error',
          error: error.response?.status || error.message
        };
      }
    }
  }

  async testarCORS() {
    console.log('\n2️⃣ TESTANDO CONFIGURAÇÃO CORS');
    console.log('-'.repeat(40));

    for (const endpoint of CONFIG.ENDPOINTS) {
      try {
        console.log(`\n🔍 Testando CORS para: ${endpoint}`);
        
        const response = await axios({
          method: 'OPTIONS',
          url: `${CONFIG.BACKEND_LOCAL}${endpoint}`,
          headers: {
            'Origin': CONFIG.FRONTEND_LOCAL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });

        const corsHeaders = {
          'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
          'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
          'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
        };

        console.log('✅ CORS funcionando:', corsHeaders);
        
        this.results.cors[endpoint] = {
          status: 'success',
          headers: corsHeaders
        };

      } catch (error) {
        console.log('❌ CORS falhou:', error.response?.status || error.message);
        
        this.results.cors[endpoint] = {
          status: 'error',
          error: error.response?.status || error.message
        };
      }
    }
  }

  async testarCadastro() {
    console.log('\n3️⃣ TESTANDO CADASTRO DE PRESTADOR');
    console.log('-'.repeat(40));

    try {
      console.log('🔍 Enviando dados de teste...');
      
      const response = await axios.post(`${CONFIG.BACKEND_LOCAL}/api/prestadores-publico`, TEST_DATA, {
        headers: {
          'Origin': CONFIG.FRONTEND_LOCAL,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('✅ Cadastro funcionando:', {
        status: response.status,
        id: response.data?.id || 'N/A',
        message: response.data?.message || 'OK'
      });

      this.results.cadastro = {
        status: 'success',
        response: response.status,
        data: response.data
      };

    } catch (error) {
      console.log('❌ Cadastro falhou:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      this.results.cadastro = {
        status: 'error',
        error: error.response?.status || error.message,
        details: error.response?.data
      };
    }
  }

  mostrarResumo() {
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('=' .repeat(70));

    // Backend
    console.log('\n🔧 Backend:');
    Object.entries(this.results.backend).forEach(([endpoint, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`  ${status} ${endpoint}: ${result.status}`);
    });

    // CORS
    console.log('\n🔒 CORS:');
    Object.entries(this.results.cors).forEach(([endpoint, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`  ${status} ${endpoint}: ${result.status}`);
    });

    // Cadastro
    console.log('\n📝 Cadastro:');
    const cadastroStatus = this.results.cadastro.status === 'success' ? '✅' : '❌';
    console.log(`  ${cadastroStatus} Cadastro de prestador: ${this.results.cadastro.status}`);

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    
    const backendErrors = Object.values(this.results.backend).filter(r => r.status === 'error').length;
    const corsErrors = Object.values(this.results.cors).filter(r => r.status === 'error').length;
    const cadastroError = this.results.cadastro.status === 'error';

    if (backendErrors === 0 && corsErrors === 0 && !cadastroError) {
      console.log('  🎉 Todos os testes passaram! A rota está funcionando corretamente.');
    } else {
      if (backendErrors > 0) {
        console.log('  ⚠️  Backend não está respondendo. Verificar se está rodando na porta 3001.');
      }
      if (corsErrors > 0) {
        console.log('  ⚠️  Problemas de CORS detectados. Verificar configuração do backend.');
      }
      if (cadastroError) {
        console.log('  ⚠️  Problema no cadastro. Verificar logs do backend.');
      }
    }

    // Comandos para resolver problemas
    if (backendErrors > 0) {
      console.log('\n🔧 COMANDOS PARA RESOLVER:');
      console.log('  1. Verificar se o backend está rodando:');
      console.log('     cd cliente-costa/backend-costa');
      console.log('     npm run dev');
      console.log('  2. Verificar se a porta 3001 está livre:');
      console.log('     netstat -an | findstr :3001');
    }
  }
}

// Executar testes
async function main() {
  const tester = new TesteRotaPrestadoresPublico();
  await tester.runTestes();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TesteRotaPrestadoresPublico;
