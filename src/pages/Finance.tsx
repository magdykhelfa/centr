import { useState, useMemo, useEffect, useCallback } from 'react'; import { Plus, Search, TrendingUp, TrendingDown, DollarSign, CreditCard, Trash2, Edit2, MoreVertical, Wifi, WifiOff } from 'lucide-react'; import AddTransactionDialog from '@/components/dialogs/AddTransactionDialog'; import { toast } from 'sonner'; import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Finance() {
  // القاعدة الأولى: لقط الـ IP اللي متسيف في "خزنة" العملاء فوراً
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [isAddOpen, setIsAddOpen] = useState(false); const [editingTransaction, setEditingTransaction] = useState<any>(null); const [searchTerm, setSearchTerm] = useState(''); const [isNet, setIsNet] = useState(false);
  const [transactions, setTransactions] = useState(() => { const saved = localStorage.getItem('lawyer_transactions'); return saved ? JSON.parse(saved) : []; });

  const syncFinance = useCallback(async (dataToPost?: any) => { 
    try { 
      const ctrl = new AbortController(); 
      const t = setTimeout(() => ctrl.abort(), 1500); 
      if (dataToPost) { 
        // الربط باستخدام BASE_URL اللي واخد الـ IP التلقائي
        await fetch(`${BASE_URL}/update`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ...JSON.parse(localStorage.getItem('full_db') || '{}'), finance: dataToPost }) 
        }); 
      } 
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal }); 
      clearTimeout(t); 
      if (res.ok) { 
        const full = await res.json(); 
        setTransactions(full.finance || []); 
        localStorage.setItem('lawyer_transactions', JSON.stringify(full.finance || [])); 
        localStorage.setItem('full_db', JSON.stringify(full)); 
        setIsNet(true); 
      } 
    } catch (e) { 
      setIsNet(false); 
    } 
  }, [BASE_URL]);

  useEffect(() => { syncFinance(); const interval = setInterval(() => syncFinance(), 10000); return () => clearInterval(interval); }, [syncFinance]);

  const handleAddOrUpdate = async (data: any) => { let newList; if (editingTransaction) { newList = transactions.map((t: any) => t.id === editingTransaction.id ? { ...data, id: t.id } : t); toast.success('تم التحديث'); } else { newList = [{ ...data, id: Date.now() }, ...transactions]; toast.success('تمت الإضافة'); } setTransactions(newList); localStorage.setItem('lawyer_transactions', JSON.stringify(newList)); await syncFinance(newList); setEditingTransaction(null); setIsAddOpen(false); };

  const deleteTransaction = async (id: number) => { if (confirm('هل تريد حذف المعاملة؟')) { const newList = transactions.filter((t: any) => t.id !== id); setTransactions(newList); localStorage.setItem('lawyer_transactions', JSON.stringify(newList)); await syncFinance(newList); toast.error('تم الحذف'); } };

  const stats = useMemo(() => { const income = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0); const expenses = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0); const totalReceivables = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, curr: any) => acc + (Number(curr.remaining) || 0), 0); return { income, expenses, net: income - expenses, receivables: totalReceivables }; }, [transactions]);

  const filteredTransactions = transactions.filter((t: any) => (t.description || '').includes(searchTerm) || (t.caseName || '').includes(searchTerm));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="page-header flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div>
          <h1 className="page-title text-2xl font-bold font-arabic flex items-center gap-2">
            الإدارة المالية {isNet ? <Wifi className="w-5 h-5 text-success animate-pulse" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isNet ? `متصل بالخزينة الرئيسية: ${currentIp}` : 'شغال محلي - تأكد من ربط IP العملاء'}
          </p>
        </div>
        <button onClick={() => { setEditingTransaction(null); setIsAddOpen(true); }} className="btn-gold px-6 py-2 rounded-lg flex items-center gap-2 text-base font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"><Plus className="w-5 h-5" /> معاملة جديدة</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-success to-emerald-400 text-white p-5 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"><div><p className="text-sm opacity-90 font-bold">إجمالي المحصل</p><p className="text-2xl font-black mt-1 font-mono tabular-nums">{stats.income.toLocaleString()}</p></div><div className="p-3 bg-white/20 rounded-lg"><TrendingUp className="w-8 h-8" /></div></div>
        <div className="stat-card bg-gradient-to-br from-destructive to-red-400 text-white p-5 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"><div><p className="text-sm opacity-90 font-bold">إجمالي المصروفات</p><p className="text-2xl font-black mt-1 font-mono tabular-nums">{stats.expenses.toLocaleString()}</p></div><div className="p-3 bg-white/20 rounded-lg"><TrendingDown className="w-8 h-8" /></div></div>
        <div className="stat-card bg-gradient-to-br from-gold to-gold-light text-navy-dark p-5 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gold/20"><div><p className="text-sm opacity-90 font-bold">صافي الربح</p><p className="text-2xl font-black mt-1 font-mono tabular-nums">{stats.net.toLocaleString()}</p></div><div className="p-3 bg-white/30 rounded-lg"><DollarSign className="w-8 h-8" /></div></div>
        <div className="stat-card bg-primary text-white p-5 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-r-8 border-gold"><div><p className="text-sm opacity-90 font-bold text-gold">المستحقات</p><p className="text-2xl font-black mt-1 font-mono tabular-nums text-gold">{stats.receivables.toLocaleString()}</p></div><div className="p-3 bg-white/20 rounded-lg"><CreditCard className="w-8 h-8" /></div></div>
      </div>
      <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
        <div className="p-4 border-b flex items-center justify-between bg-muted/5"><h3 className="text-lg font-bold">سجل العمليات المالية</h3><div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-9 py-1.5 text-sm w-64 border transition-all focus:ring-2 focus:ring-gold/20" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead><tr className="bg-muted/30 text-xs text-muted-foreground font-bold border-b"><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3">البيان / القضية</th><th className="px-4 py-3">المبلغ التفصيلي</th><th className="px-4 py-3 text-center">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-medium font-mono">{tx.date}</td>
                  <td className="px-4 py-2.5"><div className="flex flex-col"><span className="text-sm font-bold text-foreground leading-tight">{tx.caseName || 'معاملة عامة'}</span><span className="text-[11px] text-muted-foreground mt-0.5">{tx.description || ''}</span></div></td>
                  <td className="px-4 py-2.5"><div className="flex flex-col"><span className={`font-bold text-base tabular-nums ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>{tx.type === 'income' ? '+' : '-'} {Number(tx.amount).toLocaleString()}</span>{tx.type === 'income' && (<div className="flex items-center gap-3 mt-0.5 text-[10px] font-bold opacity-90"><span className="text-blue-600">مدفوع: {Number(tx.downPayment || 0).toLocaleString()}</span><span className="text-orange-600 border-r pr-2 border-border">باقي: {Number(tx.remaining || 0).toLocaleString()}</span></div>)}</div></td>
                  <td className="px-4 py-2.5"><div className="flex justify-center"><DropdownMenu><DropdownMenuTrigger className="p-1.5 hover:bg-muted rounded-full transition-all hover:rotate-90"><MoreVertical className="w-4 h-4 text-muted-foreground" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36 font-bold text-sm shadow-xl font-arabic"><DropdownMenuItem onClick={() => { setEditingTransaction(tx); setIsAddOpen(true); }} className="cursor-pointer gap-2 py-2.5 transition-colors"><Edit2 className="w-4 h-4 text-primary" /> تعديل البيانات</DropdownMenuItem><DropdownMenuItem onClick={() => deleteTransaction(tx.id)} className="cursor-pointer gap-2 text-destructive py-2.5 transition-colors"><Trash2 className="w-4 h-4" /> حذف السجل</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && <div className="p-20 text-center text-muted-foreground font-bold">لا توجد سجلات مالية</div>}
        </div>
      </div>
      <AddTransactionDialog open={isAddOpen} onOpenChange={setIsAddOpen} onAdd={handleAddOrUpdate} initialData={editingTransaction} />
    </div>
  );
}