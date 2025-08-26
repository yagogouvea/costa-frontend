/**
 * Script de teste para verificar a configuração do Supabase
 * Execute este script para testar se a conexão está funcionando
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://ziedretdauamqkaoqcjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZWRyZXRkYXVhbXFrYW9xY2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

console.log('🧪 Testando configuração do Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'PRESENTE' : 'AUSENTE');

try {
  // Criar cliente
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Cliente Supabase criado com sucesso!');

  // Testar conexão básica
  console.log('🔄 Testando conexão...');
  
  // Listar buckets disponíveis
  supabase.storage.listBuckets()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro ao listar buckets:', error.message);
      } else {
        console.log('✅ Buckets disponíveis:', data.map(bucket => bucket.name));
        
        // Verificar se o bucket segtrackfotos existe
        const segtrackfotosBucket = data.find(bucket => bucket.name === 'segtrackfotos');
        if (segtrackfotosBucket) {
          console.log('✅ Bucket segtrackfotos encontrado!');
        } else {
          console.log('⚠️ Bucket segtrackfotos não encontrado');
        }
      }
    })
    .catch(error => {
      console.error('❌ Erro na conexão:', error.message);
    });

} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error.message);
}

console.log('\n📋 Para configurar o ambiente:');
console.log('1. Crie um arquivo .env na raiz do projeto');
console.log('2. Adicione as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
console.log('3. Reinicie o servidor de desenvolvimento');
