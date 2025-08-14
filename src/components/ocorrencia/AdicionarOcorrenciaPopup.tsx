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

const tiposVeiculo = [
  'Carro', 'Moto', 'Caminhão', 'Carreta'
] as const;

const tiposOcorrenciaPadrao = [
  'Acidente', 'Furto', 'Perda de Sinal', 'Preservação', 'Suspeita', 'Roubo', 'Apropriação',
  'Acompanhamento', 'Sindicância', 'Parada Indevida', 'Botão de Pânico', 'Verificação',
  'Problema Mecânico', 'Iscagem', 'Blitz', 'Pernoite Seguro', 'Constatação',
  'Violação Equipamento', 'Regulação'
] as const;

const tiposOcorrenciaIturan = [
  'Roubo', 'Furto', 'Apropriação', 'Check de Segurança'
] as const;

const tiposOcorrenciaMarfrig = [
  'Roubo', 'Furto', 'Suspeita', 'ACL', 'Investigação', 'Acidente', 'Preservação'
];

const operadores = [
  'Marcio', 'Bia', 'Junior', 'Ozias', 'Yago', 'ADM'
];

const operacoesOpentech = [
  'OPERAÇÃO PADRÃO',
  'OPENTECH CONTRAVALE',
  'OPENTECH LACTALIS',
  'OPENTECH OP. MINERVA',
  'OPENTECH AGV - RONDA',
  'OPENTECH AGV - INVESTIGAÇÃO',
  'OPENTECH AGV - ACOMPANHAMENTO',
  'OPENTECH OP 4BIO',
  'OPENTECH OP. ESPECIAIS PRO FARMA'
];

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

// Função utilitária para normalizar nome do cliente
function isClienteMarfrig(nome: string) {
  if (!nome || typeof nome !== 'string') return false;
  return nome.replace(/\s+/g, '').toUpperCase().includes('MARFRIG');
}

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

    // Validações específicas para cliente Ituran
            const clientesArray = Array.isArray(clientes) ? clientes : [];
        const clienteObj: ClienteResumo | undefined = clientesArray.find(c => c.id === clienteSelecionado);
        const nomeCliente: string = clienteObj?.nome || '';
        const isClienteIturan = nomeCliente.toUpperCase().includes('ITURAN');
        const isClienteOpentech = nomeCliente.toUpperCase().includes('OPENTECH');
        const isClienteBrk = nomeCliente.toUpperCase().includes('BRK');

    if (isClienteIturan) {
      if (!clienteSelecionado) {
        alert('Selecione um cliente');
        return;
      }
      if (!tipoOcorrencia) {
        alert('Selecione o tipo de ocorrência');
        return;
      }
      if (!tipoVeiculo) {
        alert('Selecione o tipo de veículo');
        return;
      }
      if (!operador) {
        alert('Selecione o operador');
        return;
      }

      if (!modelos[0]) {
        alert('Preencha o modelo do veículo');
        return;
      }
      if (!cores[0]) {
        alert('Preencha a cor do veículo');
        return;
      }
      if (!coordenadas) {
        alert('Preencha as coordenadas');
        return;
      }
      if (!enderecoInfo.endereco) {
        alert('Preencha o endereço');
        return;
      }
      if (!enderecoInfo.bairro) {
        alert('Preencha o bairro');
        return;
      }
      if (!enderecoInfo.cidade) {
        alert('Preencha a cidade');
        return;
      }
      if (!enderecoInfo.estado) {
        alert('Preencha o estado');
        return;
      }
      if (!os) {
        alert('Preencha o número da OS, Projeto GM etc');
        return;
      }
      if (!origemBairro) {
        alert('Preencha o bairro de origem do prestador');
        return;
      }
      if (!origemCidade) {
        alert('Preencha a cidade de origem do prestador');
        return;
      }
      if (!origemEstado) {
        alert('Preencha o estado de origem do prestador');
        return;
      }
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
          const isClienteIturan = nomeCliente.toUpperCase().includes('ITURAN');
          const isClienteOpentech = nomeCliente.toUpperCase().includes('OPENTECH') || nomeCliente.toUpperCase().includes('OPEN TECH');
          const isClienteBrk = nomeCliente.toUpperCase().includes('BRK');
          
          return (
            <>
              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Cliente {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
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
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Tipo de Ocorrência {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Select onValueChange={setTipoOcorrencia} value={tipoOcorrencia}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                                  {(clienteSelecionado && (() => {
                const cliente = clientesArray.find(c => c.id === clienteSelecionado);
                const nomeCliente = cliente?.nome || '';
                return isClienteMarfrig(nomeCliente);
              })()
                ? tiposOcorrenciaMarfrig
                : clienteSelecionado && (() => {
                    const cliente = clientesArray.find(c => c.id === clienteSelecionado);
                    const nomeCliente = cliente?.nome || '';
                    return nomeCliente.toUpperCase().includes('ITURAN');
                  })()
                  ? tiposOcorrenciaIturan
                  : tiposOcorrenciaPadrao
              ).map((tipo: string) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Data do Acionamento {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input type="date" value={dataAcionamento} onChange={e => setDataAcionamento(e.target.value)} />
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Tipo de Veículo {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Select onValueChange={setTipoVeiculo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposVeiculo.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Operador {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Select onValueChange={setOperador} value={operador}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {operadores.map(op => (
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
                      {operacoesOpentech.map(operacao => (
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
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Placa Principal {isClienteIturan && <span className="text-red-500">*</span>}
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
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Modelo {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={modelos[0]} onChange={e => setModelos([e.target.value, modelos[1], modelos[2]])} />
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Cor {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={cores[0]} onChange={e => setCores([e.target.value, cores[1], cores[2]])} />
              </div>

              <div className="col-span-3">
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Coordenadas (latitude, longitude) {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={coordenadas} onChange={e => setCoordenadas(e.target.value)} placeholder="Ex: -23.550520, -46.633308" />
              </div>

              <div className="col-span-3">
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Endereço {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={enderecoInfo.endereco} onChange={e => setEnderecoInfo({ ...enderecoInfo, endereco: e.target.value })} />
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Bairro {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={enderecoInfo.bairro} onChange={e => setEnderecoInfo({ ...enderecoInfo, bairro: e.target.value })} />
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Cidade {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={enderecoInfo.cidade} onChange={e => setEnderecoInfo({ ...enderecoInfo, cidade: e.target.value })} />
              </div>

              <div>
                <Label className={isClienteIturan ? "text-red-500" : ""}>
                  Estado {isClienteIturan && <span className="text-red-500">*</span>}
                </Label>
                <Input value={enderecoInfo.estado} onChange={e => setEnderecoInfo({ ...enderecoInfo, estado: e.target.value })} />
              </div>
            </>
          );
        })()}

        {clienteSelecionado && (() => {
          const clientesArray = Array.isArray(clientes) ? clientes : [];
          const cliente = clientesArray.find(c => c.id === clienteSelecionado);
          const nomeCliente = cliente?.nome || '';
          return nomeCliente.toUpperCase().includes('ITURAN');
        })() && (
          <div className="grid grid-cols-3 gap-2 col-span-3">
            <div>
              <Label className="text-red-500">
                OS <span className="text-red-500">*</span>
              </Label>
              <Input value={os} onChange={e => setOs(e.target.value)} placeholder="Número da OS, Projeto GM etc" />
            </div>
            <div>
              <Label className="text-red-500">
                Bairro (Origem do Prestador) <span className="text-red-500">*</span>
              </Label>
              <Input value={origemBairro} onChange={e => setOrigemBairro(e.target.value)} />
            </div>
            <div>
              <Label className="text-red-500">
                Cidade (Origem do Prestador) <span className="text-red-500">*</span>
              </Label>
              <Input value={origemCidade} onChange={e => setOrigemCidade(e.target.value)} />
            </div>
            <div>
              <Label className="text-red-500">
                Estado (Origem do Prestador) <span className="text-red-500">*</span>
              </Label>
              <Input value={origemEstado} onChange={e => setOrigemEstado(e.target.value)} />
            </div>
          </div>
        )}

        {clienteSelecionado && (() => {
          const clientesArray = Array.isArray(clientes) ? clientes : [];
          const cliente = clientesArray.find(c => c.id === clienteSelecionado);
          const nomeCliente = cliente?.nome || '';
          return isClienteMarfrig(nomeCliente);
        })() && (
          <div className="grid grid-cols-2 gap-2 col-span-3">
            <div><Label>CPF do Condutor</Label><Input value={cpfCondutor} onChange={e => setCpfCondutor(e.target.value)} /></div>
            <div><Label>Nome do Condutor</Label><Input value={nomeCondutor} onChange={e => setNomeCondutor(e.target.value)} /></div>
            <div><Label>Transportadora</Label><Input value={transportadora} onChange={e => setTransportadora(e.target.value)} /></div>
            <div><Label>Valor da Carga (R$)</Label><Input type="text" value={formatarMoedaBR(valorCarga)} onChange={e => setValorCarga(e.target.value)} placeholder="R$ 0,00" inputMode="numeric" /></div>
            <div className="col-span-2"><Label>Notas Fiscais</Label><Input value={notasFiscais} onChange={e => setNotasFiscais(e.target.value)} placeholder="Separe por vírgulas" /></div>
            <div><Label>Planta de origem</Label><Input value={plantaOrigem} onChange={e => setPlantaOrigem(e.target.value)} /></div>
            <div><Label>Cidade de destino</Label><Input value={cidadeDestino} onChange={e => setCidadeDestino(e.target.value)} /></div>
            {tipoOcorrencia === 'ACL' && (
              <div className="col-span-2"><Label>KM ACL</Label><Input value={kmAcl} onChange={e => setKmAcl(e.target.value)} /></div>
            )}
          </div>
        )}
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