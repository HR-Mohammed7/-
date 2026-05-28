import { Calendar, CheckCircle2, ShieldAlert, Timer } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] md:text-sm mb-1">مدة العقد</p>
          <p className="text-base md:text-lg font-bold">15 سنة</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] md:text-sm mb-1">فترة التهيئة</p>
          <p className="text-base md:text-lg font-bold">90 يوم</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] md:text-sm mb-1">فترة السماح</p>
          <p className="text-base md:text-lg font-bold text-amber-600">730 يوم</p>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] md:text-sm mb-1">قيمة العقد</p>
          <p className="text-base md:text-lg font-bold text-blue-600">20% مقطوعة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0">
        <section className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-sm md:text-base">الأهداف الرئيسية للمشروع</h2>
          </div>
          <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-3 md:space-y-4">
             <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
               <h3 className="font-bold text-sm mb-1">تأهيل الشبكة الكهربائية</h3>
               <p className="text-sm text-slate-600 leading-relaxed">تأهيل الشبكة في محافظة واسط ورفع كفاءتها ضمن المعايير والمواصفات الوزارية لضمان استمرارية التجهيز وتقليل الأعطال.</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-blue-500">
               <h3 className="font-bold text-sm mb-1">منظومة المقاييس الذكية</h3>
               <p className="text-sm text-slate-600 leading-relaxed">تجهيز وتنصيب وتشغيل منظومة المقاييس الذكية (HES) وربطها لتمكين التبادل ثنائي الاتجاه للبيانات والسيطرة المتقدمة.</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-amber-500">
               <h3 className="font-bold text-sm mb-1">تخفيض الضائعات</h3>
               <p className="text-sm text-slate-600 leading-relaxed">القضاء على التجاوزات وتخفيض الضائعات الفنية والإدارية في مبيعات الطاقة وتحسين واردات الوزارة إلى أقصى حد.</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
               <h3 className="font-bold text-sm mb-1">خدمات المشتركين</h3>
               <p className="text-sm text-slate-600 leading-relaxed">تطوير مستويات الجباية، وإدارة صيانات الشبكة خلال أوقات قياسية، وتقديم خدمات متميزة عبر مراكز متخصصة للمشتركين.</p>
             </div>
          </div>
        </section>

        <section className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm md:text-base">أطراف العقد</h2>
          </div>
          <div className="p-4 md:p-5 space-y-5 md:space-y-6 flex-1">
             <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">1</div>
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-600 mb-1 block">الطرف الأول</span>
                <p className="text-sm font-bold text-slate-900">وزارة الكهرباء العراقية</p>
                <p className="text-xs text-slate-500 mt-1">الشركة العامة لتوزيع كهرباء الوسط / فرع واسط</p>
              </div>
            </div>
            
            <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">2</div>
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-600 mb-1 block">الطرف الثاني</span>
                <p className="text-sm font-bold text-slate-900">شركة قلعة الطارق</p>
                <p className="text-xs text-slate-500 mt-1">للمقاولات والتجارة العامة</p>
              </div>
            </div>
            
            <div className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-bold"><Calendar className="w-4 h-4"/></div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 mb-1 block">تاريخ الإبرام</span>
                <p className="text-sm font-bold text-slate-900">3 أكتوبر 2024</p>
              </div>
            </div>
          </div>
          <div className="p-4 mt-auto border-t border-slate-100">
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition">تحميل ملخص PDF</button>
          </div>
        </section>
      </div>
    </div>
  );
}
