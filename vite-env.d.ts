/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OPENCAGE_KEY?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_DEBUG_MODE?: string;
  // Outras variáveis aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
