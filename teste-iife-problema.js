// Teste para identificar se a IIFE era o problema das páginas em branco
console.log('🔍 TESTE: IDENTIFICANDO PROBLEMA DA IIFE\n');

// Simular dados com 8 fotos (como na imagem)
const dados = {
  checklist: { veiculo_recuperado: 'Sim' },
  descricao: 'Descrição da ocorrência',
  fotos: Array.from({ length: 8 }, (_, i) => ({ url: `foto${i + 1}.jpg` }))
};

console.log('📊 DADOS DE TESTE:');
console.log(`   • Checklist: ${dados.checklist ? 'Sim' : 'Não'}`);
console.log(`   • Descrição: ${dados.descricao ? 'Sim' : 'Não'}`);
console.log(`   • Total de fotos: ${dados.fotos.length}`);

// Simular a lógica atual (sem IIFE)
function simularSemIIFE() {
  console.log('\n📄 SIMULAÇÃO SEM IIFE:');
  
  const fotosPorPagina = 4;
  const totalPaginasConteudo = (dados.checklist || dados.descricao) ? 2 : 1;
  const primeiraPaginaFotos = totalPaginasConteudo + 1;
  const totalPaginasFotos = Math.ceil(dados.fotos.length / fotosPorPagina);
  
  console.log(`   • Páginas de conteúdo: ${totalPaginasConteudo}`);
  console.log(`   • Primeira página de fotos: ${primeiraPaginaFotos}`);
  console.log(`   • Total de páginas de fotos: ${totalPaginasFotos}`);
  
  const paginas = [];
  
  for (let paginaIndex = 0; paginaIndex < totalPaginasFotos; paginaIndex++) {
    const inicioFotos = paginaIndex * fotosPorPagina;
    const fotosDaPagina = dados.fotos.slice(inicioFotos, inicioFotos + fotosPorPagina);
    
    if (fotosDaPagina.length > 0) {
      paginas.push({
        numeroPagina: primeiraPaginaFotos + paginaIndex,
        fotos: fotosDaPagina.length,
        inicio: inicioFotos + 1,
        fim: inicioFotos + fotosDaPagina.length
      });
    }
  }
  
  console.log(`   • Páginas criadas: ${paginas.length}`);
  console.log(`   • Numeração: ${paginas.map(p => p.numeroPagina).join(', ')}`);
  
  return paginas;
}

// Simular a lógica antiga (com IIFE)
function simularComIIFE() {
  console.log('\n📄 SIMULAÇÃO COM IIFE (ANTIGA):');
  
  const fotosPorPagina = 4;
  const totalPaginasConteudo = (dados.checklist || dados.descricao) ? 2 : 1;
  const primeiraPaginaFotos = totalPaginasConteudo + 1;
  const totalPaginasFotos = Math.ceil(dados.fotos.length / fotosPorPagina);
  
  console.log(`   • Páginas de conteúdo: ${totalPaginasConteudo}`);
  console.log(`   • Primeira página de fotos: ${primeiraPaginaFotos}`);
  console.log(`   • Total de páginas de fotos: ${totalPaginasFotos}`);
  
  // Simular o comportamento da IIFE que pode estar causando problemas
  const resultado = (() => {
    const paginas = [];
    
    for (let paginaIndex = 0; paginaIndex < totalPaginasFotos; paginaIndex++) {
      const inicioFotos = paginaIndex * fotosPorPagina;
      const fotosDaPagina = dados.fotos.slice(inicioFotos, inicioFotos + fotosPorPagina);
      
      if (fotosDaPagina.length > 0) {
        paginas.push({
          numeroPagina: primeiraPaginaFotos + paginaIndex,
          fotos: fotosDaPagina.length,
          inicio: inicioFotos + 1,
          fim: inicioFotos + fotosDaPagina.length
        });
      }
    }
    
    return paginas;
  })();
  
  console.log(`   • Páginas criadas: ${resultado.length}`);
  console.log(`   • Numeração: ${resultado.map(p => p.numeroPagina).join(', ')}`);
  
  return resultado;
}

// Executar simulações
const resultadoSemIIFE = simularSemIIFE();
const resultadoComIIFE = simularComIIFE();

console.log('\n🎯 ANÁLISE:');
console.log(`   • Sem IIFE: ${resultadoSemIIFE.length} páginas`);
console.log(`   • Com IIFE: ${resultadoComIIFE.length} páginas`);

console.log('\n📝 CONCLUSÃO:');
console.log('   • A lógica matemática é idêntica em ambos os casos');
console.log('   • O problema pode estar na interpretação do React-PDF da IIFE');
console.log('   • A IIFE pode estar criando um contexto extra que o React-PDF interpreta como conteúdo');
console.log('   • A solução é remover a IIFE e usar renderização direta');
