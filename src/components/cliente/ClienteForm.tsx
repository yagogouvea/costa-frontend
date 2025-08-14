import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cliente } from '@/types/cliente';

interface Props {
  cliente?: Cliente;
  onSubmit: (cliente: Cliente) => Promise<void>;
  onCancel: () => void;
}

const ClienteForm: React.FC<Props> = ({ cliente, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Cliente>({
    nome: cliente?.nome || '',
    cnpj: cliente?.cnpj || '',
    contato: cliente?.contato || '',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    endereco: cliente?.endereco || '',
    bairro: cliente?.bairro || '',
    cidade: cliente?.cidade || '',
    estado: cliente?.estado || '',
    cep: cliente?.cep || '',
    regiao: cliente?.regiao || 'CAPITAL',
    tipo_contrato: cliente?.tipo_contrato || 'MENSAL',
    valor_contrato: cliente?.valor_contrato || '',
    horario_inicio: cliente?.horario_inicio || '',
    horario_fim: cliente?.horario_fim || '',
    contratos: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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
          <label>CNPJ</label>
          <Input
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Contato</label>
          <Input
            name="contato"
            value={formData.contato}
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
          <label>CEP</label>
          <Input
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            required
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
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {cliente ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default ClienteForm; 