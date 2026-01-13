import { useEffect, useState } from "react";
import { BookOpen, Calendar, Clock, Plus, Edit, Trash2, BookText, PenTool } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Session = { id: number; group: string; date: string; time: string; topic: string; homework?: string | null; notes?: string | null; status: "completed" | "upcoming"; startTime: string; endTime: string; lateAfter: number; absentAfter: number; };

const TimePicker = ({ label, value, onChange }: any) => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const [h, m, p] = value ? [value.split(':')[0], value.split(':')[1].split(' ')[0], value.split(' ')[1]] : ["04", "00", "م"];
  const update = (nh: string, nm: string, np: string) => onChange(`${nh}:${nm} ${np}`);
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <div className="flex gap-1 items-center" dir="ltr">
        <Select value={p} onValueChange={(v) => update(h, m, v)}><SelectTrigger className="h-8 w-[55px] text-xs px-1 font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ص">ص</SelectItem><SelectItem value="م">م</SelectItem></SelectContent></Select>
        <Select value={m} onValueChange={(v) => update(h, v, p)}><SelectTrigger className="h-8 w-[60px] text-xs px-1 font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="00">00</SelectItem><SelectItem value="15">15</SelectItem><SelectItem value="30">30</SelectItem><SelectItem value="45">45</SelectItem></SelectContent></Select>
        <Select value={h} onValueChange={(v) => update(v, m, p)}><SelectTrigger className="h-8 w-[60px] text-xs px-1 font-bold"><SelectValue /></SelectTrigger><SelectContent>{hours.map(hour => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}</SelectContent></Select>
      </div>
    </div>
  );
};

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Session, "id">>({ group: "", date: "", time: "", startTime: "04:00 م", endTime: "05:30 م", lateAfter: 10, absentAfter: 25, topic: "", homework: "", notes: "", status: "upcoming" });

  useEffect(() => { const s = JSON.parse(localStorage.getItem("sessions-data") || "[]"); const g = JSON.parse(localStorage.getItem("groups-data") || "[]"); setSessions(s); setGroups(g); }, []);
  useEffect(() => { localStorage.setItem("sessions-data", JSON.stringify(sessions)); window.dispatchEvent(new Event("storage")); }, [sessions]);

  const handleSave = () => { const finalForm = { ...form, time: `${form.startTime} - ${form.endTime}` }; if (editId) { setSessions(prev => prev.map(s => s.id === editId ? { ...s, ...finalForm } : s)); } else { setSessions(prev => [...prev, { ...finalForm, id: Date.now() }]); } setOpenDialog(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">جدول الحصص</h1><p className="text-muted-foreground text-sm font-medium">عرض وإدارة حصص المجموعات</p></div>
        <Button className="gap-2 font-bold" onClick={() => { setEditId(null); setForm({ group: "", date: "", time: "", startTime: "04:00 م", endTime: "05:30 م", lateAfter: 10, absentAfter: 25, topic: "", homework: "", notes: "", status: "upcoming" }); setOpenDialog(true); }}><Plus className="w-4 h-4" /> إضافة حصة جديدة</Button>
      </div>

      <div className="grid gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="overflow-hidden border-r-4 border-r-primary shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 px-6 pt-4 bg-muted/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-inner"><BookOpen className="w-6 h-6 text-primary-foreground" /></div>
                  <div><CardTitle className="text-xl font-black text-primary">{session.group}</CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm font-bold text-muted-foreground"><span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" />{session.date}</span><span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />{session.time}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`font-black text-xs px-3 py-1 ${session.status === "completed" ? "bg-success/20 text-success hover:bg-success/30" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>{session.status === "completed" ? "مكتملة" : "قادمة"}</Badge>
                  <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-primary/10" onClick={() => { setEditId(session.id); setForm({ ...session }); setOpenDialog(true); }}><Edit className="w-4 h-4 text-primary" /></Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-destructive/10" onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4 grid md:grid-cols-2 gap-4 border-t border-dashed">
              <div className="space-y-1 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 text-primary mb-1"><BookText className="w-4 h-4" /><span className="text-xs font-black uppercase">محتوى الحصة</span></div>
                <p className="text-md font-bold leading-relaxed">{session.topic || "لم يتم تحديد محتوى"}</p>
              </div>
              <div className="space-y-1 p-3 rounded-xl bg-success/5 border border-success/10">
                <div className="flex items-center gap-2 text-success mb-1"><PenTool className="w-4 h-4" /><span className="text-xs font-black uppercase">الواجب المطلوب</span></div>
                <p className="text-md font-bold leading-relaxed">{session.homework || "لا يوجد واجب"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-none">
          <DialogHeader className="border-b pb-2 mb-4"><DialogTitle className="text-xl font-black text-primary">{editId ? "تعديل بيانات الحصة" : "إضافة حصة دراسية"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-right px-1" dir="rtl">
            <div className="col-span-2 space-y-1.5"><Label className="font-bold">المجموعة</Label><Select value={form.group} onValueChange={(val) => setForm({ ...form, group: val })}><SelectTrigger className="h-10 font-bold"><SelectValue placeholder="اختر المجموعة من القائمة" /></SelectTrigger><SelectContent>{groups.map((g: any) => (<SelectItem key={g.id} value={g.name} className="font-bold">{g.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="font-bold">تاريخ الحصة</Label><Input type="date" className="h-10 font-bold" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="font-bold">حالة الحصة</Label><Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}><SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upcoming" className="font-bold text-primary">قادمة</SelectItem><SelectItem value="completed" className="font-bold text-success">مكتملة</SelectItem></SelectContent></Select></div>
            <TimePicker label="وقت بداية الحصة" value={form.startTime} onChange={(v: string) => setForm({ ...form, startTime: v })} />
            <TimePicker label="وقت نهاية الحصة" value={form.endTime} onChange={(v: string) => setForm({ ...form, endTime: v })} />
            <div className="space-y-1.5"><Label className="font-bold text-xs">سماح التأخير (دقيقة)</Label><Input type="number" className="h-10 font-bold text-center" value={form.lateAfter} onChange={(e) => setForm({ ...form, lateAfter: +e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="font-bold text-xs">يُحسب غياب بعد (دقيقة)</Label><Input type="number" className="h-10 font-bold text-center" value={form.absentAfter} onChange={(e) => setForm({ ...form, absentAfter: +e.target.value })} /></div>
            <div className="col-span-2 space-y-1.5"><Label className="font-bold text-primary">محتوى الحصة / الدرس</Label><Input className="h-10 font-bold border-primary/20 focus:border-primary shadow-sm" placeholder="اكتب عنوان الدرس أو المحتوى" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
            <div className="col-span-2 space-y-1.5"><Label className="font-bold text-success">الواجب المطلوب</Label><Textarea className="font-bold border-success/20 focus:border-success shadow-sm min-h-[80px]" placeholder="اكتب تفاصيل الواجب للطلاب" value={form.homework || ""} onChange={(e) => setForm({ ...form, homework: e.target.value })} /></div>
            <div className="col-span-2 flex justify-end gap-3 pt-4 border-t mt-2"><Button variant="outline" className="h-11 px-8 font-bold text-muted-foreground" onClick={() => setOpenDialog(false)}>إلغاء</Button><Button className="h-11 px-10 font-black shadow-lg" onClick={handleSave}>{editId ? "حفظ التعديلات" : "تأكيد الحصة"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}