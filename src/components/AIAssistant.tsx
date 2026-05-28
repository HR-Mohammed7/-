import { FormEvent, useRef, useState, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Settings, Key, Copy, Check, Trash2, Image, X, FileText } from 'lucide-react';
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
    content: 'أهلاً بك! أنا المساعد الذكي الخاص بعقد التحول الذكي لشبكة كهرباء واسط. يمكنني الإجابة على أي أسئلة حول البنود، الالتزامات، الغرامات، وفترات العقد. تفضل بسؤالي، أو اختر أحد الأسئلة المقترحة.'
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        if (response.status === 413) {
          throw new Error('حجم الصورة المرفقة كبير جداً. يرجى محاولة استخدام صورة بحجم أصغر.');
        }
        throw new Error(textResponse.slice(0, 150) || `خطأ في الاتصال بالخادم: ${response.status}`);
      }
      
      if (!response.ok) {
        if (data.error && data.error.includes('429')) {
           throw new Error('تم تجاوز الحد المسموح للاستخدام المجاني (Rate Limit). يرجى المحاولة بعد قليل، أو إدخال مفتاح API الخاص بك من الإعدادات لرفع القيود.');
        }
        if (data.error && (data.error.includes('503') || data.error.includes('demand'))) {
           throw new Error('النظام يواجه ضغطاً عالياً حالياً (High Demand). يرجى المحاولة مرة أخرى خلال ثوانٍ قليلة.');
        }
        throw new Error(data.error || 'Network response was not ok');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || data.error || 'عذراً لا يمكنني الإجابة الآن.'
      };

      setMessages(prev => [...prev, assistantMessage]);
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[500px]">
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base leading-tight flex items-center gap-2 flex-wrap">
              <span>مساعد العقد الذكي</span>
              <span className="text-[10px] md:text-xs bg-slate-100 text-slate-600 font-normal px-2 py-0.5 rounded-full border border-slate-200">
                تم البرمجة بواسطة محمد خالد
              </span>
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500">مدعوم بواسطة Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleClearChat}
            className="p-1.5 md:p-2 rounded-lg transition-colors border-2 bg-white border-transparent text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-1.5 md:p-2 rounded-lg transition-colors border-2",
              showSettings ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
            title="إعدادات المفتاح"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-sm">
          <div className="max-w-md">
            <label className="flex items-center gap-2 font-semibold text-slate-700 mb-2">
              <Key className="w-4 h-4 text-slate-500" />
              مفتاح Gemini API مخصص (اختياري)
            </label>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              إذا توقف النظام عن العمل بسبب كثرة الاستخدام المجاني، يمكنك إدخال مفتاح API الخاص بك من موقع <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google AI Studio</a> للحصول على استخدام غير محدود. يتم حفظه في متصفحك فقط.
            </p>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={customApiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="w-full text-left p-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-blue-500 text-slate-700 font-mono text-sm"
              dir="ltr"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "flex gap-2 md:gap-3 max-w-[95%] md:max-w-[85%]",
              message.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
            )}
          >
            <div className={cn(
              "w-7 h-7 md:w-8 md:h-8 flex-shrink-0 flex items-center justify-center rounded-full mt-1 border",
              message.role === 'user' ? "bg-slate-200 border-slate-300" : "bg-white border-slate-200"
            )}>
              {message.role === 'user' ? <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" /> : <span className="text-base md:text-lg">🤖</span>}
            </div>
            
            <div className={cn(
              "p-3 md:p-4 rounded-xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap border group relative",
              message.role === 'user' 
                ? "bg-slate-900 text-white rounded-tl-sm border-slate-800 shadow-sm font-medium" 
                : "bg-white text-slate-800 rounded-tr-sm border-slate-200 shadow-sm"
            )}>
              {message.role === 'user' ? (
                <div className="flex flex-col gap-2">
                  {message.attachment && (
                    <div className="max-w-[240px] rounded-md overflow-hidden border border-slate-700 bg-slate-800 shadow-sm">
                      {message.attachmentType === 'application/pdf' ? (
                        <div className="p-4 flex flex-col items-center gap-2 bg-slate-800 text-slate-200">
                          <FileText className="w-12 h-12 text-red-400" />
                          <span className="text-xs font-medium truncate w-full text-center">مستند PDF مرسل</span>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = message.attachment!;
                              link.target = '_blank';
                              link.click();
                            }}
                            className="text-[10px] bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors"
                          >
                            عرض المستند
                          </button>
                        </div>
                      ) : (
                        <img 
                          src={message.attachment} 
                          alt="الملف المرفق" 
                          className="max-h-48 w-full object-contain cursor-zoom-in hover:brightness-95 transition-all"
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            const w = window.open();
                            if (w) {
                              w.document.write(`<img src="${message.attachment}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                              w.document.body.style.backgroundColor = '#0f172a';
                              w.document.body.style.margin = '0';
                              w.document.body.style.display = 'flex';
                              w.document.body.style.alignItems = 'center';
                            }
                          }}
                        />
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="absolute top-2 left-2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80"
                    title="نسخ المحادثة"
                  >
                    {copiedId === message.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <div className="markdown-body pt-1">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pr-5 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pr-5 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] ml-auto">
             <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full mt-1 bg-white border border-slate-200">
               <span className="text-lg">🤖</span>
             </div>
             <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl rounded-tr-sm text-slate-500 flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
               <span className="text-xs font-medium">يتم تحليل العقد وتجهيز الإجابة...</span>
             </div>
          </div>
        )}
        
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-wrap gap-2 mt-6 justify-start ml-auto max-w-[85%] pr-11">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(suggestion)}
                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 transition-colors font-medium flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-5 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
        {selectedFile && (
          <div className="mb-3 flex items-center justify-between bg-slate-50 p-2 md:p-3 rounded-lg border border-slate-200 animate-in fade-in duration-200" dir="rtl">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative group shrink-0">
                {selectedFile.mimeType === 'application/pdf' ? (
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-md border border-red-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                  </div>
                ) : (
                  <img 
                    src={selectedFile.dataUrl} 
                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md border border-slate-300 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="text-right truncate">
                <p className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400">سيتم إرسال المستند للتحليل الذكي</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-red-600 rounded-full transition-colors shrink-0"
              title="إلغاء المرفق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
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
            className={cn(
              "p-2 md:p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center shrink-0",
              selectedFile ? "text-blue-600 bg-blue-50 border-blue-200" : ""
            )}
            title="إرفاق صورة أو مستند PDF"
          >
            <Image className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن العقد، أو أرفق مستند PDF لتحليله..."
            className="flex-1 p-2 md:p-3 px-3 md:px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-xs md:text-sm text-right"
            dir="rtl"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedFile)}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs md:text-sm flex gap-2 items-center shrink-0"
          >
            <span className="hidden sm:inline">إرسال</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}
