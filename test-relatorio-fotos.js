// Teste para verificar se as fotos estão sendo carregadas no relatório
const axios = require('axios');

const API_BASE = 'http://localhost:3001'; // Ajuste para a URL correta do seu backend

async function testarFotosRelatorio() {
  try {
    console.log('🔍 Testando carregamento de fotos para relatório...');
    
    // 1. Testar endpoint de fotos por ocorrência
    console.log('\n📸 Testando endpoint de fotos...');
    const fotosResponse = await axios.get(`${API_BASE}/api/v1/fotos/por-ocorrencia/1`);
    console.log('✅ Fotos carregadas:', fotosResponse.data);
    console.log('📊 Total de fotos:', fotosResponse.data.length);
    
    if (fotosResponse.data.length > 0) {
      console.log('🔍 Primeira foto:', fotosResponse.data[0]);
      console.log('🔗 URL da primeira foto:', fotosResponse.data[0].url);
    }
    
    // 2. Testar se as URLs das fotos são acessíveis
    if (fotosResponse.data.length > 0) {
      console.log('\n🔗 Testando acesso às URLs das fotos...');
      for (let i = 0; i < Math.min(3, fotosResponse.data.length); i++) {
        const foto = fotosResponse.data[i];
        try {
          const fotoResponse = await axios.get(foto.url, { 
            responseType: 'arraybuffer',
            timeout: 5000 
          });
          console.log(`✅ Foto ${i + 1} acessível:`, foto.url);
          console.log(`   Tamanho: ${fotoResponse.data.length} bytes`);
        } catch (error) {
          console.log(`❌ Foto ${i + 1} não acessível:`, foto.url);
          console.log(`   Erro:`, error.message);
        }
      }
    }
    
    // 3. Testar endpoint de ocorrência para ver se inclui fotos
    console.log('\n📋 Testando endpoint de ocorrência...');
    const ocorrenciaResponse = await axios.get(`${API_BASE}/api/ocorrencias/1`);
    console.log('✅ Ocorrência carregada');
    console.log('📊 Tem fotos?', !!ocorrenciaResponse.data.fotos);
    console.log('📊 Total de fotos na ocorrência:', ocorrenciaResponse.data.fotos?.length || 0);
    
    if (ocorrenciaResponse.data.fotos && ocorrenciaResponse.data.fotos.length > 0) {
      console.log('🔍 Primeira foto da ocorrência:', ocorrenciaResponse.data.fotos[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Dados:', error.response.data);
    }
  }
}

// Executar teste
testarFotosRelatorio();
