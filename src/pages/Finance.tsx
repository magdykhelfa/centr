import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, CreditCard, Plus, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TransactionType = "income" | "expense";
type TransactionStatus = "completed" | "partial";
type Transaction = { id: number; type: TransactionType; amount: number; date: string; status: TransactionStatus; student?: string; method?: string; description?: string; category?: string; groupId?: string; };

export default function Finance() {
  // جلب البيانات مع دعم أكتر من مسمى للـ LocalStorage لضمان المزامنة
  const [allStudents] = useState(() => { const data = localStorage.getItem("students-data") || localStorage.getItem("students") || "[]"; return JSON.parse(data); });
  const [groups] = useState(() => { const data = localStorage.getItem("groups-data") || localStorage.getItem("groups") || "[]"; return JSON.parse(data); });
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem("finance-transactions") || "[]"));
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [form, setForm] = useState<Omit<Transaction, "id">>({ type: "income", amount: 0, date: new Date().toISOString().split('T')[0], status: "completed", student: "", method: "نقدي", description: "", category: "", groupId: "" });

  // تحديث البيانات لحظياً في الداشبورد
  useEffect(() => { localStorage.setItem("finance-transactions", JSON.stringify(transactions)); window.dispatchEvent(new Event("storage")); }, [transactions]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === "partial").reduce((acc, t) => acc + t.amount, 0);

  const handleSave = () => { if (editId) { setTransactions((prev) => prev.map((t) => (t.id === editId ? { ...form, id: editId } as Transaction : t))); } else { setTransactions((prev) => [...prev, { ...form, id: Date.now() } as Transaction]); } setOpenDialog(false); };
  
  // دالة البحث عن الطلاب جوه المجموعة المختارة
  const filterStudentsByGroup = (groupIdOrName: string) => {
    const selectedGroup = groups.find((g: any) => String(g.id) === groupIdOrName || g.name === groupIdOrName);
    const result = allStudents.filter((s: any) => String(s.groupId) === String(groupIdOrName) || String(s.group) === String(groupIdOrName) || (selectedGroup && (s.groupId === selectedGroup.name || s.group === selectedGroup.name)));
    setFilteredStudents(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">الحسابات المالية</h1><p className="text-muted-foreground text-sm">إدارة الإيرادات والمصروفات</p></div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild><Button className="gap-2" onClick={() => {setEditId(null); setForm({type: "income", amount: 0, date: new Date().toISOString().split('T')[0], status: "completed", student: "", method: "نقدي", description: "", category: "", groupId: ""}); setFilteredStudents([]); setOpenDialog(true);}}><Plus className="w-4 h-4" /> تسجيل معاملة</Button></DialogTrigger>
          <DialogContent className="max-w-md text-right" dir="rtl">
            <DialogHeader><DialogTitle>{editId ? "تعديل معاملة" : "تسجيل معاملة جديدة"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>نوع المعاملة</Label><Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent></Select></div>
              <div><Label>المبلغ</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
              {form.type === "income" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>المجموعة</Label><Select onValueChange={(v) => { setForm({...form, groupId: v}); filterStudentsByGroup(v); }}><SelectTrigger><SelectValue placeholder="اختر المجموعة" /></SelectTrigger><SelectContent>{groups.map((g: any) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>الطالب</Label><Select onValueChange={(v) => setForm({...form, student: v})}><SelectTrigger><SelectValue placeholder={filteredStudents.length > 0 ? "اختر الطالب" : "لا يوجد طلاب"} /></SelectTrigger><SelectContent>{filteredStudents.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                </>
              )}
              {form.type === "expense" && ( <div><Label>الوصف / البيان</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="مثال: إيجار القاعة" /></div> )}
              <div className="grid grid-cols-2 gap-2">
                <div><Label>الحالة</Label><Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="completed">مكتمل</SelectItem><SelectItem value="partial">متأخرات (جزئي)</SelectItem></SelectContent></Select></div>
                <div><Label>التاريخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setOpenDialog(false)}>إلغاء</Button><Button onClick={handleSave}>حفظ المعاملة</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="إجمالي الإيرادات" value={`${totalIncome.toLocaleString()} ج.م`} icon={<TrendingUp />} variant="primary" />
        <Stat title="إجمالي المصروفات" value={`${totalExpenses.toLocaleString()} ج.م`} icon={<TrendingDown />} variant="secondary" />
        <Stat title="صافي الربح" value={`${(totalIncome - totalExpenses).toLocaleString()} ج.م`} icon={<Wallet />} variant="success" />
        <Stat title="المتأخرات" value={`${totalPending.toLocaleString()} ج.م`} icon={<CreditCard />} variant="warning" />
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList dir="rtl" className="h-10"><TabsTrigger value="transactions">سجل المعاملات</TabsTrigger><TabsTrigger value="pending">المتأخرات المالية</TabsTrigger></TabsList>
        <TabsContent value="transactions" className="mt-4">
          <Card><CardContent className="p-0" dir="rtl">
            <Table>
              <TableHeader><TableRow className="h-12 bg-muted/30"><TableHead className="text-right">النوع</TableHead><TableHead className="text-right">البيان / الطالب</TableHead><TableHead className="text-right">المبلغ</TableHead><TableHead className="text-right">التاريخ</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {transactions.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد معاملات مسجلة</TableCell></TableRow> : 
                transactions.map((t) => (
                  <TableRow key={t.id} className="h-11 hover:bg-muted/20 border-b">
                    <TableCell className="py-2"><Badge className={`text-[11px] font-bold ${t.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{t.type === "income" ? "إيراد" : "مصروف"}</Badge></TableCell>
                    <TableCell className="py-2 font-medium">{t.type === "income" ? t.student : t.description}</TableCell>
                    <TableCell className={`py-2 font-bold ${t.type === "income" ? "text-success" : "text-destructive"}`}>{t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}</TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">{t.date}</TableCell>
                    <TableCell className="py-2 flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {setEditId(t.id); setForm(t); setOpenDialog(true);}}><Edit className="w-4 h-4" /></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setTransactions(transactions.filter(i => i.id !== t.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card><CardContent className="p-3 space-y-3">
            {transactions.filter(t => t.status === "partial").length === 0 ? <p className="text-center py-6 text-muted-foreground text-sm">لا توجد مبالغ متأخرة حالياً</p> :
            transactions.filter(t => t.status === "partial").map((p) => (
              <div key={p.id} dir="rtl" className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border-r-4 border-warning">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm">{p.student}</span>
                  <span className="text-[11px] text-muted-foreground">تاريخ الاستحقاق: {p.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left"><p className="text-[10px] text-muted-foreground uppercase font-bold">المبلغ</p><p className="font-black text-warning leading-none">{p.amount.toLocaleString()} ج.م</p></div>
                  <Button size="sm" className="bg-warning hover:bg-warning/90 text-white font-bold h-8" onClick={() => setTransactions(prev => prev.map(t => t.id === p.id ? {...t, status: 'completed'} as Transaction : t))}>تحصيل الآن</Button>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ title, value, icon, variant }: any) {
  const bg = variant === "primary" ? "gradient-primary text-primary-foreground shadow-primary/20" : variant === "secondary" ? "gradient-secondary text-secondary-foreground shadow-slate-200" : variant === "success" ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20";
  return ( 
    <Card className={`card-hover ${bg} border-none shadow-md`}>
      <CardContent className="p-5 flex justify-between items-center">
        <div><p className="text-sm opacity-80 font-bold">{title}</p><p className="text-2xl font-black mt-1 tracking-tight">{value}</p></div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">{icon}</div>
      </CardContent>
    </Card> 
  );
}