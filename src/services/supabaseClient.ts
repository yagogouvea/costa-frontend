import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para debug das configurações do Supabase
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl ? 'PRESENTE' : 'AUSENTE',
  key: supabaseAnonKey ? 'PRESENTE' : 'AUSENTE',
  urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'N/A',
  fullUrl: supabaseUrl || 'N/A'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env');
}

// Verificar se a URL do Supabase está no formato correto
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.error('❌ URL do Supabase parece estar incorreta!');
  console.error('A URL deve ser algo como: https://your-project-id.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 