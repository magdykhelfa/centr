import { useState, useEffect } from 'react'; 
import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "sonner"; 
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import { MainLayout } from "./components/layout/MainLayout"; 
import { GraduationCap, Lock, Facebook, Fingerprint, ShieldCheck } from 'lucide-react'; 
import { toast } from 'sonner';

import Dashboard from "./pages/Dashboard"; 
import Students from "./pages/Students"; 
import Groups from "./pages/Groups"; 
import Attendance from "./pages/Attendance"; 
import Sessions from "./pages/Sessions"; 
import Exams from "./pages/Exams"; 
import Parents from "./pages/Parents"; 
import Finance from "./pages/Finance"; 
import Alerts from "./pages/Alerts"; 
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

  const generateMathKey = (id: string) => { 
    if (!id) return ""; 
    const clean = id.replace(/[^A-Z0-9]/gi, ''); 
    const mathPart = (clean.length * 9000) + 555; 
    const reversed = clean.split('').reverse().join('').toUpperCase(); 
    return `M7-${mathPart}-${reversed.slice(0, 8)}`; 
  };

  const generateUUID = () => {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });
  };

  useEffect(() => {
    let storedId = localStorage.getItem('fixed_id');
    if (!storedId) { storedId = generateUUID(); localStorage.setItem('fixed_id', storedId); }
    setDeviceId(storedId);
    if (localStorage.getItem('license_key') === generateMathKey(storedId)) setIsActivated(true);
    const s = localStorage.getItem('current_edu_user');
    if (s) setUser(JSON.parse(s));
    setLoading(false);
  }, []);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (!isActivated) { 
      const expected = generateMathKey(deviceId); 
      if (form.act.trim().toUpperCase() === expected.toUpperCase()) { 
        localStorage.setItem('license_key', expected); 
        setIsActivated(true); 
        toast.success('تم التفعيل بنجاح'); 
      } else return toast.error('كود التفعيل غير صحيح'); 
    } 

    // --- المنطق الجديد للبحث عن المستخدمين ---
    const all = JSON.parse(localStorage.getItem('edu_users') || '[]');
    
    // لو القائمة فاضية تماماً، مسموح فقط بـ admin/admin كمنقذ
    if (all.length === 0) {
        if (form.n === "admin" && form.p === "admin") {
            const admin = { name: "المدير العام", user: "admin", password: "admin", role: "admin" };
            localStorage.setItem('edu_users', JSON.stringify([admin]));
            setUser(admin);
            localStorage.setItem('current_edu_user', JSON.stringify(admin));
            return;
        }
    }

    // البحث في القائمة المحفوظة (سواء أدمن جديد أو مساعد)
    const f = all.find((u: any) => u.user === form.n && u.password === form.p);
    
    if (f) { 
        setUser(f); 
        localStorage.setItem('current_edu_user', JSON.stringify(f)); 
        toast.success(`أهلاً بك يا ${f.name}`);
    } else {
        toast.error('بيانات الدخول خاطئة');
    }
  };

  if (loading) return null;

  if (!user) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-bold animate-in fade-in duration-500" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-primary text-center">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20"><GraduationCap className="text-white w-10 h-10" /></div>
        <h1 className="text-2xl text-slate-800 mb-6 font-black">نظام السنتر التعليمي</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {!isActivated && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-right">
              <label className="text-[10px] text-amber-700 flex items-center gap-1 mb-2 font-black"><ShieldCheck className="w-3 h-3" /> كود تفعيل الجهاز</label>
              <input required className="w-full p-3 border-2 rounded-xl text-center font-mono outline-none focus:border-amber-500" placeholder="M7-XXXX-XXXX" onChange={(e) => setForm({...form, act: e.target.value})} />
            </div>
          )}
          <input required className="w-full p-4 border-2 rounded-2xl text-right outline-none focus:border-primary transition-all" placeholder="اسم المستخدم" onChange={(e) => setForm({...form, n: e.target.value})} />
          <input type="password" required className="w-full p-4 border-2 rounded-2xl text-right outline-none focus:border-primary transition-all" placeholder="كلمة المرور" onChange={(e) => setForm({...form, p: e.target.value})} />
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex border-none cursor-pointer items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl">
            <Lock className="w-4 h-4 text-primary" /> {isActivated ? 'دخول النظام' : 'تفعيل ودخول'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t space-y-4">
          <div className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => { navigator.clipboard.writeText(deviceId); toast.success('تم نسخ كود الجهاز'); }}> 
            <span className="text-[9px] text-slate-400 font-black"><Fingerprint className="w-3 h-3 inline ml-1" /> كود الجهاز (اضغط للنسخ)</span> 
            <code className="text-primary font-mono text-[10px]">{deviceId}</code> 
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider> <Toaster /> <Sonner position="top-right" />
        <Router>
          <MainLayout user={user} onLogout={() => { localStorage.removeItem('current_edu_user'); setUser(null); }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/parents" element={<Parents />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}; 

export default App;