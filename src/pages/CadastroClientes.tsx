import api from '@/services/api';
import React, { useEffect, useState } from "react";
import ClientePopup from "@/components/ClientePopup";
import { Button } from "@/components/ui/button";
import PermissionButton from "@/components/PermissionButton";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Phone, Mail, MapPin, Building, Users, CheckCircle } from "lucide-react";
import { Cliente, Contrato } from "@/types/cliente";
import { toast } from 'react-hot-toast';
import { API_URL } from '@/config/api';

interface ClienteComContratos extends Cliente {
  contratos: Array<Contrato & { nome_interno: string }>;
}

const formatarValorContrato = (contrato: Contrato & { nome_interno: string }) => {
  switch (contrato.tipo) {
    case 'PADRAO_REGIAO':
      if (contrato.valores_por_regiao && contrato.valores_por_regiao.length > 0) {
        const valor = contrato.valores_por_regiao[0];
        return `${valor.regiao} - R$ ${valor.valor_acionamento}`;
      }
      return '';
    case 'ACL_KM':
      return `R$ ${contrato.valor_km}/km`;
    case 'PADRAO_FIXO':
      return `R$ ${contrato.valor_acionamento}`;
    case 'VALOR_FECHADO':
      return contrato.permite_negociacao 
        ? `Base: R$ ${contrato.valor_padrao} (Negociável)` 
        : `R$ ${contrato.valor_padrao}`;
    default:
      return '';
  }
};

const CadastroClientes: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteComContratos[]>([]);
  const [popupAberto, setPopupAberto] = useState(false);
  const [clienteEdicao, setClienteEdicao] = useState<ClienteComContratos | null>(null);
  const [filtros, setFiltros] = useState({ nome: '', cnpj: '' });
  const [buscou, setBuscou] = useState(false);
  const [loading, setLoading] = useState(false);

  const carregarClientes = async () => {
    setLoading(true);
    setBuscou(true);
    try {
      const params: any = {};
      if (filtros.nome) params.nome = filtros.nome;
      if (filtros.cnpj) params.cnpj = filtros.cnpj;
      
      const res = await api.get("/api/clientes", { params });
      const dados = res.data;
      // Compatibilidade: se vier paginado, pega .data, senão usa array direto
      let clientesArray: any[];
      if (dados && typeof dados === 'object' && 'data' in dados && 'total' in dados) {
        clientesArray = (dados as any).data;
      } else {
        clientesArray = Array.isArray(dados) ? dados : [];
      }
      setClientes(clientesArray);
      if (clientesArray.length === 0) {
        toast.error('Nenhum cliente encontrado');
      }
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      toast.error('Erro ao carregar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleEditar = (cliente: ClienteComContratos) => {
    setClienteEdicao(cliente);
    setPopupAberto(true);
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    try {
      await api.delete(`/api/clientes/${id}`);
      toast.success('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast.error('Erro ao excluir cliente');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 lg:p-8 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-slate-600/5 to-blue-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header Elegante */}
        <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm text-white rounded-2xl p-3 sm:p-6 mb-8 shadow-xl border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <Building className="w-8 h-8 text-blue-400" />
                Cadastro de Clientes
              </h1>
              <p className="text-slate-300 mt-2 text-xs sm:text-sm lg:text-base">
                Gerencie e cadastre todos os clientes da empresa
              </p>
            </div>
            <PermissionButton
              requiredPermission="create:cliente"
              onClick={() => {
                setClienteEdicao(null);
                setPopupAberto(true);
              }}
              message="Você não tem permissão para criar novos clientes."
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              + Novo Cliente
            </PermissionButton>
          </div>
        </div>

        {/* Filtros de busca */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 lg:p-3 sm:p-6 flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Filtros de Busca</h3>
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              💡 Use os filtros para encontrar clientes específicos
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Nome</label>
              <Input
                placeholder="Nome do cliente"
                value={filtros.nome}
                onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
                className="text-xs sm:text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">CNPJ</label>
              <Input
                placeholder="CNPJ"
                value={filtros.cnpj}
                onChange={e => setFiltros(f => ({ ...f, cnpj: e.target.value }))}
                className="text-xs sm:text-sm bg-white/60 backdrop-blur-sm border-white/30"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
              onClick={carregarClientes} 
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-lg">Carregando clientes...</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        ) : !buscou ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum cliente carregado</h3>
            <p className="text-slate-500">Use os filtros acima para pesquisar clientes.</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-lg mb-2">🔍 Nenhum cliente encontrado</div>
            <div className="text-xs sm:text-sm text-slate-400">
              Tente ajustar os filtros ou verificar se os dados estão corretos
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-2 sm:gap-3 sm:p-6">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-3 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        {cliente.logo && (
                          <img
                            src={cliente.logo.startsWith('http') ? cliente.logo : `${API_URL.replace(/\/$/, '')}/${cliente.logo.replace(/^\//, '')}`}
                            alt={`Logo ${cliente.nome}`}
                            className="h-8 w-8 object-contain rounded border flex-shrink-0 bg-white/80 backdrop-blur-sm"
                            onError={(e) => {
                              console.warn('Erro ao carregar logo:', cliente.logo);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                          #{cliente.id}
                        </div>
                      </div>
                      <p className="text-slate-900 text-lg font-bold mb-1">{cliente.nome_fantasia || cliente.nome}</p>
                      {cliente.nome_fantasia && (
                        <p className="text-slate-500 text-xs mb-2">{cliente.nome}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs sm:text-sm">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-700 font-semibold">CNPJ</span>
                      </div>
                      <p className="text-slate-900 font-bold truncate">{cliente.cnpj}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span className="text-slate-700 font-semibold">Localização</span>
                      </div>
                      <p className="text-slate-900 font-bold truncate">
                        {cliente.cidade && cliente.estado ? `${cliente.cidade}, ${cliente.estado}` : '–'}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700 font-semibold">Telefone</span>
                      </div>
                      <p className="text-slate-900 font-bold truncate">{cliente.telefone || '–'}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-700 font-semibold">Email</span>
                      </div>
                      <p className="text-slate-900 font-bold truncate">{cliente.email || '–'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <PermissionButton
                      requiredPermission="update:cliente"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditar(cliente)}
                      message="Você não tem permissão para editar clientes."
                      className="flex items-center gap-2 p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                      <span>Editar</span>
                    </PermissionButton>
                    {cliente.id && (
                      <PermissionButton
                        requiredPermission="delete:cliente"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluir(cliente.id as number)}
                        className="flex items-center gap-2 p-2 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                        message="Você não tem permissão para excluir clientes."
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Excluir</span>
                      </PermissionButton>
                    )}
                    {cliente.telefone && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(`tel:${cliente.telefone}`, '_blank')} 
                        className="flex items-center gap-2 p-2 hover:bg-green-50 hover:text-green-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                      >
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>Ligar</span>
                      </Button>
                    )}
                    {cliente.email && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(`mailto:${cliente.email}`, '_blank')} 
                        className="flex items-center gap-2 p-2 hover:bg-purple-50 hover:text-purple-600 transition-colors rounded-lg text-xs bg-white/50 backdrop-blur-sm border border-white/30"
                      >
                        <Mail className="w-4 h-4 text-purple-600" />
                        <span>Email</span>
                      </Button>
                    )}
                  </div>

                  {/* Contratos */}
                  {cliente.contratos && cliente.contratos.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-300/60">
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="bg-slate-50/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200/70">
                          <p className="text-slate-800 font-semibold text-xs mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-600" />
                            Contratos ({cliente.contratos.length})
                          </p>
                          <div className="text-xs text-slate-700 space-y-1">
                            {cliente.contratos.map((contrato, idx) => {
                              return (
                                <div key={idx} className="flex justify-between items-center py-1">
                                  <span className="font-medium">{contrato.nome_interno}</span>
                                  <span className="font-bold text-slate-900">{formatarValorContrato(contrato)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {popupAberto && (
          <ClientePopup
            onClose={() => setPopupAberto(false)}
            onSave={() => {
              carregarClientes();
              setPopupAberto(false);
            }}
            clienteEdicao={clienteEdicao}
          />
        )}
      </div>
    </div>
  );
};

export default CadastroClientes;
