# Lógica de Resultado no Relatório PDF - Frontend Costa

## Estrutura dos Campos

Baseado no schema do Prisma, temos os seguintes campos para resultado:

### 📊 **Campos Disponíveis**
- **`status`**: OcorrenciaStatus (enum)
  - `em_andamento` → "Em andamento"
  - `concluida` → "Concluída"
  - `cancelada` → "Cancelado"
  - `aguardando` → "Aguardando"

- **`resultado`**: String (campo livre)
  - Exemplo: "Recuperado", "Apreendido", "Em análise"

- **`sub_resultado`**: String (campo livre)
  - Exemplo: "com rastreio", "sem danos", "com multa"

## 🎯 **Lógica de Exibição**

### **Prioridade 1: Resultado + Sub_resultado**
```
Se resultado = "Recuperado" e sub_resultado = "com rastreio"
→ Exibe: "Recuperado - com rastreio"
```

### **Prioridade 2: Apenas Sub_resultado**
```
Se resultado = "" e sub_resultado = "com rastreio"
→ Exibe: "com rastreio"
```

### **Prioridade 3: Status + Sub_resultado**
```
Se resultado = "" e sub_resultado = "com rastreio" e status = "concluida"
→ Exibe: "Concluída - com rastreio"
```

### **Prioridade 4: Apenas Status**
```
Se resultado = "" e sub_resultado = "" e status = "concluida"
→ Exibe: "Concluída"
```

### **Prioridade 5: Fallback**
```
Se todos os campos estiverem vazios
→ Exibe: "-"
```

## 🔍 **Exemplos Práticos**

### **Exemplo 1: Recuperação com Rastreio**
```typescript
resultado: "Recuperado"
sub_resultado: "com rastreio"
status: "concluida"
// Exibe: "Recuperado - com rastreio"
```

### **Exemplo 2: Apreensão**
```typescript
resultado: "Apreendido"
sub_resultado: "sem documentos"
status: "concluida"
// Exibe: "Apreendido - sem documentos"
```

### **Exemplo 3: Apenas Status**
```typescript
resultado: ""
sub_resultado: ""
status: "em_andamento"
// Exibe: "Em andamento"
```

### **Exemplo 4: Status + Sub_resultado**
```typescript
resultado: ""
sub_resultado: "aguardando documentos"
status: "aguardando"
// Exibe: "Aguardando - aguardando documentos"
```

## 💻 **Implementação no Código**

```typescript
<View style={styles.linhaQuadrante}>
  <Text style={styles.rotulo}>Resultado:</Text>
  <Text style={styles.valor}>
    {(() => {
      // Construir resultado combinando status e sub_status
      let resultadoCompleto = '';
      
      // Se há resultado específico preenchido, usar ele
      if (resultado && resultado.trim() !== '') {
        resultadoCompleto = resultado;
      }
      
      // Se há sub_resultado, adicionar com hífen
      if (sub_resultado && sub_resultado.trim() !== '') {
        if (resultadoCompleto) {
          resultadoCompleto += ` - ${sub_resultado}`;
        } else {
          resultadoCompleto = sub_resultado;
        }
      }
      
      // Se não há resultado específico, usar o status como base
      if (!resultadoCompleto) {
        let statusTexto = '';
        if (status === 'concluida') {
          statusTexto = 'Concluída';
        } else if (status === 'em_andamento') {
          statusTexto = 'Em andamento';
        } else if (status === 'aguardando') {
          statusTexto = 'Aguardando';
        } else if (status === 'cancelada') {
          statusTexto = 'Cancelado';
        }
        
        if (statusTexto && sub_resultado && sub_resultado.trim() !== '') {
          resultadoCompleto = `${statusTexto} - ${sub_resultado}`;
        } else if (statusTexto) {
          resultadoCompleto = statusTexto;
        }
      }
      
      return resultadoCompleto || '-';
    })()}
  </Text>
</View>
```

## 🎨 **Formatação Visual**

### **Separador**
- **Hífen** (`-`) é usado para separar resultado e sub_resultado
- **Espaço** antes e depois do hífen para melhor legibilidade

### **Exemplos de Formatação**
- ✅ **Correto**: "Recuperado - com rastreio"
- ✅ **Correto**: "Apreendido - sem documentos"
- ✅ **Correto**: "Em andamento - aguardando aprovação"
- ❌ **Incorreto**: "Recuperado-com rastreio" (sem espaços)

## 🔧 **Configuração no Banco**

### **Campos Obrigatórios**
- `status`: Sempre preenchido (default: `em_andamento`)

### **Campos Opcionais**
- `resultado`: String opcional
- `sub_resultado`: String opcional

### **Validação**
- Campos vazios ou `null` são tratados como não preenchidos
- Strings vazias (`""`) são tratadas como não preenchidas
- Espaços em branco são removidos antes da validação

## 📋 **Casos de Uso Comuns**

### **1. Recuperação de Veículo**
```
resultado: "Recuperado"
sub_resultado: "com rastreio"
→ "Recuperado - com rastreio"
```

### **2. Apreensão**
```
resultado: "Apreendido"
sub_resultado: "sem documentos"
→ "Apreendido - sem documentos"
```

### **3. Em Análise**
```
resultado: ""
sub_resultado: "aguardando documentos"
status: "aguardando"
→ "Aguardando - aguardando documentos"
```

### **4. Concluído Simples**
```
resultado: ""
sub_resultado: ""
status: "concluida"
→ "Concluída"
```

## ✅ **Benefícios da Implementação**

1. **Flexibilidade**: Permite combinações personalizadas
2. **Consistência**: Formato padronizado em todos os relatórios
3. **Legibilidade**: Separação clara entre informações
4. **Fallback Inteligente**: Sempre exibe alguma informação relevante
5. **Manutenibilidade**: Código limpo e fácil de entender

## 🧪 **Testes Recomendados**

1. **Todos os campos preenchidos**: Verificar formatação
2. **Apenas resultado**: Verificar exibição
3. **Apenas sub_resultado**: Verificar exibição
4. **Apenas status**: Verificar exibição
5. **Campos vazios**: Verificar fallback
6. **Caracteres especiais**: Verificar formatação
7. **Espaços extras**: Verificar limpeza
