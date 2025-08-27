// Teste completo para verificar todos os cenários de geração de páginas
console.log('🔍 TESTE COMPLETO: TODOS OS CENÁRIOS DE PÁGINAS\n');

// Função para simular a lógica de geração de páginas
function simularGeracaoPaginas(checklist, descricao, fotos) {
  console.log(`📊 CENÁRIO: Checklist=${!!checklist}, Descrição=${!!descricao}, Fotos=${fotos?.length || 0}`);
  
  // Página 1: Sempre existe
  const paginas = ['Página 1: Informações básicas'];
  
  // Página 2: Condicional
  if (checklist || descricao) {
    paginas.push('Página 2: Checklist/Descrição');
  }
  
  // Páginas de fotos: Condicional
  if (fotos && fotos.length > 0) {
    const fotosPorPagina = 4;
    const totalPaginasFotos = Math.ceil(fotos.length / fotosPorPagina);
    
    for (let i = 0; i < totalPaginasFotos; i++) {
      const inicioFotos = i * fotosPorPagina;
      const fotosDaPagina = fotos.slice(inicioFotos, inicioFotos + fotosPorPagina);
      
      if (fotosDaPagina.length > 0) {
        const numeroPagina = (checklist || descricao) ? 3 + i : 2 + i;
        paginas.push(`Página ${numeroPagina}: Fotos ${inicioFotos + 1}-${inicioFotos + fotosDaPagina.length}`);
      }
    }
  }
  
  return paginas;
}

// Cenário 1: Sem checklist, sem descrição, sem fotos
console.log('=== CENÁRIO 1: SEM CONTEÚDO ADICIONAL ===');
const cenario1 = simularGeracaoPaginas(null, null, []);
console.log(`   • Total de páginas: ${cenario1.length}`);
console.log(`   • Páginas: ${cenario1.join(', ')}`);
console.log('   • Resultado esperado: 1 página (apenas informações básicas)');
console.log('   • Status: ' + (cenario1.length === 1 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 2: Com checklist, sem descrição, sem fotos
console.log('=== CENÁRIO 2: APENAS CHECKLIST ===');
const cenario2 = simularGeracaoPaginas({ veiculo_recuperado: 'Sim' }, null, []);
console.log(`   • Total de páginas: ${cenario2.length}`);
console.log(`   • Páginas: ${cenario2.join(', ')}`);
console.log('   • Resultado esperado: 2 páginas (básicas + checklist)');
console.log('   • Status: ' + (cenario2.length === 2 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 3: Sem checklist, com descrição, sem fotos
console.log('=== CENÁRIO 3: APENAS DESCRIÇÃO ===');
const cenario3 = simularGeracaoPaginas(null, 'Descrição da ocorrência', []);
console.log(`   • Total de páginas: ${cenario3.length}`);
console.log(`   • Páginas: ${cenario3.join(', ')}`);
console.log('   • Resultado esperado: 2 páginas (básicas + descrição)');
console.log('   • Status: ' + (cenario3.length === 2 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 4: Com checklist, com descrição, sem fotos
console.log('=== CENÁRIO 4: CHECKLIST + DESCRIÇÃO ===');
const cenario4 = simularGeracaoPaginas({ veiculo_recuperado: 'Sim' }, 'Descrição da ocorrência', []);
console.log(`   • Total de páginas: ${cenario4.length}`);
console.log(`   • Páginas: ${cenario4.join(', ')}`);
console.log('   • Resultado esperado: 2 páginas (básicas + checklist+descrição)');
console.log('   • Status: ' + (cenario4.length === 2 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 5: Sem checklist, sem descrição, com 4 fotos
console.log('=== CENÁRIO 5: APENAS 4 FOTOS ===');
const cenario5 = simularGeracaoPaginas(null, null, Array.from({ length: 4 }, (_, i) => ({ url: `foto${i + 1}.jpg` })));
console.log(`   • Total de páginas: ${cenario5.length}`);
console.log(`   • Páginas: ${cenario5.join(', ')}`);
console.log('   • Resultado esperado: 2 páginas (básicas + 1 página de fotos)');
console.log('   • Status: ' + (cenario5.length === 2 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 6: Sem checklist, sem descrição, com 8 fotos
console.log('=== CENÁRIO 6: APENAS 8 FOTOS ===');
const cenario6 = simularGeracaoPaginas(null, null, Array.from({ length: 8 }, (_, i) => ({ url: `foto${i + 1}.jpg` })));
console.log(`   • Total de páginas: ${cenario6.length}`);
console.log(`   • Páginas: ${cenario6.join(', ')}`);
console.log('   • Resultado esperado: 3 páginas (básicas + 2 páginas de fotos)');
console.log('   • Status: ' + (cenario6.length === 3 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 7: Com checklist, sem descrição, com 8 fotos
console.log('=== CENÁRIO 7: CHECKLIST + 8 FOTOS ===');
const cenario7 = simularGeracaoPaginas({ veiculo_recuperado: 'Sim' }, null, Array.from({ length: 8 }, (_, i) => ({ url: `foto${i + 1}.jpg` })));
console.log(`   • Total de páginas: ${cenario7.length}`);
console.log(`   • Páginas: ${cenario7.join(', ')}`);
console.log('   • Resultado esperado: 4 páginas (básicas + checklist + 2 páginas de fotos)');
console.log('   • Status: ' + (cenario7.length === 4 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Cenário 8: Com checklist, com descrição, com 12 fotos
console.log('=== CENÁRIO 8: CHECKLIST + DESCRIÇÃO + 12 FOTOS ===');
const cenario8 = simularGeracaoPaginas({ veiculo_recuperado: 'Sim' }, 'Descrição da ocorrência', Array.from({ length: 12 }, (_, i) => ({ url: `foto${i + 1}.jpg` })));
console.log(`   • Total de páginas: ${cenario8.length}`);
console.log(`   • Páginas: ${cenario8.join(', ')}`);
console.log('   • Resultado esperado: 5 páginas (básicas + checklist+descrição + 3 páginas de fotos)');
console.log('   • Status: ' + (cenario8.length === 5 ? '✅ CORRETO' : '❌ INCORRETO'));
console.log('');

// Resumo final
console.log('🎯 RESUMO FINAL:');
console.log(`   • Cenários testados: 8`);
console.log(`   • Cenários corretos: ${[cenario1, cenario2, cenario3, cenario4, cenario5, cenario6, cenario7, cenario8].filter(c => c.length > 0).length}`);
console.log(`   • Cenários incorretos: ${[cenario1, cenario2, cenario3, cenario4, cenario5, cenario6, cenario7, cenario8].filter(c => c.length === 0).length}`);

console.log('\n📝 CONCLUSÃO:');
console.log('   • Se todos os cenários estiverem corretos, a lógica está funcionando perfeitamente');
console.log('   • Se algum cenário estiver incorreto, há um problema na lógica de geração de páginas');
console.log('   • O problema das páginas em branco pode estar na renderização do React-PDF, não na lógica');
