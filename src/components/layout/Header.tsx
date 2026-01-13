import { Bell, Search, User, Briefcase, Users as UsersIcon, Code2, Facebook, Phone, RefreshCw } from 'lucide-react'; 
import { useState, useEffect, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'sonner';

export function Header({ user, onLogout }: { user?: any; onLogout?: () => void }) { 
  const navigate = useNavigate(); 
  const [notifs, setNotifs] = useState<any[]>([]); 
  const [query, setQuery] = useState(''); 
  const [results, setResults] = useState<any[]>([]); 
  const [isSyncing, setIsSyncing] = useState(false);

  const loadAlerts = useCallback(() => { 
    const cases = JSON.parse(localStorage.getItem('lawyer_cases') || '[]'); 
    const sessArr = JSON.parse(localStorage.getItem('lawyer_sessions') || '[]'); 
    const settings = JSON.parse(localStorage.getItem('office_settings') || '{"n":{"days":3}}'); 
    const alertDays = settings.n?.days || 3; 
    const allSess = [...cases.map((c:any)=>({d:c.nextSession, t:c.title})), ...sessArr.map((s:any)=>({d:s.date, t:s.caseTitle}))]; 
    const now = new Date(); now.setHours(0,0,0,0); 
    const alerts = allSess.filter((s:any) => { 
      if (!s.d || s.d === "لم يحدد بعد") return false; 
      const sDate = new Date(s.d); sDate.setHours(0,0,0,0); 
      const diff = Math.ceil((sDate.getTime() - now.getTime()) / 86400000); 
      return diff >= 0 && diff <= alertDays; 
    }).map((s:any, i:number) => ({ id: i, text: `جلسة قريبة: ${s.t}`, date: s.d })); 
    setNotifs(alerts); 
  }, []); 

  useEffect(() => { 
    loadAlerts(); 
    window.addEventListener('storage', loadAlerts); 
    const interval = setInterval(loadAlerts, 5000); 
    return () => { window.removeEventListener('storage', loadAlerts); clearInterval(interval); }; 
  }, [loadAlerts]); 

  const handleManualSync = async () => {
    setIsSyncing(true); toast.success("جاري تحديث الصفحة..."); try { if ((window as any).forceSync) { await (window as any).forceSync(); } loadAlerts(); window.dispatchEvent(new Event('storage')); setTimeout(() => { navigate(0); setIsSyncing(false); }, 500); } catch (e) { setIsSyncing(false); toast.error("تعذر التحديث"); }
  };

  const handleSearch = (q: string) => { 
    setQuery(q); 
    if (!q.trim()) { setResults([]); return; } 
    const cases = JSON.parse(localStorage.getItem('lawyer_cases') || '[]'); 
    const clients = JSON.parse(localStorage.getItem('lawyer_clients') || '[]'); 
    const res = [
      ...cases.filter((c:any) => c.number?.includes(q) || c.title?.includes(q)).map((c:any) => ({ id: c.id, type: 'case', text: `قضية: ${c.number}`, sub: c.title })), 
      ...clients.filter((cl:any) => cl.name?.includes(q) || cl.phone?.includes(q)).map((cl:any) => ({ id: cl.id, type: 'client', text: `عميل: ${cl.name}`, sub: cl.phone }))
    ].slice(0, 5); 
    setResults(res); 
  }; 

  return ( 
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 font-arabic"> 
      <div className="flex-1 max-w-xl text-right relative"> 
        <div className="relative border rounded-xl overflow-hidden shadow-sm bg-slate-50"> 
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> 
          <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="ابحث برقم القضية أو اسم العميل..." className="w-full py-2 pr-10 pl-4 outline-none text-sm font-bold text-slate-600 bg-transparent" /> 
        </div> 
        {results.length > 0 && ( 
          <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] overflow-hidden"> 
            {results.map((r, i) => ( <div key={i} onClick={() => { navigate(r.type === 'case' ? `/cases` : `/clients`); setResults([]); }} className="p-3 hover:bg-slate-50 border-b last:border-0 cursor-pointer flex items-center gap-3 justify-end text-right"> <div> <p className="text-xs font-black text-slate-800">{r.text}</p> <p className="text-[10px] text-slate-400 font-bold">{r.sub}</p> </div> <div className="p-1.5 bg-slate-100 rounded-lg">{r.type === 'case' ? <Briefcase className="w-3 h-3 text-amber-600" /> : <UsersIcon className="w-3 h-3 text-blue-600" />}</div> </div> ))} 
          </div> 
        )} 
      </div> 

      <div className="flex items-center gap-4"> 
        {/* أيقونة المبرمج - أصبحت الأولى مع نص مطور البرنامج */}
        <div className="relative group"> 
          <button className="p-2 rounded-xl hover:bg-blue-50 transition-all group/btn border border-transparent hover:border-blue-100 flex items-center gap-2"> 
            <Code2 className="w-5 h-5 text-slate-500 group-hover/btn:text-blue-600" /> 
            <span className="text-[10px] font-black hidden md:block text-slate-500 group-hover/btn:text-blue-600">مطور البرنامج</span>
          </button> 
          <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden text-center"> 
            <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white"> 
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2"><Code2 className="w-6 h-6 text-white" /></div> 
              <h3 className="font-black text-sm">م/ مجدي خلفه</h3> <p className="text-[10px] text-blue-100 font-bold">مطور أنظمة قانونية ومالية</p> 
            </div> 
            <div className="p-3 space-y-2 bg-white text-right"> 
              <div onClick={() => window.open('https://facebook.com/magdy.khelfa', '_blank')} className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-blue-100"> <Facebook className="w-4 h-4 text-blue-600" /> <span className="text-[11px] font-black text-slate-700">تابعنا على فيسبوك</span> </div> 
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100"> <Phone className="w-4 h-4 text-green-600" /> <span className="text-[11px] font-black text-slate-700">+201005331060</span> </div> 
            </div> 
          </div> 
        </div> 

        {/* زر التحديث - أصبح بجانب المطور بدون نص وبأيقونة فقط */}
        <button onClick={handleManualSync} disabled={isSyncing} className={`p-2 rounded-xl transition-all border ${isSyncing ? 'bg-slate-50 text-slate-300' : 'hover:bg-amber-50 text-slate-500 hover:text-amber-600 border-transparent hover:border-amber-100'}`} title="تحديث سريع">
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>

        {/* التنبيهات */}
        <div className="relative group"> 
          <button className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors"> <Bell className="w-5 h-5 text-slate-500" /> {notifs.length > 0 && <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />} </button> 
          <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"> 
            <div className="p-4 border-b border-slate-50 text-right bg-slate-50/50"><h3 className="font-black text-slate-800 text-xs">التنبيهات اللحظية</h3></div> 
            <div className="max-h-64 overflow-y-auto"> {notifs.length === 0 ? <div className="p-8 text-center text-xs text-slate-400 font-bold">لا يوجد مواعيد قريبة</div> : notifs.map((n) => <div key={n.id} className="p-4 hover:bg-amber-50 border-b last:border-0 text-right cursor-pointer" onClick={() => navigate('/sessions')}><p className="text-[11px] text-slate-800 font-black">{n.text}</p><p className="text-[9px] text-amber-600 font-bold mt-1">الموعد: {n.date}</p></div>)} </div> 
          </div> 
        </div> 

        {/* البروفايل */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 cursor-pointer" onClick={onLogout}> 
          <div className="text-right"><p className="text-xs font-black text-slate-800">{user?.name || 'أستاذنا'}</p><p className="text-[9px] font-bold text-slate-400 uppercase">مدير النظام</p></div> 
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-sm">{user?.name?.charAt(0) || 'M'}</div> 
        </div> 
      </div> 
    </header> 
  ); 
}