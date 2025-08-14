import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          // Removendo o rewrite para manter o /api na URL
          // rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/users': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/ocorrencias': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/prestadores': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/clientes': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/fotos': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        // '/uploads': {
        //   target: 'http://localhost:3001',
        //   changeOrigin: true,
        //   secure: false,
        // },
        '/health': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/cnpj': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/veiculos': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production'
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: ['healthcheck.railway.app']
    }
  };
});
