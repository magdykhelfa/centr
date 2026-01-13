import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GROUPS_KEY = "groups-data";
const STUDENTS_KEY = "students-data";

export default function Students() {
  const [studentList, setStudentList] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const emptyForm = { name: "", phone: "", parentName: "", parentPhone: "", grade: "", group: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { const s = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]"); const g = JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]"); setStudentList(s); setGroups(g); }, []);
  useEffect(() => { if (studentList.length > 0 || localStorage.getItem(STUDENTS_KEY)) { localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentList)); window.dispatchEvent(new Event("storage")); } }, [studentList]);

  const updateGroupStudentsCount = (groupName: string, delta: number) => {
    const storedGroups = JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]");
    const updatedGroups = storedGroups.map((g: any) => g.name === groupName ? { ...g, students: Math.max((g.students || 0) + delta, 0) } : g);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
    setGroups(updatedGroups);
  };

  const handleSave = () => {
    if (!form.group || !form.grade) return;
    if (editingStudentId) { setStudentList(studentList.map((s) => s.id === editingStudentId ? { ...s, ...form } : s)); } 
    else { setStudentList([...studentList, { ...form, id: Date.now(), status: "active", subscriptionDate: new Date().toISOString().split("T")[0], paid: 0, total: 500, createdAt: new Date().toISOString() }]); updateGroupStudentsCount(form.group, +1); }
    setForm(emptyForm); setEditingStudentId(null); setIsDialogOpen(false);
  };

  const handleDelete = (student: any) => { setStudentList(studentList.filter((s) => s.id !== student.id)); updateGroupStudentsCount(student.group, -1); };
  const filteredStudents = studentList.filter((student) => student.name.includes(searchQuery) || student.phone.includes(searchQuery) || student.grade.includes(searchQuery));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">إدارة الطلاب</h1><p className="text-muted-foreground">إدارة بيانات الطلاب والاشتراكات</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> إضافة طالب</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingStudentId ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 text-right" dir="rtl">
              <div className="space-y-2"><Label>اسم الطالب</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>رقم الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>اسم ولي الأمر</Label><Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></div>
              <div className="space-y-2"><Label>هاتف ولي الأمر</Label><Input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></div>
              <div className="space-y-2"><Label>المجموعة</Label><Select value={form.group} onValueChange={(groupName) => { const selectedGroup = groups.find((g) => g.name === groupName); setForm({ ...form, group: groupName, grade: selectedGroup?.grade || "" }); }}><SelectTrigger><SelectValue placeholder="اختر المجموعة" /></SelectTrigger><SelectContent>{groups.length === 0 && (<SelectItem value="none" disabled>لا توجد مجموعات مضافة</SelectItem>)}{groups.map((g: any) => (<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>الصف الدراسي</Label><Input value={form.grade} disabled /></div>
              <div className="col-span-2 flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button><Button onClick={handleSave}>{editingStudentId ? "حفظ التعديل" : "حفظ الطالب"}</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" /><Input className="pr-10" placeholder="البحث عن طالب..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></CardContent></Card>
      <Card><CardHeader><CardTitle>قائمة الطلاب ({filteredStudents.length})</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead className="text-right">الطالب</TableHead><TableHead className="text-right">الصف / المجموعة</TableHead><TableHead className="text-right">ولي الأمر</TableHead><TableHead className="text-right">الحالة</TableHead><TableHead className="text-right">إجراءات</TableHead></TableRow></TableHeader><TableBody>{filteredStudents.map((student) => (<TableRow key={student.id}><TableCell><p className="font-medium">{student.name}</p><p className="text-sm flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />{student.phone}</p></TableCell><TableCell>{student.grade} / {student.group}</TableCell><TableCell>{student.parentName}</TableCell><TableCell><Badge>{student.status === "active" ? "نشط" : "متوقف"}</Badge></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> عرض التفاصيل</DropdownMenuItem><DropdownMenuItem className="gap-2" onClick={() => { setForm(student); setEditingStudentId(student.id); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /> تعديل</DropdownMenuItem><DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(student)}><Trash2 className="w-4 h-4" /> حذف</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
}