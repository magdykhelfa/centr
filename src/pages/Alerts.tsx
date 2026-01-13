import { useState, useEffect, useCallback } from 'react';
import { Bell, Calendar, DollarSign, Clock, X, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Alerts() {
  // القاعدة الثابتة: سحب الـ IP من صفحة العملاء
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isNet, setIsNet] = useState(false);

  // وظيفة المزامنة لجلب أحدث البيانات من السيرفر قبل فحص التنبيهات
  const syncAndCheck = useCallback(async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) {
        const full = await res.json();
        localStorage.setItem('lawyer_cases', JSON.stringify(full.cases || []));
        localStorage.setItem('lawyer_transactions', JSON.stringify(full.finance || []));
        localStorage.setItem('lawyer_sessions', JSON.stringify(full.sessions || []));
        localStorage.setItem('full_db', JSON.stringify(full));
        setIsNet(true);
      }
    } catch { setIsNet(false); }

    // قراءة البيانات المحدثة
    const cases = JSON.parse(localStorage.getItem('lawyer_cases') || '[]');
    const transactions = JSON.parse(localStorage.getItem('lawyer_transactions') || '[]');
    const systemAlerts: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. فحص الجلسات (من القضايا والجلسات المستقلة)
    cases.forEach((c: any) => {
      const sDate = c.nextSession || c.sessionDate;
      if (sDate === today) {
        systemAlerts.push({
          id: `case-${c.id}`,
          type: 'session',
          title: '⚖️ جلسة اليوم الآن',
          description: `قضية رقم: ${c.number || '---'} | محكمة: ${c.court || 'غير محدد'}`,
          date: sDate,
          time: c.time || '10:00',
          priority: 'high'
        });
      } else if (!sDate && c.status === 'active') {
        systemAlerts.push({
          id: `warn-${c.id}`,
          type: 'case',
          title: '⚠️ قضية بدون تحديث',
          description: `قضية رقم ${c.number || 'جديدة'} لم يتم تحديد موعد جلسة لها`,
          priority: 'medium'
        });
      }
    });

    // 2. فحص المستحقات المترتبة
    transactions.forEach((tx: any) => {
      const remaining = parseFloat(tx.remaining || 0);
      if (remaining > 0) {
        systemAlerts.push({
          id: `pay-${tx.id}`,
          type: 'payment',
          title: '💰 مستحقات مالية',
          description: `العميل: ${tx.client} | متبقي عليه: ${remaining.toLocaleString()} ج.م`,
          priority: 'high'
        });
      }
    });

    setAlerts(systemAlerts);
  }, [BASE_URL]);

  useEffect(() => {
    syncAndCheck();
    const interval = setInterval(() => syncAndCheck(), 15000); // تحديث التنبيهات كل 15 ثانية
    return () => clearInterval(interval);
  }, [syncAndCheck]);

  const filtered = alerts.filter(a => filter === 'all' ? true : a.type === filter);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border-2 border-gold/20 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-arabic text-navy-dark flex items-center gap-2">
            مركز التنبيهات {isNet ? <Wifi className="w-5 h-5 text-success animate-pulse" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isNet ? `متصل بالخزينة الرئيسية: ${currentIp}` : 'شغال على آخر بيانات محفوظة محلياً'}
          </p>
        </div>
        <div className="p-3 bg-gold/10 rounded-full flex items-center gap-3">
            <span className="text-xs font-black text-gold">({alerts.length}) تنبيه</span>
            <Bell className="w-8 h-8 text-gold" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[{id:'all', n:'الكل'}, {id:'session', n:'الجلسات'}, {id:'payment', n:'المستحقات'}, {id:'case', n:'القضايا'}].map(t => (
          <button 
            key={t.id} 
            onClick={() => setFilter(t.id)} 
            className={`px-6 py-2 rounded-xl text-xs font-bold border-2 transition-all whitespace-nowrap ${filter === t.id ? 'bg-gold text-white border-gold shadow-md' : 'bg-white hover:border-gold'}`}
          >
            {t.n}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.length > 0 ? filtered.map((alert) => (
          <div key={alert.id} className={`bg-white rounded-xl p-5 border-r-[6px] shadow-sm flex items-start gap-4 hover:shadow-md transition-all ${alert.priority === 'high' ? 'border-r-red-600' : 'border-r-amber-500'}`}>
            <div className={`p-3 rounded-lg ${alert.type === 'session' ? 'bg-blue-100 text-blue-600' : alert.type === 'payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
              {alert.type === 'session' ? <Calendar className="w-6 h-6" /> : alert.type === 'payment' ? <DollarSign className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-navy-dark">{alert.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">{alert.description}</p>
                </div>
                <button onClick={() => {setAlerts(alerts.filter(a => a.id !== alert.id)); toast.success('تم إخفاء التنبيه');}} className="text-slate-300 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {alert.date && (
                <div className="mt-4 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-md text-[11px] font-bold text-navy-dark border">
                    <Clock className="w-3.5 h-3.5 text-gold" /> {alert.date}
                  </span>
                  {alert.time && (
                    <span className="text-[11px] font-bold text-gold bg-gold/5 px-3 py-1 rounded-md border border-gold/10">
                      الساعة: {alert.time}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-24 bg-white rounded-3xl border-4 border-dashed border-slate-100">
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-200 opacity-20" />
            <p className="text-slate-400 font-bold">كل شيء تمام! لا توجد تنبيهات معلقة</p>
          </div>
        )}
      </div>
    </div>
  );
}