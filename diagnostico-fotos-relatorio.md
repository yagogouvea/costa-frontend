# Diagnóstico: Fotos não aparecem nos Relatórios PDF

## Problema Identificado
Os relatórios PDF estão sendo gerados sem as fotos, mesmo confirmando que as fotos estão anexadas no banco de dados.

## Análise do Código

### 1. Fluxo de Geração do PDF
```typescript
// Em src/pages/relatorios/index.tsx (linha 278)
const resFotos = await api.get(`/api/v1/fotos/por-ocorrencia/${ocorrencia.id}`);
fotosPublicas = (resFotos.data || []).filter(
  (f: any) => f.url && (f.url.startsWith('http') || f.url.startsWith('/api/'))
);
```

### 2. Tratamento das URLs no RelatorioPDF
```typescript
// Em src/components/pdf/RelatorioPDF.tsx
const tratarUrlImagem = (url: string): string => {
  if (!url) return '';
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se é uma URL relativa, concatenar com a API base
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }
  
  // Se não tem barra, adicionar
  return `${API_URL}/${url}`;
};
```

### 3. Renderização das Fotos
```typescript
<Image
  style={styles.foto}
  src={tratarUrlImagem(foto.url || '')}
/>
```

## Possíveis Causas

### 1. **Endpoint de Fotos Não Funcionando**
- O endpoint `/api/v1/fotos/por-ocorrencia/:id` pode não estar retornando dados
- Pode haver erro de autenticação ou autorização

### 2. **URLs das Fotos Inválidas**
- As URLs retornadas pelo backend podem estar em formato incorreto
- O filtro pode estar removendo fotos válidas

### 3. **Problema de CORS ou Acesso**
- As URLs das fotos podem não ser acessíveis pelo React PDF
- Pode haver problema de CORS ao tentar carregar as imagens

### 4. **Formato das Fotos**
- O React PDF pode não estar conseguindo processar o formato das imagens
- Pode haver problema com o tamanho ou encoding das imagens

## Soluções a Testar

### 1. **Verificar Endpoint de Fotos**
```bash
# Testar se o endpoint está funcionando
curl -X GET "http://localhost:3001/api/v1/fotos/por-ocorrencia/1"
```

### 2. **Verificar URLs das Fotos**
- Adicionar logs para ver as URLs retornadas
- Verificar se as URLs são acessíveis diretamente no navegador

### 3. **Testar com URLs Diferentes**
- Tentar com URLs absolutas completas
- Verificar se o problema é com URLs relativas

### 4. **Verificar Console do Navegador**
- Procurar por erros de CORS
- Verificar se há erros ao carregar as imagens

## Próximos Passos

1. Executar o teste `test-relatorio-fotos.js` para diagnosticar
2. Verificar logs do backend ao acessar o endpoint de fotos
3. Testar URLs das fotos diretamente no navegador
4. Verificar se há problemas de CORS ou autenticação
