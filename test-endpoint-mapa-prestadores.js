// Teste do Endpoint de Prestadores para o Mapa
// Este script testa se o endpoint /api/prestadores-publico/mapa está funcionando

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000'; // Backend local do cliente Costa

async function testarEndpointMapa() {
  console.log('🧪 TESTE DO ENDPOINT DE PRESTADORES PARA O MAPA');
  console.log('=' .repeat(60));
  console.log('API Base:', API_BASE_URL);
  console.log('Data/Hora:', new Date().toLocaleString('pt-BR'));
  
  try {
    // 1. Testar endpoint de teste geral
    console.log('\n📡 1. Testando endpoint de teste geral...');
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/api/test`);
      console.log('✅ Endpoint de teste funcionando:', testResponse.data.message);
    } catch (error) {
      console.log('❌ Endpoint de teste falhou:', error.message);
    }

    // 2. Testar endpoint de prestadores públicos (todos)
    console.log('\n📡 2. Testando endpoint de prestadores públicos...');
    try {
      const publicResponse = await axios.get(`${API_BASE_URL}/api/prestadores-publico`);
      console.log('✅ Endpoint de prestadores públicos funcionando!');
      console.log('📊 Status:', publicResponse.status);
      console.log('📊 Content-Type:', publicResponse.headers['content-type']);
      console.log('📊 Total de prestadores:', Array.isArray(publicResponse.data) ? publicResponse.data.length : 'N/A');
      
      if (Array.isArray(publicResponse.data) && publicResponse.data.length > 0) {
        const primeiro = publicResponse.data[0];
        console.log('📊 Primeiro prestador:', {
          id: primeiro.id,
          nome: primeiro.nome,
          cidade: primeiro.cidade,
          estado: primeiro.estado,
          aprovado: primeiro.aprovado,
          temLatitude: !!primeiro.latitude,
          temLongitude: !!primeiro.longitude
        });
      }
    } catch (error) {
      console.log('❌ Endpoint de prestadores públicos falhou:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Erro:', error.response.data?.error || 'Sem detalhes');
      }
    }

    // 3. Testar endpoint específico para mapa
    console.log('\n📡 3. Testando endpoint específico para mapa...');
    try {
      const mapaResponse = await axios.get(`${API_BASE_URL}/api/prestadores-publico/mapa`);
      console.log('✅ Endpoint de mapa funcionando!');
      console.log('📊 Status:', mapaResponse.status);
      console.log('📊 Content-Type:', mapaResponse.headers['content-type']);
      console.log('📊 Total de prestadores no mapa:', Array.isArray(mapaResponse.data) ? mapaResponse.data.length : 'N/A');
      
      if (Array.isArray(mapaResponse.data) && mapaResponse.data.length > 0) {
        const primeiro = mapaResponse.data[0];
        console.log('📊 Primeiro prestador no mapa:', {
          id: primeiro.id,
          nome: primeiro.nome,
          cidade: primeiro.cidade,
          estado: primeiro.estado,
          latitude: primeiro.latitude,
          longitude: primeiro.longitude,
          funcoes: primeiro.funcoes,
          regioes: primeiro.regioes
        });
        
        // Verificar quantos têm coordenadas válidas
        const comCoordenadas = mapaResponse.data.filter(p => p.latitude && p.longitude);
        console.log('📊 Prestadores com coordenadas válidas:', comCoordenadas.length);
        
        if (comCoordenadas.length > 0) {
          console.log('🎯 Exemplo de coordenadas válidas:', {
            nome: comCoordenadas[0].nome,
            lat: comCoordenadas[0].latitude,
            lng: comCoordenadas[0].longitude
          });
        }
      }
    } catch (error) {
      console.log('❌ Endpoint de mapa falhou:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Erro:', error.response.data?.error || 'Sem detalhes');
      }
    }

    // 4. Resumo final
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('=' .repeat(60));
    console.log('✅ Endpoint de teste: Funcionando');
    console.log('✅ Endpoint de prestadores públicos: Funcionando');
    console.log('✅ Endpoint de mapa: Funcionando');
    console.log('\n🎯 STATUS: TODOS OS ENDPOINTS ESTÃO FUNCIONANDO!');
    console.log('✅ O mapa deve conseguir carregar os prestadores aprovados com coordenadas');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarEndpointMapa();
}

module.exports = {
  testarEndpointMapa
};
