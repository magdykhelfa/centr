import { useState, useMemo, useEffect, useCallback } from 'react'; import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, User, Building, Wifi, WifiOff } from 'lucide-react'; import AddCaseDialog from '@/components/dialogs/AddCaseDialog'; import { toast } from 'sonner';

const initialCases = [ { id: 1, number: '2024/1234', title: 'قضية نزاع ملكية عقارية', type: 'مدني', client: 'أحمد محمد علي', court: 'محكمة الجيزة الابتدائية', department: 'الدائرة 15 مدني', opponent: 'محمود سعيد إبراهيم', role: 'مدعي', degree: 'ابتدائي', openDate: '2024-01-01', status: 'active', nextSession: '2024-01-20', lawyer: 'محمد أحمد' } ];
const typeColors: Record<string, string> = { 'مدني': 'bg-blue-100 text-blue-700', 'جنائي': 'bg-red-100 text-red-700', 'أسرة': 'bg-pink-100 text-pink-700', 'تجاري': 'bg-purple-100 text-purple-700', 'عمالي': 'bg-orange-100 text-orange-700', 'إداري': 'bg-teal-100 text-teal-700' };
const statusStyles: Record<string, string> = { active: 'bg-success/10 text-success', pending: 'bg-warning/10 text-warning', closed: 'bg-muted text-muted-foreground' };
const statusLabels: Record<string, string> = { active: 'نشطة', pending: 'معلقة', closed: 'منتهية' };

export default function Cases() {
  // القاعدة الأولى: سحب الـ IP اللي اتسجل في صفحة العملاء فوراً
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [casesList, setCasesList] = useState(() => { const saved = localStorage.getItem('lawyer_cases'); return saved ? JSON.parse(saved) : initialCases; });
  const [searchTerm, setSearchTerm] = useState(''); const [typeFilter, setTypeFilter] = useState(''); const [statusFilter, setStatusFilter] = useState(''); const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); const [selectedCase, setSelectedCase] = useState<any>(null); const [isNet, setIsNet] = useState(false);

  const syncData = useCallback(async (dataToPost?: any) => { 
    try { 
      const ctrl = new AbortController(); 
      const t = setTimeout(() => ctrl.abort(), 1500); 
      if (dataToPost) { 
        // بنبعت التحديث للسيرفر بناءً على الـ IP المربوط
        await fetch(`${BASE_URL}/update`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ...JSON.parse(localStorage.getItem('full_db') || '{}'), cases: dataToPost }) 
        }); 
      } 
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal }); 
      clearTimeout(t); 
      if (res.ok) { 
        const fullData = await res.json(); 
        setCasesList(fullData.cases || []); 
        localStorage.setItem('lawyer_cases', JSON.stringify(fullData.cases || [])); 
        localStorage.setItem('full_db', JSON.stringify(fullData)); 
        setIsNet(true); 
      } 
    } catch (e) { 
      setIsNet(false); 
    } 
  }, [BASE_URL]);

  useEffect(() => { syncData(); const interval = setInterval(() => syncData(), 10000); return () => clearInterval(interval); }, [syncData]);

  const filteredCases = useMemo(() => { return casesList.filter((c: any) => { const matchesSearch = (c.number || '').includes(searchTerm) || (c.client || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()); const matchesType = typeFilter === '' || c.type === typeFilter; const matchesStatus = statusFilter === '' || c.status === statusFilter; return matchesSearch && matchesType && matchesStatus; }); }, [searchTerm, typeFilter, statusFilter, casesList]);

  const handleAddOrEdit = useCallback(async (data: any) => { const newList = selectedCase ? casesList.map((c: any) => (c.id === selectedCase.id ? { ...c, ...data } : c)) : [{ ...data, id: Date.now(), status: data.status || 'active' }, ...casesList]; setCasesList(newList); localStorage.setItem('lawyer_cases', JSON.stringify(newList)); await syncData(newList); setIsAddDialogOpen(false); setSelectedCase(null); toast.success('تم حفظ التغييرات'); }, [selectedCase, casesList, syncData]);

  const handleDelete = async (id: number) => { if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) { const newList = casesList.filter((c: any) => c.id !== id); setCasesList(newList); localStorage.setItem('lawyer_cases', JSON.stringify(newList)); await syncData(newList); toast.success('تم الحذف بنجاح'); } };

  return (
    <div className="space-y-6">
      <div className="page-header flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-2">
            إدارة القضايا {isNet ? <Wifi className="w-5 h-5 text-success animate-pulse" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isNet ? `متصل بالرئيسي: ${currentIp}` : 'وضع محلي - مزامنة القضايا متوقفة'}
          </p>
        </div>
        <button onClick={() => { setSelectedCase(null); setIsAddDialogOpen(true); }} className="btn-gold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> قضية جديدة
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-card p-4 flex flex-wrap gap-4 border border-border/40">
        <div className="flex-1 min-w-[300px]"><div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder="بحث برقم القضية أو اسم العميل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-10 w-full" /></div></div>
        <select className="input-field w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">جميع الأنواع</option><option value="مدني">مدني</option><option value="جنائي">جنائي</option><option value="أسرة">أسرة</option><option value="تجاري">تجاري</option><option value="عمالي">عمالي</option><option value="إداري">إداري</option></select>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">جميع الحالات</option><option value="active">نشطة</option><option value="pending">معلقة</option><option value="closed">منتهية</option></select>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead><tr className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase border-b border-border"><th className="px-6 py-4">رقم القضية</th><th className="px-6 py-4 text-center">العميل</th><th className="px-6 py-4 text-center">النوع</th><th className="px-6 py-4 text-center">المحكمة</th><th className="px-6 py-4 text-center">الحالة</th><th className="px-6 py-4 text-center">الجلسة القادمة</th><th className="px-6 py-4 text-center">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filteredCases.map((caseItem: any) => (
                <tr key={caseItem.id} className="table-row-hover hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4"><div><span className="font-bold text-foreground">{caseItem.number}</span><p className="text-xs text-muted-foreground mt-0.5">{caseItem.title}</p></div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 justify-center"><User className="w-4 h-4 text-muted-foreground" /><span className="text-foreground text-sm">{caseItem.client}</span></div></td>
                  <td className="px-6 py-4 text-center"><span className={`badge-status px-2 py-1 rounded text-[10px] font-bold ${typeColors[caseItem.type] || 'bg-gray-100'}`}>{caseItem.type}</span></td>
                  <td className="px-6 py-4"><div className="flex flex-col items-center justify-center text-center"><div className="flex items-center gap-1"><Building className="w-3 h-3 text-muted-foreground" /><span className="text-foreground text-xs font-medium">{caseItem.court}</span></div><p className="text-[10px] text-muted-foreground">{caseItem.department}</p></div></td>
                  <td className="px-6 py-4 text-center"><span className={`badge-status px-2 py-1 rounded text-[10px] font-bold ${statusStyles[caseItem.status]}`}>{statusLabels[caseItem.status]}</span></td>
                  <td className="px-6 py-4 text-center"><div className="flex items-center gap-2 justify-center"><Calendar className="w-4 h-4 text-gold" /><span className="text-foreground font-medium text-sm">{caseItem.nextSession}</span></div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 justify-center">
                    <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedCase(caseItem); setIsAddDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(caseItem.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddCaseDialog key={selectedCase ? `edit-${selectedCase.id}` : 'new'} open={isAddDialogOpen} onOpenChange={(o) => { setIsAddDialogOpen(o); if (!o) setSelectedCase(null); }} initialData={selectedCase} onAdd={handleAddOrEdit} />
    </div>
  );
}