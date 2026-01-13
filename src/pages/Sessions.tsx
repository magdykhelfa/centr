import { useState, useMemo, useEffect, useCallback } from 'react'; import { Plus, Search, Calendar, Clock, MapPin, ChevronRight, ChevronLeft, Trash2, Edit2, MoreVertical, Wifi, WifiOff } from 'lucide-react'; import AddSessionDialog from '@/components/dialogs/AddSessionDialog'; import { toast } from 'sonner'; import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const initialSessions = [ { id: 1, date: '2026-01-15', time: '10:00', caseNumber: '2024/1234', caseTitle: 'قضية نزاع ملكية', client: 'أحمد محمد علي', court: 'محكمة الجيزة الابتدائية', type: 'مرافعة', status: 'upcoming', notes: 'تقديم مذكرة دفاع' } ];

export default function Sessions() {
  // القاعدة الثابتة: الربط التلقائي بالعنوان المسجل في صفحة العملاء
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [sessionsList, setSessionsList] = useState(() => { const saved = localStorage.getItem('lawyer_sessions'); return saved ? JSON.parse(saved) : initialSessions; });
  const [currentDate, setCurrentDate] = useState(new Date()); const [searchTerm, setSearchTerm] = useState(''); const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); const [editingSession, setEditingSession] = useState<any>(null); const [isNet, setIsNet] = useState(false);

  const syncSessions = useCallback(async (dataToPost?: any) => { 
    try { 
      const ctrl = new AbortController(); 
      const t = setTimeout(() => ctrl.abort(), 1500); 
      if (dataToPost) { 
        // المزامنة باستخدام الـ IP الموحد
        await fetch(`${BASE_URL}/update`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ...JSON.parse(localStorage.getItem('full_db') || '{}'), sessions: dataToPost }) 
        }); 
      } 
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal }); 
      clearTimeout(t); 
      if (res.ok) { 
        const full = await res.json(); 
        setSessionsList(full.sessions || []); 
        localStorage.setItem('lawyer_sessions', JSON.stringify(full.sessions || [])); 
        localStorage.setItem('full_db', JSON.stringify(full)); 
        setIsNet(true); 
      } 
    } catch (e) { 
      setIsNet(false); 
    } 
  }, [BASE_URL]);

  useEffect(() => { syncSessions(); const interval = setInterval(() => syncSessions(), 10000); return () => clearInterval(interval); }, [syncSessions]);

  const monthName = currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }); const todayStr = new Date().toISOString().split('T')[0];

  const days = useMemo(() => { const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDayOfMonth = new Date(year, month, 1).getDay(); const d = []; for (let i = 0; i < firstDayOfMonth; i++) d.push(null); for (let i = 1; i <= daysInMonth; i++) d.push(i); return d; }, [currentDate]);

  const filteredSessions = useMemo(() => { return sessionsList.filter((s: any) => s.caseNumber?.includes(searchTerm) || s.client?.includes(searchTerm) || s.caseTitle?.includes(searchTerm) ); }, [searchTerm, sessionsList]);

  const handleAddOrUpdateSession = async (data: any) => { let newList; if (editingSession) { newList = sessionsList.map((s: any) => s.id === editingSession.id ? { ...data, id: s.id } : s); toast.success('تم تحديث الجلسة بنجاح'); } else { newList = [{ ...data, id: Date.now(), status: 'upcoming' }, ...sessionsList]; toast.success('تم إضافة الجلسة بنجاح'); } setSessionsList(newList); localStorage.setItem('lawyer_sessions', JSON.stringify(newList)); await syncSessions(newList); setEditingSession(null); setIsAddDialogOpen(false); };

  const deleteSession = async (id: number) => { if (window.confirm('هل أنت متأكد من حذف هذه الجلسة؟')) { const newList = sessionsList.filter((s: any) => s.id !== id); setSessionsList(newList); localStorage.setItem('lawyer_sessions', JSON.stringify(newList)); await syncSessions(newList); toast.error('تم حذف الجلسة'); } };

  const openEditDialog = (session: any) => { setEditingSession(session); setIsAddDialogOpen(true); }; const changeMonth = (offset: number) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)); };

  return (
    <div className="space-y-6">
      <div className="page-header flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-2">
            الجلسات والمواعيد {isNet ? <Wifi className="w-5 h-5 text-success animate-pulse" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isNet ? `متصل بالأجندة الرئيسية: ${currentIp}` : 'وضع محلي - مزامنة الجلسات معطلة'}
          </p>
        </div>
        <button onClick={() => { setEditingSession(null); setIsAddDialogOpen(true); }} className="btn-gold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> جلسة جديدة
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl shadow-card p-6 border border-border/40">
          <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-foreground">{monthName}</h2><div className="flex items-center gap-2"><button onClick={() => changeMonth(1)} className="p-2 hover:bg-muted rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button><button onClick={() => changeMonth(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button></div></div>
          <div className="grid grid-cols-7 gap-1">{['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(d => (<div key={d} className="text-center text-xs text-muted-foreground py-2 font-bold">{d}</div>))}{days.map((day, i) => { if (day === null) return <div key={i} className="h-16" />; const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`; const daySessions = sessionsList.filter((s: any) => s.date === dateStr); const isToday = dateStr === todayStr; return (<div key={i} className={`h-16 p-1 rounded-md border text-right transition-all ${isToday ? 'bg-primary text-primary-foreground border-primary' : daySessions.length > 0 ? 'bg-gold/10 border-gold/30' : 'border-border'}`}><span className="text-xs font-bold">{day}</span>{daySessions.slice(0, 1).map((s: any) => (<div key={s.id} className="text-[8px] mt-1 p-0.5 bg-background/40 rounded truncate">{s.time} | {s.caseNumber}</div>))}{daySessions.length > 1 && <div className="text-[7px] text-center mt-0.5">+{daySessions.length - 1} أخرى</div>}</div>); })}</div>
        </div>
        <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border/40">
          <div className="p-4 border-b bg-primary text-primary-foreground text-center font-bold uppercase tracking-wider">جلسات اليوم</div>
          <div className="divide-y divide-border overflow-y-auto max-h-[420px]">{sessionsList.filter((s: any) => s.date === todayStr).length > 0 ? (sessionsList.filter((s: any) => s.date === todayStr).map((s: any) => (<div key={s.id} className="p-4 hover:bg-muted/50 transition-colors"><div className="flex justify-between font-bold text-xs mb-1"><span className="text-foreground">{s.caseNumber}</span><span className="text-gold">{s.time}</span></div><p className="text-[11px] text-muted-foreground line-clamp-1"><MapPin className="inline w-3 h-3 ml-1" />{s.court}</p></div>))) : (<div className="p-10 text-center text-xs text-muted-foreground">لا يوجد جلسات مسجلة لتاريخ اليوم</div>)}</div>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border/40">
        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-4"><h2 className="font-bold text-lg text-foreground">جدول الجلسات التفصيلي</h2><div className="relative"><Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="بحث برقم القضية أو العميل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-9 py-2 text-sm w-72" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-4 font-bold border-b">التاريخ والوقت</th><th className="p-4 font-bold border-b">القضية</th><th className="p-4 font-bold border-b text-center">العميل</th><th className="p-4 font-bold border-b text-center">المحكمة</th><th className="p-4 font-bold border-b text-center">النوع</th><th className="p-4 font-bold border-b text-center">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-border">{filteredSessions.map((s: any) => (<tr key={s.id} className="hover:bg-muted/30 transition-colors"><td className="p-4"><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gold" />{s.date}</div><div className="text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3 inline ml-1" />{s.time}</div></td><td className="p-4"><div className="font-bold text-foreground">{s.caseNumber}</div><div className="text-xs text-muted-foreground line-clamp-1">{s.caseTitle}</div></td><td className="p-4 font-medium text-center">{s.client}</td><td className="p-4 text-xs text-muted-foreground text-center">{s.court}</td><td className="p-4 text-center"><span className="px-2.5 py-1 rounded-md bg-gold/10 text-gold text-[10px] font-black border border-gold/20">{s.type}</span></td><td className="p-4"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger className="p-1.5 hover:bg-muted rounded-full transition-all"><MoreVertical className="w-4 h-4 text-muted-foreground" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-32 font-bold"><DropdownMenuItem onClick={() => openEditDialog(s)} className="cursor-pointer flex items-center gap-2 py-2"><Edit2 className="w-3.5 h-3.5 text-primary" /> تعديل</DropdownMenuItem><DropdownMenuItem onClick={() => deleteSession(s.id)} className="cursor-pointer flex items-center gap-2 py-2 text-destructive"><Trash2 className="w-3.5 h-3.5" /> حذف</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td></tr>))}</tbody>
          </table>
          {filteredSessions.length === 0 && <div className="p-8 text-center text-muted-foreground font-bold">لم يتم العثور على أي جلسات مطابقة للبحث</div>}
        </div>
      </div>
      <AddSessionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddOrUpdateSession} initialData={editingSession} />
    </div>
  );
}