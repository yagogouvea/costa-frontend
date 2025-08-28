import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import PrestadorPublicoForm from '@/components/prestador/PrestadorPublicoForm';
import CadastroSucessoPublico from '@/components/prestador/CadastroSucessoPublico';
import { PrestadorPublicoForm as PrestadorPublicoFormType } from '@/types/prestadorPublico';
import { dispararAtualizacaoMapa } from '@/hooks/useMapaAutoUpdate';

const CadastroPrestadorPublico: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const handleSubmit = async (data: PrestadorPublicoFormType) => {
    try {
      setLoading(true);

      // Normalização dos campos obrigatórios
      const cpf = (data.cpf || '').replace(/\D/g, '');
      const telefone = (data.telefone || '').replace(/\D/g, '');
      const cep = (data.cep || '').replace(/\D/g, '');
      const email = (data.email || '').toLowerCase();
      let chave_pix = data.chave_pix || '';
      if (data.tipo_pix === 'cpf' || data.tipo_pix === 'telefone') {
        chave_pix = chave_pix.replace(/\D/g, '');
      }
      // Arrays de strings
      const funcoes = Array.isArray(data.funcoes)
        ? data.funcoes.map(String)
        : [];
      const regioes = Array.isArray(data.regioes)
        ? data.regioes.map(String)
        : [];
      const tipo_veiculo = Array.isArray(data.tipo_veiculo)
        ? data.tipo_veiculo.map(String)
        : [];
      // Estado com 2 letras
      const estado = (data.estado || '').slice(0, 2).toUpperCase();
      // Modelo antena só se for antenista
      const modelo_antena = funcoes.includes('Antenista') ? (data.modelo_antena || '') : undefined;

      const payload = {
        nome: data.nome.trim(),
        cpf,
        cod_nome: data.cod_nome.trim(),
        telefone,
        email,
        tipo_pix: data.tipo_pix,
        chave_pix,
        cep,
        endereco: data.endereco?.trim() || '',
        bairro: data.bairro?.trim() || '',
        cidade: data.cidade?.trim() || '',
        estado,
        funcoes,
        regioes,
        tipo_veiculo,
        modelo_antena,
        aprovado: false
      };
      // Log detalhado do payload antes do envio
      console.log('🔍 Payload normalizado sendo enviado:', JSON.stringify(payload, null, 2));
      await api.post('/api/prestadores-publico', payload);
      dispararAtualizacaoMapa('criado');
      setCadastroSucesso(true);
      toast.success('Cadastro realizado com sucesso na Costa & Camargo! Aguarde nossa análise.');
    } catch (erro: any) {
      console.error('❌ Erro ao cadastrar prestador:', erro);
      console.error('❌ Detalhes do erro:', {
        status: erro.response?.status,
        statusText: erro.response?.statusText,
        data: erro.response?.data,
        message: erro.message
      });
      toast.error(erro.response?.data?.message || erro.response?.data?.error || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Pode redirecionar para página inicial ou limpar formulário
    window.location.href = '/';
  };

  if (cadastroSucesso) {
    return (
      <CadastroSucessoPublico 
        onNovoNadastro={() => {
          setCadastroSucesso(false);
          setLoading(false);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Enviando Cadastro...</h1>
        <p className="text-gray-600">Aguarde um momento...</p>
      </div>
    );
  }

  return (
    <PrestadorPublicoForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default CadastroPrestadorPublico;
