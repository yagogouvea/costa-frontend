# Configuração da API

Este arquivo contém a configuração dinâmica da API baseada no ambiente de execução.

## Como usar

```typescript
import { API_URL, API_CONFIG } from '@/config/api';

// Usar a URL da API
const response = await fetch(`${API_URL}/users`);

// Usar com axios
import axios from 'axios';
const api = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.timeout.development
});
```

## Lógica de Detecção de Ambiente

A configuração prioriza os seguintes ambientes:

1. **Desenvolvimento Local** (`localhost` ou `127.0.0.1`)
   -


   

3. **Railway** (`*.up.railway.app`)
   - URL: `https://web-production-19090.up.railway.app`

4. **Fallback** (outros ambientes)
   - URL: `https://api.painelsegtrack.com.br`

## Configurações Disponíveis

- `API_URL`: URL base da API para o ambiente atual
- `API_CONFIG`: Objeto com configurações adicionais
  - `timeout.development`: Timeout para desenvolvimento (10s)
  - `timeout.production`: Timeout para produção (30s)
  - `retry.maxRetries`: Número máximo de tentativas (3)
  - `retry.retryDelay`: Delay entre tentativas (1s)

## Logs de Desenvolvimento

Em modo de desenvolvimento, a configuração é logada no console para facilitar o debug. 