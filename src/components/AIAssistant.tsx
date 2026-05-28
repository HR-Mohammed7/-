import { FormEvent, useRef, useState, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Settings, Key, Copy, Check, Trash2, Image, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTIONS = [
  "ما هي مدة العقد وفترات السماح؟",
  "ماهي التزامات الطرف الأول؟",
  "اشرح لي آلية غرامات التأخير",
  "ما هي مؤشرات الأداء المطلوبة؟"
];

export function AIAssistant() {
  const defaultMessage: ChatMessage = {
    id: '1',
    role: 'assistant',
    content: 'أهلاً بك! أنا المساعد الذكي الخاص بعقد التحول الذكي لشبكة كهرباء واسط تم برمجتي بواسطة (محمد خالد) يمكنني الإجابة على أي أسئلة حول البنود، الالتزامات، الغرامات، وفترات العقد. تفضل بسؤالي، أو اختر أحد الأسئلة المقترحة.'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ dataUrl: string; base64: string; mimeType: string; name: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('يرجى اختيار ملف صورة أو مستند PDF صالح فقط.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const parts = dataUrl.split(',');
      const mimeType = file.type;
      const base64 = parts[1];

      setSelectedFile({
        dataUrl,
        base64,
        mimeType,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY');
    if (savedKey) setCustomApiKey(savedKey);
    
    const savedHistory = localStorage.getItem('SMART_CONTRACT_CHAT_HISTORY');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Failed to parse chat history');
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('SMART_CONTRACT_CHAT_HISTORY', JSON.stringify(messages));
    } else {
      localStorage.removeItem('SMART_CONTRACT_CHAT_HISTORY');
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('هل أنت متأكد من مسح سجل المحادثة؟')) {
      setMessages([defaultMessage]);
    }
  };

  const handleSaveKey = (key: string) => {
    setCustomApiKey(key);
    if (key.trim()) {
      localStorage.setItem('CUSTOM_GEMINI_API_KEY', key.trim());
    } else {
      localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    }
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    const userMessageText = text.trim() || (selectedFile?.mimeType === 'application/pdf' ? 'يرجى مراجعة هذا المستند المرفق وتلخيص ما جاء فيه أو الإجابة على استفساري حوله.' : 'يرجى مراجعة هذه الصورة المرفقة في سياق بنود العقد وتوضيح تعليقك عنها.');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      attachment: selectedFile?.dataUrl || undefined,
      attachmentType: selectedFile?.mimeType || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    const attachmentPayload = selectedFile ? { base64: selectedFile.base64, mimeType: selectedFile.mimeType } : null;
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          customApiKey: customApiKey.trim() || undefined,
          attachment: attachmentPayload?.base64,
          attachmentType: attachmentPayload?.mimeType
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData: any = {};
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text || `خطأ في الاتصال بالخادم: ${response.status}`);
        }
        
        if (errorData.error && errorData.error.includes('429')) {
           throw new Error('تم تجاوز الحد المسموح للاستخدام المجاني (Rate Limit). يرجى المحاولة بعد قليل، أو إدخال مفتاح API الخاص بك من الإعدادات لرفع القيود.');
        }
        throw new Error(errorData.error || 'Network response was not ok');
      }

      // Handle streaming response
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false); // Stop loading animation since we are starting the stream

      const reader = response.body?.getReader();
      if (!reader) throw new Error('لا يمكن قراءة البيانات من الخادم.');

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Handle potential error messages in the stream
        if (chunk.includes('[ERROR]:')) {
          const errorPart = chunk.split('[ERROR]:')[1];
          throw new Error(errorPart.trim());
        }

        accumulatedText += chunk;
        
        setMessages(prev => prev.map(m => 
          m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
        ));
      }

    } catch (error: any) {
       setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `عذراً، حدث خطأ: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFD] md:bg-transparent overflow-hidden relative">
      {/* Premium Apple Header */}
      <header className="z-20 backdrop-blur-3xl bg-white/60 border-b border-black/[0.03] p-4 md:p-5 flex items-center justify-between sticky top-0 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-black/[0.03] group-hover:scale-105 transition-transform duration-500">
              <Bot className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div>
            <h2 className="font-bold text-[#1D1D1F] text-sm md:text-base tracking-tight leading-none mb-1">المساعد العقدي الذكي</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-black/40 font-bold tracking-tight">تم تطوير هذا النظام بواسطة محمد خالد</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.03)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2.5 rounded-xl transition-all font-medium",
              showSettings ? "bg-black/5 text-blue-600" : "text-black/30 hover:text-black"
            )}
            title="الإعدادات"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(239,68,68,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearChat}
            className="p-2.5 rounded-xl transition-all text-black/30 hover:text-red-500"
            title="مسح السجل"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-20 left-4 right-4 z-30 bg-white/80 backdrop-blur-3xl border border-black/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-6 md:p-8"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <Key className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">تكوين المفتاح السحابي</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/30">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs text-black/50 leading-relaxed font-medium">
                  للحصول على استجابات أسرع وتحليل أعمق للمستندات، يفضل استخدام مفتاح API خاص بك من Google AI Studio.
                </p>
                <div className="relative group">
                  <input 
                    type="password"
                    placeholder="أدخل مفتاح Google AI Studio..."
                    value={customApiKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    className="w-full text-left p-4 pr-11 rounded-2xl bg-black/[0.02] border border-black/[0.08] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 text-[#1D1D1F] font-mono text-xs transition-all shadow-inner"
                    dir="ltr"
                  />
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-50" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-8 md:py-12 bg-[#FBFBFD] scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-14">
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((message) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className={cn(
                  "flex gap-4 md:gap-8 w-full group",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-9 h-9 md:w-11 md:h-11 flex-shrink-0 flex items-center justify-center rounded-2xl shadow-sm border transition-all duration-500",
                  message.role === 'user' 
                    ? "bg-white border-black/[0.05] text-black/30 group-hover:bg-black group-hover:text-white" 
                    : "bg-blue-600 border-blue-500 text-white shadow-blue-200 group-hover:rotate-[10deg] shadow-blue-500/20 shadow-lg"
                )}>
                  {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 shadow-sm" />}
                </div>
                
                <div className={cn(
                  "flex-1 min-w-0 max-w-[85%] md:max-w-2xl",
                  message.role === 'user' ? "text-left" : "text-right"
                )}>
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
                      {message.role === 'user' ? 'المستخدم' : 'الذكاء الاصطناعي'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-black/20"></span>
                    <span className="text-[9px] font-bold text-black/40">
                      {new Date(parseInt(message.id)).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className={cn(
                    "rounded-[24px] px-5 py-4 md:px-7 md:py-6 text-sm md:text-[15px] leading-[1.7] transition-all shadow-sm group/bubble relative",
                    message.role === 'user' 
                      ? "bg-black text-white rounded-tl-none shadow-black/5" 
                      : "bg-white border border-black/[0.04] text-[#1D1D1F] rounded-tr-none shadow-[0_2px_15px_rgba(0,0,0,0.02)]"
                  )}>
                    {message.role === 'user' && message.attachment && (
                      <div className="mb-4 max-w-sm rounded-[18px] overflow-hidden border border-white/10 shadow-lg bg-white/5 backdrop-blur-md self-end block ml-auto">
                        {message.attachmentType === 'application/pdf' ? (
                          <div className="p-4 flex items-center gap-4">
                            <div className="w-12 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shrink-0">
                              <FileText className="w-7 h-7 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0 text-right" dir="rtl">
                              <p className="text-xs font-black truncate text-white">ملخص العقد المراد تحليله</p>
                              <button 
                                onClick={() => window.open(message.attachment, '_blank')}
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold mt-1.5 flex items-center gap-1 group/btn"
                              >
                                عرض المستند
                                <div className="w-1 h-1 rounded-full bg-blue-400 group-hover/btn:scale-150 transition-transform"></div>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={message.attachment} 
                            alt="المرفق" 
                            className="max-h-72 w-full object-contain cursor-zoom-in hover:brightness-105 transition-all duration-500"
                            onClick={() => window.open(message.attachment, '_blank')}
                          />
                        )}
                      </div>
                    )}
                    
                    <div className={cn(
                      "markdown-body",
                      message.role === 'user' ? "text-white/90" : "text-[#1D1D1F]/90"
                    )}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({...props}) => <p className="mb-4 last:mb-0" {...props} />,
                          ul: ({...props}) => <ul className="list-disc pr-6 mb-4 space-y-2.5" {...props} />,
                          ol: ({...props}) => <ol className="list-decimal pr-6 mb-4 space-y-2.5" {...props} />,
                          strong: ({...props}) => <strong className={cn("font-bold", message.role === 'user' ? "text-white" : "text-black")} {...props} />,
                          blockquote: ({...props}) => <blockquote className="border-r-4 border-blue-500/30 pr-5 my-5 italic opacity-80" {...props} />,
                          code: ({...props}) => <code className="bg-black/5 px-2 py-0.5 rounded-md font-mono text-[0.85em] border border-black/5" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {message.role === 'assistant' && (
                      <div className="mt-6 pt-4 border-t border-black/[0.04] flex justify-between items-center">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="flex items-center gap-2 p-2 rounded-lg text-black/30 hover:text-black hover:bg-black/[0.03] transition-all text-[11px] font-bold"
                          >
                            {copiedId === message.id ? (
                              <><Check className="w-3.5 h-3.5 text-emerald-500" /> تم النسخ</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> نسخ الإجابة</>
                            )}
                          </button>
                        </div>
                        <Sparkles className="w-3.5 h-3.5 text-blue-500/20" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 md:gap-8 w-full"
            >
               <div className="w-9 h-9 md:w-11 md:h-11 bg-white border border-black/[0.03] rounded-2xl flex items-center justify-center shadow-sm shadow-black/5">
                 <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
               </div>
               <div className="flex-1 pt-1">
                 <div className="flex items-center gap-4">
                   <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                   <span className="text-[11px] font-black uppercase tracking-widest text-black/30">Thinking Deeply...</span>
                 </div>
                 <div className="mt-3 flex gap-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className={`h-1.5 w-${i === 2 ? '12' : '6'} bg-black/[0.03] rounded-full animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                   ))}
                 </div>
               </div>
            </motion.div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="pt-10 flex flex-col items-center">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-white rounded-[24px] shadow-2xl shadow-blue-500/10 border border-black/[0.02] flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-[#1D1D1F] mb-2 tracking-tight">كيف يمكنني مساعدتك اليوم؟</h3>
                <p className="text-xs text-black/40 font-medium max-w-xs mx-auto leading-relaxed">
                  يمكنك الاستفسار عن بنود العقد، رفع مستندات PDF للمقارنة، أو طلب تحليل مالي دقيق.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,1)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(suggestion)}
                    className="p-5 text-right bg-white/70 border border-black/[0.04] rounded-[24px] transition-all group shadow-sm flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 h-full flex flex-col justify-between">
                      <p className="text-[13px] text-[#1D1D1F] font-bold leading-relaxed">{suggestion}</p>
                      <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-4">Ask Neural Assistant</span>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="w-3.5 h-3.5 text-blue-500 rotate-180" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} className="h-40 md:h-48" />
      </div>

      {/* Input Area - Integrated in Flex Flow */}
      <div className="px-4 md:px-6 pb-6 md:pb-10 pt-2 shrink-0 bg-[#FBFBFD] md:bg-transparent border-t border-black/[0.03] md:border-t-0">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mb-3 flex items-center justify-between bg-white border border-black/[0.08] p-3 rounded-[20px] shadow-sm"
                dir="rtl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-black/5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    {selectedFile.mimeType === 'application/pdf' ? (
                      <FileText className="w-5 h-5 text-red-500" />
                    ) : (
                      <img src={selectedFile.dataUrl} className="w-10 h-10 object-cover rounded-xl" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-[#1D1D1F] truncate">{selectedFile.name}</p>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">جاهز للتحليل</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="w-7 h-7 flex items-center justify-center bg-black/5 hover:bg-red-500 hover:text-white text-black/40 rounded-full transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <form 
              onSubmit={handleSubmit} 
              className="relative bg-white border border-black/[0.08] shadow-[0_2px_15px_rgba(0,0,0,0.02)] rounded-[24px] p-1.5 flex items-end gap-1 transition-all focus-within:border-black/20 focus-within:shadow-md"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 text-black/30 hover:text-black hover:bg-black/5 transition-all rounded-xl shrink-0"
              >
                <Image className="w-5 h-5" />
              </button>

              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() || selectedFile) sendMessage(input);
                  }
                }}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 bg-transparent border-none py-3 px-2 focus:ring-0 text-[14px] md:text-[15px] text-right leading-relaxed resize-none min-h-[44px] max-h-32 scrollbar-hide text-[#1D1D1F] placeholder:text-black/20"
                dir="rtl"
                disabled={isLoading}
              />

              <motion.button 
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={isLoading || (!input.trim() && !selectedFile)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-[18px] transition-all duration-300 shrink-0",
                  (input.trim() || selectedFile) && !isLoading
                    ? "bg-black text-white shadow-sm"
                    : "bg-black/[0.03] text-black/10 cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4 rotate-180" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
