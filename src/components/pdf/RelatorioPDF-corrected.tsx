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
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se é uma URL relativa, concatenar com a API base
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }
  
  // Se não tem barra, adicionar
  return `${API_URL}/${url}`;
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
    padding: 30,
    fontFamily: 'Helvetica',
    textTransform: 'none'
  },
  
  // Faixa superior do cabeçalho
  faixaTopo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    padding: '2pt 0',
    backgroundColor: '#1E3A8A',
    borderBottom: '0.5pt solid #1E40AF'
  },
  
  // Logo Costa centralizado
  headerLogo: {
    display: 'flex',
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
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafc',
    marginBottom: 20
  },
  
  // Quadrante do checklist - deve iniciar na segunda página
  quadranteChecklist: {
    border: '2pt solid #0B2149',
    borderRadius: 8,
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
    marginBottom: 6,
    alignItems: 'flex-start'
  },
  
  // Rotulo do campo
  rotulo: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0B2149',
    width: '40%',
    textTransform: 'uppercase'
  },
  
  // Valor do campo
  valor: {
    fontSize: 9,
    color: '#333',
    width: '60%',
    textAlign: 'left'
  },
  
  // Linha divisória entre seções
  linhaDivisoria: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8
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
    borderRadius: 8,
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
    textAlign: 'justify',
    lineHeight: 1.4
  },
  
  // === FOTOS ===
  fotosContainer: {
    marginTop: 25,
    marginBottom: 20
  },
  tituloFotos: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B2149',
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  fotosGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  fotoItem: {
    width: '48%',
    marginBottom: 15,
    border: '1pt solid #e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  },
  fotoItemLeft: {
    marginRight: 'auto'
  },
  fotoItemRight: {
    marginLeft: 'auto'
  },
  fotoItemFirstRow: {
    marginTop: 0
  },
  fotoContainer: {
    position: 'relative',
    overflow: 'hidden'
  },
  foto: {
    width: '100%',
    height: 80,
    objectFit: 'cover',
    display: 'block'
  },
  fotoLegenda: {
    fontSize: 8,
    color: '#333',
    textAlign: 'center',
    padding: 6,
    backgroundColor: '#f8fafc',
    fontWeight: '500',
    lineHeight: 1.2
  },
  fotoData: {
    fontSize: 7,
    color: '#666',
    fontStyle: 'italic'
  },
  fotoInfoTecnica: {
    fontSize: 6,
    color: '#888',
    textAlign: 'center',
    padding: '2px 4px',
    backgroundColor: '#f1f5f9',
    fontFamily: 'monospace'
  },
  fotosContador: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    padding: '8px 0',
    borderTop: '1pt solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontStyle: 'italic'
  },
  
  // Rodapé
  rodape: {
    marginTop: 20,
    padding: 10,
    borderTop: '1pt solid #e2e8f0',
    textAlign: 'center',
    position: 'relative'
  },
  
  // Faixa degradê do rodapé
  faixaRodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    padding: '2pt 0',
    backgroundColor: '#DBEAFE',
    borderTop: '0.5pt solid #1E40AF'
  },
  rodapeTexto: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic'
  },
  linkMaps: {
    color: '#007bff',
    textDecoration: 'underline'
  },
  
  // Estilos para campos vazios
  campoVazio: {
    color: '#999',
    fontStyle: 'italic'
  }
});

const RelatorioPDF = ({ dados }: { dados: RelatorioDados }) => {
  const {
    id, cliente, tipo, data_acionamento, placa1, modelo1, cor1, endereco, cidade, estado, coordenadas, inicio, chegada,
    termino, km_inicial, km_final, km, descricao, fotos = [], resultado, sub_resultado,
    checklist, status, operador, criado_em, despesas, despesas_detalhadas, bairro, sub_cliente
  } = dados;

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
            src="/logo-costa.png"
          />
        </View>
        
        {/* Título principal */}
        <Text style={styles.tituloPrincipal}>
          RELATÓRIO DE OCORRÊNCIA
        </Text>
        
        {/* Subtítulo com informações básicas */}
        <Text style={styles.subtitulo}>
          {cliente || 'Cliente não informado'} - {tipo || 'Tipo não informado'}
        </Text>
        
        {/* === QUADRANTES DO CABEÇALHO === */}
        <View style={styles.quadrantesContainer}>
          <View style={styles.quadrantesWrapper}>
            {/* Quadrante 1: Informações da Ocorrência */}
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>INFORMAÇÕES DA OCORRÊNCIA</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>ID:</Text>
                <Text style={styles.valor}>{id || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Data do Acionamento:</Text>
                <Text style={styles.valor}>{formatarData(data_acionamento)}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Status:</Text>
                <Text style={styles.valor}>{status || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Operador:</Text>
                <Text style={styles.valor}>{operador || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Resultado:</Text>
                <Text style={styles.valor}>{resultado || 'N/A'}</Text>
              </View>
              
              {sub_resultado && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Sub-resultado:</Text>
                  <Text style={styles.valor}>{sub_resultado}</Text>
                </View>
              )}
            </View>
            
            {/* Quadrante 2: Informações do Veículo */}
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>INFORMAÇÕES DO VEÍCULO</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Placa Principal:</Text>
                <Text style={styles.valor}>{placa1 || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Modelo:</Text>
                <Text style={styles.valor}>{modelo1 || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Cor:</Text>
                <Text style={styles.valor}>{cor1 || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Tipo de Veículo:</Text>
                <Text style={styles.valor}>{tipo_veiculo || 'N/A'}</Text>
              </View>
            </View>
            
            {/* Quadrante 3: Localização */}
            <View style={styles.quadrante}>
              <Text style={styles.tituloQuadrante}>LOCALIZAÇÃO</Text>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Endereço:</Text>
                <Text style={styles.valor}>{endereco || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Bairro:</Text>
                <Text style={styles.valor}>{bairro || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Cidade:</Text>
                <Text style={styles.valor}>{cidade || 'N/A'}</Text>
              </View>
              
              <View style={styles.linhaQuadrante}>
                <Text style={styles.rotulo}>Estado:</Text>
                <Text style={styles.valor}>{estado || 'N/A'}</Text>
              </View>
              
              {coordenadas && (
                <View style={styles.linhaQuadrante}>
                  <Text style={styles.rotulo}>Coordenadas:</Text>
                  <Link src={gerarLinkGoogleMaps(coordenadas)} style={styles.linkMaps}>
                    {coordenadas}
                  </Link>
                </View>
              )}
            </View>
            
            {/* Quadrante 4: Horários e Quilometragem */}
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
            
            {/* Quadrante 5: Despesas */}
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

      {/* === SEGUNDA PÁGINA === */}
      {(checklist || descricao || (fotos && fotos.length > 0)) && (
        <Page size="A4" style={styles.page}>
          {/* Faixa superior */}
          <View style={styles.faixaTopo} />
          
          {/* Logo Costa */}
          <View style={styles.headerLogo}>
            <Image
              style={styles.logoCosta}
              src="/logo-costa.png"
            />
          </View>
          
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

          {/* === FOTOS NA SEGUNDA PÁGINA === */}
          {fotos && fotos.length > 0 && (
            <View style={styles.fotosContainer}>
              <Text style={styles.tituloFotos}>FOTOS DA OCORRÊNCIA</Text>
              
              {/* Grid de fotos organizado em duplas */}
              <View style={styles.fotosGrid}>
                {fotos.map((foto, index) => {
                  // Calcular posição na grade (2 fotos por linha)
                  const rowIndex = Math.floor(index / 2);
                  const colIndex = index % 2;
                  
                  return (
                    <View 
                      key={index} 
                      style={[
                        styles.fotoItem,
                        colIndex === 0 ? styles.fotoItemLeft : styles.fotoItemRight,
                        rowIndex === 0 ? styles.fotoItemFirstRow : null
                      ]}
                    >
                      {/* Container da imagem com crop/zoom aplicado */}
                      <View style={styles.fotoContainer}>
                        <Image
                          style={[
                            styles.foto,
                            // Aplicar crop se disponível
                            foto.cropX !== undefined && foto.cropY !== undefined && foto.cropArea
                              ? {
                                  objectFit: 'cover',
                                  objectPosition: `${foto.cropX}px ${foto.cropY}px`,
                                  transform: `scale(${foto.zoom || 1})`
                                }
                              : {}
                          ]}
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
                      
                      {/* Informações técnicas de crop/zoom se disponíveis */}
                      {(foto.cropX !== undefined || foto.cropY !== undefined || foto.zoom !== undefined) && (
                        <Text style={styles.fotoInfoTecnica}>
                          {foto.cropX !== undefined && `X:${foto.cropX.toFixed(1)} `}
                          {foto.cropY !== undefined && `Y:${foto.cropY.toFixed(1)} `}
                          {foto.zoom !== undefined && foto.zoom !== 1 && `Zoom:${foto.zoom.toFixed(2)}x`}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
              
              {/* Contador de fotos */}
              <Text style={styles.fotosContador}>
                Total de {fotos.length} foto{fotos.length !== 1 ? 's' : ''} anexada{fotos.length !== 1 ? 's' : ''}
              </Text>
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
      )}
    </Document>
  );
};

export default RelatorioPDF;
