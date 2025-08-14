import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  type TipoPix,
  type PrestadorForm,
  type TipoVeiculo
} from '@/types/prestador';
import { formatTelefoneBR, formatarValorMonetario } from '@/utils/prestadorUtils';
import { cepApi, geocodingApi } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

interface Props {
  prestador?: PrestadorForm;
  onSubmit: (prestador: PrestadorForm) => void;
  onCancel: () => void;
}

// Sugestões pré-definidas de regiões comuns
const sugestoesPreDefinidas = [
  'São Paulo, SP',
  'Osasco, SP',
  'Guarulhos, SP',
  'Santo André, SP',
  'São Bernardo do Campo, SP',
  'Barueri, SP',
  'Carapicuíba, SP',
  'Cotia, SP',
  'Embu das Artes, SP',
  'Itapevi, SP',
  'Jandira, SP',
  'Mairiporã, SP',
  'Mauá, SP',
  'Ribeirão Pires, SP',
  'Rio Grande da Serra, SP',
  'Santana de Parnaíba, SP',
  'Taboão da Serra, SP',
  'Vargem Grande Paulista, SP',
  'Zona Norte, São Paulo',
  'Zona Sul, São Paulo',
  'Zona Leste, São Paulo',
  'Zona Oeste, São Paulo',
  'Centro, São Paulo'
];

const PrestadorForm: React.FC<Props> = ({ prestador, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<PrestadorForm, 'regioes' | 'funcoes'> & { regioes: string[]; funcoes: string[] }>(() => {
    if (prestador) {
      return {
        ...prestador,
        regioes: prestador.regioes || [],
        funcoes: Array.isArray(prestador.funcoes) 
          ? prestador.funcoes.map((f: any) => typeof f === 'string' ? f : f.funcao || f.nome || String(f))
          : [],
        valor_acionamento: prestador.valor_acionamento?.toString() || '',
        valor_hora_adc: prestador.valor_hora_adc?.toString() || '',
        valor_km_adc: prestador.valor_km_adc?.toString() || '',
        franquia_km: prestador.franquia_km?.toString() || ''
      };
    }
    return {
      nome: '',
      cpf: '',
      cod_nome: '',
      telefone: '',
      email: '',
      tipo_pix: 'cpf' as TipoPix,
      chave_pix: '',
      cep: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      aprovado: false,
      origem: undefined,
      funcoes: [],
      tipo_veiculo: [],
      veiculos: [],
      regioes: [],
      valor_acionamento: '',
      valor_hora_adc: '',
      valor_km_adc: '',
      franquia_km: '',
      franquia_horas: '',
      modelo_antena: ''
    };
  });

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoRegiao, setBuscandoRegiao] = useState(false);
  const [showRegiaoDropdown, setShowRegiaoDropdown] = useState(false);
  const [sugestoesRegiao, setSugestoesRegiao] = useState<string[]>([]);
  const [regiaoInput, setRegiaoInput] = useState('');

  // Debounce para evitar muitas requisições
  const debouncedRegiaoInput = useDebounce(regiaoInput, 500);

  // Buscar sugestões quando o input mudar (com debounce)
  useEffect(() => {
    if (debouncedRegiaoInput.length > 2) {
      buscarSugestoes(debouncedRegiaoInput);
    } else {
      setSugestoesRegiao([]);
    }
  }, [debouncedRegiaoInput]);

  const buscarSugestoes = async (query: string) => {
    setBuscandoRegiao(true);
    
    try {
      // Primeiro, buscar nas sugestões pré-definidas
      const sugestoesLocais = sugestoesPreDefinidas.filter(
        sugestao => sugestao.toLowerCase().includes(query.toLowerCase())
      );

      // Tentar buscar na API (com timeout menor)
      let sugestoesAPI: string[] = [];
      try {
        const results = await Promise.race([
          geocodingApi.search(query),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
        sugestoesAPI = results.map((r: any) => r.display_name);
      } catch (error) {
        console.log('API de geocoding indisponível, usando apenas sugestões locais');
      }

      // Combinar sugestões (locais primeiro, depois API)
      const todasSugestoes = [...sugestoesLocais, ...sugestoesAPI];
      setSugestoesRegiao(todasSugestoes.slice(0, 10)); // Limitar a 10 resultados
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      // Fallback: usar apenas sugestões locais
      const sugestoesLocais = sugestoesPreDefinidas.filter(
        sugestao => sugestao.toLowerCase().includes(query.toLowerCase())
      );
      setSugestoesRegiao(sugestoesLocais);
    } finally {
      setBuscandoRegiao(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Função para converter valor formatado para número
    const converterValorParaNumero = (valor: string | number | undefined): number | undefined => {
      if (!valor) return undefined;
      
      const valorString = valor.toString();
      
      // Se já é um número, retorna ele mesmo
      if (typeof valor === 'number') return valor;
      
      // Remove formatação monetária (R$, espaços, etc)
      const valorLimpo = valorString
        .replace(/R\$\s*/g, '') // Remove "R$ "
        .replace(/\./g, '') // Remove pontos (separadores de milhares)
        .replace(/,/g, '.') // Converte vírgula em ponto
        .trim();
      
      const numero = parseFloat(valorLimpo);
      return isNaN(numero) ? undefined : numero;
    };
    
    // Converter para o tipo esperado antes de enviar
    const prestadorParaEnviar: PrestadorForm = {
      ...formData,
      valor_acionamento: (converterValorParaNumero(formData.valor_acionamento) || 0).toString(),
      valor_hora_adc: (converterValorParaNumero(formData.valor_hora_adc) || 0).toString(),
      valor_km_adc: (converterValorParaNumero(formData.valor_km_adc) || 0).toString(),
      franquia_km: (formData.franquia_km ? Number(formData.franquia_km) : 0).toString(),
      veiculos: formData.tipo_veiculo.map(tipo => ({ tipo })),
      funcoes: formData.funcoes as any,
      regioes: formData.regioes as any
    };
    
    console.log('Enviando prestador:', prestadorParaEnviar);
    console.log('Valores convertidos:', {
      valor_acionamento: prestadorParaEnviar.valor_acionamento,
      valor_hora_adc: prestadorParaEnviar.valor_hora_adc,
      valor_km_adc: prestadorParaEnviar.valor_km_adc,
      franquia_km: prestadorParaEnviar.franquia_km
    });
    
    onSubmit(prestadorParaEnviar);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));
  };

  // Função para buscar endereço pelo CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setBuscandoCep(true);
      try {
        const data = await cepApi.get(cep);
        setFormData(f => ({
          ...f,
          endereco: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      } catch {
        // erro já tratado na api
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleRegiaoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegiaoInput(value);
    setShowRegiaoDropdown(true);
  };

  const handleAddRegiao = (regiao: string) => {
    if (!formData.regioes.includes(regiao)) {
      setFormData(f => ({ ...f, regioes: [...f.regioes, regiao] }));
    }
    setRegiaoInput('');
    setSugestoesRegiao([]);
    setShowRegiaoDropdown(false);
  };

  const handleRegiaoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const valor = regiaoInput.trim();
      if (valor && !formData.regioes.includes(valor)) {
        handleAddRegiao(valor);
      }
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.regiao-dropdown-container')) {
        setShowRegiaoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Remover região
  const handleRemoveRegiao = (regiao: string) => {
    setFormData(f => ({ ...f, regioes: f.regioes.filter(r => r !== regiao) }));
  };

  const tiposApoio = [
    'Pronta resposta',
    'Apoio armado', 
    'Policial',
    'Antenista',
    'Drone'
  ];

  // Handler de funções: só permite valores válidos
  const handleFuncaoChange = (funcao: string) => {
    setFormData(f => {
      const jaSelecionada = f.funcoes.includes(funcao);
      return {
        ...f,
        funcoes: jaSelecionada
          ? f.funcoes.filter(fx => fx !== funcao)
          : [...f.funcoes, funcao]
      };
    });
  };

  // Handler para tipo de veículo
  const handleTipoVeiculoChange = (tipo: TipoVeiculo) => {
    setFormData(f => {
      const jaSelecionado = f.tipo_veiculo.includes(tipo);
      return {
        ...f,
        tipo_veiculo: jaSelecionado
          ? f.tipo_veiculo.filter(tv => tv !== tipo)
          : [...f.tipo_veiculo, tipo]
      };
    });
  };

  const tiposVeiculo: TipoVeiculo[] = ['Carro', 'Moto'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Nome</label>
          <Input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>CPF</label>
          <Input
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Codinome</label>
          <Input
            name="cod_nome"
            value={formData.cod_nome}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Telefone</label>
          <Input
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            onBlur={e => setFormData(f => ({ ...f, telefone: formatTelefoneBR(e.target.value) }))}
            required
          />
        </div>

        <div>
          <label>E-mail</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Tipo PIX</label>
          <select
            name="tipo_pix"
            value={formData.tipo_pix}
            onChange={handleChange}
            required
            className="w-full border rounded-md p-2"
          >
            <option value="cpf">CPF</option>
            <option value="email">Email</option>
            <option value="telefone">Telefone</option>
            <option value="chave_aleatoria">Chave Aleatória</option>
          </select>
        </div>

        <div>
          <label>Chave PIX</label>
          <Input
            name="chave_pix"
            value={formData.chave_pix}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>CEP</label>
          <Input
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            onBlur={handleCepBlur}
            required
            disabled={buscandoCep}
          />
        </div>

        <div>
          <label>Endereço</label>
          <Input
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Bairro</label>
          <Input
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Cidade</label>
          <Input
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Estado</label>
          <Input
            name="estado"
            value={formData.estado}
            maxLength={2}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Valor Acionamento</label>
          <Input
            name="valor_acionamento"
            value={formData.valor_acionamento}
            onChange={handleChange}
            onBlur={e => setFormData(f => ({ ...f, valor_acionamento: formatarValorMonetario(e.target.value) }))}
            type="text"
          />
        </div>

        <div>
          <label>Valor Hora Adicional</label>
          <Input
            name="valor_hora_adc"
            value={formData.valor_hora_adc}
            onChange={handleChange}
            onBlur={e => setFormData(f => ({ ...f, valor_hora_adc: formatarValorMonetario(e.target.value) }))}
            type="text"
          />
        </div>

        <div>
          <label>Valor KM Adicional</label>
          <Input
            name="valor_km_adc"
            value={formData.valor_km_adc}
            onChange={handleChange}
            onBlur={e => setFormData(f => ({ ...f, valor_km_adc: formatarValorMonetario(e.target.value) }))}
            type="text"
          />
        </div>

        <div>
          <label>Franquia KM</label>
          <Input
            name="franquia_km"
            value={formData.franquia_km}
            onChange={handleChange}
            type="number"
            min="0"
          />
        </div>

        <div>
          <label>Franquia Horas</label>
          <Input
            name="franquia_horas"
            value={formData.franquia_horas}
            onChange={handleChange}
            type="time"
          />
        </div>

        <div>
          <label>Tipos de Apoio</label>
          <div className="flex flex-wrap gap-2">
            {tiposApoio.map(funcao => (
              <label key={funcao} className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.funcoes.includes(funcao)}
                  onChange={() => handleFuncaoChange(funcao)}
                  className="accent-blue-600"
                />
                {funcao}
              </label>
            ))}
          </div>
          {/* Campo condicional para Antenista */}
          {formData.funcoes.includes('Antenista') && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Modelo da Antena <span className="text-red-500">*</span>
              </label>
              <Input
                name="modelo_antena"
                value={formData.modelo_antena || ''}
                onChange={handleChange}
                placeholder="Informe o modelo da antena"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Campo de tipo de veículo fora do grid para garantir visibilidade */}
      <div>
        <label>Tipo de Veículo</label>
        <div className="flex flex-wrap gap-2">
          {tiposVeiculo.map(tipo => (
            <label key={tipo} className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.tipo_veiculo.includes(tipo)}
                onChange={() => handleTipoVeiculoChange(tipo)}
                className="accent-blue-600"
              />
              {tipo}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-gray-700">Regiões de Atendimento</h3>
        <div className="space-y-3">
          <div className="relative regiao-dropdown-container">
            <label className="block text-sm font-medium mb-1">Buscar Região</label>
            <Input
              value={regiaoInput}
              onChange={handleRegiaoInput}
              onFocus={() => setShowRegiaoDropdown(true)}
              onKeyDown={handleRegiaoKeyDown}
              placeholder="Digite cidade, bairro ou região..."
              className="w-full"
            />
            {buscandoRegiao && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                Buscando...
              </div>
            )}
            {showRegiaoDropdown && (regiaoInput.length > 0 || sugestoesRegiao.length > 0) && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {regiaoInput.length > 0 && !formData.regioes.includes(regiaoInput) && (
                  <div
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100"
                    onClick={() => handleAddRegiao(regiaoInput)}
                  >
                    <span className="font-medium">Adicionar:</span> "{regiaoInput}"
                  </div>
                )}
                {sugestoesRegiao.map((s, index) => (
                  <div
                    key={`${s}-${index}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleAddRegiao(s)}
                  >
                    {s}
                  </div>
                ))}
                {sugestoesRegiao.length === 0 && regiaoInput.length > 2 && !buscandoRegiao && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Nenhuma sugestão encontrada. Pressione Enter para adicionar.
                  </div>
                )}
              </div>
            )}
          </div>
          {formData.regioes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.regioes.map(regiao => (
                <span key={regiao} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  {regiao}
                  <button
                    type="button"
                    onClick={() => handleRemoveRegiao(regiao)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default PrestadorForm; 