import React, { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/services/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreateOcorrenciaDTO, OcorrenciaStatus } from '@/types/ocorrencia';
import { OPERADORES } from '@/constants/operadores';
import { 
  TIPOS_VEICULO, 
  TIPOS_OCORRENCIA_PADRAO,
  OPERACOES_OPENTECH,
  isClienteOpentech,
  getTiposOcorrenciaPorCliente
} from '@/constants/ocorrencia';

// Função auxiliar para identificar cliente BRK
const isClienteBrk = (nomeCliente: string): boolean => {
  return nomeCliente.toUpperCase().includes('BRK');
};

export interface ClienteResumo {
  id: string;
  nome: string;
  nome_fantasia?: string | null;
}



interface Props {
  onClose: () => void;
  onSave: (data: {
    placa1: string;
    cliente: string;
    tipo: string;
  }) => void;
  clientes: ClienteResumo[];
}

// Função removida - cliente Marfrig não é utilizado neste sistema

// Função para formatar moeda brasileira
function formatarMoedaBR(valor: string | number) {
  console.log('[LOG] AdicionarOcorrenciaPopup - formatarMoedaBR - valor:', valor, typeof valor);
  const numero = Number(String(valor ?? '').replace(/\D/g, ''));
  if (isNaN(numero)) return '';
  return (numero / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const AdicionarOcorrenciaPopup: React.FC<Props> = ({ onClose, onSave, clientes }) => {

  const [tipoOcorrencia, setTipoOcorrencia] = useState('');
  const [tipoVeiculo, setTipoVeiculo] = useState('');
  const [placas, setPlacas] = useState<string[]>(['', '', '']);
  const [modelos, setModelos] = useState<string[]>(['', '', '']);
  const [cores, setCores] = useState<string[]>(['', '', '']);
  const [coordenadas, setCoordenadas] = useState('');
  const [enderecoInfo, setEnderecoInfo] = useState({ endereco: '', bairro: '', cidade: '', estado: '' });
  const [dataAcionamento, setDataAcionamento] = useState('');
  const [loading, setLoading] = useState(false);

  const [os, setOs] = useState('');
  const [origemBairro, setOrigemBairro] = useState('');
  const [origemCidade, setOrigemCidade] = useState('');
  const [origemEstado, setOrigemEstado] = useState('');
  const [cpfCondutor, setCpfCondutor] = useState('');
  const [nomeCondutor, setNomeCondutor] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [valorCarga, setValorCarga] = useState('');
  const [notasFiscais, setNotasFiscais] = useState('');

  const [plantaOrigem, setPlantaOrigem] = useState('');
  const [cidadeDestino, setCidadeDestino] = useState('');
  const [kmAcl, setKmAcl] = useState('');

  const [operador, setOperador] = useState('');
  const [operacao, setOperacao] = useState('');
  const [conta, setConta] = useState('');

  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [subCliente, setSubCliente] = useState('');

  // Removido debounce das placas - não é mais necessário

  // Debounce apenas para coordenadas
  const debouncedCoordenadas = useDebounce(coordenadas, 1000);



  // Removida a consulta automática de placas - agora os dados são preenchidos manualmente

  useEffect(() => {
    const buscarEndereco = async () => {
      if (!debouncedCoordenadas) return;
      
      const coords = debouncedCoordenadas.split(',').map((p: string) => p.trim());
      if (coords.length === 2) {
        const [lat, lng] = coords;
        try {
          const { data } = await api.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const address = data.address || {};
          setEnderecoInfo({
            endereco: `${address.road || ''}${address.house_number ? ', ' + address.house_number : ''}`,
            bairro: address.suburb || address.neighbourhood || '',
            cidade: address.city || address.town || address.village || '',
            estado: address.state || ''
          });
        } catch (err) {
          console.error('❌ Erro ao buscar endereço via coordenadas:', err);
        }
      }
    };

    buscarEndereco();
  }, [debouncedCoordenadas]);

  const handlePlacaChange = (value: string, index: number) => {
    const novasPlacas = [...placas];
    novasPlacas[index] = value;
    setPlacas(novasPlacas);
  };

  const handleSave = async () => {
    if (!placas[0]) {
      alert('Preencha a placa principal');
      return;
    }
    if (!dataAcionamento) {
      alert('Preencha a Data do Acionamento');
      return;
    }

    // Validações básicas
    const clientesArray = Array.isArray(clientes) ? clientes : [];
    const clienteObj: ClienteResumo | undefined = clientesArray.find(c => c.id === clienteSelecionado);
    const nomeCliente: string = clienteObj?.nome || '';
    const isClienteOpentech = nomeCliente.toUpperCase().includes('OPENTECH');
    const isClienteBrk = nomeCliente.toUpperCase().includes('BRK');

    // Validações básicas para todos os clientes
    if (!clienteSelecionado) {
      alert('Selecione um cliente');
      return;
    }
    if (!tipoOcorrencia) {
      alert('Selecione o tipo de ocorrência');
      return;
    }
    if (!placas[0]) {
      alert('Preencha a placa principal');
      return;
    }

    // Validações específicas para cliente Opentech
    if (isClienteOpentech) {
      if (!operacao) {
        alert('Selecione a operação');
        return;
      }
    }

    // Validações específicas para cliente BRK
    if (isClienteBrk) {
      if (!conta) {
        alert('Preencha a conta');
        return;
      }
    }

    setLoading(true);
    try {
      const clientesArray = Array.isArray(clientes) ? clientes : [];
      const clienteObj: ClienteResumo | undefined = clientesArray.find(c => c.id === clienteSelecionado);
      const nomeCliente: string = clienteObj?.nome || '';
      


      const novaOcorrencia: CreateOcorrenciaDTO = {
        placa1: placas[0],
        placa2: placas[1] || undefined,
        placa3: placas[2] || undefined,
        modelo1: modelos[0] || undefined,
        cor1: cores[0] || undefined,
        cliente: nomeCliente,
        sub_cliente: subCliente || undefined,
        tipo: tipoOcorrencia,
        tipo_veiculo: tipoVeiculo || undefined,
        coordenadas: coordenadas || undefined,
        endereco: enderecoInfo.endereco || undefined,
        bairro: enderecoInfo.bairro || undefined,
        cidade: enderecoInfo.cidade || undefined,
        estado: enderecoInfo.estado || undefined,
        status: 'em_andamento' as OcorrenciaStatus,
        data_acionamento: dataAcionamento ? new Date(dataAcionamento).toISOString() : undefined,
        os: os || undefined,
        origem_bairro: origemBairro || undefined,
        origem_cidade: origemCidade || undefined,
        origem_estado: origemEstado || undefined,
        cpf_condutor: cpfCondutor || undefined,
        nome_condutor: nomeCondutor || undefined,
        transportadora: transportadora || undefined,
        valor_carga: valorCarga ? parseFloat(valorCarga) : undefined,
        notas_fiscais: notasFiscais || undefined,
        planta_origem: plantaOrigem || undefined,
        cidade_destino: cidadeDestino || undefined,
        km_acl: kmAcl || undefined,
        operador: operador || undefined,
        operacao: operacao || undefined,
        conta: conta || undefined
      };

      await api.post('/api/ocorrencias', novaOcorrencia);
      onSave({
        placa1: placas[0],
        cliente: nomeCliente,
        tipo: tipoOcorrencia
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ocorrência:', error);
      alert('Erro ao salvar ocorrência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogTitle className="text-lg font-bold">Adicionar Nova Ocorrência</DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        Preencha os dados da ocorrência conforme o perfil do cliente.
      </DialogDescription>

      <div className="grid grid-cols-3 gap-4">
        {(() => {
          const clientesArray = Array.isArray(clientes) ? clientes : [];
          const clienteObj: ClienteResumo | undefined = clientesArray.find(c => c.id === clienteSelecionado);
          const nomeCliente: string = clienteObj?.nome || '';
          const isClienteOpentech = nomeCliente.toUpperCase().includes('OPENTECH') || nomeCliente.toUpperCase().includes('OPEN TECH');
          const isClienteBrk = nomeCliente.toUpperCase().includes('BRK');
          
          return (
            <>
              <div>
                <Label>Cliente</Label>
                <Select onValueChange={setClienteSelecionado} value={clienteSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                              <SelectContent>
              {clientesArray.map((c: ClienteResumo) => (
                <SelectItem key={c.id} value={c.id}>{c.nome_fantasia || c.nome}</SelectItem>
              ))}
            </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sub cliente</Label>
                <Input 
                  value={subCliente} 
                  onChange={e => setSubCliente(e.target.value)} 
                  placeholder="Digite o sub cliente (opcional)"
                />
              </div>

              <div>
                <Label >
                  Tipo de Ocorrência 
                </Label>
                <Select onValueChange={setTipoOcorrencia} value={tipoOcorrencia}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_OCORRENCIA_PADRAO.map((tipo: string) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label >
                  Data do Acionamento 
                </Label>
                <Input type="date" value={dataAcionamento} onChange={e => setDataAcionamento(e.target.value)} />
              </div>

              <div>
                <Label >
                  Tipo de Veículo 
                </Label>
                <Select onValueChange={setTipoVeiculo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VEICULO.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label >
                  Operador 
                </Label>
                <Select onValueChange={setOperador} value={operador}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERADORES.map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isClienteOpentech && (
                <div>
                  <Label className="text-red-500">
                    Operação <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={setOperacao} value={operacao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a operação" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERACOES_OPENTECH.map(operacao => (
                        <SelectItem key={operacao} value={operacao}>{operacao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isClienteBrk && (
                <div>
                  <Label className="text-red-500">
                    Conta <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={conta} 
                    onChange={e => setConta(e.target.value)} 
                    placeholder="Digite a conta"
                  />
                </div>
              )}

              <div>
                <Label >
                  Placa Principal 
                </Label>
                <Input value={placas[0]} onChange={e => handlePlacaChange(e.target.value, 0)} />
              </div>

              <div>
                <Label>Placa 2 (opcional)</Label>
                <Input value={placas[1]} onChange={e => handlePlacaChange(e.target.value, 1)} />
              </div>

              <div>
                <Label>Placa 3 (opcional)</Label>
                <Input value={placas[2]} onChange={e => handlePlacaChange(e.target.value, 2)} />
              </div>

              <div>
                <Label >
                  Modelo 
                </Label>
                <Input value={modelos[0]} onChange={e => setModelos([e.target.value, modelos[1], modelos[2]])} />
              </div>

              <div>
                <Label >
                  Cor 
                </Label>
                <Input value={cores[0]} onChange={e => setCores([e.target.value, cores[1], cores[2]])} />
              </div>

              <div className="col-span-3">
                <Label >
                  Local da abordagem (latitude, longitude) 
                </Label>
                <Input value={coordenadas} onChange={e => setCoordenadas(e.target.value)} placeholder="Ex: -23.550520, -46.633308" />
              </div>

              <div className="col-span-3">
                <Label >
                  Endereço 
                </Label>
                <Input value={enderecoInfo.endereco} onChange={e => setEnderecoInfo({ ...enderecoInfo, endereco: e.target.value })} />
              </div>

              <div>
                <Label >
                  Bairro 
                </Label>
                <Input value={enderecoInfo.bairro} onChange={e => setEnderecoInfo({ ...enderecoInfo, bairro: e.target.value })} />
              </div>

              <div>
                <Label >
                  Cidade 
                </Label>
                <Input value={enderecoInfo.cidade} onChange={e => setEnderecoInfo({ ...enderecoInfo, cidade: e.target.value })} />
              </div>

              <div>
                <Label >
                  Estado 
                </Label>
                <Input value={enderecoInfo.estado} onChange={e => setEnderecoInfo({ ...enderecoInfo, estado: e.target.value })} />
              </div>
            </>
          );
        })()}

        {/* Seção específica do Ituran removida - cliente não utilizado neste sistema */}

        {/* Seção específica do Marfrig removida - cliente não utilizado neste sistema */}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" disabled={loading} onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

export default AdicionarOcorrenciaPopup;