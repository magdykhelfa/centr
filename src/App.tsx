import { useState, useEffect, Suspense, lazy } from 'react'; 
import { Toaster } from "@/components/ui/toaster"; 
import { Toaster as Sonner } from "sonner"; 
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 
import { MainLayout } from "./components/layout/MainLayout"; 
import { GraduationCap, Lock, Fingerprint, ShieldCheck } from 'lucide-react'; 
import { toast } from 'sonner';

// --- تكتيك التحميل الآمن لمنع فشل الـ Build ---
// بنستخدم lazy عشان لو صفحة فيها مشكلة المشروع كله ميفشلش
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Groups = lazy(() => import("./pages/Groups"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Exams = lazy(() => import("./pages/Exams"));
const Parents = lazy(() => import("./pages/Parents"));
const Finance = lazy(() => import("./pages/Finance"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null); 
  const [loading, setLoading] = useState(true); 
  const [form, setForm] = useState({ n: '', p: '', act: '' }); 
  const [deviceId, setDeviceId] = useState(''); 
  const [isActivated, setIsActivated] = useState(false);

  // نظام التوليد الرياضي لكود التفعيل (Math-Based Key)
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
    
    // التحقق من حالة التفعيل
    if (localStorage.getItem('license_key') === generateMathKey(storedId)) setIsActivated(true);
    
    const s = localStorage.getItem('current_edu_user');
    if (s) setUser(JSON.parse(s));
    setLoading(false);
  }, []);

  const handleLogin = (e: any) => {
    e.preventDefault();
    
    // 1. فحص تفعيل الجهاز أولاً
    if (!isActivated) { 
      const expected = generateMathKey(deviceId); 
      if (form.act.trim().toUpperCase() === expected.toUpperCase()) { 
        localStorage.setItem('license_key', expected); 
        setIsActivated(true); 
        toast.success('تم تفعيل البرنامج بنجاح'); 
      } else return toast.error('كود التفعيل غير صحيح لهذا الجهاز'); 
    } 

    // 2. تسجيل دخول المستخدمين (أدمن أو مساعد)
    const all = JSON.parse(localStorage.getItem('edu_users') || '[]');
    
    // حساب الطوارئ لو النظام لسه جديد
    if (all.length === 0 && form.n === "admin" && form.p === "admin") {
        const admin = { name: "المدير العام", user: "admin", password: "admin", role: "admin" };
        localStorage.setItem('edu_users', JSON.stringify([admin]));
        setUser(admin);
        localStorage.setItem('current_edu_user', JSON.stringify(admin));
        return;
    }

    const foundUser = all.find((u: any) => u.user === form.n && u.password === form.p);
    
    if (foundUser) { 
        setUser(foundUser); 
        localStorage.setItem('current_edu_user', JSON.stringify(foundUser)); 
        toast.success(`أهلاً بك يا ${foundUser.name}`);
    } else {
        toast.error('بيانات الدخول خاطئة');
    }
  };

  if (loading) return null;

  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-bold animate-in fade-in duration-500" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border-t-[10px] border-primary text-center">
        <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30 animate-bounce">
          <GraduationCap className="text-white w-10 h-10" />
        </div>
        <h1 className="text-2xl text-slate-800 mb-2 font-black">نظام إدارة السنتر</h1>
        <p className="text-slate-400 text-xs mb-8 font-black">سجل دخولك لبدء العمل</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {!isActivated && (
            <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 text-right space-y-2">
              <label className="text-[10px] text-amber-600 flex items-center gap-1 font-black"><ShieldCheck className="w-3 h-3" /> مطلوب تفعيل الجهاز</label>
              <input required className="w-full p-3 bg-white border-2 border-amber-100 rounded-xl text-center font-mono text-sm outline-none focus:border-amber-500" placeholder="M7-XXXX-XXXX" onChange={(e) => setForm({...form, act: e.target.value})} />
            </div>
          )}
          <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-right outline-none focus:ring-2 ring-primary/20 transition-all font-bold" placeholder="اسم المستخدم" onChange={(e) => setForm({...form, n: e.target.value})} />
          <input type="password" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-right outline-none focus:ring-2 ring-primary/20 transition-all font-bold" placeholder="كلمة المرور" onChange={(e) => setForm({...form, p: e.target.value})} />
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex border-none cursor-pointer items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl shadow-slate-200 mt-2">
            <Lock className="w-4 h-4" /> {isActivated ? 'دخول النظام' : 'تفعيل وتأكيد الدخول'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex flex-col items-center gap-1 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => { navigator.clipboard.writeText(deviceId); toast.info('تم نسخ كود الجهاز'); }}> 
            <span className="text-[9px] text-slate-400 font-black"><Fingerprint className="w-3 h-3 inline ml-1" /> بصمة الجهاز الحالية (اضغط للنسخ)</span> 
            <code className="text-primary font-mono text-[10px] bg-white px-2 py-1 rounded-md">{deviceId}</code> 
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider> 
        <Toaster /> 
        <Sonner position="top-right" />
        <Router>
          <MainLayout user={user} onLogout={() => { localStorage.removeItem('current_edu_user'); setUser(null); }}>
            <Suspense fallback={<div className="h-screen flex items-center justify-center font-black text-slate-400">جاري التحميل...</div>}>
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
            </Suspense>
          </MainLayout>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}; 

export default App;