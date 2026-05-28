import React, { useState, useRef, useMemo } from 'react';
import { FileText, Download, ChevronDown, Search, Menu, X, BookOpen, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CONTRACT_DATA } from '../data/contractSections';

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join(' ');
  }
  if (React.isValidElement(node)) {
    return extractText((node.props as any).children);
  }
  return '';
}

function getSnippet(text: string, query: string): string {
  if (!query) return '';
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 40);
  return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
}

function HighlightedText({ text, query }: { text: string, query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</mark> 
          : part
      )}
    </>
  );
}

const CONTRACT_WITH_TEXT = CONTRACT_DATA.map(item => ({
  ...item,
  rawText: item.content
}));

export function ContractDocument() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['preamble']));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return CONTRACT_WITH_TEXT;
    const query = searchQuery.toLowerCase();
    return CONTRACT_WITH_TEXT.filter(section => 
      section.title.toLowerCase().includes(query) || 
      section.rawText.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleSection = (id: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenSections(newOpen);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpenSections(prev => new Set(prev).add(id));
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 h-[calc(100vh-8rem)] relative overflow-hidden">
      
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white z-10 relative">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 md:hidden hover:bg-slate-100 rounded-lg text-slate-600"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 hidden sm:flex">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base md:text-lg">وثيقة العقد الاستثماري</h2>
            <p className="text-xs md:text-sm text-slate-500">تمت ترجمة البنود الأصلية من الوثيقة المرفقة</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs md:text-sm font-semibold shadow-sm whitespace-nowrap">
          <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
          تحميل العقد
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Table of Contents Overlay for Mobile / Sidebar on Desktop */}
        <div className={cn(
          "absolute md:static inset-y-0 right-0 w-64 md:w-72 bg-slate-50 border-l border-slate-200 flex flex-col z-20 transition-transform duration-300 transform",
          isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الفهرس ومحتوى العقد..." 
                className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">محتويات العقد (الفهرس)</h3>
            <ul className="space-y-1 text-sm">
              {filteredSections.map((section) => {
                const snippet = getSnippet(section.rawText, searchQuery);
                const titleMatch = section.title.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                  <li key={`toc-${section.id}`}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full text-right px-3 py-2 rounded-lg transition-colors flex items-start flex-col gap-1.5",
                        openSections.has(section.id) 
                          ? "bg-blue-50 text-blue-700 font-semibold" 
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <BookOpen className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
                        <span className="leading-tight"><HighlightedText text={section.title} query={searchQuery} /></span>
                      </div>
                      {searchQuery && !titleMatch && snippet && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 pr-6 opacity-90 leading-relaxed font-normal text-right w-full">
                          <HighlightedText text={snippet} query={searchQuery} />
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="text-center p-4 text-slate-500 text-sm">
                  لا توجد نتائج مطابقة للبحث.
                </div>
              )}
            </ul>
          </div>
        </div>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/20 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Document Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Title Page Simulation */}
            <div className="bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-xl mb-8 border-t-8 border-t-blue-600">
             <div className="text-center space-y-4">
               <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                 <FileText className="w-10 h-10 text-blue-600" />
               </div>
               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">عقد استثماري<br />مشروع التحول الذكي بالشبكة الكهربائية</h1>
               <p className="text-base md:text-lg font-medium text-slate-600 mb-4">محافظة واسط - فرع توزيع كهرباء واسط</p>
               <div className="inline-block mt-4 px-4 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-medium text-sm">العدد: ع / تحول ذكي / 1 / 2024</div>
             </div>
            </div>

            {/* Contract Clauses Accordions */}
            {CONTRACT_DATA.map((section) => {
              const isOpen = openSections.has(section.id);
              return (
                <div 
                  key={section.id} 
                  id={`section-${section.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex justify-between items-center p-5 text-right font-bold text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-sm shrink-0">
                        <FileText className="w-4 h-4" />
                      </span>
                      {section.title}
                    </span>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-slate-400 transition-transform duration-300",
                      isOpen && "transform rotate-180"
                    )} />
                  </button>
                  
                  {isOpen && (
                    <div className="p-6 border-t border-slate-100 bg-white text-slate-700 leading-relaxed text-sm md:text-base animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="whitespace-pre-wrap"> {/* Rendering text content efficiently */}
                        <HighlightedText text={section.content} query={searchQuery} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}
