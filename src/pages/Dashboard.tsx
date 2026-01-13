import { Briefcase, Users, Calendar, DollarSign, AlertTriangle, BellRing, Wifi, WifiOff } from 'lucide-react'; import { StatCard } from '@/components/dashboard/StatCard'; import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions'; import { RecentCases } from '@/components/dashboard/RecentCases'; import { QuickActions } from '@/components/dashboard/QuickActions'; import { FinanceChart } from '@/components/dashboard/FinanceChart'; import { useState, useEffect, useCallback } from 'react'; import { useNavigate } from 'react-router-dom';

export default function Dashboard() { 
  const navigate = useNavigate(); 
  const [isNet, setIsNet] = useState(false);
  const [d, setD] = useState<any>({ u: null, cases: [], clients: [], alerts: [], finance: 0, today: 0 });

  // القاعدة الثابتة: سحب الـ IP من صفحة العملاء
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  // وظيفة المزامنة الشاملة للداش بورد
  const syncDashboard = useCallback(async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal });
      clearTimeout(t);
      
      if (res.ok) {
        const full = await res.json();
        // تحديث كل المخازن المحلية بالبيانات الجديدة من السيرفر
        localStorage.setItem('lawyer_cases', JSON.stringify(full.cases || []));
        localStorage.setItem('lawyer_clients', JSON.stringify(full.clients || []));
        localStorage.setItem('lawyer_transactions', JSON.stringify(full.finance || []));
        localStorage.setItem('lawyer_sessions', JSON.stringify(full.sessions || []));
        localStorage.setItem('full_db', JSON.stringify(full));
        setIsNet(true);
      }
    } catch { setIsNet(false); }
    
    // بعد المزامنة (أو لو مفيش نت) بنقرأ من الـ LocalStorage عشان نحدث الشاشة
    const user = JSON.parse(localStorage.getItem('current_lawyer_user') || '{}');
    const cases = JSON.parse(localStorage.getItem('lawyer_cases') || '[]');
    const clients = JSON.parse(localStorage.getItem('lawyer_clients') || '[]');
    const trans = JSON.parse(localStorage.getItem('lawyer_transactions') || '[]');
    const sessArr = JSON.parse(localStorage.getItem('lawyer_sessions') || '[]');
    const settings = JSON.parse(localStorage.getItem('office_settings') || '{"n":{"days":1}}');

    const now = new Date(); now.setHours(0,0,0,0);
    const todayStr = new Date().toISOString().split('T')[0];

    const allSessDates = [...cases.map((c:any)=>({d:c.nextSession, t:c.title})), ...sessArr.map((s:any)=>({d:s.date, t:s.caseTitle}))];
    const upcoming = allSessDates.filter((s: any) => {
      if (!s.d || s.d === "لم يحدد بعد") return false;
      const sDate = new Date(s.d); sDate.setHours(0,0,0,0);
      const diff = Math.ceil((sDate.getTime() - now.getTime()) / 86400000);
      return diff >= 0 && diff <= (settings.n?.days || 1);
    });

    const todaySessCount = allSessDates.filter((s: any) => s.d === todayStr).length;
    const totalRem = trans.reduce((acc: number, t: any) => acc + (Number(t.remaining) || 0), 0);

    setD({ u: user, cases, clients, alerts: upcoming, finance: totalRem, today: todaySessCount });
  }, [BASE_URL]);

  useEffect(() => { 
    syncDashboard(); 
    const interval = setInterval(() => syncDashboard(), 10000); // تحديث كل 10 ثواني
    return () => clearInterval(interval); 
  }, [syncDashboard]);

  return ( 
    <div className="space-y-6 text-right font-arabic" dir="rtl">
      <div className="page-header flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm"> 
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            لوحة التحكم {isNet ? <Wifi className="w-5 h-5 text-green-500 animate-pulse" /> : <WifiOff className="w-5 h-5 text-slate-300" />}
          </h1>
          <p className="text-muted-foreground mt-1 font-bold italic text-sm">مرحباً بك، {d.u?.name || 'أستاذنا'}</p>
        </div> 
        <div className={`text-left p-2 rounded-xl border text-[10px] font-black ${isNet ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
          {isNet ? 'السيرفر متصل' : 'وضع أوفلاين'} <span className={`inline-block w-2 h-2 rounded-full ${isNet ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`}></span>
        </div> 
      </div>

      {d.alerts.length > 0 && ( 
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-center justify-between"> 
          <div className="flex items-center gap-3"><div className="bg-amber-500 p-2 rounded-lg text-white"><BellRing className="w-5 h-5" /></div><div><h3 className="font-black text-amber-900 text-sm">تنبيه مواعيد!</h3><p className="text-xs text-amber-700 font-bold">لديك {d.alerts.length} جلسات قريبة مسجلة.</p></div></div> 
          <button onClick={() => navigate('/sessions')} className="bg-amber-600 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-md hover:bg-amber-700 transition-colors">عرض الأجندة</button> 
        </div> 
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"> 
        <StatCard title="إجمالي القضايا" value={d.cases.length} icon={Briefcase} variant="primary" /> 
        <StatCard title="القضايا النشطة" value={d.cases.filter((c:any)=> c.status === 'active').length} icon={Briefcase} variant="gold" /> 
        <StatCard title="العملاء" value={d.clients.length} icon={Users} /> 
        <StatCard title="جلسات اليوم" value={d.today} icon={Calendar} variant="warning" /> 
        <StatCard title="المستحقات" value={d.finance.toLocaleString()} subtitle="ج.م" icon={DollarSign} variant="danger" /> 
        <StatCard title="تنبيهات" value={d.alerts.length} icon={AlertTriangle} /> 
      </div>

      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><UpcomingSessions sessions={d.alerts} /><FinanceChart /></div>
      <RecentCases />
    </div> 
  ); 
}