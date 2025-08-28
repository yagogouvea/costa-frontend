const axios = require('axios');

// Configurações de teste
const CONFIG = {
  DOMAIN: 'https://prestador.costaecamargo.com.br',
  API: 'https://api.costaecamargo.seg.br',
  ENDPOINTS: [
    '/api/prestadores-publico',
    '/api/health',
    '/api/cors-test'
  ]
};

// Dados de teste para cadastro
const TEST_DATA = {
  nome: 'Teste Domínio',
  cpf: '12345678901',
  cod_nome: 'Teste',
  telefone: '11999999999',
  email: 'teste@dominio.com',
  tipo_pix: 'cpf',
  chave_pix: '12345678901',
  cep: '01234-567',
  endereco: 'Rua Teste Domínio',
  bairro: 'Bairro Teste',
  cidade: 'São Paulo',
  estado: 'SP',
  funcoes: ['Pronta resposta'],
  regioes: ['São Paulo'],
  tipo_veiculo: ['Carro']
};

class TesteDominioPrestador {
  constructor() {
    this.results = {
      cors: {},
      endpoints: {},
      cadastro: {}
    };
  }

  async runTestes() {
    console.log('🔍 TESTANDO DOMÍNIO PRESTADOR.COSTAECAMARGO.COM.BR\n');
    console.log('=' .repeat(70));

    try {
      // 1. Teste de CORS
      await this.testarCORS();
      
      // 2. Teste de endpoints
      await this.testarEndpoints();
      
      // 3. Teste de cadastro
      await this.testarCadastro();
      
      // 4. Resumo dos resultados
      this.mostrarResumo();
      
    } catch (error) {
      console.error('❌ Erro durante os testes:', error.message);
    }
  }

  async testarCORS() {
    console.log('\n1️⃣ TESTANDO CONFIGURAÇÃO CORS');
    console.log('-'.repeat(40));

    for (const endpoint of CONFIG.ENDPOINTS) {
      try {
        console.log(`\n🔍 Testando CORS para: ${endpoint}`);
        
        const response = await axios({
          method: 'OPTIONS',
          url: `${CONFIG.API}${endpoint}`,
          headers: {
            'Origin': CONFIG.DOMAIN,
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

  async testarEndpoints() {
    console.log('\n2️⃣ TESTANDO ENDPOINTS');
    console.log('-'.repeat(40));

    for (const endpoint of CONFIG.ENDPOINTS) {
      try {
        console.log(`\n🔍 Testando endpoint: ${endpoint}`);
        
        const response = await axios.get(`${CONFIG.API}${endpoint}`, {
          headers: {
            'Origin': CONFIG.DOMAIN
          }
        });

        console.log('✅ Endpoint funcionando:', {
          status: response.status,
          data: response.data?.message || 'OK'
        });

        this.results.endpoints[endpoint] = {
          status: 'success',
          response: response.status
        };

      } catch (error) {
        console.log('❌ Endpoint falhou:', error.response?.status || error.message);
        
        this.results.endpoints[endpoint] = {
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
      
      const response = await axios.post(`${CONFIG.API}/api/prestadores-publico`, TEST_DATA, {
        headers: {
          'Origin': CONFIG.DOMAIN,
          'Content-Type': 'application/json'
        }
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

    // CORS
    console.log('\n🔒 CORS:');
    Object.entries(this.results.cors).forEach(([endpoint, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`  ${status} ${endpoint}: ${result.status}`);
    });

    // Endpoints
    console.log('\n🌐 Endpoints:');
    Object.entries(this.results.endpoints).forEach(([endpoint, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`  ${status} ${endpoint}: ${result.status}`);
    });

    // Cadastro
    console.log('\n📝 Cadastro:');
    const cadastroStatus = this.results.cadastro.status === 'success' ? '✅' : '❌';
    console.log(`  ${cadastroStatus} Cadastro de prestador: ${this.results.cadastro.status}`);

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    
    const corsErrors = Object.values(this.results.cors).filter(r => r.status === 'error').length;
    const endpointErrors = Object.values(this.results.endpoints).filter(r => r.status === 'error').length;
    const cadastroError = this.results.cadastro.status === 'error';

    if (corsErrors === 0 && endpointErrors === 0 && !cadastroError) {
      console.log('  🎉 Todos os testes passaram! O domínio está configurado corretamente.');
    } else {
      if (corsErrors > 0) {
        console.log('  ⚠️  Problemas de CORS detectados. Verificar configuração do backend.');
      }
      if (endpointErrors > 0) {
        console.log('  ⚠️  Endpoints com problemas. Verificar se o backend está rodando.');
      }
      if (cadastroError) {
        console.log('  ⚠️  Problema no cadastro. Verificar logs do backend.');
      }
    }
  }
}

// Executar testes
async function main() {
  const tester = new TesteDominioPrestador();
  await tester.runTestes();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TesteDominioPrestador;
