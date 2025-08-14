// Código ajustado com controle de quebra e layout aplicado corretamente
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Foto } from '@/types/ocorrencia';
import { API_URL } from '@/config/api';

interface RelatorioDados {
  id?: string | number;
  cliente?: string;
  cliente_logo?: string;
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
  resultado?: 'Recuperado' | 'Não Recuperado' | 'Cancelado';
  planta_origem?: string;
  cidade_destino?: string;
  km_acl?: string;
  nome_condutor?: string;
  transportadora?: string;
  valor_carga?: number;
  notas_fiscais?: string;
  cpf_condutor?: string;
  conta?: string;
}

// Função auxiliar para tratar valores nulos/undefined
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Função para concatenar valores com segurança
const safeConcatenate = (...values: (string | null | undefined)[]): string => {
  return values
    .map(v => safeString(v))
    .filter(v => v.trim() !== '')
    .join(' ');
};

// --- Configurações flexíveis para logos ---
const LOGO_CLIENTE_WIDTH = 180;
const LOGO_CLIENTE_HEIGHT = 120;

const LOGO_SEGTRACK_WIDTH = 180;
const LOGO_SEGTRACK_HEIGHT = 180;
// -----------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: '#555555',
    backgroundColor: '#FFFFFF',
    position: 'relative'
  },
  headerVisual: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 40,
    backgroundColor: '#0B2149'
  },
  headerBarSecondary: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: '100%',
    height: 10,
    backgroundColor: '#6c7a89'
  },
  footerVisual: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 30,
    backgroundColor: '#0B2149'
  },
  footerBarSecondary: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    width: '100%',
    height: 10,
    backgroundColor: '#6c7a89'
  },
  logo: {
    width: 200,
    marginBottom: 6,
    marginTop: 50,
    alignSelf: 'center'
  },
  headerLogos: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    zIndex: 10,
    height: 120
  },
  headerLogosClienteDireita: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    zIndex: 10,
    height: 120
  },
  logoCliente: {
    width: LOGO_CLIENTE_WIDTH,
    height: LOGO_CLIENTE_HEIGHT,
    objectFit: 'contain',
    alignSelf: 'center'
  },
  logoSegtrack: {
    width: LOGO_SEGTRACK_WIDTH,
    height: LOGO_SEGTRACK_HEIGHT,
    objectFit: 'contain',
    alignSelf: 'center'
  },
  tituloPrincipal: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 4,
    color: '#0B2149'
  },
  faixaAzul: {
    backgroundColor: '#0B2149',
    color: '#FFFFFF',
    padding: 4,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4
  },
  cardUnico: {
    border: '2pt solid #0B2149',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#f9fafc'
  },
  linhaCampo: {
    fontSize: 9,
    marginBottom: 4,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  rotuloBotao: {
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 9,
    color: '#0B2149'
  },
  linhaSeparadora: {
    borderBottomWidth: 1,
    borderBottomColor: '#0B2149',
    marginVertical: 6,
    width: '100%'
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
    color: '#0B2149',
    textAlign: 'center'
  },
  descricaoBox: {
    border: '2pt solid #0B2149',
    borderRadius: 10,
    padding: 30,
    marginTop: 160, // Aumentado de 30 para 160 para dar espaço ao cabeçalho
    marginBottom: 30,
    marginHorizontal: 40,
    backgroundColor: '#f9fafc',
    width: '85%',
    alignSelf: 'center',
    minHeight: 150,
    overflow: 'hidden'
  },
  descricaoTexto: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#333',
    textAlign: 'justify',
    wordBreak: 'break-word',
    width: '100%',
    whiteSpace: 'pre-wrap',
    paddingHorizontal: 30,
    marginVertical: 15
  },
  galeriaLinha: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 40,
    breakInside: 'avoid'
  },
  cardImagem: {
    width: '48%',
    padding: 6,
    marginBottom: 10,
    border: '2pt solid #0B2149',
    borderRadius: 10,
    backgroundColor: '#f9fafc',
    alignItems: 'center',
    breakInside: 'avoid'
  },
  imagem: {
    width: '100%',
    height: 180,
    borderRadius: 5,
    objectFit: 'cover'
  },
  legenda: {
    fontSize: 8,
    color: '#333',
    backgroundColor: '#eaeaea',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    textAlign: 'center',
    marginTop: 6,
    border: '1pt solid #ccc',
    width: '100%',
    fontFamily: 'Helvetica'
  },
  linkMaps: {
    fontSize: 9,
    color: '#0066cc',
    textDecoration: 'underline'
  }
});

const resolveFotoUrl = (url: string): string => {
  if (!url) {
    console.warn('⚠️ URL da foto está vazia');
    return '';
  }
  
  console.log('🔗 Resolvendo URL da foto:', url);
  
  if (url.startsWith('http')) {
    console.log('✅ URL já é absoluta:', url);
    return url;
  }
  
  // Remove duplicidade de /api/api/ se houver
  let cleanUrl = url.replace(/^\/api\/api\//, '/api/');
  console.log('🧹 URL limpa:', cleanUrl);
  
  // Remove barra final do API_URL e barra inicial do url
  const finalUrl = `${API_URL.replace(/\/$/, '')}/${cleanUrl.replace(/^\//, '')}`;
  console.log('🔗 URL final construída:', finalUrl);
  
  return finalUrl;
};

const resolveLogoUrl = (logoPath: string): string => {
  if (!logoPath) {
    console.log('🏢 Logo path vazio');
    return '';
  }
  
  console.log('🏢 Resolvendo logo URL:', logoPath);
  
  // Se a URL já for absoluta, retornar como está
  if (logoPath.startsWith('http')) {
    console.log('🏢 Logo já é URL absoluta:', logoPath);
    return logoPath;
  }
  
  // Se o logo começa com /uploads/, usar a URL do Supabase
  if (logoPath.startsWith('/uploads/') || logoPath.includes('logos/')) {
    const supabaseUrl = 'https://ziedretdauamqkaoqcjh.supabase.co/storage/v1/object/public/segtrackfotos';
    const cleanPath = logoPath.replace(/^\/+/, '');
    const finalUrl = `${supabaseUrl}/${cleanPath}`;
    console.log('🏢 URL do Supabase construída:', finalUrl);
    return finalUrl;
  }
  
  // Se o logo não tem caminho relativo, tentar construir URL completa
  if (!logoPath.startsWith('/')) {
    const supabaseUrl = 'https://ziedretdauamqkaoqcjh.supabase.co/storage/v1/object/public/segtrackfotos';
    const finalUrl = `${supabaseUrl}/${logoPath}`;
    console.log('🏢 URL do Supabase construída (sem /):', finalUrl);
    return finalUrl;
  }
  
  // Configuração baseada no ambiente
  const baseUrl = API_URL;
  console.log('🏢 Base URL:', baseUrl);
  
  // Remove leading slashes
  const cleanPath = logoPath.replace(/^\/+/, '');
  
  // Construct final URL
  const finalUrl = `${baseUrl}/${cleanPath}`;
  
  console.log('🏢 URL do logo construída:', finalUrl);
  
  return finalUrl;
};

const processarLegenda = (texto: string): string => {
  if (!texto) return '';
  
  // Limpa todas as tags HTML e retorna apenas o texto puro
  return texto
    .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
    .replace(/&nbsp;/g, ' ') // Substitui &nbsp; por espaço
    .replace(/\s+/g, ' ')    // Remove múltiplos espaços
    .trim();                 // Remove espaços no início e fim
};

const gerarLinkGoogleMaps = (coordenadas: string): string => {
  if (!coordenadas) return '';
  
  // Remove espaços e caracteres especiais, mantém apenas números, vírgulas, pontos e hífens
  const coordenadasLimpas = coordenadas.replace(/[^\d.,-]/g, '');
  
  // Verifica se tem formato de coordenadas (latitude,longitude)
  const coordenadasArray = coordenadasLimpas.split(',');
  if (coordenadasArray.length === 2) {
    const lat = parseFloat(coordenadasArray[0].trim());
    const lng = parseFloat(coordenadasArray[1].trim());
    
    // Verifica se são coordenadas válidas
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
  }
  
  // Se não conseguir extrair coordenadas válidas, faz uma busca textual
  return `https://www.google.com/maps/search/${encodeURIComponent(coordenadas)}`;
};

const LegendaFormatada = ({ texto }: { texto: string }) => (
  <Text style={styles.legenda}>{processarLegenda(texto)}</Text>
);

const RelatorioPDF = ({ dados }: { dados: RelatorioDados }) => {
  const {
    id, cliente, cliente_logo, tipo, data_acionamento, placa1, modelo1, cor1, placa2, modelo2, cor2,
    placa3, modelo3, cor3, endereco, cidade, estado, coordenadas, inicio, chegada,
    termino, km_inicial, km_final, km, descricao, fotos = [], os,
    origem_bairro, origem_cidade, origem_estado, condutor, resultado, planta_origem, cidade_destino, km_acl,
    nome_condutor, transportadora, valor_carga, notas_fiscais, cpf_condutor, conta
  } = dados;

  const tempoTotal = inicio && termino ? new Date(termino).getTime() - new Date(inicio).getTime() : null;
  const tempoHoras = tempoTotal ? String(Math.floor(tempoTotal / 3600000)).padStart(2, '0') : '00';
  const tempoMinutos = tempoTotal ? String(Math.floor((tempoTotal % 3600000) / 60000)).padStart(2, '0') : '00';

  return (
    <Document>
       <Page size="A4" style={styles.page} wrap>
      <View style={styles.headerVisual} />
      <View style={styles.headerBarSecondary} />
      
      {/* Logos no cabeçalho - Logo do cliente à direita */}
      <View style={styles.headerLogosClienteDireita}>
        {/* Logo da Segtrack sempre à esquerda */}
        <Image 
          style={styles.logoSegtrack} 
          src="https://ziedretdauamqkaoqcjh.supabase.co/storage/v1/object/public/segtrackfotos/logos/logoseg.png"
        />
        
        {/* Logo do cliente à direita - apenas se existir */}
        {cliente_logo && (
          <Image 
            style={styles.logoCliente} 
            src={resolveLogoUrl(cliente_logo)}
          />
        )}
      </View>

      <Text style={[styles.tituloPrincipal, { marginTop: 160 }]}>RELATÓRIO DE PRESTAÇÃO DE SERVIÇOS</Text>
      <Text style={styles.faixaAzul}>RELATÓRIO DE ACIONAMENTO</Text>
      <Text style={styles.secaoTitulo}>DADOS DA OCORRÊNCIA</Text>

        <View style={styles.cardUnico}>
          {id && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Ocorrência Nº:</Text> {safeString(id)}</Text>}
          <View style={styles.linhaSeparadora} />
          {cliente && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Cliente:</Text> {safeString(cliente)}</Text>}
          {(cliente === 'BRK' || cliente?.toLowerCase().includes('brk')) && conta && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Conta:</Text> {safeString(conta)}</Text>}
          {cliente === 'BRK' && condutor && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Dados do Condutor:</Text> {safeString(condutor)}</Text>}
          {tipo && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Tipo de Ocorrência:</Text> {safeString(tipo)}</Text>}
         {data_acionamento && (
  <Text style={styles.linhaCampo}>
    <Text style={styles.rotuloBotao}>Data de Acionamento:</Text> {(() => {
      const dataObj = new Date(data_acionamento);
      const dataLocal = new Date(dataObj.getTime() + (dataObj.getTimezoneOffset() * 60000));
      return dataLocal.toLocaleDateString('pt-BR');
    })()}
  </Text>
)}

          <View style={styles.linhaSeparadora} />
          {(cliente === 'ITURAN' || cliente?.toLowerCase().includes('ituran')) && os && (
            <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Número OS:</Text> {safeString(os)}</Text>
          )}
          {(cliente === 'ITURAN' || cliente?.toLowerCase().includes('ituran')) && (origem_bairro || origem_cidade || origem_estado) && (
            <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Local de Origem:</Text> {safeConcatenate(origem_bairro, '-', origem_cidade, '-', origem_estado)}</Text>
          )}
          {(cliente === 'Aitura' || cliente === 'Marfrig') && <View style={styles.linhaSeparadora} />}
          {placa1 && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Dados do Veículo 1:</Text> {safeConcatenate(placa1, modelo1, cor1)}</Text>}
          {placa2 && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Dados do Veículo 2:</Text> {safeConcatenate(placa2, modelo2, cor2)}</Text>}
          {placa3 && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Dados do Veículo 3:</Text> {safeConcatenate(placa3, modelo3, cor3)}</Text>}
          {endereco && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Local por Extenso:</Text> {safeConcatenate(endereco + ',', cidade, '-', estado)}</Text>}
          {coordenadas && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Coordenadas:</Text> {safeString(coordenadas)}</Text>}
          {coordenadas && (
            <Text style={styles.linhaCampo}>
              <Text style={styles.rotuloBotao}>Ver no Google Maps:</Text>{' '}
              <Link src={gerarLinkGoogleMaps(coordenadas)} style={styles.linkMaps}>
                Abrir no Google Maps
              </Link>
            </Text>
          )}
          {resultado && <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Status de Recuperação:</Text> {safeString(resultado)}</Text>}
          <View style={styles.linhaSeparadora} />
          <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Horário Inicial:</Text> {inicio ? new Date(inicio).toLocaleString() : '-'}</Text>
          <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Horário Chegada:</Text> {chegada ? new Date(chegada).toLocaleString() : '-'}</Text>
          <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Horário Final:</Text> {termino ? new Date(termino).toLocaleString() : '-'}</Text>
         <Text style={styles.linhaCampo}>
  <Text style={styles.rotuloBotao}>Tempo Total:</Text> {tempoHoras}h{tempoMinutos}min
</Text>

          <Text style={styles.linhaCampo}><Text style={styles.rotuloBotao}>Odômetro:</Text> Início: {km_inicial ?? '-'} | Final: {km_final ?? '-'} | Total: {km ?? (km_final !== undefined && km_inicial !== undefined ? km_final - km_inicial : '-')} km</Text>
          {/* Linha divisória antes do bloco Marfrig */}
          {(cliente === 'Marfrig' || cliente?.toLowerCase().includes('marfrig')) && (
            <>
              <View style={styles.linhaSeparadora} />
              {cpf_condutor && <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>CPF do Condutor:</Text> {safeString(cpf_condutor)}</Text>}
              {nome_condutor && <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>Nome do Condutor:</Text> {safeString(nome_condutor)}</Text>}
              {transportadora && <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>Transportadora:</Text> {safeString(transportadora)}</Text>}
              <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>Valor da Carga:</Text> {valor_carga !== undefined && valor_carga !== null ? Number(valor_carga).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}</Text>
              {notas_fiscais && <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>Notas Fiscais:</Text> {safeString(notas_fiscais)}</Text>}
              {planta_origem && <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>Planta de origem:</Text> {safeString(planta_origem)}</Text>}
              {cidade_destino && <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>Cidade de destino:</Text> {safeString(cidade_destino)}</Text>}
              {tipo && tipo.toUpperCase() === 'ACL' && km_acl && (
                <Text style={[styles.linhaCampo, { marginBottom: 2 }]}><Text style={styles.rotuloBotao}>KM ACL:</Text> {safeString(km_acl)}</Text>
              )}
            </>
          )}
        </View>
        <View style={styles.footerVisual} />
        <View style={styles.footerBarSecondary} />
      </Page>

      {(descricao || fotos.length > 0) && (
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.headerVisual} />
          <View style={styles.headerBarSecondary} />
          
          {/* Logos na segunda página - Logo do cliente à direita */}
          <View style={styles.headerLogosClienteDireita}>
            {/* Logo da Segtrack sempre à esquerda */}
            <Image 
              style={styles.logoSegtrack} 
              src="https://ziedretdauamqkaoqcjh.supabase.co/storage/v1/object/public/segtrackfotos/logos/logoseg.png"
            />
            
            {/* Logo do cliente à direita - apenas se existir */}
            {cliente_logo && (
              <Image 
                style={styles.logoCliente} 
                src={resolveLogoUrl(cliente_logo)}
              />
            )}
          </View>

          {descricao && (
            <View style={styles.descricaoBox}>
              <Text style={styles.secaoTitulo}>DESCRIÇÃO DA OCORRÊNCIA:</Text>
              <Text style={styles.descricaoTexto}>
                {processarLegenda(descricao)}
              </Text>
            </View>
          )}

          {(() => {
            console.log('📷 Fotos disponíveis para PDF:', fotos);
            console.log('📷 Número de fotos:', fotos?.length || 0);
            console.log('📷 Tipo de fotos:', typeof fotos);
            console.log('📷 É array?', Array.isArray(fotos));
            return fotos && Array.isArray(fotos) && fotos.length > 0;
          })() && (
            <>
              <Text style={styles.secaoTitulo}>LAUDO FOTOGRÁFICO</Text>
              {[...Array(Math.ceil(fotos.length / 2))].map((_, rowIndex) => (
                <View key={rowIndex} style={styles.galeriaLinha} wrap={false}>
                  {fotos.slice(rowIndex * 2, rowIndex * 2 + 2)
                    .filter(f => {
                      const isValid = f && f.url && typeof f.url === 'string' && f.url.trim() !== '';
                      if (!isValid) {
                        console.warn('⚠️ Foto inválida filtrada:', f);
                      } else {
                        console.log('✅ Foto válida:', f);
                      }
                      return isValid;
                    })
                    .map((f, i) => {
                      const fotoIndex = rowIndex * 2 + i + 1;
                      console.log(`🖼️ Processando foto ${fotoIndex}:`, f);
                      const resolvedUrl = resolveFotoUrl(f.url);
                      console.log(`🔗 URL resolvida para foto ${fotoIndex}:`, resolvedUrl);
                      
                      if (!resolvedUrl) {
                        console.error(`❌ URL da foto ${fotoIndex} não pôde ser resolvida:`, f.url);
                        return null;
                      }
                      
                      return (
                        <View key={i} style={styles.cardImagem} wrap={false}>
                          <Image 
                            style={styles.imagem} 
                            src={resolvedUrl}
                          />
                          {f.legenda && <LegendaFormatada texto={f.legenda} />}
                        </View>
                      );
                    })
                    .filter(Boolean)} {/* Remove nulls */}
                </View>
              ))}
            </>
          )}

          <View style={styles.footerVisual} />
          <View style={styles.footerBarSecondary} />
        </Page>
      )}
    </Document>
  );
};

export default RelatorioPDF;
