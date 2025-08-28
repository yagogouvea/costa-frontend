// Código ajustado com controle de quebra e layout aplicado corretamente
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Foto } from '@/types/ocorrencia';
import { API_URL } from '@/config/api';

interface RelatorioDados {
  id?: string | number;
  cliente?: string;
  tipo?: string;
  data_acionamento?: string;
  placa1?: string;
  modelo1?: string;
  cor1?: string;
  placa2?: string;
  modelo2?: string;
  cor2?: string;
  placa3?: string;
  modelo3?: string;
  cor3?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  coordenadas?: string;
  inicio?: string;
  chegada?: string;
  termino?: string;
  km_inicial?: number;
  km_final?: number;
  km?: number;
  descricao?: string;
  fotos?: Foto[];
  os?: string;
  origem_bairro?: string;
  origem_cidade?: string;
  origem_estado?: string;
  condutor?: string;
  resultado?: string;
  sub_resultado?: string;
  planta_origem?: string;
  cidade_destino?: string;
  km_acl?: string;
  nome_condutor?: string;
  transportadora?: string;
  valor_carga?: number;
  notas_fiscais?: string;
  cpf_condutor?: string;
  conta?: string;
  checklist?: any;
  operador?: string;
  criado_em?: string;
  despesas?: number;
  despesas_detalhadas?: Array<{ tipo: string; valor: number }>;
  bairro?: string;
  sub_cliente?: string;
}

// Função para formatar data (YYYY-MM-DD para DD/MM/YYYY)
const formatarData = (data: string | undefined): string => {
  if (!data) return '';
  try {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return '';
    return dataObj.toLocaleDateString('pt-BR');
  } catch (error) {
    console.warn('Erro ao formatar data:', data, error);
    return '';
  }
};

// Função para formatar data e hora (YYYY-MM-DD HH:MM:SS para DD/MM/YYYY HH:MM)
const formatarDataHora = (data: string | undefined): string => {
  if (!data) return '';
  try {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return '';
    return dataObj.toLocaleDateString('pt-BR', { hour: 'numeric', minute: 'numeric' });
  } catch (error) {
    console.warn('Erro ao formatar data/hora:', data, error);
    return '';
  }
};

// Função para gerar link do Google Maps
const gerarLinkGoogleMaps = (coordenadas: string): string => {
  if (!coordenadas) return '';
  
  try {
    // Tentar extrair coordenadas no formato "latitude,longitude"
    const match = coordenadas.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (match) {
      const lat = match[1];
      const lng = match[2];
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    
    // Se não conseguir extrair, retornar coordenadas como estão
    return `https://www.google.com/maps?q=${coordenadas}`;
  } catch (error) {
    console.warn('Erro ao gerar link do Google Maps:', error);
    return '';
  }
};

// Função para tratar URL da imagem
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

// Função para capitalizar texto
const capitalizarTexto = (texto: string | null | undefined): string => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

// Função para renderizar valor com fallback
const renderizarValor = (valor: any, fallback: string = '-'): string => {
  if (valor === null || valor === undefined || valor === '') {
    return fallback;
  }
  return String(valor);
};

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    textTransform: 'none'
    // padding: 30 REDUZIDO para 20 - mais espaço para conteúdo
  },
  
  // Faixa superior do cabeçalho
  faixaTopo: {
    height: 12,
    padding: 2,
    backgroundColor: '#1E3A8A',
    borderBottom: '0.5pt solid #1E40AF'
  },
  
  // Logo Costa centralizado
  headerLogo: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    height: 138
  },
  logoCosta: {
    width: 345,
    height: 138,
    objectFit: 'contain'
  },
  
  // Títulos principais
  tituloPrincipal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 6,
    color: '#0B2149'
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 18,
    color: '#0B2149'
  },
  
  // === QUADRANTES DO CABEÇALHO ===
  
  // Container dos quadrantes - organiza a quebra de página
  quadrantesContainer: {
    marginBottom: 25
  },
  
  // Wrapper interno dos quadrantes para controle de quebra
  quadrantesWrapper: {
    // Permite quebra natural entre quadrantes
  },
  
  // Quadrante individual - não pode ser dividido entre páginas
  quadrante: {
    border: '2pt solid #0B2149',
    padding: 12,
    backgroundColor: '#f9fafc',
    marginBottom: 20
  },
  
  // Quadrante do checklist - deve iniciar na segunda página
  quadranteChecklist: {
    border: '2pt solid #0B2149',
    padding: 12,
    backgroundColor: '#f9fafc',
    marginBottom: 20
  },
  
  // Título do quadrante
  tituloQuadrante: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottom: '2pt solid #0B2149',
    paddingBottom: 4
  },
  
  // Subtítulo do quadrante (para seções internas)
  subtituloQuadrante: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottom: '1pt solid #0B2149',
    paddingBottom: 2
  },
  
  // Linha de quadrante (label + valor)
  linhaQuadrante: {
    flexDirection: 'row',
    marginBottom: 6
  },
  
  // Rotulo do campo
  rotulo: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0B2149',
    width: '35%',
    marginRight: 10,
    textTransform: 'uppercase'
  },
  
  // Valor do campo
  valor: {
    fontSize: 9,
    color: '#333',
    width: '65%',
    textAlign: 'left'
  },
  
  // Linha divisória entre seções
  linhaDivisoria: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 8,
    marginBottom: 8
  },
  
  // Seção condicional (aparece apenas quando selecionada)
  secaoCondicional: {
    marginTop: 8
  },
  
  // === DESCRIÇÃO ===
  descricaoBox: {
    marginTop: 25,
    padding: 15,
    border: '2pt solid #0B2149',
    backgroundColor: '#f9fafc'
  },
  tituloDescricao: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
    borderBottom: '2pt solid #0B2149',
    paddingBottom: 4
  },
  descricaoTexto: {
    fontSize: 10,
    color: '#333',
    textAlign: 'justify'
  },
  
  // === FOTOS ===
  fotosContainer: {
    marginTop: 25,
    marginBottom: 20,
    flex: 1
  },
  tituloFotos: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  fotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  fotoItem: {
    width: '42%',
    marginBottom: 15,
    border: '3pt solid #2D3748',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8
    // minHeight: 320 REMOVIDO - permite altura natural e quebra de página
  },
  fotoItemLeft: {
    marginRight: 15
  },
  fotoItemRight: {
    marginLeft: 15
  },
  fotoItemFirstRow: {
    marginTop: 0
  },
  fotoContainer: {
    margin: 0,
    padding: 0,
    backgroundColor: 'transparent'
  },
  foto: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain'
    // height: 280 REMOVIDO - permite altura natural e quebra de página
  },
  fotoLegenda: {
    fontSize: 8,
    color: '#333',
    textAlign: 'center',
    padding: 6,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
    borderTop: '1pt solid #CBD5E0',
    borderRadius: 4
  },
  fotoData: {
    fontSize: 7,
    color: '#666'
  },
  fotoInfoTecnica: {
    fontSize: 6,
    color: '#888',
    textAlign: 'center',
    padding: 4,
    backgroundColor: '#f1f5f9',
    marginTop: 2
  },
  fotosContador: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    padding: 8,
    borderTop: '3pt solid #2D3748',
    backgroundColor: '#EDF2F7',
    borderRadius: 4
  },
  
  // Rodapé
  rodape: {
    marginTop: 10,
    padding: 8,
    borderTop: '1pt solid #e2e8f0',
    textAlign: 'center'
  },
  
  // Faixa degradê do rodapé
  faixaRodape: {
    height: 12,
    padding: 2,
    backgroundColor: '#DBEAFE',
    borderTop: '0.5pt solid #1E40AF'
  },
  rodapeTexto: {
    fontSize: 8,
    color: '#666'
  },
  linkMaps: {
    color: '#007bff',
    fontSize: 9,
    fontFamily: 'Helvetica'
  },
  
  // Estilos para campos vazios
  campoVazio: {
    color: '#999'
  }
});

const RelatorioPDF = ({ dados }: { dados: RelatorioDados }) => {
  const {
    id, cliente, tipo, data_acionamento, placa1, modelo1, cor1, endereco, cidade, estado, coordenadas, inicio, chegada,
    termino, km_inicial, km_final, km, descricao, fotos = [], resultado, sub_resultado,
    checklist, operador, despesas, despesas_detalhadas, bairro, sub_cliente
  } = dados;
  
  // Debug: verificar dados recebidos
  console.log('🔍 Debug RelatorioPDF - dados recebidos:', {
    temFotos: !!fotos,
    totalFotos: fotos?.length || 0,
    fotos: fotos?.slice(0, 3) || [], // Primeiras 3 fotos para debug
    temChecklist: !!checklist,
    temDescricao: !!descricao
  });

  // Debug detalhado das fotos
  if (fotos && fotos.length > 0) {
    console.log('📸 Fotos recebidas no RelatorioPDF:');
    fotos.forEach((foto, index) => {
      console.log(`  Foto ${index + 1}:`, {
        id: foto.id,
        url: foto.url,
        legenda: foto.legenda,
        urlTratada: tratarUrlImagem(foto.url || '')
      });
    });
  } else {
    console.log('❌ Nenhuma foto recebida no RelatorioPDF');
  }

  // Calcular informações das páginas ANTES do return
  const fotosPorPagina = 4; // 2 linhas de 2 fotos por página
  const totalPaginasConteudo = (checklist || descricao) ? 2 : 1;
  const primeiraPaginaFotos = totalPaginasConteudo + 1;
  const totalPaginasFotos = fotos && fotos.length > 0 ? Math.ceil(fotos.length / fotosPorPagina) : 0;

  return (
    <Document>
      {/* === PRIMEIRA PÁGINA === */}
      <Page size="A4" style={styles.page}>
        {/* Faixa superior */}
        <View style={styles.faixaTopo} />
        
        {/* Logo Costa */}
        <View style={styles.headerLogo}>
          <Image
            style={styles.logoCosta}
            src="/assets/LOGOCOSTA.png"
          />
        </View>
        
        {/* Título principal */}
        <Text style={styles.tituloPrincipal}>
          RELATÓRIO DE OCORRÊNCIA
        </Text>
        
        {/* === QUADRANTES DO CABEÇALHO === */}
        <View style={styles.quadrantesContainer}>
          <View style={styles.quadrantesWrapper}>
            {/* Quadrante 1: Informações da Ocorrência */}
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>INFORMAÇÕES BÁSICAS</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Data:</Text>
                <Text style={styles.valor}>{formatarData(data_acionamento)}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>ID da Ocorrência:</Text>
                <Text style={styles.valor}>{id || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Cliente:</Text>
                <Text style={styles.valor}>{cliente || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Sub Cliente:</Text>
                <Text style={styles.valor}>{sub_cliente || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Operador:</Text>
                <Text style={styles.valor}>{operador || 'N/A'}</Text>
              </View>
            </View>
            
            {/* Quadrante 2: Veículo e Localização */}
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>VEÍCULO E LOCALIZAÇÃO</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Tipo de Ocorrência:</Text>
                <Text style={styles.valor}>{tipo || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Placa:</Text>
                <Text style={styles.valor}>
                  {placa1 || 'N/A'}
                  {modelo1 && ` - ${modelo1}`}
                  {cor1 && ` - ${cor1}`}
                </Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Endereço da Abordagem:</Text>
                <Text style={styles.valor}>
                  {endereco || 'N/A'}
                  {bairro && `, ${bairro}`}
                  {cidade && `, ${cidade}`}
                  {estado && `, ${estado}`}
                </Text>
              </View>
              
              {coordenadas && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Link Google Maps:</Text>
                  <Link src={gerarLinkGoogleMaps(coordenadas)} style={styles.linkMaps}>
                    Ver no Google Maps
                  </Link>
                </View>
              )}
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Resultado:</Text>
                <Text style={styles.valor}>
                  {(() => {
                    let resultadoCompleto = '';
                    
                    if (resultado) {
                      // Formatar resultado: primeira letra maiúscula, resto minúsculo, remover underscores
                      resultadoCompleto = resultado
                        .split('_')
                        .map((palavra, index) => {
                          if (index === 0) {
                            // Primeira palavra: primeira letra maiúscula
                            return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
                          } else {
                            // Outras palavras: tudo minúsculo
                            return palavra.toLowerCase();
                          }
                        })
                        .join(' ');
                    }
                    
                                         if (sub_resultado) {
                       // Formatar sub_resultado: primeira letra maiúscula, resto minúsculo, remover underscores
                       const subResultadoFormatado = sub_resultado
                         .split('_')
                         .map((palavra, index) => {
                           if (index === 0) {
                             // Primeira palavra: primeira letra maiúscula
                             return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
                           } else {
                             // Outras palavras: tudo minúsculo
                             return palavra.toLowerCase();
                           }
                         })
                         .join(' ');
                      
                       // Combinar resultado + sub_resultado (sem duplicar "com")
                       if (resultadoCompleto) {
                         // Se já tem resultado, adicionar sub_resultado
                         resultadoCompleto += ' ' + subResultadoFormatado;
                       } else {
                         // Se não tem resultado, usar apenas sub_resultado
                         resultadoCompleto = subResultadoFormatado;
                       }
                     }
                    
                    return resultadoCompleto || 'N/A';
                  })()}
                </Text>
              </View>
            </View>
            
            {/* Quadrante 3: Horários e Quilometragem */}
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>HORÁRIOS E QUILOMETRAGEM</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Início:</Text>
                <Text style={styles.valor}>{formatarDataHora(inicio)}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Chegada:</Text>
                <Text style={styles.valor}>{formatarDataHora(chegada)}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Término:</Text>
                <Text style={styles.valor}>{formatarDataHora(termino)}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>KM Inicial:</Text>
                <Text style={styles.valor}>{km_inicial || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>KM Final:</Text>
                <Text style={styles.valor}>{km_final || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>KM Total:</Text>
                <Text style={styles.valor}>{km || 'N/A'}</Text>
              </View>
            </View>
            
            {/* Quadrante 4: Despesas */}
            {despesas && despesas > 0 && (
              <View style={styles.quadrante}>
                <Text style={styles.tituloQuadrante}>DESPESAS</Text>
                
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Total:</Text>
                  <Text style={styles.valor}>R$ {despesas.toFixed(2)}</Text>
                </View>
                
                {despesas_detalhadas && despesas_detalhadas.length > 0 && (
                  <>
                    {despesas_detalhadas.map((despesa, index) => (
                      <View key={index} style={styles.linhaQuadrante}>
                        <Text style={styles.rotulo}>{despesa.tipo}:</Text>
                        <Text style={styles.valor}>R$ {despesa.valor.toFixed(2)}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Page>

      {/* === SEGUNDA PÁGINA - APENAS QUANDO HÁ CONTEÚDO === */}
      {(checklist || descricao) && (
        <Page size="A4" style={styles.page}>
          {/* Faixa superior */}
          <View style={styles.faixaTopo} />
          
          {/* === CHECKLIST NA SEGUNDA PÁGINA === */}
          {checklist && (
            <View style={styles.quadranteChecklist}>
              <Text style={styles.tituloQuadrante}>CHECKLIST DA OCORRÊNCIA</Text>
              
              {/* Campos básicos do checklist */}
              {checklist.veiculo_recuperado && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Veículo Recuperado:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.veiculo_recuperado)}</Text>
                </View>
              )}
              
              {checklist.recuperado_com_chave && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Recuperado com Chave:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.recuperado_com_chave)}</Text>
                </View>
              )}

              {/* Avarias */}
              {checklist.avarias && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Avarias:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.avarias)}</Text>
                </View>
              )}

              {/* Detalhes das Avarias */}
              {checklist.detalhes_avarias && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Detalhes das avarias:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.detalhes_avarias)}</Text>
                </View>
              )}

              {/* Fotos Realizadas */}
              {checklist.fotos_realizadas && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Fotos realizadas:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.fotos_realizadas)}</Text>
                </View>
              )}

              {/* Justificativa das Fotos */}
              {checklist.justificativa_fotos && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Justificativa das fotos:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.justificativa_fotos)}</Text>
                </View>
              )}

              {/* Posse do Veículo */}
              {checklist.posse_veiculo && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Posse do veículo:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.posse_veiculo)}</Text>
                </View>
              )}

              {/* Observação da Posse */}
              {checklist.observacao_posse && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Observação da posse:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.observacao_posse)}</Text>
                </View>
              )}

              {/* Observação da Ocorrência */}
              {checklist.observacao_ocorrencia && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Observação da ocorrência:</Text>
                  <Text style={styles.valor}>{renderizarValor(checklist.observacao_ocorrencia)}</Text>
                </View>
              )}

              {/* === INFORMAÇÕES CONDICIONAIS - APARECEM APENAS QUANDO SELECIONADAS === */}
              
              {/* Destino - Apenas quando alguma opção for selecionada */}
              {(checklist.loja_selecionada || checklist.guincho_selecionado || checklist.apreensao_selecionada) && (
                <View style={styles.secaoCondicional}>
                  <View style={styles.linhaDivisoria} />
                  <Text style={styles.subtituloQuadrante}>DESTINO SELECIONADO</Text>
                  
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Tipo de Destino:</Text>
                    <Text style={styles.valor}>
                      {(() => {
                        if (checklist.loja_selecionada) {
                          return 'Loja';
                        } else if (checklist.guincho_selecionado) {
                          return 'Guincho';
                        } else if (checklist.apreensao_selecionada) {
                          return 'Apreensão';
                        }
                        return '-';
                      })()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Detalhes da Loja - Apenas quando loja for selecionada */}
              {checklist.loja_selecionada && (
                <View style={styles.secaoCondicional}>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Nome da loja:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.nome_loja)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Endereço da loja:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.endereco_loja)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Atendente:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.nome_atendente)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Matrícula do Atendente:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.matricula_atendente)}</Text>
                  </View>
                </View>
              )}

              {/* Detalhes do Guincho - Apenas quando guincho for selecionado */}
              {checklist.guincho_selecionado && (
                <View style={styles.secaoCondicional}>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Tipo de Guincho:</Text>
                    <Text style={styles.valor}>{capitalizarTexto(checklist.tipo_guincho)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Empresa Guincho:</Text>
                    <Text style={styles.valor}>{capitalizarTexto(checklist.nome_empresa_guincho)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Motorista do Guincho:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.nome_motorista_guincho)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Valor Guincho:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.valor_guincho)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Telefone Guincho:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.telefone_guincho)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Destino do Guincho:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.destino_guincho)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Endereço do Destino:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.endereco_destino_guincho)}</Text>
                  </View>
                </View>
              )}

              {/* Detalhes da Apreensão - Apenas quando apreensão for selecionada */}
              {checklist.apreensao_selecionada && (
                <View style={styles.secaoCondicional}>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>DP/Batalhão:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.nome_dp_batalhao)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Endereço da Apreensão:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.endereco_apreensao)}</Text>
                  </View>
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>BO/NOC:</Text>
                    <Text style={styles.valor}>{renderizarValor(checklist.numero_bo_noc)}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* === DESCRIÇÃO NA SEGUNDA PÁGINA === */}
          {descricao && (
            <View style={styles.descricaoBox}>
              <Text style={styles.tituloDescricao}>DESCRIÇÃO DA OCORRÊNCIA</Text>
              <Text style={styles.descricaoTexto}>
                {descricao}
              </Text>
            </View>
          )}

          {/* RODAPÉ REMOVIDO PARA TESTE */}
        </Page>
      )}

      {/* === PÁGINAS DE FOTOS - SOLUÇÃO COMPLETAMENTE SEM IIFE === */}
      
      {/* Página 1 de fotos */}
      {fotos && fotos.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Faixa superior */}
          <View style={styles.faixaTopo} />
          
          {/* Título das fotos */}
          <Text style={styles.tituloFotos}>FOTOS DA OCORRÊNCIA</Text>
          
          {/* Grid de fotos - primeira página */}
          <View style={styles.fotosGrid}>
            {fotos.slice(0, 4).map((foto, index) => (
              <View 
                key={`foto-0-${index}`} 
                style={[
                  styles.fotoItem,
                  index % 2 === 0 ? styles.fotoItemLeft : styles.fotoItemRight,
                  index < 2 ? styles.fotoItemFirstRow : {}
                ]}
              >
                {/* Container da imagem */}
                <View style={styles.fotoContainer}>
                  <Image
                    style={styles.foto}
                    src={tratarUrlImagem(foto.url || '')}
                  />
                </View>
                
                {/* Legenda da foto */}
                <Text style={styles.fotoLegenda}>
                  {foto.legenda || `Foto ${index + 1}`}
                  {foto.criado_em && (
                    <Text style={styles.fotoData}>
                      {' - '}{formatarDataHora(foto.criado_em)}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Contador de fotos */}
          <Text style={styles.fotosContador}>
            Página {primeiraPaginaFotos} de {primeiraPaginaFotos + totalPaginasFotos - 1} - Total de {fotos.length} foto{fotos.length !== 1 ? 's' : ''} anexada{fotos.length !== 1 ? 's' : ''}
          </Text>
          
          {/* RODAPÉ REMOVIDO PARA TESTE */}
        </Page>
      )}

      {/* Página 2 de fotos */}
      {fotos && fotos.length > 4 && (
        <Page size="A4" style={styles.page}>
          {/* Faixa superior */}
          <View style={styles.faixaTopo} />
          
          {/* Título das fotos */}
          <Text style={styles.tituloFotos}>FOTOS DA OCORRÊNCIA (CONTINUAÇÃO)</Text>
          
          {/* Grid de fotos - segunda página */}
          <View style={styles.fotosGrid}>
            {fotos.slice(4, 8).map((foto, index) => (
              <View 
                key={`foto-1-${index}`} 
                style={[
                  styles.fotoItem,
                  index % 2 === 0 ? styles.fotoItemLeft : styles.fotoItemRight,
                  index < 2 ? styles.fotoItemFirstRow : {}
                ]}
              >
                {/* Container da imagem */}
                <View style={styles.fotoContainer}>
                  <Image
                    style={styles.foto}
                    src={tratarUrlImagem(foto.url || '')}
                  />
                </View>
                
                {/* Legenda da foto */}
                <Text style={styles.fotoLegenda}>
                  {foto.legenda || `Foto ${index + 5}`}
                  {foto.criado_em && (
                    <Text style={styles.fotoData}>
                      {' - '}{formatarDataHora(foto.criado_em)}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Contador de fotos */}
          <Text style={styles.fotosContador}>
            Página {primeiraPaginaFotos + 1} de {primeiraPaginaFotos + totalPaginasFotos - 1} - Total de {fotos.length} foto{fotos.length !== 1 ? 's' : ''} anexada{fotos.length !== 1 ? 's' : ''}
          </Text>
          
          {/* RODAPÉ REMOVIDO PARA TESTE */}
        </Page>
      )}

      {/* Página 3 de fotos */}
      {fotos && fotos.length > 8 && (
        <Page size="A4" style={styles.page}>
          {/* Faixa superior */}
          <View style={styles.faixaTopo} />
          
          {/* Título das fotos */}
          <Text style={styles.tituloFotos}>FOTOS DA OCORRÊNCIA (CONTINUAÇÃO)</Text>
          
          {/* Grid de fotos - terceira página */}
          <View style={styles.fotosGrid}>
            {fotos.slice(8, 12).map((foto, index) => (
              <View 
                key={`foto-2-${index}`} 
                style={[
                  styles.fotoItem,
                  index % 2 === 0 ? styles.fotoItemLeft : styles.fotoItemRight,
                  index < 2 ? styles.fotoItemFirstRow : {}
                ]}
              >
                {/* Container da imagem */}
                <View style={styles.fotoContainer}>
                  <Image
                    style={styles.foto}
                    src={tratarUrlImagem(foto.url || '')}
                  />
                </View>
                
                {/* Legenda da foto */}
                <Text style={styles.fotoLegenda}>
                  {foto.legenda || `Foto ${index + 9}`}
                  {foto.criado_em && (
                    <Text style={styles.fotoData}>
                      {' - '}{formatarDataHora(foto.criado_em)}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Contador de fotos */}
          <Text style={styles.fotosContador}>
            Página {primeiraPaginaFotos + 2} de {primeiraPaginaFotos + totalPaginasFotos - 1} - Total de {fotos.length} foto{fotos.length !== 1 ? 's' : ''} anexada{fotos.length !== 1 ? 's' : ''}
          </Text>
          
          {/* RODAPÉ REMOVIDO PARA TESTE */}
        </Page>
      )}

      {/* Página 4 de fotos */}
      {fotos && fotos.length > 12 && (
        <Page size="A4" style={styles.page}>
          {/* Faixa superior */}
          <View style={styles.faixaTopo} />
          
          {/* Título das fotos */}
          <Text style={styles.tituloFotos}>FOTOS DA OCORRÊNCIA (CONTINUAÇÃO)</Text>
          
          {/* Grid de fotos - quarta página */}
          <View style={styles.fotosGrid}>
            {fotos.slice(12, 16).map((foto, index) => (
              <View 
                key={`foto-3-${index}`} 
                style={[
                  styles.fotoItem,
                  index % 2 === 0 ? styles.fotoItemLeft : styles.fotoItemRight,
                  index < 2 ? styles.fotoItemFirstRow : {}
                ]}
              >
                {/* Container da imagem */}
                <View style={styles.fotoContainer}>
                  <Image
                    style={styles.foto}
                    src={tratarUrlImagem(foto.url || '')}
                  />
                </View>
                
                {/* Legenda da foto */}
                <Text style={styles.fotoLegenda}>
                  {foto.legenda || `Foto ${index + 13}`}
                  {foto.criado_em && (
                    <Text style={styles.fotoData}>
                      {' - '}{formatarDataHora(foto.criado_em)}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Contador de fotos */}
          <Text style={styles.fotosContador}>
            Página {primeiraPaginaFotos + 3} de {primeiraPaginaFotos + totalPaginasFotos - 1} - Total de {fotos.length} foto{fotos.length !== 1 ? 's' : ''} anexada{fotos.length !== 1 ? 's' : ''}
          </Text>
          
          {/* RODAPÉ REMOVIDO PARA TESTE */}
        </Page>
      )}
    </Document>
  );
};

export default RelatorioPDF;
