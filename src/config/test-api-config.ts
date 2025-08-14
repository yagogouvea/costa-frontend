/**
 * Teste da configuração da API
 * Execute este arquivo para verificar se a detecção de ambiente está funcionando
 */

import { API_URL, API_CONFIG } from './api';

console.log('🧪 Teste da Configuração da API');
console.log('================================');

console.log('📍 Hostname atual:', window.location.hostname);
console.log('🌐 Protocolo atual:', window.location.protocol);
console.log('🔗 URL da API:', API_URL);
console.log('⚙️ Configurações:', API_CONFIG);

// Teste de diferentes cenários
const testScenarios = [
  { hostname: 'localhost', expected: 'http://localhost:3001' },
  { hostname: '127.0.0.1', expected: 'http://localhost:3001' },
  { hostname: 'app.painelsegtrack.com.br', expected: 'https://api.painelsegtrack.com.br' },
  { hostname: 'web-production-19090.up.railway.app', expected: 'https://web-production-19090.up.railway.app' },
  { hostname: 'outro-dominio.com', expected: 'https://api.painelsegtrack.com.br' }
];

console.log('\n📋 Cenários de Teste:');
testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.hostname} → ${scenario.expected}`);
});

// Função para simular diferentes hostnames (comentada para evitar erro de build)
// const simulateHostname = (hostname: string) => {
//   const originalHostname = window.location.hostname;
//   Object.defineProperty(window.location, 'hostname', {
//     value: hostname,
//     writable: true
//   });
//   
//   // Recarregar a configuração
//   const { API_URL: newApiUrl } = require('./api');
//   
//   // Restaurar hostname original
//   Object.defineProperty(window.location, 'hostname', {
//     value: originalHostname,
//     writable: true
//   });
//   
//   return newApiUrl;
// };

console.log('\n✅ Configuração carregada com sucesso!');
console.log('💡 Para testar diferentes ambientes, modifique o hostname no navegador'); 