import { useState, useEffect, useCallback } from 'react'; import { Settings as SetIcon, Building2, Bell, Database, Save, Download, Upload, Clock, Wifi, WifiOff } from 'lucide-react'; import { toast } from 'sonner';

export default function Settings() {
  // القاعدة الذهبية: الـ IP المركزي لسحب الإعدادات وتوحيدها
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;
  
  const [s, setS] = useState<any>({ name: 'المكتب', owner: 'المدير', n: { s: true, f: true, days: 1 } });
  const [isNet, setIsNet] = useState(false);

  // وظيفة المزامنة لجلب الإعدادات الموحدة من السيرفر
  const syncSettings = useCallback(async (dataToPost?: any) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      
      if (dataToPost) {
        await fetch(`${BASE_URL}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...JSON.parse(localStorage.getItem('full_db') || '{}'), settings: dataToPost })
        });
      }

      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) {
        const full = await res.json();
        const serverSettings = full.settings || s;
        setS(serverSettings);
        localStorage.setItem('office_settings', JSON.stringify(serverSettings));
        localStorage.setItem('full_db', JSON.stringify(full));
        setIsNet(true);
      }
    } catch { setIsNet(false); }
  }, [BASE_URL]);

  useEffect(() => { syncSettings(); }, [syncSettings]);

  const save = async (e: any) => {
    e.preventDefault();
    localStorage.setItem('office_settings', JSON.stringify(s));
    await syncSettings(s); // حفظ للسيرفر فوراً
    toast.success('تم حفظ الإعدادات ومزامنتها مع الشبكة');
  };

  const exp = () => {
    const fullData = JSON.parse(localStorage.getItem('full_db') || '{}');
    const b = new Blob([JSON.stringify(fullData)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `Lawyer_Backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
    toast.success('تم تصدير نسخة شاملة من القاعدة المركزية');
  };

  const imp = (e: any) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async (ev: any) => {
      try {
        const d = JSON.parse(ev.target.result);
        localStorage.setItem('full_db', JSON.stringify(d));
        // توزيع البيانات على المخازن المحلية
        if (d.cases) localStorage.setItem('lawyer_cases', JSON.stringify(d.cases));
        if (d.clients) localStorage.setItem('lawyer_clients', JSON.stringify(d.clients));
        if (d.finance) localStorage.setItem('lawyer_transactions', JSON.stringify(d.finance));
        if (d.settings) { localStorage.setItem('office_settings', JSON.stringify(d.settings)); setS(d.settings); }
        
        await syncSettings(d.settings); // رفع النسخة المستعادة للسيرفر
        toast.success('تمت استعادة القاعدة بالكامل');
        setTimeout(() => window.location.reload(), 800);
      } catch { toast.error('ملف غير صالح'); }
    };
    r.readAsText(f);
  };

  return (
    <div className="p-4 space-y-6 text-right font-arabic" dir="rtl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            إعدادات النظام {isNet ? <Wifi className="w-5 h-5 text-green-500 animate-pulse" /> : <WifiOff className="w-5 h-5 text-slate-300" />}
          </h1>
          <p className="text-xs text-slate-400 font-bold">
            {isNet ? `التحكم المركزي مفعل: ${currentIp}` : 'تعديل الإعدادات المحلية فقط'}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
          <SetIcon className={`w-8 h-8 ${isNet ? 'text-amber-500 animate-[spin_4s_linear_infinite]' : 'text-slate-300'}`} />
        </div>
      </div>

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border-2 border-slate-50 space-y-4 shadow-sm hover:border-amber-100 transition-colors">
            <h2 className="font-bold text-lg flex items-center gap-2 border-b pb-3 text-slate-700"><Building2 className="w-5 h-5 text-amber-500" /> الهوية والبيانات الرسمية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5"><label className="text-xs font-black text-slate-500 mr-1">اسم مكتب المحاماة</label><input className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-amber-500 focus:bg-amber-50/30 transition-all" value={s?.name} onChange={e => setS({...s, name: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-xs font-black text-slate-500 mr-1">المحامي المدير</label><input className="w-full p-3 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-amber-500 focus:bg-amber-50/30 transition-all" value={s?.owner} onChange={e => setS({...s, owner: e.target.value})} /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-50 space-y-4 shadow-sm">
            <h2 className="font-bold text-lg flex items-center gap-2 border-b pb-3 text-slate-700"><Bell className="w-5 h-5 text-amber-500" /> محرك التنبيهات المسبقة</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg shadow-sm"><Clock className="w-5 h-5 text-amber-600" /></div><span className="text-sm font-black text-slate-700">تنبيهي قبل موعد الجلسة بـ :</span></div>
                <select className="p-2.5 border-2 border-white rounded-xl text-xs font-black outline-none bg-white shadow-sm cursor-pointer" value={s?.n?.days} onChange={e => setS({...s, n: {...s.n, days: parseInt(e.target.value)}})}>
                  <option value="1">يوم واحد (افتراضي)</option><option value="2">يومين</option><option value="3">3 أيام</option><option value="7">أسبوع كامل</option>
                </select>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                <div className="space-y-0.5"><p className="text-sm font-black text-slate-700">الإشعارات الذكية</p><p className="text-[10px] text-slate-400 font-bold">تفعيل تنبيهات المستحقات المالية والجلسات في لوحة التحكم</p></div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="w-6 h-6 accent-amber-500 rounded-lg cursor-pointer" checked={s?.n?.s} onChange={e => setS({...s, n: {...s.n, s: e.target.checked}})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-5 shadow-2xl border-b-[6px] border-amber-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 relative"><Database className="w-5 h-5 text-amber-500" /> <h2 className="font-black text-sm">مركز البيانات السحابي</h2></div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">يمكنك تصدير النسخة الاحتياطية الشاملة أو استعادتها وتعميمها على جميع أجهزة المكتب المرتبطة بالـ IP.</p>
            <button type="button" onClick={exp} className="w-full py-3.5 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-400 active:scale-95 transition-all shadow-lg"><Download className="w-4 h-4" /> تصدير القاعدة الكاملة</button>
            <label className="w-full py-3.5 bg-white/5 border-2 border-white/10 border-dashed rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all"><Upload className="w-4 h-4 text-amber-500" /> استعادة قاعدة بيانات <input type="file" className="hidden" accept=".json" onChange={imp} /></label>
          </div>
          <button type="submit" className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-b-4 border-slate-950"><Save className="w-6 h-6 text-amber-500" /> اعتماد وحفظ التغييرات</button>
        </div>
      </form>
    </div>
  );
}