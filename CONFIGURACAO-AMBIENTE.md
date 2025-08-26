# Configuração do Ambiente - Frontend Costa

## Problema Identificado
O projeto está apresentando erro porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução Temporária
Modifiquei o arquivo `src/services/supabaseClient.ts` para usar configurações hardcoded como fallback, permitindo que o projeto funcione imediatamente.

## Configuração Permanente (Recomendada)

### 1. Criar arquivo .env
Crie um arquivo `.env` na raiz do projeto `cliente-costa/frontend-costa/` com o seguinte conteúdo:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ziedretdauamqkaoqcjh.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# API Configuration
VITE_API_URL=http://localhost:3001
```

### 2. Obter a Chave Anônima do Supabase
Para obter a chave anônima correta:

1. Acesse o projeto Supabase: https://supabase.com/dashboard
2. Selecione o projeto: `ziedretdauamqkaoqcjh`
3. Vá para Settings > API
4. Copie a "anon public" key
5. Substitua `sua_chave_anonima_aqui` pela chave real

### 3. Reiniciar o Servidor
Após criar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

## Estrutura do Projeto Supabase
- **URL**: https://ziedretdauamqkaoqcjh.supabase.co
- **Bucket de Storage**: segtrackfotos
- **Funcionalidades**: Upload de logos e fotos

## Verificação
Após a configuração, você deve ver no console:
```
🔧 Supabase Configuration: {
  url: 'PRESENTE',
  key: 'PRESENTE',
  urlValue: 'https://ziedretdauamqkaoqcjh...',
  fullUrl: 'https://ziedretdauamqkaoqcjh.supabase.co',
  source: 'environment'
}
```

## Notas Importantes
- O arquivo `.env` está no `.gitignore` por segurança
- As configurações hardcoded são apenas para desenvolvimento
- Em produção, sempre use variáveis de ambiente
- A chave anônima é segura para uso no frontend
