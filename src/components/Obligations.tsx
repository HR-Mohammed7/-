import { useState } from 'react';
import { ShieldCheck, Truck, Users, Wallet, Zap, Settings, BarChart3, PhoneCall, CreditCard, ArrowLeftRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function Obligations() {
  const [view, setView] = useState<'detailed' | 'comparison'>('detailed');

  const comparisonData = [
    {
      domain: 'تجهيز الطاقة والبنية التحتية',
      p1: 'تجهيز طاقة بمعدل ≥ 20 ساعة يومياً وتسليم الشبكة الحالية بموجب محاضر أصولية.',
      p2: 'تأهيل كامل للشبكة خلال 1080 يوماً، وتجهيز ونصب منظومة المقاييس الذكية (HES).',
      icon: Zap
    },
    {
      domain: 'الصيانة والتشغيل',
      p1: 'توفير محولات التوزيع ومعدات الربط الحلقي البديلة خلال السنة الأولى فقط من العقد.',
      p2: 'إجراء كافة الصيانات (وقائية، دورية، طارئة) وتوفير المواد على نفقتها الخاصة (بعد السنة الأولى).',
      icon: Settings
    },
    {
      domain: 'الموارد البشرية',
      p1: 'إعارة موظفين من الملاك الدائم (حوالي موظف لكل 1000 مشترك) للعمل لدى المستثمر.',
      p2: 'تحمل كافة رواتب ومخصصات وامتيازات الموظفين المعارين طيلة مدة العقد.',
      icon: Users
    },
    {
      domain: 'الجباية والإدارة المالية',
      p1: 'إصدار القوائم، وتدقيق الجباية، وتسديد نسبة الـ 20% (رسم الخدمة) للمستثمر شهرياً.',
      p2: 'قراءة المقاييس، توزيع الفواتير، الجباية اليومية للسوق، وتسديد كامل النقد للوزارة يومياً.',
      icon: Wallet
    },
    {
      domain: 'الأداء والضائعات',
      p1: 'مراقبة وتقييم الأداء بناءً على مؤشرات (KPIs) وفرض الغرامات في حال الإخفاق.',
      p2: 'الالتزام بتخفيض الضائعات إلى 14% (نهاية السنة 2) و 8% (نهاية السنة 3) وتحمل كلفة الزيادة.',
      icon: BarChart3
    }
  ];

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* View Toggle */}
      <div className="flex bg-white p-1 rounded-lg border border-slate-200 self-start">
        <button 
          onClick={() => setView('detailed')}
          className={cn(
            "px-4 py-1.5 text-sm font-bold rounded-md transition-all",
            view === 'detailed' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
          )}
        >
          عرض تفصيلي
        </button>
        <button 
          onClick={() => setView('comparison')}
          className={cn(
            "px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2",
            view === 'comparison' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ArrowLeftRight className="w-4 h-4" />
          مقارنة المسؤوليات
        </button>
      </div>

      {view === 'detailed' ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* First Party Obligations */}
          <section className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/30">
              <h2 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                التزامات الطرف الأول (الوزارة)
              </h2>
            </div>
            <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-3 md:space-y-4">
               <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-blue-500">
                <h3 className="font-bold text-sm mb-1">تجهيز الطاقة</h3>
                <p className="text-sm text-slate-600 leading-relaxed">تجهيز المنطقة المشمولة بمعدل ساعات يومي لا يقل عن (20) ساعة، باستثناء الحالات الطارئة والقاهرة.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-blue-500">
                <h3 className="font-bold text-sm mb-1">تسليم الشبكة والمعدات</h3>
                <p className="text-sm text-slate-600 leading-relaxed">تسليم الشبكة الكهربائية بموجب محاضر أصولية وفق الملحق رقم (1)، وتوفير محولات الربط الحلقي خلال السنة الأولى.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-blue-500">
                <h3 className="font-bold text-sm mb-1">إعارة الموظفين</h3>
                <p className="text-sm text-slate-600 leading-relaxed">إعارة عدد من الموظفين للطرف الثاني، مع استمرار صرف رواتبهم من قبل الطرف الثاني وفقاً للآلية المعينة.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-blue-500">
                <h3 className="font-bold text-sm mb-1">الدفع والسداد</h3>
                <p className="text-sm text-slate-600 leading-relaxed">تسديد مستحقات الطرف الثاني وفق الآلية والشروط المنصوص عليها في العقد.</p>
              </div>
            </div>
          </section>

          {/* Second Party Obligations */}
          <section className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
              <h2 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                التزامات الطرف الثاني (المستثمر)
              </h2>
            </div>
            <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-3 md:space-y-4">
               <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
                <h3 className="font-bold text-sm mb-1">تأهيل وصيانة الشبكة</h3>
                <p className="text-sm text-slate-600 leading-relaxed">تأهيل الشبكة خلال 1080 يوماً. وإجراء الصيانة الدورية والطارئة، واستبدال المحولات المعطوبة خلال 4 ساعات كحد أقصى.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
                <h3 className="font-bold text-sm mb-1">المقاييس الذكية</h3>
                <p className="text-sm text-slate-600 leading-relaxed">تجهيز، نصب، وتشغيل منظومة المقاييس الذكية (HES) خلال فترة لا تتجاوز 730 يوماً وتغيير المقاييس للمشتركين مجاناً.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
                <h3 className="font-bold text-sm mb-1">تخفيض الضائعات</h3>
                <p className="text-sm text-slate-600 leading-relaxed">الالتزام بتخفيض مستوى الضائعات إلى نسبة (14%) بنهاية السنة الثانية، وإلى (8%) بنهاية السنة الثالثة.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
                <h3 className="font-bold text-sm mb-1">مراكز الخدمات والشكاوى</h3>
                <p className="text-sm text-slate-600 leading-relaxed">تجهيز وتشغيل مراكز الصيانة، وتلقي الشكاوى على الرقم (159)، ومراكز الجباية مجهزة بالنظام الإلكتروني.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border-r-4 border-emerald-500">
                <h3 className="font-bold text-sm mb-1">الجباية والتسديد</h3>
                <p className="text-sm text-slate-600 leading-relaxed">إصدار الفواتير شهرياً وجباية المبالغ للمناطق المشمولة، وتسديدها بشكل يومي إلى حساب الطرف الأول.</p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Comparison Matrix View */
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 text-sm font-bold border-l border-slate-800">مجال المسؤولية</th>
                  <th className="p-4 text-sm font-bold border-l border-slate-800 w-1/3">الطرف الأول (الوزارة)</th>
                  <th className="p-4 text-sm font-bold w-1/3">الطرف الثاني (المستثمر)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <tr key={idx} className={cn(
                      "border-b border-slate-100 transition-colors hover:bg-slate-50",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    )}>
                      <td className="p-4 border-l border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                            <Icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{row.domain}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 leading-relaxed border-l border-slate-100 align-top">
                        {row.p1}
                      </td>
                      <td className="p-4 text-sm text-slate-600 leading-relaxed align-top">
                        {row.p2}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-amber-50 border-t border-amber-100 mt-auto">
            <p className="text-xs text-amber-800 flex items-center gap-2 font-medium">
              <Users className="w-4 h-4" />
              ملاحظة: تهدف هذه المقارنة إلى توضيح المسؤوليات المتقابلة لضمان توازن المصالح وتحقيق أهداف المشروع.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

