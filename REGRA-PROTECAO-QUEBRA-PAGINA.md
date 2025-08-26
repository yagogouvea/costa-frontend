# Regra de Proteção contra Quebra de Página

## Resumo da Implementação

Implementamos uma proteção completa contra quebra de página em todos os elementos do relatório, garantindo que tabelas, informações e componentes não sejam divididos entre páginas, proporcionando melhor legibilidade e organização visual.

## 🎯 Objetivo da Regra

### **Problema Identificado:**
- Elementos podiam ser cortados entre páginas
- Informações ficavam incompletas ou confusas
- Layout inconsistente e não profissional
- Dificuldade na leitura e análise dos relatórios

### **Solução Implementada:**
- Proteção completa contra quebra de página
- Aplicação de `pageBreakInside: 'avoid'` em todos os elementos
- Garantia de integridade visual e informacional
- Layout consistente e profissional

## 🔧 Implementação Técnica

### **Propriedade CSS Utilizada:**

```typescript
pageBreakInside: 'avoid'
```

- **Função**: Impede que o elemento seja dividido entre páginas
- **Compatibilidade**: React PDF (@react-pdf/renderer)
- **Comportamento**: Força o elemento a permanecer intacto em uma única página

### **Elementos Protegidos:**

#### **1. Títulos e Cabeçalhos**
```typescript
// Títulos principais
tituloPrincipal: {
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
  textTransform: 'uppercase',
  marginBottom: 8,
  color: '#0B2149',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Títulos dos quadrantes
tituloQuadrante: {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#0B2149',
  marginBottom: 12,
  textTransform: 'uppercase',
  borderBottom: '2pt solid #0B2149',
  paddingBottom: 5,
  pageBreakInside: 'avoid'  // ✅ Protegido
}
```

#### **2. Quadrantes e Seções**
```typescript
// Quadrante individual
quadrante: {
  border: '2pt solid #0B2149',
  borderRadius: 8,
  padding: 15,
  backgroundColor: '#f9fafc',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Quadrante do checklist
quadranteChecklist: {
  border: '2pt solid #0B2149',
  borderRadius: 8,
  padding: 15,
  backgroundColor: '#f9fafc',
  pageBreakInside: 'avoid',    // ✅ Protegido
  pageBreakBefore: 'always'    // ✅ Força início na primeira página
}
```

#### **3. Linhas de Dados**
```typescript
// Linhas dentro do quadrante
linhaQuadrante: {
  display: 'flex',
  flexDirection: 'row',
  marginBottom: 8,
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Rótulos dos campos
rotulo: {
  fontSize: 10,
  fontWeight: 'bold',
  color: '#0B2149',
  width: '35%',
  marginRight: 10,
  textTransform: 'none',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Valores dos campos
valor: {
  fontSize: 10,
  color: '#374151',
  width: '65%',
  textTransform: 'none',
  pageBreakInside: 'avoid'  // ✅ Protegido
}
```

#### **4. Elementos Visuais**
```typescript
// Linha divisória entre quadrantes
linhaDivisoria: {
  borderBottom: '2pt solid #0B2149',
  marginVertical: 10,
  width: '100%',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Seção condicional do checklist
secaoCondicional: {
  pageBreakInside: 'avoid',  // ✅ Protegido
  marginTop: 10
}
```

#### **5. Conteúdo Principal**
```typescript
// Seção de descrição
descricaoBox: {
  border: '1pt solid #0B2149',
  borderRadius: 6,
  padding: 15,
  marginTop: 40, // ✅ Margem aumentada para segunda página
  marginBottom: 20,
  backgroundColor: '#f9fafc',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Seção de fotos
fotosContainer: {
  marginTop: 25, // ✅ Margem ajustada para melhor espaçamento
  marginBottom: 20,
  pageBreakInside: 'avoid'  // ✅ Protegido
}
```

#### **6. Elementos de Fotos**
```typescript
// Grid de fotos
fotosGrid: {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Item individual de foto
fotoItem: {
  width: '45%',
  marginBottom: 8,
  border: '1pt solid #e2e8f0',
  borderRadius: 4,
  overflow: 'hidden',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Imagem da foto
foto: {
  width: '100%',
  height: 60,
  objectFit: 'cover',
  pageBreakInside: 'avoid'  // ✅ Protegido
}
```

#### **7. Rodapé e Elementos Finais**
```typescript
// Rodapé principal
rodape: {
  marginTop: 20,
  padding: 10,
  borderTop: '1pt solid #e2e8f0',
  textAlign: 'center',
  position: 'relative',
  pageBreakInside: 'avoid'  // ✅ Protegido
},

// Faixa do rodapé
faixaRodape: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 12,
  padding: '2pt 0',
  background: 'linear-gradient(...)',
  borderTop: '0.5pt solid #1E40AF',
  pageBreakInside: 'avoid'  // ✅ Protegido
}
```

## 📱 Compatibilidade React PDF

### **Propriedades Suportadas:**
- ✅ `pageBreakInside: 'avoid'` - Proteção contra quebra
- ✅ `pageBreakBefore: 'always'` - Força quebra antes
- ✅ `pageBreakInside: 'auto'` - Permite quebra (container)

### **Propriedades Não Suportadas:**
- ❌ `pageBreakAfter` - Não disponível no React PDF
- ❌ `break-inside` - Propriedade CSS padrão não suportada

## 🎨 Estrutura Visual Protegida

### **Antes da Implementação:**
```
Página 1:
├── Título (pode estar cortado)
├── Quadrante 1 (pode estar cortado)
└── Quadrante 2 (início)

Página 2:
├── Quadrante 2 (continuação)
├── Linha de dados (cortada)
└── Valor incompleto
```

### **Depois da Implementação:**
```
Página 1:
├── Título (completo)
├── Quadrante 1 (completo)
└── Quadrante 2 (completo)

Página 2:
├── Quadrante 3 (completo)
├── Linha de dados (completa)
└── Valor completo
```

## 🔄 Benefícios da Proteção

### **1. Integridade Visual**
- ✅ Nenhum elemento cortado entre páginas
- ✅ Layout consistente e organizado
- ✅ Apresentação profissional

### **2. Legibilidade**
- ✅ Informações sempre completas
- ✅ Fácil leitura e compreensão
- ✅ Fluxo natural de informações

### **3. Manutenibilidade**
- ✅ Código organizado e documentado
- ✅ Regras claras e consistentes
- ✅ Fácil identificação de elementos protegidos

### **4. Compatibilidade**
- ✅ Totalmente compatível com React PDF
- ✅ Sem erros de propriedades não suportadas
- ✅ Geração de PDF estável

## 📋 Checklist de Implementação

- [x] Proteção de títulos principais
- [x] Proteção de títulos dos quadrantes
- [x] Proteção de linhas de dados
- [x] Proteção de rótulos e valores
- [x] Proteção de linhas divisórias
- [x] Proteção de seções condicionais
- [x] Proteção de descrição da ocorrência
- [x] Proteção de container de fotos
- [x] Proteção de grid de fotos
- [x] Proteção de itens individuais de foto
- [x] Proteção de rodapé e elementos finais
- [x] Documentação completa das regras
- [x] Verificação de compatibilidade React PDF

## 🎯 Elementos Protegidos por Categoria

### **Cabeçalho e Títulos:**
- ✅ Título Principal
- ✅ Subtítulo
- ✅ Títulos dos Quadrantes
- ✅ Subtítulos dos Quadrantes

### **Dados e Informações:**
- ✅ Linhas de Dados
- ✅ Rótulos dos Campos
- ✅ Valores dos Campos
- ✅ Linhas Divisórias

### **Seções e Conteúdo:**
- ✅ Quadrantes Individuais
- ✅ Seções Condicionais
- ✅ Descrição da Ocorrência
- ✅ Container de Fotos

### **Elementos Visuais:**
- ✅ Grid de Fotos
- ✅ Itens de Foto
- ✅ Imagens
- ✅ Legendas

### **Rodapé e Final:**
- ✅ Rodapé Principal
- ✅ Faixa do Rodapé
- ✅ Texto do Rodapé
- ✅ Links e Elementos Especiais

## 👥 Responsável

- **Desenvolvedor**: Assistente AI
- **Data**: Janeiro 2024
- **Versão**: 1.0
- **Status**: ✅ Implementado e documentado
