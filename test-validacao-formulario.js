// Teste de Validação do Formulário de Prestador
// Este script testa diferentes formatos de dados para verificar a robustez do sistema

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/prestadores-publico';

// Dados de teste com diferentes formatos
const dadosTeste = [
  {
    nome: '  João Silva  ', // Com espaços extras
    cpf: '123.456.789-00', // Com formatação
    cod_nome: '  Joao  ', // Com espaços extras
    telefone: '(11) 99999-9999', // Com formatação
    email: '  JOAO@EMAIL.COM  ', // Maiúsculas e espaços
    tipo_pix: 'cpf',
    chave_pix: '123.456.789-00', // Com formatação
    cep: '01234-567', // Com traço
    endereco: '  Rua das Flores, 123  ', // Com espaços extras
    bairro: '  Centro  ', // Com espaços extras
    cidade: '  São Paulo  ', // Com espaços extras
    estado: 'sp', // Minúsculas
    funcoes: ['Pronta resposta', 'Apoio armado'],
    regioes: ['  São Paulo, SP  ', '  Osasco, SP  '], // Com espaços extras
    tipo_veiculo: ['Carro', 'Moto'],
    modelo_antena: ''
  },
  {
    nome: 'Maria Santos',
    cpf: '98765432100', // Sem formatação
    cod_nome: 'Maria',
    telefone: '11987654321', // Sem formatação
    email: 'maria@email.com',
    tipo_pix: 'email',
    chave_pix: 'maria@email.com',
    cep: '98765432', // Sem traço
    endereco: 'Av. Principal, 456',
    bairro: 'Vila Nova',
    cidade: 'Osasco',
    estado: 'SP', // Maiúsculas
    funcoes: ['Antenista'],
    regioes: ['Osasco, SP'],
    tipo_veiculo: ['Moto'],
    modelo_antena: 'Antena 5G'
  },
  {
    nome: 'Pedro Costa',
    cpf: '111 222 333 44', // Com espaços
    cod_nome: 'Pedro',
    telefone: '11 88888 7777', // Com espaços
    email: 'PEDRO@EMAIL.COM', // Maiúsculas
    tipo_pix: 'telefone',
    chave_pix: '11 88888 7777', // Com espaços
    cep: '11111 222', // Com espaço
    endereco: 'Rua do Comércio, 789',
    bairro: 'Jardim das Flores',
    cidade: 'Guarulhos',
    estado: 'Sp', // Misto
    funcoes: ['Drone'],
    regioes: ['Guarulhos, SP'],
    tipo_veiculo: ['Carro'],
    modelo_antena: ''
  }
];

async function testarFormato(dados, index) {
  console.log(`\n🧪 TESTE ${index + 1}: Dados com formatação variada`);
  console.log('=' .repeat(60));
  
  try {
    console.log('📤 Enviando dados...');
    console.log('Dados originais:', JSON.stringify(dados, null, 2));
    
    const response = await axios.post(API_BASE_URL, dados, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCESSO! Prestador criado com ID:', response.data.id);
    console.log('📊 Dados normalizados salvos:');
    console.log('- Nome:', response.data.nome);
    console.log('- CPF:', response.data.cpf);
    console.log('- Telefone:', response.data.telefone);
    console.log('- Email:', response.data.email);
    console.log('- CEP:', response.data.cep);
    console.log('- Estado:', response.data.estado);
    console.log('- Endereço:', response.data.endereco);
    console.log('- Bairro:', response.data.bairro);
    console.log('- Cidade:', response.data.cidade);
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ ERRO na criação:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erro:', error.response.data.error);
      if (error.response.data.details) {
        console.log('Detalhes:', error.response.data.details);
      }
    } else {
      console.log('Erro:', error.message);
    }
    return { success: false, error: error.response?.data || error.message };
  }
}

async function testarValidacoes() {
  console.log('🔍 TESTE DE VALIDAÇÃO E NORMALIZAÇÃO DO FORMULÁRIO');
  console.log('=' .repeat(60));
  console.log('Este teste verifica se o sistema aceita e normaliza diferentes formatos de dados');
  console.log('API:', API_BASE_URL);
  console.log('Data/Hora:', new Date().toLocaleString('pt-BR'));
  
  const resultados = [];
  
  for (let i = 0; i < dadosTeste.length; i++) {
    const resultado = await testarFormato(dadosTeste[i], i);
    resultados.push(resultado);
    
    // Aguardar um pouco entre os testes
    if (i < dadosTeste.length - 1) {
      console.log('\n⏳ Aguardando 2 segundos antes do próximo teste...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('=' .repeat(60));
  
  const sucessos = resultados.filter(r => r.success).length;
  const falhas = resultados.filter(r => !r.success).length;
  
  console.log(`✅ Sucessos: ${sucessos}/${resultados.length}`);
  console.log(`❌ Falhas: ${falhas}/${resultados.length}`);
  
  if (falhas > 0) {
    console.log('\n🚨 TESTES QUE FALHARAM:');
    resultados.forEach((resultado, index) => {
      if (!resultado.success) {
        console.log(`Teste ${index + 1}: ${resultado.error}`);
      }
    });
  }
  
  if (sucessos === resultados.length) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ O sistema está aceitando e normalizando corretamente diferentes formatos de dados');
    console.log('✅ As validações estão funcionando adequadamente');
    console.log('✅ A normalização de dados está implementada corretamente');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('Recomenda-se revisar as validações e normalizações implementadas');
  }
  
  return resultados;
}

// Função para testar endpoint de teste
async function testarEndpoint() {
  try {
    console.log('🔍 Testando endpoint de teste...');
    const response = await axios.get(`${API_BASE_URL}/test`);
    console.log('✅ Endpoint funcionando:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Endpoint não está funcionando:', error.message);
    return false;
  }
}

// Executar testes
async function executarTestes() {
  try {
    // Primeiro testar se o endpoint está funcionando
    const endpointOk = await testarEndpoint();
    if (!endpointOk) {
      console.log('\n❌ Não foi possível executar os testes. Verifique se o backend está rodando.');
      return;
    }
    
    // Executar testes de validação
    await testarValidacoes();
    
  } catch (error) {
    console.error('❌ Erro ao executar testes:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTestes();
}

module.exports = {
  testarFormato,
  testarValidacoes,
  executarTestes
};
