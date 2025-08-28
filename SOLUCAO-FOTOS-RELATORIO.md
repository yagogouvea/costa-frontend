# Solução: Fotos não aparecem nos Relatórios PDF

## Problema Identificado ✅
As fotos não estão aparecendo nos relatórios PDF devido a problemas de autenticação e tratamento de URLs.

## Soluções Implementadas

### 1. **Correção dos Erros de TypeScript**
- Removidas variáveis não utilizadas (`safeString`, `status`, `tipo_veiculo`)
- Corrigida a interface `RelatorioDados`
- Limpeza do código para produção

### 2. **Diagnóstico do Problema das Fotos**

#### Problema Principal:
- O endpoint `/api/v1/fotos/por-ocorrencia/:id` está temporariamente sem autenticação no backend
- O frontend pode estar enviando token de autenticação desnecessariamente
- Possível problema de CORS ou formato das URLs

#### Verificação Necessária:
```bash
# Testar endpoint de fotos
curl -X GET "http://localhost:3001/api/v1/fotos/por-ocorrencia/1"

# Testar com token (se necessário)
curl -X GET "http://localhost:3001/api/v1/fotos/por-ocorrencia/1" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. **Soluções a Implementar**

#### A. **Verificar Autenticação no Backend**
```typescript
// Em src/api/v1/routes/index.ts (linha 89)
// Atualmente: SEM AUTENTICAÇÃO
v1Router.use('/fotos', fotosRouter);

// Deve ser: COM AUTENTICAÇÃO (quando necessário)
v1Router.use('/fotos', authenticateToken, fotosRouter);
```

#### B. **Melhorar Tratamento de URLs no Frontend**
```typescript
// Em src/components/pdf/RelatorioPDF.tsx
const tratarUrlImagem = (url: string): string => {
  if (!url) return '';
  
  // Log para debug
  console.log('🔍 Tratando URL da imagem:', url);
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('✅ URL completa detectada:', url);
    return url;
  }
  
  // Se é uma URL relativa, concatenar com a API base
  if (url.startsWith('/')) {
    const urlCompleta = `${API_URL}${url}`;
    console.log('🔗 URL relativa convertida:', urlCompleta);
    return urlCompleta;
  }
  
  // Se não tem barra, adicionar
  const urlCompleta = `${API_URL}/${url}`;
  console.log('🔗 URL sem barra convertida:', urlCompleta);
  return urlCompleta;
};
```

#### C. **Adicionar Logs de Debug no Frontend**
```typescript
// Em src/pages/relatorios/index.tsx (função gerarPDF)
const gerarPDF = async (ocorrencia: Ocorrencia) => {
  try {
    console.log('🔍 Gerando PDF para ocorrência:', ocorrencia.id);
    
    // Buscar fotos diretamente do backend para garantir URLs públicas
    let fotosPublicas: any[] = [];
    try {
      console.log('📸 Buscando fotos da ocorrência:', ocorrencia.id);
      const resFotos = await api.get(`/api/v1/fotos/por-ocorrencia/${ocorrencia.id}`);
      console.log('📊 Resposta do endpoint de fotos:', resFotos.data);
      
      fotosPublicas = (resFotos.data || []).filter(
        (f: any) => f.url && (f.url.startsWith('http') || f.url.startsWith('/api/'))
      );
      console.log('✅ Fotos filtradas:', fotosPublicas);
      console.log('📊 Total de fotos válidas:', fotosPublicas.length);
      
      // Log detalhado de cada foto
      fotosPublicas.forEach((foto, index) => {
        console.log(`📸 Foto ${index + 1}:`, {
          id: foto.id,
          url: foto.url,
          legenda: foto.legenda,
          urlTratada: tratarUrlImagem(foto.url)
        });
      });
      
    } catch (err) {
      console.error('❌ Erro ao buscar fotos do backend para o relatório:', err);
    }

    // Converter dados incluindo as fotos públicas
    const dados = {
      ...converterParaRelatorioDados(ocorrencia),
      fotos: fotosPublicas
    };
    
    console.log('📄 Dados finais para PDF:', {
      ...dados,
      fotos: dados.fotos?.map(f => ({ id: f.id, url: f.url, legenda: f.legenda }))
    });
    
    const blob = await pdf(<RelatorioPDF dados={dados} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
  }
};
```

### 4. **Testes Recomendados**

#### A. **Teste do Endpoint de Fotos**
```bash
# Executar o script de teste
node test-relatorio-fotos.js
```

#### B. **Verificar Console do Navegador**
- Abrir DevTools ao gerar PDF
- Verificar logs de debug
- Procurar por erros de CORS ou carregamento de imagens

#### C. **Testar URLs das Fotos**
- Copiar URLs das fotos do console
- Testar diretamente no navegador
- Verificar se retornam as imagens corretas

### 5. **Próximos Passos**

1. **Implementar logs de debug** no frontend
2. **Verificar autenticação** no endpoint de fotos
3. **Testar URLs das fotos** diretamente
4. **Verificar formato das imagens** no banco de dados
5. **Testar geração de PDF** com logs ativos

### 6. **Comandos para Executar**

```bash
# 1. Navegar para o diretório do frontend
cd cliente-costa/frontend-costa

# 2. Verificar se não há erros de TypeScript
npm run typecheck

# 3. Executar teste de fotos (ajustar URL da API se necessário)
node test-relatorio-fotos.js

# 4. Verificar se o backend está rodando
curl http://localhost:3001/api/health
```

## Status da Solução
- ✅ Erros de TypeScript corrigidos
- 🔍 Diagnóstico do problema implementado
- 📝 Soluções documentadas
- ⏳ Aguardando implementação e testes
