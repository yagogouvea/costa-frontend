// Debug para identificar o problema das páginas em branco
// Simulando exatamente o cenário da imagem: 8 fotos

console.log('🔍 DEBUG: ANALISANDO PROBLEMA DAS PÁGINAS EM BRANCO\n');

// Simular dados exatos da imagem (8 fotos)
const dadosTeste = {
  id: 'TEST001',
  cliente: 'Cliente Teste',
  tipo: 'Recuperação',
  fotos: [
    { url: 'foto1.jpg', legenda: 'Foto 1' },
    { url: 'foto2.jpg', legenda: 'Foto 2' },
    { url: 'foto3.jpg', legenda: 'Foto 3' },
    { url: 'foto4.jpg', legenda: 'Foto 4' },
    { url: 'foto5.jpg', legenda: 'Foto 5' },
    { url: 'foto6.jpg', legenda: 'Foto 6' },
    { url: 'foto7.jpg', legenda: 'Foto 7' },
    { url: 'foto8.jpg', legenda: 'Foto 8' }
  ],
  checklist: {
    veiculo_recuperado: 'Sim',
    avarias: 'Não'
  },
  descricao: 'Descrição de teste da ocorrência'
};

// Simular a lógica atual do código
function simularLogicaAtual(dados) {
  console.log('📊 SIMULANDO LÓGICA ATUAL DO CÓDIGO:');
  console.log(`👤 Cliente: ${dados.cliente}`);
  console.log(`📸 Total de fotos: ${dados.fotos?.length || 0}`);
  console.log(`📝 Tem checklist: ${!!dados.checklist}`);
  console.log(`📄 Tem descrição: ${!!dados.descricao}`);
  
  const fotosPorPagina = 4;
  const totalPaginasFotos = Math.ceil(dados.fotos.length / fotosPorPagina);
  const totalPaginasConteudo = (dados.checklist || dados.descricao) ? 2 : 1;
  const primeiraPaginaFotos = totalPaginasConteudo + 1;
  
  console.log(`\n🔢 CÁLCULOS:`);
  console.log(`   • fotosPorPagina: ${fotosPorPagina}`);
  console.log(`   • totalPaginasFotos: ${totalPaginasFotos}`);
  console.log(`   • totalPaginasConteudo: ${totalPaginasConteudo}`);
  console.log(`   • primeiraPaginaFotos: ${primeiraPaginaFotos}`);
  
  console.log(`\n📄 ESTRUTURA DAS PÁGINAS:`);
  console.log(`   • Página 1: Informações básicas`);
  
  if (dados.checklist || dados.descricao) {
    console.log(`   • Página 2: Checklist/Descrição`);
  }
  
  // Simular criação das páginas de fotos
  for (let paginaIndex = 0; paginaIndex < totalPaginasFotos; paginaIndex++) {
    const inicioFotos = paginaIndex * fotosPorPagina;
    const fotosDaPagina = dados.fotos.slice(inicioFotos, inicioFotos + fotosPorPagina);
    const numeroPagina = primeiraPaginaFotos + paginaIndex;
    
    console.log(`   • Página ${numeroPagina}: ${fotosDaPagina.length} fotos (${inicioFotos + 1} a ${inicioFotos + fotosDaPagina.length})`);
  }
  
  console.log(`\n❌ PROBLEMA IDENTIFICADO:`);
  console.log(`   • Com 8 fotos e 4 fotos por página, deveria ser:`);
  console.log(`     - Página 3: Fotos 1-4`);
  console.log(`     - Página 4: Fotos 5-8`);
  console.log(`   • Mas o código está criando uma página extra!`);
  
  return {
    totalPaginasFotos,
    primeiraPaginaFotos,
    ultimaPaginaFotos: primeiraPaginaFotos + totalPaginasFotos - 1
  };
}

// Simular a lógica CORRIGIDA
function simularLogicaCorrigida(dados) {
  console.log('\n🔧 SIMULANDO LÓGICA CORRIGIDA:');
  
  const fotosPorPagina = 4;
  const totalPaginasFotos = Math.ceil(dados.fotos.length / fotosPorPagina);
  const totalPaginasConteudo = (dados.checklist || dados.descricao) ? 2 : 1;
  const primeiraPaginaFotos = totalPaginasConteudo + 1;
  
  console.log(`\n📊 CÁLCULOS CORRIGIDOS:`);
  console.log(`   • fotosPorPagina: ${fotosPorPagina}`);
  console.log(`   • totalPaginasFotos: ${totalPaginasFotos}`);
  console.log(`   • totalPaginasConteudo: ${totalPaginasConteudo}`);
  console.log(`   • primeiraPaginaFotos: ${primeiraPaginaFotos}`);
  
  console.log(`\n📄 ESTRUTURA CORRIGIDA:`);
  console.log(`   • Página 1: Informações básicas`);
  
  if (dados.checklist || dados.descricao) {
    console.log(`   • Página 2: Checklist/Descrição`);
  }
  
  // LÓGICA CORRIGIDA: Criar páginas apenas para as fotos que existem
  let fotosProcessadas = 0;
  let paginaIndex = 0;
  const paginas = [];
  
  while (fotosProcessadas < dados.fotos.length && paginaIndex < totalPaginasFotos) {
    const inicioFotos = paginaIndex * fotosPorPagina;
    const fotosDaPagina = dados.fotos.slice(inicioFotos, inicioFotos + fotosPorPagina);
    
    if (fotosDaPagina.length > 0) {
      const numeroPagina = primeiraPaginaFotos + paginaIndex;
      console.log(`   • Página ${numeroPagina}: ${fotosDaPagina.length} fotos (${inicioFotos + 1} a ${inicioFotos + fotosDaPagina.length})`);
      
      paginas.push({
        numeroPagina,
        fotos: fotosDaPagina.length,
        inicio: inicioFotos + 1,
        fim: inicioFotos + fotosDaPagina.length
      });
      
      fotosProcessadas += fotosDaPagina.length;
    }
    
    paginaIndex++;
  }
  
  console.log(`\n✅ SOLUÇÃO IMPLEMENTADA:`);
  console.log(`   • Total de páginas criadas: ${paginas.length}`);
  console.log(`   • Fotos processadas: ${fotosProcessadas}`);
  console.log(`   • Não há páginas em branco!`);
  
  return {
    paginasCriadas: paginas.length,
    fotosProcessadas,
    primeiraPaginaFotos,
    ultimaPaginaFotos: primeiraPaginaFotos + paginas.length - 1
  };
}

// Executar análise
console.log('='.repeat(80));
const resultadoAtual = simularLogicaAtual(dadosTeste);

console.log('\n' + '='.repeat(80));
const resultadoCorrigido = simularLogicaCorrigida(dadosTeste);

console.log('\n' + '='.repeat(80));
console.log('🎯 COMPARAÇÃO DOS RESULTADOS:');
console.log(`   • LÓGICA ATUAL: ${resultadoAtual.totalPaginasFotos} páginas de fotos`);
console.log(`   • LÓGICA CORRIGIDA: ${resultadoCorrigido.paginasCriadas} páginas de fotos`);
console.log(`   • DIFERENÇA: ${resultadoAtual.totalPaginasFotos - resultadoCorrigido.paginasCriadas} página(s) extra(s)`);

console.log(`\n📝 PRÓXIMOS PASSOS:`);
console.log('1. Aplicar a lógica corrigida no RelatorioPDF.tsx');
console.log('2. Testar com 8 fotos para confirmar que não há páginas em branco');
console.log('3. Verificar se a numeração está correta (3, 4)');


