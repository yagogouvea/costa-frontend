import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase - usar hardcoded como fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ziedretdauamqkaoqcjh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZWRyZXRkYXVhbXFrYW9xY2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Log para debug das configurações do Supabase
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl ? 'PRESENTE' : 'AUSENTE',
  key: supabaseAnonKey ? 'PRESENTE' : 'AUSENTE',
  urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'N/A',
  fullUrl: supabaseUrl || 'N/A',
  source: import.meta.env.VITE_SUPABASE_URL ? 'environment' : 'hardcoded'
});

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas!');
  console.warn('Usando configurações hardcoded como fallback.');
  console.warn('Para configurar corretamente, crie um arquivo .env com:');
  console.warn('VITE_SUPABASE_URL=https://ziedretdauamqkaoqcjh.supabase.co');
  console.warn('VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui');
}

// Verificar se a URL do Supabase está no formato correto
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.error('❌ URL do Supabase parece estar incorreta!');
  console.error('A URL deve ser algo como: https://your-project-id.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 