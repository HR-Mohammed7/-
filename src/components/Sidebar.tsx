import { BookOpen, DollarSign, Grip, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'motion/react';
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
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-2xl border-l border-black/[0.05] p-4 shrink-0 relative inset-y-0 right-0 z-0 h-full",
      )}>
        <div className="mb-8 px-4 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">القائمة الرئيسية</p>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all text-right group",
                  isActive 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "text-black/50 hover:text-black hover:bg-black/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-white/10" : "bg-black/[0.03] group-hover:bg-black/[0.06]"
                )}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto space-y-6">
          <div className="p-5 bg-black/[0.02] border border-black/[0.05] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-[10px] font-bold text-black/30 mb-2 uppercase tracking-widest">فترة التهيئة</p>
            <div className="text-2xl font-black text-[#1D1D1F] mb-3">90 يوم</div>
            <div className="w-full bg-black/[0.05] h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '10%' }}
                className="bg-black h-full rounded-full"
              ></motion.div>
            </div>
          </div>
          
          <div className="px-4 py-2 pb-6">
            <div className="h-[1px] bg-black/[0.05] w-full mb-4"></div>
            <p className="text-[9px] text-black/20 font-black uppercase tracking-[0.2em] leading-relaxed">
              تم البرمجة بواسطة <span className="text-black/40 block mt-1">محمد خالد</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-3xl border-t border-black/[0.05] px-2 pb-safe pt-2 flex items-center justify-around h-[72px] shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
                isActive ? "text-black" : "text-black/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                isActive ? "bg-black text-white shadow-lg shadow-black/10 scale-105" : "bg-transparent"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter",
                isActive ? "opacity-100" : "opacity-0 invisible h-0"
              )}>
                {item.label.split(' ')[0]} {/* Show short text on mobile if active */}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
