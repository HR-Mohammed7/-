import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Obligations } from './components/Obligations';
import { Financials } from './components/Financials';
import { AIAssistant } from './components/AIAssistant';
import { ContractDocument } from './components/ContractDocument';
import { Section } from './types';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (section: Section) => {
    setCurrentSection(section);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans overflow-hidden" dir="rtl">
      {/* Premium Apple-style Navbar - Hidden when in chat mode */}
      {currentSection !== 'chat' && (
        <header className="h-14 md:h-16 bg-white/70 backdrop-blur-2xl border-b border-black/[0.05] flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">W</div>
              <h1 className="text-sm md:text-base font-bold tracking-tight text-[#1D1D1F]">نظام إدارة العقد الذكي</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:flex items-center gap-2 bg-black/[0.02] border border-black/[0.05] px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1D1D1F]/40">Active Node</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border border-black/[0.05] shadow-inner"></div>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          currentSection={currentSection} 
          onNavigate={handleNavigate} 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <main className={cn(
          "flex-1 flex flex-col bg-transparent pb-[72px] md:pb-0",
          currentSection === 'chat' ? "overflow-hidden" : "overflow-y-auto scroll-smooth"
        )}>
          <div className={cn(
            "w-full flex-1 flex flex-col min-h-0",
            currentSection === 'chat' ? "" : "p-4 md:p-10"
          )}>
            <div className={cn(
              "mx-auto w-full flex-1 flex flex-col min-h-0",
              currentSection === 'chat' ? "max-w-none" : "max-w-6xl space-y-8"
            )}>
              {currentSection === 'dashboard' && <Dashboard />}
              {currentSection === 'contract' && <ContractDocument />}
              {currentSection === 'obligations' && <Obligations />}
              {currentSection === 'financials' && <Financials />}
              {currentSection === 'chat' && <AIAssistant />}
            </div>
            
            {currentSection !== 'chat' && (
              <footer className="mt-12 pb-8 text-center">
                <div className="max-w-[100px] h-[1px] bg-black/[0.05] mx-auto mb-6"></div>
                <p className="text-[10px] text-black/20 font-black uppercase tracking-widest flex items-center justify-center gap-4">
                  <span>© 2026 WASAT SYSTEMS</span>
                  <span>|</span>
                  <span className="text-black/40">محمد خالد</span>
                </p>
              </footer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

