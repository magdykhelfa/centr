import { useState, useEffect } from 'react'; 
import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "sonner"; 
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import { MainLayout } from "./components/layout/MainLayout"; 
import { Scale, Lock, Facebook, Fingerprint, ShieldCheck, Wifi, Save, X } from 'lucide-react'; 
import { toast } from 'sonner';

import Dashboard from "./pages/Dashboard"; 
import Clients from "./pages/Clients"; 
import Cases from "./pages/Cases"; 
import Sessions from "./pages/Sessions"; 
import Finance from "./pages/Finance"; 
import Documents from "./pages/Documents"; 
import Alerts from "./pages/Alerts"; 
import Users from "./pages/Users"; 
import Reports from "./pages/Reports"; 
import Settings from "./pages/Settings"; 
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null); 
  const [loading, setLoading] = useState(true); 
  const [form, setForm] = useState({ n: '', p: '', act: '' }); 
  const [deviceId, setDeviceId] = useState(''); 
  const [isActivated, setIsActivated] = useState(false); 
  const [appMode, setAppMode] = useState<'local' | 'network'>('local');
  const [showIpPanel, setShowIpPanel] = useState(false);
  const [manualIp, setManualIp] = useState(localStorage.getItem('server_ip') || '');

  const generateMathKey = (id: string) => { 
    if (!id) return ""; 
    const clean = id.replace(/-/g, ''); 
    const mathPart = (clean.length * 9000) + 555; 
    const reversed = clean.split('').reverse().join('').toUpperCase(); 
    return `M7-${mathPart}-${reversed.slice(0, 8)}`; 
  };

  // دالة المزامنة الرئيسية - بتجيب من السيرفر وتحدث الـ LocalStorage عشان الصفحات تقرأ منها
  const syncProcess = async () => {
    const currentServer = localStorage.getItem('server_ip') || 'localhost';
    try {
      const res = await fetch(`http://${currentServer}:3000/sync`);
      if (!res.ok) return;
      const serverData = await res.json();
      
      const keys = ['clients', 'cases', 'sessions', 'finance', 'users'];
      let changed = false;

      keys.forEach(key => {
        const serverValue = JSON.stringify(serverData[key] || []);
        if (localStorage.getItem(`lawyer_${key}`) !== serverValue) {
          localStorage.setItem(`lawyer_${key}`, serverValue);
          changed = true;
        }
      });

      if (changed) window.dispatchEvent(new Event('storage'));
    } catch (e) { console.log("Sync Error"); }
  };

  // دالة الحفظ العالمية - دي اللي بتخلي تعديل السكرتيرة يوصلك
  (window as any).saveToServer = async (key: string, data: any) => {
    const currentServer = localStorage.getItem('server_ip') || 'localhost';
    try {
      await fetch(`http://${currentServer}:3000/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key.replace('lawyer_', '')]: data })
      });
      await syncProcess(); // تحديث فوري بعد الحفظ
    } catch (e) { toast.error("خطأ في الاتصال بالسيرفر الرئيسي"); }
  };

  useEffect(() => {
    const currentServer = localStorage.getItem('server_ip') || 'localhost';
    const isAdmin = currentServer === 'localhost' || currentServer === '127.0.0.1';

    const getID = () => {
      fetch(`http://localhost:3000/hardware-id`)
        .then(r => r.json())
        .then(d => {
          if (d.id) { 
            setDeviceId(d.id); 
            if (localStorage.getItem('license_key') === generateMathKey(d.id)) setIsActivated(true); 
          }
        })
        .catch(() => {
          const fb = localStorage.getItem('fixed_id') || "DEV-OFFLINE";
          setDeviceId(fb); 
          if (localStorage.getItem('license_key') === generateMathKey(fb)) setIsActivated(true);
        });
    };

    const init = async () => {
      await syncProcess();
      getID();
      const s = localStorage.getItem('current_lawyer_user');
      if (s) setUser(JSON.parse(s));
      setAppMode(isAdmin ? 'local' : 'network');
      setTimeout(() => setLoading(false), 500);
    };

    init();
    const interval = setInterval(syncProcess, 3000); 
    return () => clearInterval(interval);
  }, []);

  const hL = (e: any) => {
    e.preventDefault();
    if (!isActivated) { 
      const expected = generateMathKey(deviceId); 
      if (form.act.trim().toUpperCase() === expected.toUpperCase()) { 
        localStorage.setItem('license_key', expected); 
        setIsActivated(true); 
        toast.success('تم التفعيل بنجاح'); 
      } 
      else return toast.error('كود التفعيل خطأ'); 
    } 
    const all = JSON.parse(localStorage.getItem('lawyer_users') || '[]');
    const f = all.find((u: any) => u.name.trim().toLowerCase() === form.n.trim().toLowerCase() && (u.password?.toString() || '123') === form.p.toString());
    if (f) { 
      if (f.status === 'inactive') return toast.error('الحساب معطل'); 
      setUser(f); 
      localStorage.setItem('current_lawyer_user', JSON.stringify(f)); 
      toast.success('دخول بنجاح'); 
    } 
    else toast.error('بيانات خاطئة');
  };

  if (loading) return ( <div className="min-h-screen bg-white flex items-center justify-center font-arabic" dir="rtl"> <div className="text-center space-y-4"> <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-bounce"><Scale className="text-white w-10 h-10" /></div> <div className="text-slate-400 font-bold">جاري تحميل النظام...</div> </div> </div> );

  if (!user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-arabic" dir="rtl">
      <Sonner position="top-center" />
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 text-center border-t-4 border-amber-500 relative overflow-hidden">
        {showIpPanel && (
          <div className="absolute inset-0 bg-white/98 z-50 flex flex-col items-center justify-center p-6 animate-in slide-in-from-top duration-300 text-center">
             <button onClick={() => setShowIpPanel(false)} className="absolute top-4 left-4 text-slate-400 hover:text-red-500 border-none bg-transparent cursor-pointer"><X /></button>
             <Wifi className="w-12 h-12 text-amber-500 mb-2 animate-pulse" />
             <h2 className="font-black text-slate-800 mb-1">إعدادات الربط بالشبكة</h2>
             <p className="text-[10px] text-slate-500 mb-4 font-bold">للسكرتيرة: اكتبي IP الجهاز الرئيسي (السيرفر)</p>
             <input value={manualIp} onChange={(e) => setManualIp(e.target.value)} className="w-full p-3 border-2 rounded-xl text-center font-bold mb-4 bg-slate-50 focus:border-amber-500 outline-none transition-all" placeholder="192.168.1.X" />
             <button onClick={() => { if (manualIp.trim()) { localStorage.setItem('server_ip', manualIp.trim()); } else { localStorage.removeItem('server_ip'); } window.location.reload(); }} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-amber-600 border-none cursor-pointer"><Save className="w-4 h-4" /> حفظ البيانات والربط</button>
          </div>
        )}
        <div onClick={() => setShowIpPanel(true)} className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg cursor-pointer hover:rotate-12 transition-transform">
          <Scale className="text-white w-8 h-8" />
        </div>
        <div className="space-y-1 text-center"> 
          <h1 className="text-2xl font-black text-slate-800">نظام المكتب الذكي</h1> 
          <p className="text-slate-400 text-[10px] font-bold">
            {appMode === 'network' ? 'وضعية السكرتيرة: متصل بالسيرفر' : 'وضعية المدير: الجهاز الرئيسي'}
          </p> 
        </div>
        <form onSubmit={hL} className="space-y-4 text-right">
          {!isActivated && ( <div className="p-3 bg-amber-50 rounded-xl border border-amber-200"> <label className="text-[10px] font-black text-amber-700 flex items-center gap-1 mb-1"><ShieldCheck className="w-3 h-3" /> كود تفعيل المازربورد</label> <input required className="w-full p-2 border-2 rounded-lg text-right text-xs font-bold" placeholder="M7-XXXX-XXXX" onChange={(e) => setForm({...form, act: e.target.value})} /> </div> )}
          <input required className="w-full p-3 border-2 rounded-xl text-right font-bold" placeholder="اسم المستخدم" onChange={(e) => setForm({...form, n: e.target.value})} />
          <input type="password" required className="w-full p-3 border-2 rounded-xl text-right font-bold" placeholder="كلمة المرور" onChange={(e) => setForm({...form, p: e.target.value})} />
          <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 shadow-lg border-none cursor-pointer">
            <Lock className="w-4 h-4 text-amber-500" /> {isActivated ? 'دخول للنظام' : 'تفعيل ودخول'}
          </button>
        </form>
        <div className="pt-4 border-t border-slate-50 space-y-3 text-center">
          <a href="https://www.facebook.com/magdy.khallafa" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[11px] text-blue-600 font-black no-underline"><Facebook className="w-4 h-4" /> برمجة وتطوير: مجدي خلفه</a>
          <div className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200 cursor-pointer" onClick={() => { navigator.clipboard.writeText(deviceId); toast.success('تم نسخ كود الجهاز'); }}> 
            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Fingerprint className="w-3 h-3" /> كود المازربورد الحالي</span> 
            <code className="text-amber-600 font-mono text-[10px] break-all">{deviceId || 'جاري جلب الكود...'}</code> 
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider> <Toaster /> <Sonner position="top-left" />
        <Router>
          <MainLayout user={user}>
            <Routes>
              <Route path="/" element={<Dashboard />} /> <Route path="/clients" element={<Clients />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/sessions" element={<Sessions />} /> <Route path="/finance" element={user.role === 'admin' ? <Finance /> : <Navigate to="/" />} />
              <Route path="/documents" element={<Documents />} /> <Route path="/alerts" element={<Alerts />} />
              <Route path="/users" element={user.role === 'admin' ? <Users /> : <Navigate to="/" />} />
              <Route path="/reports" element={user.role === 'admin' ? <Reports /> : <Navigate to="/" />} />
              <Route path="/settings" element={user.role === 'admin' ? <Settings /> : <Navigate to="/" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}; 

export default App;