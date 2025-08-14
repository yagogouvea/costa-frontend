# Aba Prestadores - Página Financeira

## Visão Geral
A aba "Prestadores" na página financeira permite visualizar e calcular valores de pagamento para prestadores (apoios) baseado em ocorrências encerradas. O sistema cruza dados de ocorrências com resultados finalizados vinculados a prestadores, aplicando cálculos baseados em franquias de horas e km, valores adicionais e despesas.

## Layout e Interface

### Cabeçalho
- **Título**: "Prestadores" 
- **Filtros**: Data início/fim, prestador, status, período predefinido
- **Botões**: Aplicar filtros, limpar filtros, exportar Excel

### Tabela Principal
A tabela exibe as seguintes colunas:

| Coluna | Descrição | Formato | Cor |
|--------|-----------|---------|-----|
| ID | Identificador da ocorrência | Número | - |
| Apoio | Nome do prestador | Texto maiúsculo | - |
| Placa | Placa do veículo | Texto maiúsculo | - |
| Data da Ocorrência | Data de criação | DD/MM/AAAA | - |
| Total de Horas | Tempo total do serviço | HH:MM:SS | - |
| Total de KMs | Quilometragem total | Número | - |
| **Valor de Acionamento** | **Valor base do contrato do cliente** | **R$ X,XX** | **Azul** |
| Hora Adicional | Valor por hora extra | R$ X,XX | Verde |
| KM Adicional | Valor por km extra | R$ X,XX | Verde |
| Despesas | Total de despesas | R$ X,XX | Vermelho |
| Valor Total | Soma de todos os valores | R$ X,XX | Azul (negrito) |
| Data de Pagamento | Data prevista para pagamento | DD/MM/AAAA | - |
| Status | Resultado da ocorrência | Texto | Verde/Vermelho/Cinza |

## Lógica de Cálculo

### Valor de Acionamento
- **Fonte**: Contrato do cliente (prioridade) → Prestador (fallback)
- **Lógica**: O sistema busca primeiro o valor de acionamento cadastrado no contrato do cliente. Se não encontrar, usa o valor do prestador.
- **Atualização**: Se o valor for alterado no cadastro do contrato, será automaticamente refletido na tabela.

### Horas Adicionais
- **Franquia**: 3 horas (180 minutos)
- **Cálculo**: Minutos excedentes ÷ 60 × valor_hora_adc do prestador
- **Cor**: Verde

### KM Adicionais  
- **Franquia**: 50 km
- **Cálculo**: KM excedentes × valor_km_adc do prestador
- **Cor**: Verde

### Despesas
- **Fonte**: Campo `despesas_detalhadas` da ocorrência
- **Cálculo**: Soma de todas as despesas cadastradas
- **Cor**: Vermelho

### Valor Total
- **Cálculo**: Valor de Acionamento + Hora Adicional + KM Adicional + Despesas
- **Cor**: Azul (negrito)

## Filtros Disponíveis

### Filtros Básicos
- **Data Início/Fim**: Período das ocorrências
- **Prestador**: Filtrar por prestador específico
- **Status**: Filtrar por status da ocorrência

### Períodos Predefinidos
- **Junho 2024**: 01/06/2024 a 30/06/2024
- **Julho 2024**: 01/07/2024 a 31/07/2024
- **Agosto 2024**: 01/08/2024 a 31/08/2024
- **Setembro 2024**: 01/09/2024 a 30/09/2024
- **Outubro 2024**: 01/10/2024 a 31/10/2024
- **Novembro 2024**: 01/11/2024 a 30/11/2024
- **Dezembro 2024**: 01/12/2024 a 31/12/2024

## Exportação para Excel

### Funcionalidade
- Exporta todos os dados filtrados para arquivo Excel
- Nome do arquivo: `prestadores-DD-MM-AAAA-HH-MM-SS.xlsx`
- Inclui todas as colunas da tabela

### Colunas Exportadas
1. ID
2. Apoio (nome do prestador)
3. Placa
4. Data da Ocorrência
5. Total de Horas
6. Total de KMs
7. **Valor de Acionamento** (do contrato do cliente)
8. Hora Adicional
9. KM Adicional
10. Despesas
11. Valor Total
12. Data de Pagamento
13. Status

## Regras de Pagamento

### Data de Pagamento
- **Dias 1-15**: Pagamento no dia 30 do mesmo mês
- **Dias 16-31**: Pagamento no dia 15 do próximo mês
- **Fim de semana**: Próximo dia útil

### Status de Pagamento
- **Recuperado**: Verde (pagamento confirmado)
- **Cancelado**: Vermelho (sem pagamento)
- **Outros**: Cinza (aguardando)

## Integração com Banco de Dados

### Tabelas Utilizadas
- **Ocorrências**: Dados das ocorrências e resultados
- **Prestadores**: Informações dos prestadores (valores de hora/km adicionais)
- **Contratos**: Valores de acionamento dos clientes
- **Clientes**: Relacionamento cliente-contrato

### Consultas Principais
1. Busca ocorrências encerradas por prestador
2. Busca dados do prestador (valores adicionais)
3. **Busca contrato do cliente (valor de acionamento)**
4. Calcula valores baseado nas regras de negócio

## Responsividade
- **Desktop**: Tabela completa com todas as colunas
- **Tablet**: Tabela com scroll horizontal
- **Mobile**: Cards com informações principais

## Performance
- Paginação de 20 registros por página
- Carregamento assíncrono de dados
- Cache de dados de prestadores e contratos
- Filtros otimizados para consultas rápidas 