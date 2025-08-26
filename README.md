# COSTA - Sistema de Gestão

Frontend do sistema de gestão para o cliente Costa, baseado na arquitetura do sistema Segtrack.

## 🚀 **Tecnologias**

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **React Hook Form** para formulários
- **Zod** para validação
- **Axios** para requisições HTTP
- **Leaflet** para mapas
- **React Query** para gerenciamento de estado

## 📁 **Estrutura do Projeto**

```
src/
├── app/           # Configurações da aplicação
├── components/    # Componentes reutilizáveis
├── config/        # Configurações (API, etc.)
├── constants/     # Constantes da aplicação
├── contexts/      # Contextos React (Auth, etc.)
├── features/      # Funcionalidades específicas
├── hooks/         # Hooks customizados
├── infrastructure/# Configurações de infraestrutura
├── lib/           # Bibliotecas e utilitários
├── pages/         # Páginas da aplicação
├── services/      # Serviços de API
├── shared/        # Componentes e utilitários compartilhados
├── styles/        # Estilos globais
├── types/         # Tipos TypeScript
└── utils/         # Funções utilitárias
```

## 🔧 **Configuração**

### **Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_KEY=sua_chave_aqui
```

### **Instalação**

```bash
npm install
```

### **Desenvolvimento**

```bash
npm run dev
```

### **Build**

```bash
npm run build
```

## 🌐 **URLs da API**

- **Desenvolvimento local:** `http://localhost:3001`
- **Produção:** `https://api.costa.com.br`
- **Railway:** `https://web-production-19090.up.railway.app`

## 📱 **Funcionalidades**

- ✅ Dashboard principal
- ✅ Gestão de ocorrências
- ✅ Cadastro de clientes
- ✅ Cadastro de prestadores
- ✅ Sistema de relatórios
- ✅ Gestão financeira
- ✅ Mapa de prestadores
- ✅ Sistema de usuários
- ✅ Autenticação JWT

## 🚀 **Deploy**

O projeto está configurado para deploy no Railway com:

- Build automático
- Health checks
- Configuração de domínio
- Variáveis de ambiente

## 📝 **Notas**

- Sistema baseado na arquitetura Segtrack
- Adaptado para o cliente Costa
- Porta do backend: 3001
- Todas as referências ao Segtrack foram removidas




