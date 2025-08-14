import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, ChevronLeft, Menu, X } from "lucide-react";
import LogoSegtrack from "./LogoSegtrack";

interface Button {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  category?: string;
}

interface Props {
  sidebarButtons: Button[];
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ sidebarButtons, children }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  // Função para obter título da página atual
  const getPageTitle = () => {
    const path = location.pathname;
    const currentButton = sidebarButtons.find(btn => btn.href === path);
    return currentButton?.label || 'Dashboard';
  };

  // Função para obter breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    const currentButton = sidebarButtons.find(btn => btn.href === path);
    
    if (path === '/') return ['Dashboard'];
    if (currentButton) return ['Dashboard', currentButton.label];
    return ['Dashboard'];
  };

  React.useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Se o usuário está autenticado e vai para login, intercepta
      if (window.location.pathname === '/login' || window.location.pathname === '/') {
        e.preventDefault();
        const sair = window.confirm('Deseja realmente sair do sistema?');
        if (sair) {
          logout();
          navigate('/login', { replace: true });
        } else {
          // Volta para a página anterior
          navigate(-1);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [logout, navigate]);

  // Agrupar botões por categoria
  const groupedButtons = sidebarButtons.reduce((acc, btn) => {
    const category = btn.category || "GERAL";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(btn);
    return acc;
  }, {} as Record<string, Button[]>);

  // Fechar menu mobile ao navegar
  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Sidebar Desktop */}
      <aside 
        className={`${
          isSidebarCollapsed ? "w-20" : "w-72"
        } bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 ease-in-out flex flex-col shadow-lg relative hidden lg:flex`}
      >
        {/* Logo Section */}
        <div className="min-h-[100px] flex items-center justify-between px-6 relative">
          {!isSidebarCollapsed && (
            <div className="w-full flex items-center justify-center py-4">
              <LogoSegtrack
                className="h-14 w-auto object-contain"
                style={{
                  maxWidth: '220px',
                  maxHeight: '280px',
                  width: '100%',
                  height: 'auto',
                  filter: 'brightness(1.3) contrast(1.1) drop-shadow(0 2px 4px rgba(255,255,255,0.1))'
                }}
              />
            </div>
          )}
          {/* Collapse Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 z-20"
          >
            <ChevronLeft
              size={18}
              className={`transform transition-transform text-white/80 ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 overflow-y-auto">
          {Object.entries(groupedButtons).map(([category, buttons]) => (
            <div key={category} className="mb-6 px-4">
              {!isSidebarCollapsed && (
                <h2 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                  {category}
                </h2>
              )}
              <div className="space-y-1">
                {buttons.map((btn, i) =>
                  btn.href ? (
                    <Link
                      key={btn.href}
                      to={btn.href}
                      className={`group flex items-center ${
                        isSidebarCollapsed ? "justify-center" : "justify-start"
                      } gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                        location.pathname === btn.href
                          ? "bg-white/15 text-white font-medium border-l-4 border-blue-400 shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className={`flex items-center justify-center min-w-[20px] ${
                        location.pathname === btn.href ? "text-blue-300" : "text-white/70 group-hover:text-white"
                      }`}>
                        {btn.icon}
                      </div>
                      {!isSidebarCollapsed && (
                        <span className="text-sm tracking-wide whitespace-nowrap">
                          {btn.label}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      key={i}
                      onClick={btn.onClick}
                      className={`group flex items-center ${
                        isSidebarCollapsed ? "justify-center" : "justify-start"
                      } w-full gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200`}
                    >
                      <div className="flex items-center justify-center min-w-[20px] text-white/70 group-hover:text-white">
                        {btn.icon}
                      </div>
                      {!isSidebarCollapsed && (
                        <span className="text-sm tracking-wide whitespace-nowrap">
                          {btn.label}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "justify-start"
            } gap-3 w-full px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200`}
          >
            <div className="flex items-center justify-center min-w-[20px]">
              <LogOut size={18} />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-sm tracking-wide whitespace-nowrap font-medium">
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center justify-center py-4">
            <LogoSegtrack
              className="h-12 w-auto object-contain"
              style={{
                maxWidth: '180px',
                maxHeight: '180px',
                width: '100%',
                height: 'auto',
                filter: 'brightness(1.3) contrast(1.1) drop-shadow(0 2px 4px rgba(255,255,255,0.1))'
              }}
            />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <X size={24} className="text-white/80" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 pt-4 overflow-y-auto">
          {Object.entries(groupedButtons).map(([category, buttons]) => (
            <div key={category} className="mb-6 px-4">
              <h2 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="space-y-1">
                {buttons.map((btn, i) =>
                  btn.href ? (
                    <Link
                      key={btn.href}
                      to={btn.href}
                      onClick={handleNavigation}
                      className={`group flex items-center justify-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative ${
                        location.pathname === btn.href
                          ? "bg-white/15 text-white font-medium border-l-4 border-blue-400 shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className={`flex items-center justify-center min-w-[20px] ${
                        location.pathname === btn.href ? "text-blue-300" : "text-white/70 group-hover:text-white"
                      }`}>
                        {btn.icon}
                      </div>
                      <span className="text-sm tracking-wide whitespace-nowrap">
                        {btn.label}
                      </span>
                    </Link>
                  ) : (
                    <button
                      key={i}
                      onClick={() => {
                        btn.onClick?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className="group flex items-center justify-start w-full gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center justify-center min-w-[20px] text-white/70 group-hover:text-white">
                        {btn.icon}
                      </div>
                      <span className="text-sm tracking-wide whitespace-nowrap">
                        {btn.label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Mobile User Section */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center justify-start gap-3 w-full px-3 py-3 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
          >
            <div className="flex items-center justify-center min-w-[20px]">
              <LogOut size={18} />
            </div>
            <span className="text-sm tracking-wide whitespace-nowrap font-medium">
              Sair
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 backdrop-blur-sm border-b border-white/20 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <Menu size={24} className="text-white" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-xl font-black text-white tracking-tight leading-tight modern-header-title" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '900', letterSpacing: '-0.025em' }}>{getPageTitle()}</h1>
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-white/70 modern-header-breadcrumb">
                {getBreadcrumb().map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-white/20 font-thin text-xs mx-2" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '100' }}>/</span>}
                    <span className={`font-semibold tracking-wider transition-all duration-300 ${
                      index === getBreadcrumb().length - 1 
                        ? 'text-white font-black text-base' 
                        : 'text-white/60 hover:text-white/80'
                    }`} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: index === getBreadcrumb().length - 1 ? '900' : '600' }}>
                      {item}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm lg:text-base text-white font-semibold tracking-wide modern-header-breadcrumb" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
                {user?.nome || user?.email || 'Usuário'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;