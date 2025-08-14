import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ClienteForm from '@/components/cliente/ClienteForm';
import { Cliente } from '@/types/cliente';
import api from "@/services/api";

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtros, setFiltros] = useState({ nome: '', cnpj: '' });
  const [buscou, setBuscou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | undefined>();
  const { toast } = useToast();

  const buscarClientes = async () => {
    setLoading(true);
    setBuscou(true);
    try {
      const params: any = {};
      if (filtros.nome) params.nome = filtros.nome;
      if (filtros.cnpj) params.cnpj = filtros.cnpj;
      
      const res = await api.get("/api/clientes", { params });
      const dados = res.data;
      
      // Verificar se é formato paginado (quando há filtros) ou array direto
      let clientesArray: any[];
      if (dados && typeof dados === 'object' && 'data' in dados && 'total' in dados) {
        // Formato paginado: { data: [...], total: X, page: X, pageSize: X }
        clientesArray = (dados as any).data;
      } else {
        // Formato antigo: array direto
        clientesArray = Array.isArray(dados) ? dados : [];
      }
      
      if (clientesArray.length === 0) {
        setClientes([]);
        toast({
          title: "Nenhum cliente encontrado",
          description: "Tente ajustar os filtros de busca.",
          duration: 3000,
        });
        return;
      }
      
      setClientes(clientesArray);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        duration: 3000,
      });
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarCliente = async (cliente: Cliente) => {
    try {
      if (cliente.id) {
        await api.put(`/clientes/${cliente.id}`, cliente);
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso.",
          duration: 3000,
        });
      } else {
        await api.post("/api/clientes", cliente);
        toast({
          title: "Sucesso",
          description: "Cliente criado com sucesso.",
          duration: 3000,
        });
      }
      await buscarClientes();
      setDialogoAberto(false);
      setClienteEmEdicao(undefined);
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente.",
        duration: 3000,
      });
    }
  };

  const handleExcluirCliente = async (id: number) => {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    try {
      await api.delete(`/clientes/${id}`);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
        duration: 3000,
      });
      await buscarClientes();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Cadastro de Clientes</h1>
        <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={() => setClienteEmEdicao(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <ClienteForm
              cliente={clienteEmEdicao}
              onSubmit={handleSalvarCliente}
              onCancel={() => setDialogoAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros de busca */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-4 flex flex-col md:flex-row gap-2 sm:gap-4 items-end">
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label className="text-xs font-semibold">Nome</label>
          <Input
            placeholder="Nome do cliente"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label className="text-xs font-semibold">CNPJ</label>
          <Input
            placeholder="CNPJ"
            value={filtros.cnpj}
            onChange={e => setFiltros(f => ({ ...f, cnpj: e.target.value }))}
            className="w-full"
          />
        </div>
        <Button className="w-full md:w-auto" onClick={buscarClientes} disabled={loading}>
          Buscar
        </Button>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : !buscou ? (
        <div className="text-center py-8 text-gray-400">Use os filtros acima para pesquisar clientes.</div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {clientes.map(cliente => (
            <Card key={cliente.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">{cliente.nome}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">CNPJ: {cliente.cnpj}</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setClienteEmEdicao(cliente);
                        setDialogoAberto(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => cliente.id && handleExcluirCliente(cliente.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Contato Principal</Label>
                    <p className="text-sm">{cliente.email}</p>
                    <p className="text-sm">{cliente.telefone}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Região</Label>
                    <p className="text-sm">{cliente.regiao}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tipo de Contrato</Label>
                    <p className="text-sm">{cliente.tipo_contrato}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Horário de Atendimento</Label>
                    <p className="text-sm">{cliente.horario_inicio} - {cliente.horario_fim}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientesPage; 