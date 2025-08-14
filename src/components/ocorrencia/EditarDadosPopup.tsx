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

interface Props {
  ocorrencia: Ocorrencia;
  onUpdate: (ocorrenciaAtualizada: Ocorrencia) => void;
  onClose: () => void;
}

// Função utilitária para normalizar nome do cliente
function isClienteMarfrig(nome: string) {
  return nome && nome.replace(/\s+/g, '').toUpperCase().includes('MARFRIG');
}

function isClienteIturan(nome: string) {
  return nome && nome.toUpperCase().includes('ITURAN');
}

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

const tiposVeiculo = [
  'Caminhão', 'Carreta', 'Van', 'Utilitário', 'Passeio', 'Moto', 'Ônibus', 'Outro'
] as const;

const operadores = [
  'Marcio', 'Bia', 'Junior', 'Ozias', 'Yago', 'ADM'
];

// Função para formatar moeda brasileira
function formatarMoedaBR(valor: string | number) {
  console.log('[LOG] EditarDadosPopup - formatarMoedaBR - valor:', valor, typeof valor);
  const numero = Number(String(valor ?? '').replace(/\D/g, ''));
  if (isNaN(numero)) return '';
  return (numero / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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

  // Efeito para recarregar os dados quando a ocorrência mudar
  useEffect(() => {
    console.log('Carregando dados da ocorrência:', ocorrencia);
    setCliente(ocorrencia.cliente || '');
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
        operador: operador || undefined
      };

      console.log('Dados sendo enviados para atualização:', dados);
      console.log('ID da ocorrência:', ocorrencia.id);

      const { data } = await api.put(`/api/ocorrencias/${ocorrencia.id}`, dados);
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

  // Determinar quais tipos de ocorrência mostrar baseado no cliente
  const getTiposOcorrencia = () => {
    if (isClienteMarfrig(cliente)) {
      return tiposOcorrenciaMarfrig;
    } else if (isClienteIturan(cliente)) {
      return tiposOcorrenciaIturan;
    } else {
      return tiposOcorrenciaPadrao;
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <DialogTitle className="text-lg font-bold">Editar Dados da Ocorrência</DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        Atualize os dados gerais lançados na abertura da ocorrência.
      </DialogDescription>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Cliente</Label>
          <Input value={cliente} onChange={e => setCliente(e.target.value)} />
        </div>

        <div>
          <Label>Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {getTiposOcorrencia().map(t => (
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
              {tiposVeiculo.map(v => (
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

        {/* Campos extras para ITURAN */}
        {isClienteIturan(cliente) && (
          <div className="col-span-3 grid grid-cols-3 gap-4">
            <div><Label>OS</Label><Input value={os} onChange={e => setOs(e.target.value)} /></div>
            <div><Label>Bairro (Origem)</Label><Input value={origemBairro} onChange={e => setOrigemBairro(e.target.value)} /></div>
            <div><Label>Cidade (Origem)</Label><Input value={origemCidade} onChange={e => setOrigemCidade(e.target.value)} /></div>
            <div><Label>Estado (Origem)</Label><Input value={origemEstado} onChange={e => setOrigemEstado(e.target.value)} /></div>
          </div>
        )}

        {/* Campos extras para MARFRIG */}
        {isClienteMarfrig(cliente) && (
          <div className="col-span-3 grid grid-cols-2 gap-4">
            <div><Label>CPF do Condutor</Label><Input value={cpfCondutor} onChange={e => setCpfCondutor(e.target.value)} /></div>
            <div><Label>Nome do Condutor</Label><Input value={nomeCondutor} onChange={e => setNomeCondutor(e.target.value)} /></div>
            <div><Label>Transportadora</Label><Input value={transportadora} onChange={e => setTransportadora(e.target.value)} /></div>
            <div>
              <Label>Valor da Carga (R$)</Label>
              <Input
                type="text"
                value={formatarMoedaBR(valorCarga)}
                onChange={e => {
                  // Permite apenas números
                  const numeros = String(e.target.value ?? '').replace(/\D/g, '');
                  console.log('[LOG] EditarDadosPopup - valor campo:', e.target.value, typeof e.target.value);
                  setValorCarga(numeros);
                }}
                onBlur={() => {
                  // Mantém o valor formatado ao sair do campo
                  setValorCarga(v => v.replace(/^0+/, '') || '0');
                }}
                placeholder="R$ 0,00"
                inputMode="numeric"
              />
            </div>
            <div className="col-span-2"><Label>Notas Fiscais</Label><Input value={notasFiscais} onChange={e => setNotasFiscais(e.target.value)} placeholder="Separe por vírgulas" /></div>
            <div><Label>Planta de origem</Label><Input value={plantaOrigem} onChange={e => setPlantaOrigem(e.target.value)} /></div>
            <div><Label>Cidade de destino</Label><Input value={cidadeDestino} onChange={e => setCidadeDestino(e.target.value)} /></div>
            {tipo === 'ACL' && (
              <div className="col-span-2"><Label>KM ACL</Label><Input value={kmAcl} onChange={e => setKmAcl(e.target.value)} /></div>
            )}
          </div>
        )}

        <div>
          <Label>Operador</Label>
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
