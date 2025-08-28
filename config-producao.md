# Configuração de Produção - Painel de Prestadores

## Domínio Principal
- **URL de Acesso**: `https://prestador.costaecamargo.com.br`
- **API Backend**: `https://api.costaecamargo.seg.br`

## Configurações Implementadas

### 1. Frontend (src/config/api.ts)
✅ Adicionado suporte ao domínio `prestador.costaecamargo.com.br`
✅ API redireciona para `https://api.costaecamargo.seg.br`

### 2. Backend CORS
✅ `src/config/cors.config.ts` - Domínio permitido
✅ `src/app.ts` - Domínio permitido na lista principal

### 3. Rotas Disponíveis
- **Cadastro Público**: `/api/prestadores-publico`
- **Formulário**: `/cadastro-prestador`
- **Sucesso**: `/cadastro-sucesso`

## Variáveis de Ambiente Recomendadas

```bash
# .env.production
VITE_APP_NAME=Costa & Camargo
VITE_APP_VERSION=1.0.0
VITE_PRODUCTION_DOMAIN=prestador.costaecamargo.com.br
VITE_API_DOMAIN=api.costaecamargo.seg.br
VITE_API_URL=https://api.costaecamargo.seg.br
VITE_PUBLIC_CADASTRO_ENABLED=true
```

## Teste da Configuração

### 1. Verificar CORS
```bash
curl -H "Origin: https://prestador.costaecamargo.com.br" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.costaecamargo.seg.br/api/prestadores-publico
```

### 2. Testar Cadastro
```bash
curl -X POST https://api.costaecamargo.seg.br/api/prestadores-publico \
     -H "Origin: https://prestador.costaecamargo.com.br" \
     -H "Content-Type: application/json" \
     -d '{"nome":"Teste","cpf":"12345678901","cod_nome":"Teste","telefone":"11999999999","email":"teste@teste.com","tipo_pix":"cpf","chave_pix":"12345678901","cep":"01234-567","endereco":"Rua Teste","bairro":"Bairro Teste","cidade":"São Paulo","estado":"SP","funcoes":["Pronta resposta"],"regioes":["São Paulo"],"tipo_veiculo":["Carro"]}'
```

## Estrutura de Arquivos

```
cliente-costa/frontend-costa/
├── src/
│   ├── config/
│   │   └── api.ts ✅ (Configurado)
│   ├── pages/
│   │   └── CadastroPrestadorPublico.tsx ✅ (Disponível)
│   └── components/prestador/
│       └── PrestadorPublicoForm.tsx ✅ (Disponível)
└── config-producao.md ✅ (Este arquivo)

cliente-costa/backend-costa/
├── src/
│   ├── config/
│   │   └── cors.config.ts ✅ (Configurado)
│   ├── app.ts ✅ (Configurado)
│   └── routes/
│       └── prestadoresPublico.ts ✅ (Disponível)
```

## Próximos Passos

1. ✅ **Configuração CORS** - Implementada
2. ✅ **Configuração Frontend** - Implementada
3. 🔄 **Deploy** - Pendente
4. 🔄 **Testes em Produção** - Pendente
5. 🔄 **Monitoramento** - Pendente

## Comandos para Deploy

```bash
# Frontend
cd cliente-costa/frontend-costa
npm run build:prod

# Backend
cd cliente-costa/backend-costa
npm run build
npm start
```

## Verificação Pós-Deploy

1. Acessar `https://prestador.costaecamargo.com.br`
2. Verificar se o formulário carrega corretamente
3. Testar cadastro de prestador
4. Verificar logs do backend para erros CORS
5. Confirmar que os dados são salvos no banco
