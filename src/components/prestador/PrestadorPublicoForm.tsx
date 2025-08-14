import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  type TipoPix,
  type TipoVeiculo
} from '@/types/prestador';
import { 
  type PrestadorPublicoForm
} from '@/types/prestadorPublico';
import { formatTelefoneBR } from '@/utils/prestadorUtils';
import { cepApi, geocodingApi } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import logoSegtrack from '/assets/Logo-segtrack.png';

interface Props {
  onSubmit: (prestador: PrestadorPublicoForm) => void;
  onCancel: () => void;
}

// Tipos de apoio iguais ao PrestadorForm
const tiposApoio = [
  'Pronta resposta',
  'Apoio armado', 
  'Policial',
  'Antenista',
  'Drone'
];

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

const PrestadorPublicoForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  // Configurações do logo - edite aqui para ajustar o tamanho
  const logoConfig = {
    height: '250px',        // Altura do logo (pode usar: 32px, 48px, 64px, etc.)
    marginBottom: '24px'   // Espaçamento inferior (pode usar: 16px, 24px, 32px, etc.)
  };
  const [formData, setFormData] = useState<Omit<PrestadorPublicoForm, 'regioes' | 'funcoes'> & { regioes: string[]; funcoes: string[] }>(() => ({
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
    funcoes: [],
    tipo_veiculo: [],
    regioes: [],
    modelo_antena: '',
    veiculos: []
    // Campos de valores removidos - preenchidos internamente pelos funcionários
  }));

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoRegiao, setBuscandoRegiao] = useState(false);
  const [showRegiaoDropdown, setShowRegiaoDropdown] = useState(false);
  const [sugestoesRegiao, setSugestoesRegiao] = useState<string[]>([]);
  const [regiaoInput, setRegiaoInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Campos obrigatórios
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.cod_nome.trim()) newErrors.cod_nome = 'Codinome é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    if (!formData.chave_pix.trim()) newErrors.chave_pix = 'Chave PIX é obrigatória';
    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
    if (!formData.endereco?.trim()) newErrors.endereco = 'Endereço é obrigatório';
    if (!formData.bairro?.trim()) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade?.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado?.trim()) newErrors.estado = 'Estado é obrigatório';

    // Validações específicas
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (formData.telefone && formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (formData.cep && formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    if (formData.estado && formData.estado.length !== 2) {
      newErrors.estado = 'Estado deve ter 2 letras (ex: SP)';
    }

    // Validações de seleção múltipla
    if (formData.funcoes.length === 0) {
      newErrors.funcoes = 'Selecione pelo menos um tipo de apoio';
    }

    if (formData.funcoes.includes('Antenista') && (!formData.modelo_antena || !formData.modelo_antena.trim())) {
      newErrors.modelo_antena = 'Informe o modelo da antena';
    }

    if (formData.tipo_veiculo.length === 0) {
      newErrors.tipo_veiculo = 'Selecione pelo menos um tipo de veículo';
    }

    if (formData.regioes.length === 0) {
      newErrors.regioes = 'Adicione pelo menos uma região de atendimento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Método parseNumber removido - não é mais necessário sem os campos de valores

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Criar array de veículos baseado nos tipos selecionados
      const veiculos = formData.tipo_veiculo.map(tipo => ({ tipo }));
      // Converter para o tipo esperado antes de enviar
      const prestadorParaEnviar: PrestadorPublicoForm = {
        ...formData,
        veiculos,
        funcoes: formData.funcoes as any,
        regioes: formData.regioes as any,
        // Campos de valores removidos - preenchidos internamente pelos funcionários
      };
      console.log('Dados do formulário antes do envio:', formData);
      console.log('Prestador formatado para envio:', prestadorParaEnviar);
      onSubmit(prestadorParaEnviar);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // No handleChange, garantir que campos de valor sejam tratados como string (para input controlado)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
        // Limpar erros dos campos preenchidos automaticamente
        setErrors(prev => ({
          ...prev,
          endereco: '',
          bairro: '',
          cidade: '',
          estado: ''
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
      // Limpar erro de regiões
      if (errors.regioes) {
        setErrors(prev => ({ ...prev, regioes: '' }));
      }
    }
    setRegiaoInput('');
    setSugestoesRegiao([]);
    setShowRegiaoDropdown(false);
  };

  const handleRegiaoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && regiaoInput.trim()) {
      e.preventDefault();
      handleAddRegiao(regiaoInput.trim());
    }
  };

  // Fechar dropdown ao clicar fora
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

  const handleRemoveRegiao = (regiao: string) => {
    setFormData(f => ({ ...f, regioes: f.regioes.filter(r => r !== regiao) }));
  };

  // Handler de funções: só permite valores válidos
  const handleFuncaoChange = (funcao: string) => {
    setFormData(f => {
      const jaSelecionada = f.funcoes.includes(funcao);
      const novasFuncoes = jaSelecionada
        ? f.funcoes.filter(fx => fx !== funcao)
        : [...f.funcoes, funcao];
      
      // Limpar erro se pelo menos uma função foi selecionada
      if (novasFuncoes.length > 0 && errors.funcoes) {
        setErrors(prev => ({ ...prev, funcoes: '' }));
      }
      
      return {
        ...f,
        funcoes: novasFuncoes
      };
    });
  };

  // Handler para tipo de veículo
  const handleTipoVeiculoChange = (tipo: TipoVeiculo) => {
    setFormData(f => {
      const jaSelecionado = f.tipo_veiculo.includes(tipo);
      const novosTipos = jaSelecionado
        ? f.tipo_veiculo.filter(tv => tv !== tipo)
        : [...f.tipo_veiculo, tipo];
      
      // Limpar erro se pelo menos um tipo foi selecionado
      if (novosTipos.length > 0 && errors.tipo_veiculo) {
        setErrors(prev => ({ ...prev, tipo_veiculo: '' }));
      }
      
      return {
        ...f,
        tipo_veiculo: novosTipos
      };
    });
  };

  const tiposVeiculo: TipoVeiculo[] = ['Carro', 'Moto'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={logoSegtrack} 
            alt="SEGTRACK Logo" 
            className="mx-auto w-auto"
            style={{
              height: logoConfig.height,
              marginBottom: logoConfig.marginBottom
            }}
            onError={(e) => {
              console.error('Erro ao carregar logo:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastro de Prestador</h1>
          <p className="text-gray-600">
            Preencha todos os campos obrigatórios para se cadastrar como prestador de serviços
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Informações do Prestador</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid de campos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className={errors.nome ? 'border-red-500' : ''}
                    placeholder="Digite seu nome completo"
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className={errors.cpf ? 'border-red-500' : ''}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                </div>

                {/* Codinome */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Codinome <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="cod_nome"
                    value={formData.cod_nome}
                    onChange={handleChange}
                    className={errors.cod_nome ? 'border-red-500' : ''}
                    placeholder="Como gostaria de ser chamado"
                  />
                  {errors.cod_nome && <p className="text-red-500 text-xs mt-1">{errors.cod_nome}</p>}
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    onBlur={e => setFormData(f => ({ ...f, telefone: formatTelefoneBR(e.target.value) }))}
                    className={errors.telefone ? 'border-red-500' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Tipo PIX */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Tipo PIX <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipo_pix"
                    value={formData.tipo_pix}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">Email</option>
                    <option value="telefone">Telefone</option>
                    <option value="chave_aleatoria">Chave Aleatória</option>
                  </select>
                </div>

                {/* Chave PIX */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Chave PIX <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="chave_pix"
                    value={formData.chave_pix}
                    onChange={handleChange}
                    className={errors.chave_pix ? 'border-red-500' : ''}
                    placeholder="Digite sua chave PIX"
                  />
                  {errors.chave_pix && <p className="text-red-500 text-xs mt-1">{errors.chave_pix}</p>}
                </div>

                {/* CEP */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    CEP <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    onBlur={handleCepBlur}
                    disabled={buscandoCep}
                    className={errors.cep ? 'border-red-500' : ''}
                    placeholder="00000-000"
                  />
                  {buscandoCep && <p className="text-blue-500 text-xs mt-1">Buscando endereço...</p>}
                  {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                </div>

                {/* Endereço */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Endereço <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className={errors.endereco ? 'border-red-500' : ''}
                    placeholder="Rua, número"
                  />
                  {errors.endereco && <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>}
                </div>

                {/* Bairro */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Bairro <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    className={errors.bairro ? 'border-red-500' : ''}
                    placeholder="Nome do bairro"
                  />
                  {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>}
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className={errors.cidade ? 'border-red-500' : ''}
                    placeholder="Nome da cidade"
                  />
                  {errors.cidade && <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Estado (UF) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="estado"
                    value={formData.estado}
                    maxLength={2}
                    onChange={handleChange}
                    className={errors.estado ? 'border-red-500' : ''}
                    placeholder="SP"
                  />
                  {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                </div>
              </div>

              {/* Campos de valores removidos - preenchidos internamente pelos funcionários */}

              {/* Tipos de Apoio */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Tipos de Apoio <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tiposApoio.map(funcao => (
                    <label key={funcao} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.funcoes.includes(funcao)}
                        onChange={() => handleFuncaoChange(funcao)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{funcao}</span>
                    </label>
                  ))}
                </div>
                {errors.funcoes && <p className="text-red-500 text-xs mt-1">{errors.funcoes}</p>}
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
                      className={errors.modelo_antena ? 'border-red-500' : ''}
                      placeholder="Informe o modelo da antena"
                    />
                    {errors.modelo_antena && <p className="text-red-500 text-xs mt-1">{errors.modelo_antena}</p>}
                  </div>
                )}
              </div>

              {/* Tipos de Veículo */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Tipos de Veículo <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {tiposVeiculo.map(tipo => (
                    <label key={tipo} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.tipo_veiculo.includes(tipo)}
                        onChange={() => handleTipoVeiculoChange(tipo)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{tipo}</span>
                    </label>
                  ))}
                </div>
                {errors.tipo_veiculo && <p className="text-red-500 text-xs mt-1">{errors.tipo_veiculo}</p>}
              </div>

              {/* Regiões de Atendimento */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700">
                  Regiões de Atendimento <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-3">
                  <div className="relative regiao-dropdown-container">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Buscar Região</label>
                    <Input
                      value={regiaoInput}
                      onChange={handleRegiaoInput}
                      onFocus={() => setShowRegiaoDropdown(true)}
                      onKeyDown={handleRegiaoKeyDown}
                      placeholder="Digite cidade, bairro ou região..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dica: Digite o nome da cidade, bairro ou região e pressione <b>Enter</b> para adicionar. Você pode adicionar várias regiões.
                    </p>
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
                  {errors.regioes && <p className="text-red-500 text-xs mt-1">{errors.regioes}</p>}
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestadorPublicoForm;