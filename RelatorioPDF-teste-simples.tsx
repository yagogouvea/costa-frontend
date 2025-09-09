// VERSÃO ULTRA SIMPLIFICADA PARA TESTE
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
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
  endereco?: string;
  cidade?: string;
  estado?: string;
  descricao?: string;
  fotos?: Foto[];
  checklist?: any;
}

// Função para formatar data
const formatarData = (data: string | undefined): string => {
  if (!data) return '';
  try {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return '';
    return dataObj.toLocaleDateString('pt-BR');
  } catch (error) {
    return '';
  }
};

// Função para tratar URL da imagem
const tratarUrlImagem = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }
  return `${API_URL}/${url}`;
};

// Estilos simplificados
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  info: {
    marginBottom: 10
  },
  fotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  fotoItem: {
    width: '45%',
    marginBottom: 20,
    border: '1pt solid #000',
    padding: 5
  },
  foto: {
    width: '100%',
    height: 200,
    objectFit: 'contain'
  },
  legenda: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5
  }
});

const RelatorioPDF = ({ dados }: { dados: RelatorioDados }) => {
  const {
    id, cliente, tipo, data_acionamento, placa1, modelo1, cor1, endereco, cidade, estado,
    descricao, fotos = [], checklist
  } = dados;

  return (
    <Document>
      {/* PÁGINA 1 - INFORMAÇÕES BÁSICAS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.titulo}>RELATÓRIO DE OCORRÊNCIA</Text>
        </View>
        
        <View style={styles.info}>
          <Text>ID: {id || 'N/A'}</Text>
        </View>
        
        <View style={styles.info}>
          <Text>Cliente: {cliente || 'N/A'}</Text>
        </View>
        
        <View style={styles.info}>
          <Text>Tipo: {tipo || 'N/A'}</Text>
        </View>
        
        <View style={styles.info}>
          <Text>Data: {formatarData(data_acionamento)}</Text>
        </View>
        
        <View style={styles.info}>
          <Text>Placa: {placa1 || 'N/A'}</Text>
        </View>
        
        <View style={styles.info}>
          <Text>Endereço: {endereco || 'N/A'}, {cidade || ''}, {estado || ''}</Text>
        </View>
      </Page>

      {/* PÁGINA 2 - APENAS SE HÁ CHECKLIST OU DESCRIÇÃO */}
      {(checklist || descricao) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.titulo}>INFORMAÇÕES ADICIONAIS</Text>
          </View>
          
          {checklist && (
            <View style={styles.info}>
              <Text>Checklist: Sim</Text>
            </View>
          )}
          
          {descricao && (
            <View style={styles.info}>
              <Text>Descrição: {descricao}</Text>
            </View>
          )}
        </Page>
      )}

      {/* PÁGINA 3 - PRIMEIRAS 4 FOTOS */}
      {fotos && fotos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.titulo}>FOTOS DA OCORRÊNCIA</Text>
          </View>
          
          <View style={styles.fotosGrid}>
            {fotos.slice(0, 4).map((foto, index) => (
              <View key={`foto-0-${index}`} style={styles.fotoItem}>
                <Image
                  style={styles.foto}
                  src={tratarUrlImagem(foto.url || '')}
                />
                <Text style={styles.legenda}>
                  Foto {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* PÁGINA 4 - PRÓXIMAS 4 FOTOS */}
      {fotos && fotos.length > 4 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.titulo}>FOTOS DA OCORRÊNCIA (CONTINUAÇÃO)</Text>
          </View>
          
          <View style={styles.fotosGrid}>
            {fotos.slice(4, 8).map((foto, index) => (
              <View key={`foto-1-${index}`} style={styles.fotoItem}>
                <Image
                  style={styles.foto}
                  src={tratarUrlImagem(foto.url || '')}
                />
                <Text style={styles.legenda}>
                  Foto {index + 5}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* PÁGINA 5 - PRÓXIMAS 4 FOTOS */}
      {fotos && fotos.length > 8 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.titulo}>FOTOS DA OCORRÊNCIA (CONTINUAÇÃO)</Text>
          </View>
          
          <View style={styles.fotosGrid}>
            {fotos.slice(8, 12).map((foto, index) => (
              <View key={`foto-2-${index}`} style={styles.fotoItem}>
                <Image
                  style={styles.foto}
                  src={tratarUrlImagem(foto.url || '')}
                />
                <Text style={styles.legenda}>
                  Foto {index + 9}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
};

export default RelatorioPDF;


