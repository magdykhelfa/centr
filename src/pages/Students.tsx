import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const students = [
  {
    id: 1,
    name: "أحمد محمد علي",
    phone: "01012345678",
    parentName: "محمد علي",
    parentPhone: "01098765432",
    grade: "الثالث الثانوي",
    group: "مجموعة أ",
    status: "active",
    subscriptionDate: "2024-01-15",
    paid: 450,
    total: 500,
  },
  {
    id: 2,
    name: "سارة أحمد محمود",
    phone: "01123456789",
    parentName: "أحمد محمود",
    parentPhone: "01187654321",
    grade: "الثاني الثانوي",
    group: "مجموعة ب",
    status: "active",
    subscriptionDate: "2024-02-01",
    paid: 500,
    total: 500,
  },
  {
    id: 3,
    name: "محمود عبدالله حسن",
    phone: "01234567890",
    parentName: "عبدالله حسن",
    parentPhone: "01276543210",
    grade: "الأول الثانوي",
    group: "مجموعة أ",
    status: "inactive",
    subscriptionDate: "2024-01-20",
    paid: 300,
    total: 500,
  },
  {
    id: 4,
    name: "فاطمة حسين محمد",
    phone: "01034567891",
    parentName: "حسين محمد",
    parentPhone: "01065432109",
    grade: "الثالث الثانوي",
    group: "مجموعة ب",
    status: "active",
    subscriptionDate: "2024-02-10",
    paid: 500,
    total: 500,
  },
  {
    id: 5,
    name: "يوسف إبراهيم عمر",
    phone: "01145678902",
    parentName: "إبراهيم عمر",
    parentPhone: "01154321098",
    grade: "الثاني الثانوي",
    group: "مجموعة أ",
    status: "active",
    subscriptionDate: "2024-01-25",
    paid: 400,
    total: 500,
  },
];

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchQuery) ||
      student.phone.includes(searchQuery) ||
      student.grade.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
          <p className="text-muted-foreground">إدارة بيانات الطلاب والاشتراكات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة طالب جديد</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>اسم الطالب</Label>
                <Input placeholder="أدخل اسم الطالب" />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input placeholder="01xxxxxxxxx" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>اسم ولي الأمر</Label>
                <Input placeholder="أدخل اسم ولي الأمر" />
              </div>
              <div className="space-y-2">
                <Label>هاتف ولي الأمر</Label>
                <Input placeholder="01xxxxxxxxx" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>الصف الدراسي</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade1">الأول الثانوي</SelectItem>
                    <SelectItem value="grade2">الثاني الثانوي</SelectItem>
                    <SelectItem value="grade3">الثالث الثانوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المجموعة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groupA">مجموعة أ</SelectItem>
                    <SelectItem value="groupB">مجموعة ب</SelectItem>
                    <SelectItem value="groupC">مجموعة ج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  حفظ الطالب
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن طالب..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الصف الدراسي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصفوف</SelectItem>
                <SelectItem value="grade1">الأول الثانوي</SelectItem>
                <SelectItem value="grade2">الثاني الثانوي</SelectItem>
                <SelectItem value="grade3">الثالث الثانوي</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">متوقف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قائمة الطلاب ({filteredStudents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">الصف / المجموعة</TableHead>
                <TableHead className="text-right">ولي الأمر</TableHead>
                <TableHead className="text-right">الاشتراك</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {student.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{student.grade}</p>
                    <p className="text-sm text-muted-foreground">{student.group}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{student.parentName}</p>
                    <p className="text-sm text-muted-foreground">{student.parentPhone}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={student.paid === student.total ? "text-success" : "text-warning"}>
                        {student.paid} / {student.total} ج.م
                      </span>
                      <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${(student.paid / student.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={student.status === "active" ? "default" : "secondary"}
                      className={student.status === "active" ? "bg-success hover:bg-success/80" : ""}
                    >
                      {student.status === "active" ? "نشط" : "متوقف"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
