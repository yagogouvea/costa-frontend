import React from 'react';
import { Button } from '@/components/ui/button';
import logoCosta from '/assets/LOGOCOSTA.png';

interface Props {
  onNovoNadastro: () => void;
}

const CadastroSucessoPublico: React.FC<Props> = ({ onNovoNadastro }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Card de sucesso principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Banner superior com gradiente azul */}
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-20 text-center relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute top-16 right-8 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-8 left-16 w-12 h-12 bg-white rounded-full"></div>
            </div>
            
            {/* Logo da Costa & Camargo dentro do banner */}
            <div className="relative z-10 mb-10">
              <img 
                src={logoCosta} 
                alt="COSTA & CAMARGO Logo" 
                className="h-40 w-auto mx-auto brightness-0 invert"
              />
            </div>
            
            {/* Título principal */}
            <div className="relative z-10">
              <h1 className="text-7xl font-bold text-white mb-8">
                Cadastro Realizado!
              </h1>
              
              <p className="text-3xl text-blue-50 max-w-3xl mx-auto leading-relaxed">
                Seu cadastro foi enviado com sucesso e está sendo analisado
              </p>
            </div>
          </div>

          {/* Conteúdo simplificado */}
          <div className="p-16">
            {/* Mensagem principal simplificada */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-semibold text-gray-800 mb-8">
                Obrigado por escolher a Costa & Camargo!
              </h2>
            </div>

            {/* Botão único centralizado */}
            <div className="flex justify-center">
              <Button 
                onClick={onNovoNadastro}
                variant="ghost"
                className="w-full sm:w-auto px-12 py-6 text-2xl font-medium border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-all duration-200"
              >
                Fazer Novo Cadastro
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoCosta} 
              alt="COSTA & CAMARGO Logo" 
              className="h-16 w-auto brightness-0 invert opacity-80"
            />
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Costa & Camargo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroSucessoPublico; 