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
  status?: string;
  operador?: string;
  tipo_veiculo?: string;
  criado_em?: string;
  despesas?: number;
  despesas_detalhadas?: Array<{ tipo: string; valor: number }>;
  bairro?: string;
  sub_cliente?: string;
}

// Função auxiliar para tratar valores nulos/undefined
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

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
    // Se não conseguir extrair coordenadas válidas, faz uma busca textual
    return `https://www.google.com/maps/search/${encodeURIComponent(coordenadas)}`;
  } catch (error) {
    console.warn('Erro ao gerar link do Google Maps:', error);
    return `https://www.google.com/maps/search/${encodeURIComponent(coordenadas)}`;
  }
};

// Função para tratar URLs de imagens
const tratarUrlImagem = (url: string | undefined): string => {
  if (!url) return '';
  
  try {
    // Se é uma URL completa, usar diretamente
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se é uma URL relativa, construir com a API
    if (url.startsWith('/')) {
      return `${API_URL}${url}`;
    }
    
    // Se não tem barra, adicionar
    return `${API_URL}/${url}`;
  } catch (error) {
    console.warn('Erro ao tratar URL da imagem:', url, error);
    return url;
  }
};

// Função para capitalizar texto (apenas primeira letra da primeira palavra maiúscula)
const capitalizarTexto = (texto: string | undefined): string => {
  if (!texto || texto.trim() === '') return '';
  
  try {
    const textoTrim = texto.trim();
    if (textoTrim.length === 0) return textoTrim;
    
    // Remover underscores e substituir por espaços
    const textoLimpo = textoTrim.replace(/_/g, ' ');
    
    // Converter tudo para minúsculas
    const textoMinusculo = textoLimpo.toLowerCase();
    
    // Capitalizar apenas a primeira letra da primeira palavra
    const palavras = textoMinusculo.split(' ');
    if (palavras.length > 0) {
      palavras[0] = palavras[0].charAt(0).toUpperCase() + palavras[0].slice(1);
    }
    
    return palavras.join(' ');
  } catch (error) {
    console.warn('Erro ao capitalizar texto:', texto, error);
    return texto;
  }
};

// Função para calcular tempo total
const calcularTempoTotal = (inicio: string | undefined, termino: string | undefined): string => {
  if (!inicio || !termino) return '-';
  
  try {
    const tempoInicio = new Date(inicio);
    const tempoTermino = new Date(termino);
    
    if (isNaN(tempoInicio.getTime()) || isNaN(tempoTermino.getTime())) {
      return '-';
    }
    
    const tempoTotal = tempoTermino.getTime() - tempoInicio.getTime();
    const horas = Math.floor(tempoTotal / 3600000);
    const minutos = Math.floor((tempoTotal % 3600000) / 60000);
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
  } catch (error) {
    console.warn('Erro ao calcular tempo total:', error);
    return '-';
  }
};

const styles = StyleSheet.create({
  // === LAYOUT SIMPLES E LIMPO ===
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 25, // ✅ Reduzido de 30 para 25 para aproximar do topo
    fontFamily: 'Helvetica',
    textTransform: 'none'
  },
  
  // Faixa degradê do topo
  faixaTopo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    padding: '2pt 0',
    background: 'linear-gradient(90deg, #1E3A8A 0%, #3B82F6 25%, #60A5FA 50%, #93C5FD 75%, #DBEAFE 100%)',
    borderBottom: '0.5pt solid #1E40AF'
  },
  
  // Logo Costa centralizado
  headerLogo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // ✅ Centralização vertical adicional
    marginTop: 10, // ✅ Reduzido de 20 para 10
    marginBottom: 15, // ✅ Reduzido de 20 para 15
    height: 138 // ✅ Aumentado em 15% (120 + 18)
  },
  logoCosta: {
    width: 345, // ✅ Aumentado em 15% (300 + 45)
    height: 138, // ✅ Aumentado em 15% (120 + 18)
    objectFit: 'contain'
  },
  
  // Títulos principais
  tituloPrincipal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 6, // ✅ Reduzido de 8 para 6
    color: '#0B2149',
    pageBreakInside: 'avoid'
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 18, // ✅ Reduzido de 25 para 18
    color: '#0B2149',
    pageBreakInside: 'avoid'
  },
  
  // === QUADRANTES DO CABEÇALHO ===
  
  // Container dos quadrantes - organiza a quebra de página
  quadrantesContainer: {
    marginBottom: 25 // ✅ Reduzido de 40 para 25 para aproximar do topo
    // Removido pageBreakInside: 'auto' para não interferir com os quadrantes
  },
  
  // Wrapper interno dos quadrantes para controle de quebra
  quadrantesWrapper: {
    // Permite quebra natural entre quadrantes
    pageBreakInside: 'auto'
  },
  
  // Quadrante individual - não pode ser dividido entre páginas
  quadrante: {
    border: '2pt solid #0B2149',
    borderRadius: 8,
    padding: 12, // ✅ Reduzido de 15 para 12
    backgroundColor: '#f9fafc',
    marginBottom: 20, // ✅ Reduzido de 30 para 20 para aproximar do topo
    // Propriedades específicas do React PDF para quebra de página
    pageBreakInside: 'avoid',
    // Força início na página seguinte se não couber por inteiro
    pageBreakBefore: 'auto'
  },
  
  // Quadrante do checklist - deve iniciar na segunda página
  quadranteChecklist: {
    border: '2pt solid #0B2149',
    borderRadius: 8,
    padding: 12, // ✅ Reduzido de 15 para 12
    backgroundColor: '#f9fafc',
    marginBottom: 20, // ✅ Reduzido de 30 para 20 para aproximar do topo
    // Propriedades específicas do React PDF para quebra de página
    pageBreakInside: 'avoid',
    pageBreakBefore: 'always' // ✅ Força início na página seguinte (mais agressivo)
  },
  
  // Título do quadrante
  tituloQuadrante: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 10, // ✅ Reduzido de 12 para 10
    textTransform: 'uppercase',
    borderBottom: '2pt solid #0B2149',
    paddingBottom: 4, // ✅ Reduzido de 5 para 4
    pageBreakInside: 'avoid'
  },
  
  // Subtítulo do quadrante (para seções internas)
  subtituloQuadrante: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0B2149',
    marginTop: 12, // ✅ Reduzido de 15 para 12
    marginBottom: 8, // ✅ Reduzido de 10 para 8
    textTransform: 'uppercase',
    borderBottom: '1pt solid #0B2149',
    paddingBottom: 3,
    pageBreakInside: 'avoid'
  },
  
  // Linhas dentro do quadrante
  linhaQuadrante: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 6, // ✅ Reduzido de 8 para 6
    pageBreakInside: 'avoid'
  },
  
  // Rótulos dos campos
  rotulo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0B2149',
    width: '35%',
    marginRight: 10,
    textTransform: 'none',
    pageBreakInside: 'avoid'
  },
  
  // Valores dos campos
  valor: {
    fontSize: 10,
    color: '#374151',
    width: '65%',
    textTransform: 'none',
    pageBreakInside: 'avoid'
  },
  
  // Linha divisória entre quadrantes
  linhaDivisoria: {
    borderBottom: '2pt solid #0B2149',
    marginVertical: 10,
    width: '100%',
    pageBreakInside: 'avoid'
  },
  
  // Seção condicional do checklist - não pode ser dividida
  secaoCondicional: {
    pageBreakInside: 'avoid',
    marginTop: 10
  },
  
  // Seção de descrição - não pode ser dividida entre páginas
  descricaoBox: {
    border: '1pt solid #0B2149',
    borderRadius: 6,
    padding: 15,
    marginTop: 40, // ✅ Margem aumentada para segunda página
    marginBottom: 20,
    backgroundColor: '#f9fafc',
    pageBreakInside: 'avoid'
  },
  tituloDescricao: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  descricaoTexto: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#333',
    textAlign: 'justify'
  },
  
  // Seção de fotos - não pode ser dividida entre páginas
  fotosContainer: {
    marginTop: 25, // ✅ Margem ajustada para melhor espaçamento
    marginBottom: 20,
    pageBreakInside: 'avoid'
  },
  tituloFotos: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 12,
    textTransform: 'uppercase',
    pageBreakInside: 'avoid'
  },
  fotosGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    pageBreakInside: 'avoid'
  },
  fotoItem: {
    width: '45%',
    marginBottom: 8,
    border: '1pt solid #e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    pageBreakInside: 'avoid'
  },
  foto: {
    width: '100%',
    height: 60,
    objectFit: 'cover',
    pageBreakInside: 'avoid'
  },
  fotoLegenda: {
    fontSize: 7,
    color: '#666',
    textAlign: 'center',
    padding: 4,
    backgroundColor: '#f9fafc',
    pageBreakInside: 'avoid'
  },
  
  // Rodapé - não pode ser dividido entre páginas
  rodape: {
    marginTop: 20,
    padding: 10,
    borderTop: '1pt solid #e2e8f0',
    textAlign: 'center',
    position: 'relative',
    pageBreakInside: 'avoid'
  },
  
  // Faixa degradê do rodapé
  faixaRodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    padding: '2pt 0',
    background: 'linear-gradient(90deg, #DBEAFE 0%, #93C5FD 25%, #60A5FA 50%, #3B82F6 75%, #1E3A8A 100%)',
    borderTop: '0.5pt solid #1E40AF',
    pageBreakInside: 'avoid'
  },
  rodapeTexto: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
    pageBreakInside: 'avoid'
  },
  linkMaps: {
    color: '#007bff',
    textDecoration: 'underline',
    pageBreakInside: 'avoid'
  },
  
  // Estilos para campos vazios
  campoVazio: {
    color: '#999',
    fontStyle: 'italic',
    pageBreakInside: 'avoid'
  }
});

const RelatorioPDF = ({ dados }: { dados: RelatorioDados }) => {
  const {
    id, cliente, tipo, data_acionamento, placa1, modelo1, cor1, endereco, cidade, estado, coordenadas, inicio, chegada,
    termino, km_inicial, km_final, km, descricao, fotos = [], os,
    origem_bairro, origem_cidade, origem_estado, resultado, sub_resultado,
    checklist, status, operador, tipo_veiculo, criado_em, despesas, despesas_detalhadas, bairro, sub_cliente
  } = dados;

  // Função para renderizar valor com fallback
  const renderizarValor = (valor: any, fallback: string = '-'): string => {
    if (valor === null || valor === undefined || valor === '') {
      return fallback;
    }
    return safeString(valor);
  };



  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Faixa degradê do topo */}
        <View style={styles.faixaTopo} />
        
        {/* Logo Costa Centralizado */}
        <View style={styles.headerLogo}>
          <Image
            style={styles.logoCosta}
            src="/assets/LOGOCOSTA.png"
          />
        </View>

        {/* Títulos Principais */}
        <Text style={styles.tituloPrincipal}>RELATÓRIO DE PRESTAÇÃO DE SERVIÇOS</Text>
        <Text style={styles.subtitulo}>RELATÓRIO DE ACIONAMENTO</Text>

        {/* === CABEÇALHO ORGANIZADO EM QUADRANTES === */}
        <View style={styles.quadrantesContainer}>
          {/* Container interno para garantir quebra de página */}
          <View style={styles.quadrantesWrapper}>
          
          {/* === PRIMEIRO QUADRANTE === */}
          <View style={styles.quadrante}>
            <Text style={styles.tituloQuadrante}>INFORMAÇÕES BÁSICAS</Text>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Data:</Text>
              <Text style={styles.valor}>
                {renderizarValor(formatarData(criado_em) || formatarData(data_acionamento))}
              </Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>ID da Ocorrência:</Text>
              <Text style={styles.valor}>{renderizarValor(id)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Cliente:</Text>
              <Text style={styles.valor}>{renderizarValor(cliente)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Sub Cliente:</Text>
              <Text style={styles.valor}>{renderizarValor(sub_cliente)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Operador:</Text>
              <Text style={styles.valor}>{renderizarValor(operador)}</Text>
            </View>
          </View>

          {/* === SEGUNDO QUADRANTE === */}
          <View style={styles.quadrante}>
            <Text style={styles.tituloQuadrante}>VEÍCULO E LOCALIZAÇÃO</Text>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Tipo de Ocorrência:</Text>
              <Text style={styles.valor}>{renderizarValor(tipo)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Placa:</Text>
              <Text style={styles.valor}>
                {renderizarValor(placa1)}
                {[modelo1, cor1].filter(Boolean).length > 0 && 
                 ` - ${[modelo1, cor1].filter(Boolean).join(' ')}`}
              </Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Endereço da Abordagem:</Text>
              <Text style={styles.valor}>
                {[endereco, bairro, cidade, estado].filter(Boolean).join(', ') || '-'}
              </Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Link Google Maps:</Text>
              <Text style={styles.valor}>
                {coordenadas ? (
                  <Link src={gerarLinkGoogleMaps(coordenadas)} style={styles.linkMaps}>
                    {gerarLinkGoogleMaps(coordenadas)}
                  </Link>
                ) : '-'}
              </Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Resultado:</Text>
              <Text style={styles.valor}>
                {(() => {
                  // Construir resultado combinando status e sub_status
                  let resultadoCompleto = '';
                  
                  // Se há resultado específico preenchido, usar ele
                  if (resultado && resultado.trim() !== '') {
                    resultadoCompleto = capitalizarTexto(resultado);
                  }
                  
                  // Se há sub_resultado, adicionar sem hífen (sub_resultado fica em minúsculas)
                  if (sub_resultado && sub_resultado.trim() !== '') {
                    if (resultadoCompleto) {
                      resultadoCompleto += ` ${sub_resultado.replace(/_/g, ' ').toLowerCase()}`;
                    } else {
                      resultadoCompleto = sub_resultado.replace(/_/g, ' ').toLowerCase();
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
                      resultadoCompleto = `${statusTexto} ${sub_resultado.replace(/_/g, ' ').toLowerCase()}`;
                    } else if (statusTexto) {
                      resultadoCompleto = statusTexto;
                    }
                  }
                  
                  return resultadoCompleto || '-';
                })()}
              </Text>
            </View>
          </View>

          {/* === TERCEIRO QUADRANTE === */}
          <View style={styles.quadrante}>
            <Text style={styles.tituloQuadrante}>HORÁRIOS E QUILOMETRAGEM</Text>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Data e Hora Início:</Text>
              <Text style={styles.valor}>{renderizarValor(inicio ? formatarDataHora(inicio) : null)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Data e Hora Local:</Text>
              <Text style={styles.valor}>{renderizarValor(chegada ? formatarDataHora(chegada) : null)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Data e Hora Finalização:</Text>
              <Text style={styles.valor}>{renderizarValor(termino ? formatarDataHora(termino) : null)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>Tempo Total:</Text>
              <Text style={styles.valor}>
                {calcularTempoTotal(inicio, termino)}
              </Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>KM Inicial:</Text>
              <Text style={styles.valor}>{renderizarValor(km_inicial)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>KM Final:</Text>
              <Text style={styles.valor}>{renderizarValor(km_final)}</Text>
            </View>
            
            <View style={styles.linhaQuadrante}>
              <Text style={styles.rotulo}>KM Total:</Text>
              <Text style={styles.valor}>{renderizarValor(km)}</Text>
            </View>
          </View>



          {/* === QUINTO QUADRANTE - DESPESAS === */}
          {(despesas || (despesas_detalhadas && despesas_detalhadas.length > 0)) && (
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>DESPESAS E INFORMAÇÕES FINANCEIRAS</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Total Despesas:</Text>
                <Text style={styles.valor}>
                  {despesas ? `R$ ${Number(despesas).toFixed(2)}` : '-'}
                </Text>
              </View>
              
              {despesas_detalhadas && despesas_detalhadas.length > 0 && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Itens Detalhados:</Text>
                  <Text style={styles.valor}>{`${despesas_detalhadas.length} itens`}</Text>
                </View>
              )}
            </View>
          )}
          </View> {/* Fechamento do quadrantesWrapper */}
        </View>
      </Page> {/* Fechamento da primeira página */}

        {/* === QUEBRA DE PÁGINA FORÇADA PARA O CHECKLIST === */}
        {checklist && (
          <>
            {/* === SEGUNDA PÁGINA - CHECKLIST E INFORMAÇÕES ADICIONAIS === */}
            <Page size="A4" style={styles.page}>
              {/* Header da segunda página */}
              <View style={styles.faixaTopo} />
              
              {/* Checklist em página separada */}
              <View style={styles.quadranteChecklist}>
                <Text style={styles.tituloQuadrante}>CHECKLIST E INFORMAÇÕES ADICIONAIS</Text>
                
                {/* === INFORMAÇÕES FIXAS - SEMPRE APARECEM QUANDO PREENCHIDAS === */}
                
                {/* Recuperado com Chave */}
                {checklist.recuperado_com_chave && (
                  <View style={styles.linhaQuadrante}>
                    <Text style={styles.rotulo}>Recuperado com chave:</Text>
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
                    {checklist.matricula_atendente && (
                      <View style={styles.linhaQuadrante}>
                        <Text style={styles.rotulo}>Matrícula do Atendente:</Text>
                        <Text style={styles.valor}>{renderizarValor(checklist.matricula_atendente)}</Text>
                      </View>
                    )}
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
              
              {/* === DESCRIÇÃO NA SEGUNDA PÁGINA === */}
              <View style={styles.descricaoBox}>
                <Text style={styles.tituloDescricao}>DESCRIÇÃO DA OCORRÊNCIA</Text>
                <Text style={styles.descricaoTexto}>
                  {descricao || 'Nenhuma descrição fornecida.'}
                </Text>
              </View>

              {/* === FOTOS NA SEGUNDA PÁGINA === */}
              {fotos && fotos.length > 0 && (
                <View style={styles.fotosContainer}>
                  <Text style={styles.tituloFotos}>FOTOS DA OCORRÊNCIA</Text>
                  <View style={styles.fotosGrid}>
                    {fotos.map((foto, index) => (
                      <View key={index} style={styles.fotoItem}>
                        <Image
                          style={styles.foto}
                          src={tratarUrlImagem(foto.url || '')}
                        />
                        <Text style={styles.fotoLegenda}>
                          Foto {index + 1} - {formatarDataHora(foto.criado_em)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* === RODAPÉ DA SEGUNDA PÁGINA === */}
              <View style={styles.rodape}>
                {/* Faixa degradê do rodapé */}
                <View style={styles.faixaRodape} />
                
                <Text style={styles.rodapeTexto}>
                  Relatório gerado em {formatarDataHora(new Date().toISOString())}
                </Text>
              </View>
            </Page>
          </>
        )}
    </Document>
  );
};

export default RelatorioPDF;
