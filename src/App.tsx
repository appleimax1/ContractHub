import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Building2, Users, Wrench, Hash, BookOpen, Clock, Package, Menu, X, Settings, Calculator } from 'lucide-react';
import GeneratorPage from './pages/GeneratorPage';
import CompaniesPage from './pages/CompaniesPage';
import ClientsPage from './pages/ClientsPage';
import FieldBuilderPage from './pages/FieldBuilderPage';
import NumeratorsPage from './pages/NumeratorsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import HistoryPage from './pages/HistoryPage';
import CatalogPage from './pages/CatalogPage';
import SettingsPage from './pages/SettingsPage';
import TaxesPage from './pages/TaxesPage';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { seedDemoData } from './db/seed';

function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { to: '/', icon: Home, label: t('sidebar.generator') },
    { to: '/companies', icon: Building2, label: t('sidebar.companies') },
    { to: '/clients', icon: Users, label: t('sidebar.clients') },
    { to: '/catalog', icon: Package, label: t('sidebar.catalog') },
    { to: '/builder', icon: Wrench, label: t('sidebar.builder') },
    { to: '/numerators', icon: Hash, label: t('sidebar.numerators') },
    { to: '/taxes', icon: Calculator, label: t('sidebar.taxes') },
    { to: '/history', icon: Clock, label: t('sidebar.history') },
    { to: '/knowledge', icon: BookOpen, label: t('sidebar.knowledge') },
    { to: '/settings', icon: Settings, label: t('sidebar.settings') },
  ];

  return (
    <div className="flex h-screen bg-slate-100/70 text-slate-800 flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-sm">
            C
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">ContractHub</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Smart Generator</p>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white p-1 rounded-md focus:outline-none">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out flex flex-col shadow-xl md:shadow-none border-r border-slate-800
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800/80 hidden md:flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 text-lg">
            C
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">ContractHub</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Smart Generator</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon size={19} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Language Switcher Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="bg-slate-800/80 p-1 rounded-xl flex items-center justify-between border border-slate-700/50">
            {['ru', 'kk', 'en'].map((lng) => {
              const isActive = i18n.language === lng || (lng === 'en' && i18n.language === 'en-US');
              const displayLabel = lng === 'kk' ? 'KZ' : lng.toUpperCase();
              return (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50/50 relative z-0">
        {children}
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/builder" element={<FieldBuilderPage />} />
          <Route path="/numerators" element={<NumeratorsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/taxes" element={<TaxesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
