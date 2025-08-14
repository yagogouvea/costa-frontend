import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import logoSegtrack from '/assets/LOGOCOSTA.png';

interface Props {
  onNovoNadastro: () => void;
}

const CadastroSucessoPublico: React.FC<Props> = ({ onNovoNadastro }) => {
  // Configurações do logo - edite aqui para ajustar o tamanho
  const logoConfig = {
    height: '250px',        // Altura do logo (pode usar: 32px, 40px, 48px, etc.)
    marginBottom: '16px'   // Espaçamento inferior (pode usar: 12px, 16px, 20px, etc.)
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card de sucesso */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-center">
            <img 
              src={logoSegtrack} 
              alt="SEGTRACK Logo" 
              className="mx-auto w-auto brightness-0 invert"
              style={{
                height: logoConfig.height,
                marginBottom: logoConfig.marginBottom
              }}
              onError={(e) => {
                console.error('Erro ao carregar logo:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Cadastro Realizado com Sucesso!</h1>
            <p className="text-green-100">Seu cadastro foi enviado e está sendo analisado</p>
          </div>
          
                    <div className="p-8">
            <div className="text-center mb-12">
              <p className="text-gray-600 leading-relaxed text-lg">
                Sua solicitação foi recebida e está em análise.<br/>
                Em breve, um operador entrará em contato com você.<br/>
                Obrigado por se cadastrar na <strong>SEGTRACK</strong>.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onNovoNadastro}
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Fazer Novo Cadastro
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Dúvidas? Entre em contato conosco através do e-mail:{' '}
            <a href="mailto:contato@segtrack.com.br" className="text-blue-600 hover:underline">
              contato@segtrack.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroSucessoPublico; 