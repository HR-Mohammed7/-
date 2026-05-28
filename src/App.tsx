import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Obligations } from './components/Obligations';
import { Financials } from './components/Financials';
import { AIAssistant } from './components/AIAssistant';
import { ContractDocument } from './components/ContractDocument';
import { Section } from './types';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (section: Section) => {
    setCurrentSection(section);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-[#0F172A] text-white flex items-center justify-between px-4 md:px-8 shrink-0 shadow-md z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg md:hidden transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg hidden sm:flex">W</div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight truncate max-w-[200px] sm:max-w-none">نظام إدارة العقد الذكي</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-slate-300">العقد نشط</span>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700 border border-slate-600"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar 
          currentSection={currentSection} 
          onNavigate={handleNavigate} 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 bg-slate-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full space-y-6 flex-1 flex flex-col">
            {currentSection === 'dashboard' && <Dashboard />}
            {currentSection === 'contract' && <ContractDocument />}
            {currentSection === 'obligations' && <Obligations />}
            {currentSection === 'financials' && <Financials />}
            {currentSection === 'chat' && <AIAssistant />}
          </div>
          
          <footer className="mt-auto pt-8 pb-4 text-center border-t border-slate-200">
            <p className="text-slate-500 text-xs md:text-sm font-medium flex items-center justify-center gap-2">
              <span>جميع الحقوق محفوظة</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-blue-600">تم البرمجة بواسطة محمد خالد</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

