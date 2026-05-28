import { AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';

export function Financials() {
  return (
    <div className="space-y-4 md:space-y-6 flex-1 flex flex-col">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="bg-blue-50 p-2 md:p-3 rounded-xl border border-blue-100 shrink-0">
               <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div className="pt-0.5 md:pt-1">
               <p className="text-slate-500 text-[10px] md:text-sm mb-1 uppercase font-semibold">قيمة العقد (رسم الخدمة)</p>
               <p className="text-base md:text-xl font-bold text-slate-800 leading-tight">20% من مبالغ الجباية الشهرية (عدا الحكومي)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0">
        <section className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
          <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-sm md:text-base">مؤشرات الأداء الرئيسية (KPIs)</h2>
          </div>
          <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 md:space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">السنة الأولى والثانية</h4>
              <div className="space-y-4">
                <KPIRow label="مؤشر منظومة المقاييس الذكية" value={35} />
                <KPIRow label="مؤشر الجباية" value={35} />
                <KPIRow label="مؤشر الصيانة" value={15} />
                <KPIRow label="مؤشر الشكاوى" value={15} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">بعد السنة الثانية</h4>
              <div className="space-y-4">
                <KPIRow label="مؤشر الجباية" value={35} />
                <KPIRow label="مؤشر الصيانة" value={30} />
                <KPIRow label="مؤشر الشكاوى" value={25} />
                <KPIRow label="إدامة وإدارة المنظومة" value={10} />
              </div>
            </div>
          </div>
        </section>

        <div className="lg:col-span-6 flex flex-col gap-4 md:gap-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              <h2 className="font-bold text-slate-800 text-sm md:text-base">أهداف تخفيض الضائعات</h2>
            </div>
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-700 text-xs md:text-sm">نهاية السنة الثانية</span>
                <span className="font-bold text-base md:text-lg text-emerald-600">≤ 14%</span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-700 text-xs md:text-sm">السنة الثالثة وما بعدها</span>
                <span className="font-bold text-base md:text-lg text-emerald-600">≤ 8%</span>
              </div>
              <div className="p-3 md:p-4 bg-slate-50 rounded-lg border-r-4 border-amber-500 text-[11px] md:text-sm text-slate-600 leading-relaxed font-medium">
                في حال تجاوز الحد المسموح به، يتم استقطاع قيمة الطاقة الضائعة الزائدة.
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
               <h2 className="font-bold text-slate-800 text-sm md:text-base">الغرامات الأساسية</h2>
            </div>
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
               <div className="p-3 md:p-4 bg-slate-50 rounded-lg border-r-4 border-amber-500">
                 <h3 className="font-bold text-xs md:text-sm mb-1">تأخير أعمال التأهيل</h3>
                 <p className="text-[11px] md:text-sm text-slate-600">خصم 10% من قيمة الأعمال غير المنجزة.</p>
               </div>
               <div className="p-3 md:p-4 bg-slate-50 rounded-lg border-r-4 border-amber-500">
                 <h3 className="font-bold text-xs md:text-sm mb-1">استبدال المحولات</h3>
                 <p className="text-[11px] md:text-sm text-slate-600">250 ألف دينار عن كل ساعة تأخير بعد مهلة 4 ساعات.</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KPIRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div 
          className="bg-blue-500 h-1.5 rounded-full" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
