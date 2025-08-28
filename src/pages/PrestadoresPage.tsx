import PageAccessControl from '../components/PageAccessControl';
import FeatureAccessControl from '../components/FeatureAccessControl';

export default function PrestadoresPage() {

  return (
    <PageAccessControl pageKey="access:prestadores">
      <div className="p-4 space-y-6">
        {/* Header da página */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Prestadores
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie os prestadores de serviço do sistema
            </p>
          </div>
          
          {/* Botões de ação baseados em permissões */}
          <div className="flex gap-3">
            <FeatureAccessControl featureKey="prestadores:export" hideIfNoAccess>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </button>
            </FeatureAccessControl>

            <FeatureAccessControl featureKey="prestadores:create" hideIfNoAccess>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Prestador
              </button>
            </FeatureAccessControl>
          </div>
        </div>

        {/* Conteúdo da página */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card de exemplo */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">João Silva</h3>
                  <p className="text-sm text-gray-600">Segurança</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Ativo
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">CPF:</span> 123.456.789-00
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefone:</span> (11) 99999-9999
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> joao@email.com
                </p>
              </div>

              {/* Botões de ação baseados em permissões */}
              <div className="flex gap-2">
                <FeatureAccessControl featureKey="prestadores:edit" hideIfNoAccess>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Editar
                  </button>
                </FeatureAccessControl>

                <FeatureAccessControl featureKey="prestadores:delete" hideIfNoAccess>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Excluir
                  </button>
                </FeatureAccessControl>
              </div>
            </div>

            {/* Card de exemplo 2 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Maria Santos</h3>
                  <p className="text-sm text-gray-600">Limpeza</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Pendente
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">CPF:</span> 987.654.321-00
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefone:</span> (11) 88888-8888
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> maria@email.com
                </p>
              </div>

              <div className="flex gap-2">
                <FeatureAccessControl featureKey="prestadores:edit" hideIfNoAccess>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Editar
                  </button>
                </FeatureAccessControl>

                <FeatureAccessControl featureKey="prestadores:delete" hideIfNoAccess>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Excluir
                  </button>
                </FeatureAccessControl>
              </div>
            </div>

            {/* Card de exemplo 3 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Pedro Costa</h3>
                  <p className="text-sm text-gray-600">Manutenção</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Inativo
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">CPF:</span> 456.789.123-00
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefone:</span> (11) 77777-7777
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> pedro@email.com
                </p>
              </div>

              <div className="flex gap-2">
                <FeatureAccessControl featureKey="prestadores:edit" hideIfNoAccess>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Editar
                  </button>
                </FeatureAccessControl>

                <FeatureAccessControl featureKey="prestadores:delete" hideIfNoAccess>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Excluir
                  </button>
                </FeatureAccessControl>
              </div>
            </div>
          </div>
        </div>

        {/* Informações sobre permissões */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Controle de Permissões Ativo
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Esta página está protegida pelo sistema de permissões. 
                  Funcionalidades específicas só aparecem se você tiver as permissões necessárias.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>Exportar:</strong> Requer permissão <code className="bg-blue-100 px-1 rounded">prestadores:export</code></li>
                  <li><strong>Novo:</strong> Requer permissão <code className="bg-blue-100 px-1 rounded">prestadores:create</code></li>
                  <li><strong>Editar:</strong> Requer permissão <code className="bg-blue-100 px-1 rounded">prestadores:edit</code></li>
                  <li><strong>Excluir:</strong> Requer permissão <code className="bg-blue-100 px-1 rounded">prestadores:delete</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageAccessControl>
  );
}
