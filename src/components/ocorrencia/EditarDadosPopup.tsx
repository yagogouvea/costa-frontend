import api from '@/services/api';
import { useState, useEffect } from 'react';
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
import { DialogClose, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Ocorrencia } from '@/types/ocorrencia';
import { OPERADORES } from '@/constants/operadores';
import { 
  TIPOS_VEICULO, 
  TIPOS_OCORRENCIA_PADRAO,
  OPERACOES_OPENTECH,
  isClienteOpentech
} from '@/constants/ocorrencia';

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
}

// Funções auxiliares para identificar tipo de cliente
const isClienteBrk = (nomeCliente: string): boolean => {
  return nomeCliente.toUpperCase().includes('BRK');
};



// Função para formatar moeda brasileira (não utilizada no momento)
// function formatarMoedaBR(valor: string | number) {
//   console.log('[LOG] EditarDadosPopup - formatarMoedaBR - valor:', valor, typeof valor);
//   const numero = Number(String(valor ?? '').replace(/\D/g, ''));
//   if (isNaN(numero)) return '';
//   return (numero / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// }

// Função utilitária para converter ISO para yyyy-MM-dd
function toDateInputValue(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const EditarDadosPopup: React.FC<Props> = ({ ocorrencia, onUpdate, onClose }) => {
  // Estados para os campos básicos
  const [cliente, setCliente] = useState(ocorrencia.cliente || '');
  const [subCliente, setSubCliente] = useState(ocorrencia.sub_cliente || '');
  const [tipo, setTipo] = useState(ocorrencia.tipo || '');
  const [tipoVeiculo, setTipoVeiculo] = useState(ocorrencia.tipo_veiculo || '');
  const [placas, setPlacas] = useState([
    ocorrencia.placa1 || '',
    ocorrencia.placa2 || '',
    ocorrencia.placa3 || ''
  ]);
  const [modelo1, setModelo1] = useState(ocorrencia.modelo1 || '');
  const [cor1, setCor1] = useState(ocorrencia.cor1 || '');
  const [coordenadas, setCoordenadas] = useState(ocorrencia.coordenadas || '');
  const [endereco, setEndereco] = useState(ocorrencia.endereco || '');
  const [bairro, setBairro] = useState(ocorrencia.bairro || '');
  const [cidade, setCidade] = useState(ocorrencia.cidade || '');
  const [estado, setEstado] = useState(ocorrencia.estado || '');
  const [dataAcionamento, setDataAcionamento] = useState(ocorrencia.data_acionamento || '');

  // Campos adicionais
  const [os, setOs] = useState(ocorrencia.os || '');
  const [origemBairro, setOrigemBairro] = useState(ocorrencia.origem_bairro || '');
  const [origemCidade, setOrigemCidade] = useState(ocorrencia.origem_cidade || '');
  const [origemEstado, setOrigemEstado] = useState(ocorrencia.origem_estado || '');
  const [cpfCondutor, setCpfCondutor] = useState(ocorrencia.cpf_condutor || '');
  const [nomeCondutor, setNomeCondutor] = useState(ocorrencia.nome_condutor || '');
  const [transportadora, setTransportadora] = useState(ocorrencia.transportadora || '');
  const [valorCarga, setValorCarga] = useState(() => {
    // Armazena sempre como string de centavos para facilitar a digitação
    if (ocorrencia.valor_carga !== undefined && ocorrencia.valor_carga !== null) {
      return String(Math.round(Number(ocorrencia.valor_carga) * 100));
    }
    return '';
  });
  const [notasFiscais, setNotasFiscais] = useState(ocorrencia.notas_fiscais || '');
  const [plantaOrigem, setPlantaOrigem] = useState(ocorrencia.planta_origem || '');
  const [cidadeDestino, setCidadeDestino] = useState(ocorrencia.cidade_destino || '');
  const [kmAcl, setKmAcl] = useState(ocorrencia.km_acl || '');
  const [operador, setOperador] = useState(ocorrencia.operador || '');
  
  // Campos que estavam faltando
  const [operacao, setOperacao] = useState(ocorrencia.operacao || '');
  const [conta, setConta] = useState(ocorrencia.conta || '');
  
  // Campos para múltiplos modelos e cores não estão no schema atual
  // const [modelo2, setModelo2] = useState('');
  // const [modelo3, setModelo3] = useState('');
  // const [cor2, setCor2] = useState('');
  // const [cor3, setCor3] = useState('');

  // Efeito para recarregar os dados quando a ocorrência mudar
  useEffect(() => {
    console.log('Carregando dados da ocorrência:', ocorrencia);
    
    // ✅ DEBUG: Log detalhado dos dados de localização carregados
    console.log('🔍 [EditarDadosPopup] Dados de localização carregados:', {
      coordenadas: ocorrencia.coordenadas,
      endereco: ocorrencia.endereco,
      bairro: ocorrencia.bairro,
      cidade: ocorrencia.cidade,
      estado: ocorrencia.estado
    });
    setCliente(ocorrencia.cliente || '');
    setSubCliente(ocorrencia.sub_cliente || '');
    setTipo(ocorrencia.tipo || '');
    setTipoVeiculo(ocorrencia.tipo_veiculo || '');
    setPlacas([
      ocorrencia.placa1 || '',
      ocorrencia.placa2 || '',
      ocorrencia.placa3 || ''
    ]);
    setModelo1(ocorrencia.modelo1 || '');
    setCor1(ocorrencia.cor1 || '');
    setCoordenadas(ocorrencia.coordenadas || '');
    setEndereco(ocorrencia.endereco || '');
    setBairro(ocorrencia.bairro || '');
    setCidade(ocorrencia.cidade || '');
    setEstado(ocorrencia.estado || '');
    setDataAcionamento(ocorrencia.data_acionamento || '');
    setOs(ocorrencia.os || '');
    setOrigemBairro(ocorrencia.origem_bairro || '');
    setOrigemCidade(ocorrencia.origem_cidade || '');
    setOrigemEstado(ocorrencia.origem_estado || '');
    setCpfCondutor(ocorrencia.cpf_condutor || '');
    setNomeCondutor(ocorrencia.nome_condutor || '');
    setTransportadora(ocorrencia.transportadora || '');
    setValorCarga(() => {
      if (ocorrencia.valor_carga !== undefined && ocorrencia.valor_carga !== null) {
        return String(Math.round(Number(ocorrencia.valor_carga) * 100));
      }
      return '';
    });
    setNotasFiscais(ocorrencia.notas_fiscais || '');
    setPlantaOrigem(ocorrencia.planta_origem || '');
    setCidadeDestino(ocorrencia.cidade_destino || '');
    setKmAcl(ocorrencia.km_acl || '');
    setOperador(ocorrencia.operador || '');
    setOperacao(ocorrencia.operacao || '');
    setConta(ocorrencia.conta || '');
  }, [ocorrencia]);

  const salvar = async () => {
    if (!cliente || !tipo || !placas[0]) {
      alert('Preencha ao menos cliente, tipo e placa principal.');
      return;
    }

    try {
      const valorCargaFloat = valorCarga ? parseFloat((parseInt(valorCarga, 10) / 100).toFixed(2)) : undefined;
      const dados = {
        placa1: placas[0] || ocorrencia.placa1,
        placa2: placas[1] || undefined,
        placa3: placas[2] || undefined,
        cliente: cliente || ocorrencia.cliente,
        sub_cliente: subCliente || undefined,
        tipo: tipo || ocorrencia.tipo,
        tipo_veiculo: tipoVeiculo,
        modelo1,
        cor1,
        coordenadas,
        endereco,
        bairro,
        cidade,
        estado,
        data_acionamento: dataAcionamento || undefined,
        os,
        origem_bairro: origemBairro,
        origem_cidade: origemCidade,
        origem_estado: origemEstado,
        cpf_condutor: cpfCondutor,
        nome_condutor: nomeCondutor,
        transportadora,
        valor_carga: valorCargaFloat,
        notas_fiscais: notasFiscais,
        planta_origem: plantaOrigem,
        cidade_destino: cidadeDestino,
        km_acl: kmAcl,
        operador: operador || undefined,
        operacao: operacao || undefined,
        conta: conta || undefined
      };

      console.log('Dados sendo enviados para atualização:', dados);
      console.log('ID da ocorrência:', ocorrencia.id);

      const { data } = await api.put(`/api/v1/ocorrencias/${ocorrencia.id}`, dados);
      onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      alert('Erro ao atualizar dados. Tente novamente.');
    }
  };

  const cancelar = () => {
    onClose();
  };

  // Usar sempre tipos de ocorrência padrão
  const tiposOcorrenciaAtivos = TIPOS_OCORRENCIA_PADRAO;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <DialogTitle className="text-base sm:text-lg font-bold">Editar Dados da Ocorrência</DialogTitle>
      <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
        Atualize os dados gerais lançados na abertura da ocorrência.
      </DialogDescription>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <div>
          <Label>Cliente</Label>
          <Input value={cliente} onChange={e => setCliente(e.target.value)} />
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
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {tiposOcorrenciaAtivos.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Data do Acionamento</Label>
          <Input
            type="date"
            value={toDateInputValue(dataAcionamento)}
            onChange={e => setDataAcionamento(e.target.value)}
          />
        </div>

        <div>
          <Label>Tipo de Veículo</Label>
          <Select value={tipoVeiculo} onValueChange={setTipoVeiculo}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {TIPOS_VEICULO.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Placa Principal</Label>
          <Input
            value={placas[0]}
            onChange={(e) => {
              const novas = [...placas];
              novas[0] = e.target.value;
              setPlacas(novas);
            }}
          />
        </div>

        <div>
          <Label>Modelo</Label>
          <Input value={modelo1} onChange={(e) => setModelo1(e.target.value)} />
        </div>

        <div>
          <Label>Cor</Label>
          <Input value={cor1} onChange={(e) => setCor1(e.target.value)} />
        </div>

        <div>
          <Label>Placa 2</Label>
          <Input
            value={placas[1]}
            onChange={(e) => {
              const novas = [...placas];
              novas[1] = e.target.value;
              setPlacas(novas);
            }}
          />
        </div>

        <div>
          <Label>Placa 3</Label>
          <Input
            value={placas[2]}
            onChange={(e) => {
              const novas = [...placas];
              novas[2] = e.target.value;
              setPlacas(novas);
            }}
          />
        </div>

        <div className="col-span-3">
          <Label>Coordenadas (latitude, longitude)</Label>
          <Input value={coordenadas} onChange={e => setCoordenadas(e.target.value)} placeholder="Ex: -23.550520, -46.633308" />
        </div>

        <div className="col-span-3">
          <Label>Endereço</Label>
          <Input value={endereco} onChange={e => setEndereco(e.target.value)} />
        </div>

        <div>
          <Label>Bairro</Label>
          <Input value={bairro} onChange={e => setBairro(e.target.value)} />
        </div>

        <div>
          <Label>Cidade</Label>
          <Input value={cidade} onChange={e => setCidade(e.target.value)} />
        </div>

        <div>
          <Label>Estado</Label>
          <Input value={estado} onChange={e => setEstado(e.target.value)} />
        </div>

        {/* Campos específicos do Ituran removidos - cliente não utilizado neste sistema */}

        {/* Campos específicos do Marfrig removidos - cliente não utilizado neste sistema */}

        <div>
          <Label>Operador</Label>
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

        {/* Campos específicos para cliente Opentech */}
        {isClienteOpentech(cliente) && (
          <div>
            <Label>Operação <span className="text-red-500">*</span></Label>
            <Select onValueChange={setOperacao} value={operacao}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a operação" />
              </SelectTrigger>
              <SelectContent>
                {OPERACOES_OPENTECH.map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Campos específicos para cliente BRK */}
        {isClienteBrk(cliente) && (
          <div>
            <Label>Conta <span className="text-red-500">*</span></Label>
            <Input 
              value={conta} 
              onChange={e => setConta(e.target.value)} 
              placeholder="Digite a conta"
            />
          </div>
        )}

        {/* Campos adicionais para múltiplos modelos e cores - não implementados no schema atual */}
        {/* Futuro: adicionar modelo2, modelo3, cor2, cor3 ao schema se necessário */}
      </div>

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="ghost" onClick={cancelar}>Cancelar</Button>
        </DialogClose>
        <Button onClick={salvar}>Salvar</Button>
      </div>
    </div>
  );
};

export default EditarDadosPopup;
