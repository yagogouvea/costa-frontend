# Regras de Quebra de Página nos Relatórios PDF

## Resumo das Implementações

Este documento descreve as regras implementadas para evitar que as tabelas e seções do cabeçalho sejam divididas entre páginas no componente `RelatorioPDF.tsx`.

## 🚫 Seções que NÃO Podem Ser Divididas

### 1. Quadrantes Principais
- **INFORMAÇÕES BÁSICAS**
- **VEÍCULO E LOCALIZAÇÃO**
- **HORÁRIOS E QUILOMETRAGEM**
- **CHECKLIST E INFORMAÇÕES ADICIONAIS**

### 2. Seções Condicionais do Checklist
- **DESTINO SELECIONADO**
- **Detalhes da Loja**
- **Detalhes do Guincho**
- **Detalhes da Apreensão**

### 3. Outras Seções
- **Descrição da Ocorrência**
- **Fotos da Ocorrência**
- **Rodapé**

## 🔧 Código Implementado

### Estilos CSS com Regras de Quebra

```typescript
// Quadrante individual - não pode ser dividido entre páginas
quadrante: {
  border: '2pt solid #0B2149',
  borderRadius: 8,
  padding: 15,
  backgroundColor: '#f9fafc',
  breakInside: 'avoid',        // CSS moderno
  pageBreakInside: 'avoid'     // CSS legado para compatibilidade
},

// Seção condicional do checklist - não pode ser dividida
secaoCondicional: {
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
  marginTop: 10
},

// Seção de descrição - não pode ser dividida entre páginas
descricaoBox: {
  border: '1pt solid #0B2149',
  borderRadius: 6,
  padding: 15,
  marginTop: 20,
  marginBottom: 20,
  backgroundColor: '#f9fafc',
  breakInside: 'avoid',
  pageBreakInside: 'avoid'
},

// Seção de fotos - não pode ser dividida entre páginas
fotosContainer: {
  marginTop: 15,
  marginBottom: 20,
  breakInside: 'avoid',
  pageBreakInside: 'avoid'
},

// Rodapé - não pode ser dividido entre páginas
rodape: {
  marginTop: 20,
  padding: 10,
  borderTop: '1pt solid #e2e8f0',
  textAlign: 'center',
  position: 'relative',
  breakInside: 'avoid',
  pageBreakInside: 'avoid'
}
```

### Container Principal com Controle de Quebra

```typescript
// Container dos quadrantes - organiza a quebra de página
quadrantesContainer: {
  marginBottom: 20,
  gap: 15,
  breakInside: 'auto',        // Permite quebra entre quadrantes
  pageBreakInside: 'auto'     // CSS legado para compatibilidade
}
```

## 📱 Propriedades CSS Utilizadas

### `break-inside: 'avoid'`
- **Função**: Impede que o elemento seja dividido entre páginas
- **Compatibilidade**: CSS moderno (CSS3)
- **Comportamento**: Força o elemento a permanecer intacto

### `page-break-inside: 'avoid'`
- **Função**: Propriedade legada para compatibilidade
- **Compatibilidade**: Navegadores antigos
- **Comportamento**: Mesmo efeito da propriedade moderna

### `break-inside: 'auto'`
- **Função**: Permite quebra automática quando necessário
- **Uso**: Container principal dos quadrantes
- **Comportamento**: Organiza a quebra de forma inteligente

## 🎯 Benefícios das Regras

1. **Integridade Visual**: Seções completas em uma única página
2. **Legibilidade**: Informações relacionadas permanecem juntas
3. **Profissionalismo**: Relatórios com layout consistente
4. **Experiência do Usuário**: Leitura fluida sem interrupções
5. **Compatibilidade**: Funciona em diferentes navegadores e sistemas

## 🔄 Comportamento da Quebra de Página

### Quando uma Seção Não Cabe na Página:
1. **Seção Inteira**: Move para a próxima página
2. **Espaço Preservado**: Não deixa espaços vazios
3. **Layout Mantido**: Estrutura visual preservada
4. **Continuidade**: Fluxo natural de leitura

### Estrutura de Quebra Inteligente:
```
Página 1:
├── Faixa do Topo
├── Logo Costa
├── Títulos
├── INFORMAÇÕES BÁSICAS (completo)
└── VEÍCULO E LOCALIZAÇÃO (completo)

Página 2:
├── HORÁRIOS E QUILOMETRAGEM (completo)
├── CHECKLIST (completo)
├── Descrição (completa)
├── Fotos (completas)
└── Rodapé (completo)
```

## 📋 Checklist de Implementação

- [x] Regras para quadrantes principais
- [x] Regras para seções condicionais do checklist
- [x] Regras para seção de descrição
- [x] Regras para seção de fotos
- [x] Regras para rodapé
- [x] Container principal com controle inteligente
- [x] Compatibilidade CSS moderno e legado
- [x] Testes de quebra de página

## 👥 Responsável

- **Desenvolvedor**: Assistente AI
- **Data**: Janeiro 2024
- **Versão**: 1.0
- **Status**: ✅ Implementado e testado

