import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cliente, ClienteFormData, ContratoFormData, converterParaFormData } from '@/types/cliente';
import { api } from '@/services/api';
import { API_URL } from '@/config/api';
import { uploadLogoToSupabase, deleteLogoFromSupabase } from '@/utils/logoUpload';
import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { MonetaryValue } from '@/types/base';
import { CNPJResponse } from '@/types/api';

interface Props {
  onClose: () => void;
  onSave: () => void;
  clienteEdicao?: Cliente | null;
}

const formatCurrency = (value: MonetaryValue): string => {
  if (typeof value === 'number') return value.toFixed(2);
  const numeric = value.replace(/[^\d]/g, "");
  return (parseFloat(numeric) / 100).toFixed(2);
};

const formatHour = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{2})(\d{2})/, "$1:$2");
};

const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const formatCEP = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
};

// Usando as regiões do sistema
const REGIOES = [
  { value: 'SAO_PAULO', label: 'São Paulo' },
  { value: 'GRANDE_SAO_PAULO', label: 'Grande São Paulo' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'OUTROS_ESTADOS', label: 'Outros Estados' },
  { value: 'SAO_PAULO_E_GRANDE_SAO_PAULO', label: 'São Paulo e Grande São Paulo' },
  { value: 'NIVEL_BRASIL', label: 'Nível Brasil' },
];

const ClientePopup: React.FC<Props> = ({ onClose, onSave, clienteEdicao }) => {
  const [consultandoCNPJ, setConsultandoCNPJ] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [expandedContracts, setExpandedContracts] = useState<number[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    control,
    formState: { }
  } = useForm<ClienteFormData>({
    defaultValues: {
      nome: clienteEdicao?.nome || "",
      cnpj: clienteEdicao?.cnpj || "",
      contato: clienteEdicao?.contato || "",
      telefone: clienteEdicao?.telefone || "",
      email: clienteEdicao?.email || "",
      endereco: clienteEdicao?.endereco || "",
      bairro: clienteEdicao?.bairro || "",
      cidade: clienteEdicao?.cidade || "",
      estado: clienteEdicao?.estado || "",
      cep: clienteEdicao?.cep || "",
      regiao: clienteEdicao?.regiao || "CAPITAL",
      tipo_contrato: clienteEdicao?.tipo_contrato || "MENSAL",
      valor_contrato: clienteEdicao?.valor_contrato || "",
      horario_inicio: clienteEdicao?.horario_inicio || "",
      horario_fim: clienteEdicao?.horario_fim || "",
      logo: clienteEdicao?.logo || "",
      nome_fantasia: clienteEdicao?.nome_fantasia || "",
      contratos: [{
        nome_interno: 'Principal',
        tipo: 'PADRAO_REGIAO' as const,
        regiao: 'CAPITAL',
        valor_acionamento: '0',
        valor_hora_extra: '0',
        valor_km_extra: '0',
        franquia_horas: '00:00',
        franquia_km: '0'
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contratos",
  });

  const watchCNPJ = watch("cnpj");

  useEffect(() => {
    if (clienteEdicao) {
      console.log("🔍 === DEBUG CLIENTE EDICAO ===");
      console.log("DEBUG clienteEdicao recebida:", clienteEdicao);
      console.log("DEBUG contratos recebidos:", clienteEdicao.contratos);
      console.log("DEBUG tipo de contratos:", typeof clienteEdicao.contratos);
      console.log("DEBUG é array?", Array.isArray(clienteEdicao.contratos));
      console.log("DEBUG estrutura completa do cliente:", JSON.stringify(clienteEdicao, null, 2));
      
      if (clienteEdicao.contratos && Array.isArray(clienteEdicao.contratos)) {
        console.log("DEBUG número de contratos:", clienteEdicao.contratos.length);
        clienteEdicao.contratos.forEach((contrato, index) => {
          console.log(`DEBUG contrato ${index}:`, contrato);
        });
      } else {
        console.log("DEBUG: Nenhum contrato encontrado ou não é array");
      }
      
      const contratosConvertidos = Array.isArray(clienteEdicao.contratos)
        ? clienteEdicao.contratos.map(contrato => {
            console.log("DEBUG convertendo contrato:", contrato);
            const convertido = converterParaFormData(contrato);
            console.log("DEBUG contrato convertido:", convertido);
            return convertido;
          })
        : [];
      
      console.log("DEBUG contratos convertidos finais:", contratosConvertidos);
      console.log("🔍 === FIM DEBUG ===");
      
      reset({
        nome: clienteEdicao.nome || '',
        cnpj: clienteEdicao.cnpj || '',
        contato: clienteEdicao.contato || '',
        telefone: clienteEdicao.telefone || '',
        email: clienteEdicao.email || '',
        endereco: clienteEdicao.endereco || '',
        bairro: clienteEdicao.bairro || '',
        cidade: clienteEdicao.cidade || '',
        estado: clienteEdicao.estado || '',
        cep: clienteEdicao.cep || '',
        regiao: clienteEdicao.regiao || 'CAPITAL',
        tipo_contrato: clienteEdicao.tipo_contrato || 'MENSAL',
        valor_contrato: clienteEdicao.valor_contrato || '',
        horario_inicio: clienteEdicao.horario_inicio || '',
        horario_fim: clienteEdicao.horario_fim || '',
        logo: clienteEdicao.logo || '',
        nome_fantasia: clienteEdicao.nome_fantasia || '',
        contratos: contratosConvertidos,
      });
      
      // Carregar preview do logo existente
      if (clienteEdicao.logo) {
        console.log('🏢 Logo do cliente recebido:', clienteEdicao.logo);
        let logoUrl = clienteEdicao.logo;
        
        // Se não é uma URL absoluta, construir a URL completa
        if (!clienteEdicao.logo.startsWith('http')) {
          // Se o logo começa com /uploads/ ou contém logos/, usar Supabase
          if (clienteEdicao.logo.startsWith('/uploads/') || clienteEdicao.logo.includes('logos/')) {
            const supabaseUrl = 'https://ziedretdauamqkaoqcjh.supabase.co/storage/v1/object/public/segtrackfotos';
            const cleanPath = clienteEdicao.logo.replace(/^\/+/, '');
            logoUrl = `${supabaseUrl}/${cleanPath}`;
          } else {
            // Usar API_URL como fallback
            logoUrl = `${API_URL}/${clienteEdicao.logo.replace(/^\/+/, '')}`;
          }
        }
        
        console.log('🏢 URL do logo construída:', logoUrl);
        setLogoPreview(logoUrl);
      } else {
        console.log('🏢 Cliente sem logo');
      }
    }
  }, [clienteEdicao, reset]);

  useEffect(() => {
    const buscarDados = async () => {
      if (clienteEdicao) return;

      const cnpjLimpo = watchCNPJ.replace(/\D/g, "");
      if (cnpjLimpo.length === 14) {
        try {
          setConsultandoCNPJ(true);
          console.log("🔍 Buscando dados do CNPJ:", cnpjLimpo);
          const { data } = await api.get<CNPJResponse>(`/api/cnpj/${cnpjLimpo}`);
          console.log("✅ Dados recebidos:", data);

          // Preencher nome da empresa
          if (data.company?.name) {
            setValue("nome", data.company.name);
          }

          // Preencher endereço completo
          const endereco = data.address;
          if (endereco) {
            // Usar o endereço já formatado pelo backend
            if (endereco.street) setValue("endereco", endereco.street);
            if (endereco.district) setValue("bairro", endereco.district);
            if (endereco.city) setValue("cidade", endereco.city);
            if (endereco.state) setValue("estado", endereco.state);
            if (endereco.zip) setValue("cep", endereco.zip);
          }

          // Preencher contato se disponível
          if (data.contact?.phone) {
            setValue("telefone", data.contact.phone);
          }
          if (data.contact?.email) {
            setValue("email", data.contact.email);
          }

          // Mostrar mensagem de sucesso
          console.log("✅ Dados preenchidos automaticamente!");
          
        } catch (err: any) {
          console.error("❌ Erro ao buscar CNPJ:", err);
          if (err.response?.status === 404) {
            console.warn("⚠️ CNPJ não encontrado na base de dados");
          } else if (err.response?.status === 429) {
            console.warn("⚠️ Muitas consultas. Aguarde alguns segundos.");
                     } else {
             console.error("❌ Erro na consulta:", err.response?.data?.error || err.message);
           }
         } finally {
           setConsultandoCNPJ(false);
         }
       }
     };

    // Debounce para evitar muitas consultas
    const timeoutId = setTimeout(buscarDados, 500);
    return () => clearTimeout(timeoutId);
  }, [watchCNPJ, setValue, clienteEdicao]);

  const handleAddContrato = () => {
    const novoContrato: ContratoFormData = {
      nome_interno: `Contrato ${fields.length + 1}`,
      tipo: 'PADRAO_REGIAO',
      regiao: 'CAPITAL',
      valor_acionamento: '0',
      valor_hora_extra: '0',
      valor_km_extra: '0',
      franquia_horas: '00:00',
      franquia_km: '0'
    };
    append(novoContrato);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    // Se há um logo existente (não é um novo upload), tentar deletar do Supabase
    const currentLogo = getValues("logo");
    if (currentLogo && currentLogo.startsWith('http') && !logoFile) {
      try {
        console.log('Tentando deletar logo existente do Supabase...');
        await deleteLogoFromSupabase(currentLogo);
        console.log('Logo deletado do Supabase com sucesso');
      } catch (error) {
        console.warn('Erro ao deletar logo do Supabase (pode ser um logo local):', error);
        // Não mostrar erro para o usuário, pois pode ser um logo local
      }
    }
    
    setLogoFile(null);
    setLogoPreview(null);
    setValue("logo", ""); // Limpar o campo logo no formulário
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    try {
      setUploadingLogo(true);
      console.log('Iniciando upload de logo para Supabase...');
      
      // Upload para Supabase
      const publicUrl = await uploadLogoToSupabase(logoFile);
      
      if (!publicUrl) {
        throw new Error('Falha ao obter URL pública do logo');
      }
      
      console.log('Logo enviado com sucesso para Supabase:', publicUrl);
      return publicUrl;
      
    } catch (error) {
      console.error('Erro ao fazer upload do logo para Supabase:', error);
      
      // Fallback: tentar upload para backend local
      try {
        console.log('Tentando fallback para backend local...');
        const formData = new FormData();
        formData.append('logo', logoFile);

        const response = await api.post('/api/clientes/upload-logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Upload para backend local bem-sucedido');
        return response.data.logoPath;
        
      } catch (backendError) {
        console.error('Erro no backend local também:', backendError);
        alert('Erro ao fazer upload do logo: Não foi possível conectar com Supabase nem com o servidor local. Verifique sua conexão.');
        return null;
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedContracts(expanded =>
      expanded.includes(index)
        ? expanded.filter(i => i !== index)
        : [...expanded, index]
    );
  };

  const renderCamposContrato = (index: number) => {
    const tipo = watch(`contratos.${index}.tipo`);

    switch (tipo) {
      case 'PADRAO_REGIAO':
        return (
          <>
            <Label>Região</Label>
            <select {...register(`contratos.${index}.regiao`)} className="mb-2 w-full border p-2 rounded">
              {REGIOES.map(regiao => (
                <option key={regiao.value} value={regiao.value}>
                  {regiao.label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Valor Acionamento</Label>
                <Input
                  {...register(`contratos.${index}.valor_acionamento`)}
                  onChange={(e) => setValue(`contratos.${index}.valor_acionamento`, formatCurrency(e.target.value))}
                />
              </div>
              <div>
                <Label>Valor Não Recuperado</Label>
                <Input
                  {...register(`contratos.${index}.valor_nao_recuperado`)}
                  onChange={(e) => setValue(`contratos.${index}.valor_nao_recuperado`, formatCurrency(e.target.value))}
                />
              </div>
              <div>
                <Label>Hora Extra (R$)</Label>
                <Input
                  {...register(`contratos.${index}.valor_hora_extra`)}
                  onChange={(e) => setValue(`contratos.${index}.valor_hora_extra`, formatCurrency(e.target.value))}
                />
              </div>
              <div>
                <Label>KM Extra (R$)</Label>
                <Input
                  {...register(`contratos.${index}.valor_km_extra`)}
                  onChange={(e) => setValue(`contratos.${index}.valor_km_extra`, formatCurrency(e.target.value))}
                />
              </div>
              <div>
                <Label>Franquia Horas</Label>
                <Input
                  {...register(`contratos.${index}.franquia_horas`)}
                  onChange={(e) => setValue(`contratos.${index}.franquia_horas`, formatHour(e.target.value))}
                />
              </div>
              <div>
                <Label>Franquia KM</Label>
                <Input
                  type="number"
                  {...register(`contratos.${index}.franquia_km`)}
                />
              </div>
            </div>
          </>
        );

      case 'ACL_KM':
        return (
          <div>
            <Label>Valor por KM</Label>
            <Input
              {...register(`contratos.${index}.valor_km`)}
              onChange={(e) => setValue(`contratos.${index}.valor_km`, formatCurrency(e.target.value))}
            />
          </div>
        );

      case 'PADRAO_FIXO':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Valor Acionamento</Label>
              <Input
                {...register(`contratos.${index}.valor_acionamento`)}
                onChange={(e) => setValue(`contratos.${index}.valor_acionamento`, formatCurrency(e.target.value))}
              />
            </div>
            <div>
              <Label>Hora Extra (R$)</Label>
              <Input
                {...register(`contratos.${index}.valor_hora_extra`)}
                onChange={(e) => setValue(`contratos.${index}.valor_hora_extra`, formatCurrency(e.target.value))}
              />
            </div>
            <div>
              <Label>KM Extra (R$)</Label>
              <Input
                {...register(`contratos.${index}.valor_km_extra`)}
                onChange={(e) => setValue(`contratos.${index}.valor_km_extra`, formatCurrency(e.target.value))}
              />
            </div>
            <div>
              <Label>Franquia Horas</Label>
              <Input
                {...register(`contratos.${index}.franquia_horas`)}
                onChange={(e) => setValue(`contratos.${index}.franquia_horas`, formatHour(e.target.value))}
              />
            </div>
            <div>
              <Label>Franquia KM</Label>
              <Input
                type="number"
                {...register(`contratos.${index}.franquia_km`)}
              />
            </div>
          </div>
        );

      case 'VALOR_FECHADO':
        return (
          <div className="space-y-4">
            <div>
              <Label>Valor Base</Label>
              <Input
                {...register(`contratos.${index}.valor_base`)}
                onChange={(e) => setValue(`contratos.${index}.valor_base`, formatCurrency(e.target.value))}
              />
            </div>
            <div>
              <Label>
                <input
                  type="checkbox"
                  {...register(`contratos.${index}.permite_negociacao`)}
                  className="mr-2"
                />
                Permite Negociação
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Franquia Horas</Label>
                <Input
                  {...register(`contratos.${index}.franquia_horas`)}
                  onChange={(e) => setValue(`contratos.${index}.franquia_horas`, formatHour(e.target.value))}
                />
              </div>
              <div>
                <Label>Franquia KM</Label>
                <Input
                  type="number"
                  {...register(`contratos.${index}.franquia_km`)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hora Extra (R$)</Label>
                <Input
                  {...register(`contratos.${index}.valor_hora_extra`)}
                  onChange={(e) => setValue(`contratos.${index}.valor_hora_extra`, formatCurrency(e.target.value))}
                />
              </div>
              <div>
                <Label>KM Extra (R$)</Label>
                <Input
                  {...register(`contratos.${index}.valor_km_extra`)}
                  onChange={(e) => setValue(`contratos.${index}.valor_km_extra`, formatCurrency(e.target.value))}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    if (clienteEdicao) {
      console.log("[DEBUG] Dados recebidos para edição:", clienteEdicao);
    }
  }, [clienteEdicao]);

  // Função para converter contrato do formulário para o formato do backend
  function contratoFormDataToBackend(contrato: any) {
    // Mapeamento dos enums do frontend para o backend (Prisma)
    const tipoMap: Record<string, string> = {
      PADRAO_REGIAO: 'padrao_regiao',
      ACL_KM: 'acl_km',
      PADRAO_FIXO: 'padrao_fixo',
      VALOR_FECHADO: 'valor_fechado'
    };
    const regiaoMap: Record<string, string> = {
      CAPITAL: 'CAPITAL',
      GRANDE_SAO_PAULO: 'GRANDE_SP',
      GRANDE_SP: 'GRANDE_SP',
      INTERIOR: 'INTERIOR',
      OUTROS_ESTADOS: 'OUTROS_ESTADOS',
      SAO_PAULO: 'CAPITAL',
      SAO_PAULO_E_GRANDE_SAO_PAULO: 'GRANDE_SP',
      NIVEL_BRASIL: 'OUTROS_ESTADOS'
    };

    return {
      nome_interno: contrato.nome_interno,
      tipo: tipoMap[contrato.tipo] || contrato.tipo,
      regiao: regiaoMap[contrato.regiao] || contrato.regiao,
      valor_acionamento: contrato.valor_acionamento ? Number(contrato.valor_acionamento) : null,
      valor_nao_recuperado: contrato.valor_nao_recuperado ? Number(contrato.valor_nao_recuperado) : null,
      valor_hora_extra: contrato.valor_hora_extra ? Number(contrato.valor_hora_extra) : null,
      valor_km_extra: contrato.valor_km_extra ? Number(contrato.valor_km_extra) : null,
      franquia_horas: contrato.franquia_horas || null,
      franquia_km: contrato.franquia_km ? Number(contrato.franquia_km) : null,
      valor_km: contrato.valor_km ? Number(contrato.valor_km) : null,
      valor_base: contrato.valor_base ? Number(contrato.valor_base) : null,
      permite_negociacao: contrato.permite_negociacao || false
    };
  }

  const onSubmit = async () => {
    const values = getValues();
    console.log('[DEBUG] Dados do formulário antes do envio:', values);
    
    // Verificar se há contratos (não obrigatório, mas log para debug)
    if (!values.contratos || values.contratos.length === 0) {
      console.log("Nenhum contrato encontrado - criando cliente sem contratos");
      values.contratos = []; // Garantir que seja um array vazio
    }

    // Upload do logo se houver um arquivo selecionado
    let logoPath = values.logo; // Manter logo existente se não houver novo upload
    if (logoFile) {
      // Se há um logo existente e é do Supabase, deletar o antigo
      if (logoPath && logoPath.startsWith('http') && !logoPath.includes(API_URL)) {
        try {
          console.log('Deletando logo antigo do Supabase...');
          await deleteLogoFromSupabase(logoPath);
          console.log('Logo antigo deletado com sucesso');
        } catch (error) {
          console.warn('Erro ao deletar logo antigo (pode ser um logo local):', error);
        }
      }
      
      const uploadedPath = await uploadLogo();
      if (uploadedPath) {
        logoPath = uploadedPath;
      }
    }

    // Converter contratos para o formato do backend
    const contratosBackend = values.contratos.map(contratoFormDataToBackend);

    const processedValues = {
      ...values,
      logo: logoPath,
      contratos: contratosBackend,
    };

    console.log('[DEBUG] Dados enviados para o backend:', processedValues);

    try {
      const response = await api[clienteEdicao?.id ? "put" : "post"](
        `/api/clientes${clienteEdicao?.id ? `/${clienteEdicao.id}` : ''}`,
        processedValues
      );
      console.log('✅ Cliente salvo com sucesso:', response.data);
      alert("Cliente salvo com sucesso!");
      onSave();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      alert("Erro ao salvar cliente");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg sm:max-w-2xl md:max-w-4xl max-min-h-[80vh] max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl font-semibold text-white">
            {clienteEdicao ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
        </div>
        
        <div className="p-2 sm:p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 sm:space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 sm:mb-4 text-base sm:text-lg">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Nome *</Label>
                    <Input {...register("nome")} placeholder="Nome da empresa" className="w-full" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">CNPJ *</Label>
                    <div className="relative">
                      <Input 
                        {...register("cnpj")} 
                        placeholder="00.000.000/0000-00"
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value);
                          setValue("cnpj", formatted);
                        }}
                        maxLength={18}
                        className={"w-full " + (consultandoCNPJ ? "pr-10" : "")}
                      />
                      {consultandoCNPJ && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {consultandoCNPJ && (
                      <p className="text-xs text-blue-600 mt-1">🔍 Consultando dados do CNPJ...</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Contato</Label>
                    <Input {...register("contato")} placeholder="Nome do responsável" className="w-full" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Telefone</Label>
                    <Input 
                      {...register("telefone")} 
                      placeholder="(11) 99999-9999"
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setValue("telefone", formatted);
                      }}
                      maxLength={15}
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs sm:text-sm font-medium">Email</Label>
                    <Input {...register("email")} placeholder="contato@empresa.com" type="email" className="w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Nome Fantasia</label>
                    <Input
                      {...register("nome_fantasia")}
                      placeholder="Nome Fantasia"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 sm:mb-4 text-base sm:text-lg">Logo da Empresa</h3>
                <div className="space-y-2 sm:space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Upload do Logo</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="mt-1 block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                    </p>
                  </div>
                  
                  {logoPreview && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex-shrink-0 relative">
                          <img
                            src={logoPreview}
                            alt="Preview do logo"
                            className="h-16 w-16 sm:h-20 sm:w-20 object-contain border border-gray-300 rounded-lg bg-white p-2"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                            title="Remover logo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600">Preview do logo</p>
                          {uploadingLogo && (
                            <div className="flex items-center mt-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-xs text-blue-600">Fazendo upload...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="bg-white text-red-600 border border-red-300 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover Logo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 sm:mb-4 text-base sm:text-lg">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label className="text-xs sm:text-sm font-medium">Endereço</Label>
                    <Input {...register("endereco")} placeholder="Rua, número, complemento" className="w-full" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Bairro</Label>
                    <Input {...register("bairro")} placeholder="Nome do bairro" className="w-full" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Cidade</Label>
                    <Input {...register("cidade")} placeholder="Nome da cidade" className="w-full" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Estado</Label>
                    <Input {...register("estado")} placeholder="SP" className="w-full" />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">CEP</Label>
                    <Input 
                      {...register("cep")} 
                      placeholder="00000-000"
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        setValue("cep", formatted);
                      }}
                      maxLength={9}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Contratos */}
              <div className="bg-gray-50 p-2 sm:p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2 sm:gap-0">
                  <h3 className="font-semibold text-gray-700 text-base sm:text-lg">Contratos</h3>
                  <Button 
                    type="button" 
                    onClick={handleAddContrato}
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    + Adicionar Contrato
                  </Button>
                </div>
                
                {fields.map((contrato, index) => (
                  <div key={contrato.id} className="bg-white p-2 sm:p-4 rounded border mb-2 sm:mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-600">
                          {watch(`contratos.${index}.nome_interno`) || `Contrato ${index + 1}`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleExpand(index)}
                          className="ml-2 text-gray-500 hover:text-blue-600"
                          title={expandedContracts.includes(index) ? 'Recolher' : 'Expandir'}
                        >
                          {expandedContracts.includes(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          {...register(`contratos.${index}.nome_interno`)}
                          placeholder="Nome do contrato"
                          className="w-full sm:w-48"
                        />
                        <select 
                          {...register(`contratos.${index}.tipo`)} 
                          className="border p-2 rounded text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <option value="PADRAO_REGIAO">Padrão por Região</option>
                          <option value="ACL_KM">ACL - Por KM</option>
                          <option value="PADRAO_FIXO">Padrão Fixo</option>
                          <option value="VALOR_FECHADO">Valor Fechado</option>
                        </select>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="ml-0 sm:ml-2 text-red-600 hover:text-red-800"
                            title="Remover contrato"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedContracts.includes(index) && (
                      <div>{renderCamposContrato(index)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientePopup;