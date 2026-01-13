import { useState, useEffect, useCallback } from 'react';
import { FileBarChart, Download, Printer, Calendar, Briefcase, DollarSign, Users, TrendingUp, FileText, X, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  // القاعدة الثابتة: سحب الـ IP من صفحة العملاء
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [reportData, setReportData] = useState<{title: string, content: any[]} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNet, setIsNet] = useState(false);

  // وظيفة المزامنة قبل استخراج التقرير لضمان أحدث بيانات
  const syncBeforeReport = useCallback(async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) {
        const full = await res.json();
        localStorage.setItem('lawyer_cases', JSON.stringify(full.cases || []));
        localStorage.setItem('lawyer_transactions', JSON.stringify(full.finance || []));
        localStorage.setItem('lawyer_clients', JSON.stringify(full.clients || []));
        localStorage.setItem('full_db', JSON.stringify(full));
        setIsNet(true);
      }
    } catch { setIsNet(false); }
  }, [BASE_URL]);

  useEffect(() => { syncBeforeReport(); }, [syncBeforeReport]);

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    await syncBeforeReport(); // بنعمل تحديث سريع قبل ما نفتح التقرير

    const cases = JSON.parse(localStorage.getItem('lawyer_cases') || '[]');
    const tx = JSON.parse(localStorage.getItem('lawyer_transactions') || '[]');
    const clients = JSON.parse(localStorage.getItem('lawyer_clients') || '[]');

    setTimeout(() => {
      if (type === 'cases') {
        setReportData({ title: 'تقرير القضايا الشامل', content: cases.map((c:any) => ({ 'رقم القضية': c.number, 'الموكل': c.client, 'المحكمة': c.court, 'الحالة': c.status })) });
      } else if (type === 'finance') {
        setReportData({ title: 'التقرير المالي التفصيلي', content: tx.map((t:any) => ({ 'العميل': t.client || 'معاملة عامة', 'المبلغ': t.amount, 'البيان': t.description, 'المتبقي': t.remaining })) });
      } else if (type === 'clients') {
        setReportData({ title: 'سجل العملاء', content: clients.map((cl:any) => ({ 'الاسم': cl.name, 'الهاتف': cl.phone, 'العنوان': cl.address })) });
      }
      setIsGenerating(false);
      toast.success('تم تحديث البيانات واستخراج التقرير');
    }, 800);
  };

  const reportTypes = [
    { id: 'cases', title: 'تقرير القضايا', description: 'حصر شامل لكل القضايا وحالاتها', icon: Briefcase, color: 'from-blue-600 to-blue-400' },
    { id: 'finance', title: 'التقرير المالي', description: 'حسابات الوارد والمنصرف والمبقي', icon: DollarSign, color: 'from-green-600 to-emerald-400' },
    { id: 'clients', title: 'تقرير العملاء', description: 'بيانات التواصل مع جميع الموكلين', icon: Users, color: 'from-purple-600 to-purple-400' },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark font-arabic flex items-center gap-2">
            مركز التقارير الذكي {isNet ? <Wifi className="w-5 h-5 text-success animate-pulse" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
          </h1>
          <p className="text-sm text-muted-foreground font-bold">
            {isNet ? `متصل بالسيرفر: ${currentIp}` : 'عرض التقارير من النسخة المحلية'}
          </p>
        </div>
        {isGenerating && <div className="animate-pulse text-gold font-bold flex items-center gap-2">جاري سحب البيانات...</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border p-6 hover:shadow-xl transition-all group border-b-4 border-b-gold/20">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 shadow-lg text-white`}><report.icon className="w-8 h-8" /></div>
            <h3 className="text-lg font-bold text-navy-dark mb-2">{report.title}</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">{report.description}</p>
            <button onClick={() => generateReport(report.id)} className="w-full py-3 bg-navy-dark text-white rounded-xl hover:bg-gold hover:text-navy-dark transition-all font-bold active:scale-95 shadow-md">معاينة التقرير</button>
          </div>
        ))}
      </div>

      {reportData && (
        <div className="bg-white rounded-2xl border shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
          <div className="bg-navy-dark p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2"><FileBarChart className="text-gold" /> <h2 className="font-bold">{reportData.title}</h2></div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all" title="طباعة"><Printer className="w-5 h-5" /></button>
              <button onClick={() => setReportData(null)} className="bg-red-500/20 hover:bg-red-500 p-2 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-gold/20">
                  {Object.keys(reportData.content[0] || {}).map(key => (
                    <th key={key} className="p-3 text-right text-sm font-bold text-navy-dark">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.content.length > 0 ? reportData.content.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-3 text-sm font-medium text-slate-600">{val}</td>
                    ))}
                  </tr>
                )) : <tr><td colSpan={10} className="p-10 text-center font-bold text-slate-400">لا توجد بيانات مسجلة لهذا التقرير حالياً</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 text-xs font-bold text-slate-400">
            <span>المصدر: {isNet ? 'مزامنة حية' : 'تخزين محلي'}</span>
            <span>•</span>
            <span>تاريخ الاستخراج: {new Date().toLocaleTimeString('ar-EG')} - {new Date().toLocaleDateString('ar-EG')}</span>
            <span>•</span>
            <span>عدد السجلات: {reportData.content.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}