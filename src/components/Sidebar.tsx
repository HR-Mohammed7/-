import { BookOpen, DollarSign, Grip, MessageSquare, FileText } from 'lucide-react';
import { Section } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentSection, onNavigate, isOpen, onClose }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as Section, label: 'نظرة عامة', icon: Grip },
    { id: 'contract' as Section, label: 'وثيقة العقد', icon: FileText },
    { id: 'obligations' as Section, label: 'الالتزامات التعاقدية', icon: BookOpen },
    { id: 'financials' as Section, label: 'المدفوعات والمالية', icon: DollarSign },
    { id: 'chat' as Section, label: 'المساعد الذكي', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 flex flex-col p-4 shrink-0 transition-transform duration-300 md:relative md:translate-x-0 md:z-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-right font-semibold",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto space-y-4">
        <div className="p-4 bg-slate-900 rounded-xl text-white">
          <p className="text-xs text-slate-400 mb-1">فترة التهيئة</p>
          <div className="text-xl font-bold mb-2">90 يوم</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>
        
        <div className="px-2 py-1 text-center">
          <p className="text-[10px] text-slate-400 font-medium tracking-tight">
            تم البرمجة بواسطة <span className="text-slate-600 block text-xs">محمد خالد</span>
          </p>
        </div>
      </div>
    </aside>
    </>
  );
}
