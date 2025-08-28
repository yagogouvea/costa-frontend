# Painel de Prestadores - Costa & Camargo

## 🌐 Domínio Configurado

**URL Principal**: `https://prestador.costaecamargo.com.br`

## 📋 Funcionalidades

### Cadastro Público de Prestadores
- ✅ Formulário completo de cadastro
- ✅ Validação de campos obrigatórios
- ✅ Integração com API de geocodificação
- ✅ Suporte a múltiplas funções e regiões
- ✅ Sistema de PIX configurável

### Rotas Disponíveis
- **Formulário**: `/cadastro-prestador`
- **Sucesso**: `/cadastro-sucesso`
- **API**: `/api/prestadores-publico`

## 🔧 Configurações Implementadas

### 1. Frontend
- ✅ `src/config/api.ts` - Suporte ao novo domínio
- ✅ Redirecionamento automático para API correta
- ✅ Configuração de ambiente dinâmica

### 2. Backend
- ✅ CORS configurado para o novo domínio
- ✅ Endpoint `/api/prestadores-publico` ativo
- ✅ Validação e processamento de dados

## 🚀 Como Usar

### 1. Acesso Direto
```
https://prestador.costaecamargo.com.br
```

### 2. Teste da Configuração
```bash
cd cliente-costa/frontend-costa
node test-dominio-prestador.js
```

### 3. Verificação Manual
```bash
# Teste CORS
curl -H "Origin: https://prestador.costaecamargo.com.br" \
     -X OPTIONS \
     https://api.costaecamargo.seg.br/api/prestadores-publico

# Teste de cadastro
curl -X POST https://api.costaecamargo.seg.br/api/prestadores-publico \
     -H "Origin: https://prestador.costaecamargo.com.br" \
     -H "Content-Type: application/json" \
     -d '{"nome":"Teste","cpf":"12345678901","cod_nome":"Teste","telefone":"11999999999","email":"teste@teste.com","tipo_pix":"cpf","chave_pix":"12345678901","cep":"01234-567","endereco":"Rua Teste","bairro":"Bairro Teste","cidade":"São Paulo","estado":"SP","funcoes":["Pronta resposta"],"regioes":["São Paulo"],"tipo_veiculo":["Carro"]}'
```

## 📁 Estrutura de Arquivos

```
cliente-costa/frontend-costa/
├── src/
│   ├── config/
│   │   └── api.ts ✅ (Configurado para novo domínio)
│   ├── pages/
│   │   └── CadastroPrestadorPublico.tsx ✅ (Página principal)
│   └── components/prestador/
│       ├── PrestadorPublicoForm.tsx ✅ (Formulário)
│       └── CadastroSucessoPublico.tsx ✅ (Página de sucesso)
├── test-dominio-prestador.js ✅ (Script de teste)
├── config-producao.md ✅ (Documentação de produção)
└── README-DOMINIO-PRESTADOR.md ✅ (Este arquivo)

cliente-costa/backend-costa/
├── src/
│   ├── config/
│   │   └── cors.config.ts ✅ (CORS configurado)
│   ├── app.ts ✅ (CORS principal configurado)
│   └── routes/
│       └── prestadoresPublico.ts ✅ (Endpoint ativo)
```

## 🔍 Monitoramento

### Logs Importantes
- **Frontend**: Console do navegador
- **Backend**: Logs de CORS e requisições
- **API**: Respostas de endpoints

### Métricas de Sucesso
- ✅ Formulário carrega sem erros
- ✅ CORS permite requisições do novo domínio
- ✅ Cadastro é processado com sucesso
- ✅ Dados são salvos no banco

## 🚨 Troubleshooting

### Problema: Erro de CORS
**Sintoma**: Erro no console do navegador sobre CORS
**Solução**: Verificar se o domínio está na lista `allowedOrigins` do backend

### Problema: API não responde
**Sintoma**: Timeout ou erro 404
**Solução**: Verificar se o backend está rodando e se a URL está correta

### Problema: Formulário não envia
**Sintoma**: Erro ao submeter dados
**Solução**: Verificar logs do backend e validação de dados

## 📞 Suporte

Para problemas técnicos:
1. Verificar logs do backend
2. Executar script de teste
3. Verificar configuração CORS
4. Confirmar se o domínio está configurado corretamente

## 🔄 Atualizações

### Versão Atual
- **Frontend**: Configurado para `prestador.costaecamargo.com.br`
- **Backend**: CORS atualizado
- **API**: Endpoints funcionando

### Próximas Melhorias
- [ ] Cache de dados de endereço
- [ ] Validação em tempo real
- [ ] Notificações por email
- [ ] Dashboard de prestadores cadastrados
