import { useState } from "react";
import { Plus, Search, Users, Clock, Calendar, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const groups = [
  {
    id: 1,
    name: "الثالث الثانوي - مجموعة أ",
    subject: "الرياضيات",
    teacher: "أ. محمد أحمد",
    grade: "الثالث الثانوي",
    days: ["السبت", "الثلاثاء"],
    time: "4:00 م - 5:30 م",
    price: 500,
    students: 25,
    maxStudents: 30,
    status: "active",
  },
  {
    id: 2,
    name: "الثاني الثانوي - مجموعة ب",
    subject: "الجبر",
    teacher: "أ. محمد أحمد",
    grade: "الثاني الثانوي",
    days: ["الأحد", "الأربعاء"],
    time: "5:30 م - 7:00 م",
    price: 450,
    students: 20,
    maxStudents: 25,
    status: "active",
  },
  {
    id: 3,
    name: "الأول الثانوي - مجموعة أ",
    subject: "الهندسة",
    teacher: "أ. محمد أحمد",
    grade: "الأول الثانوي",
    days: ["الإثنين", "الخميس"],
    time: "7:00 م - 8:30 م",
    price: 400,
    students: 22,
    maxStudents: 25,
    status: "active",
  },
  {
    id: 4,
    name: "الثالث الثانوي - مجموعة ب",
    subject: "التفاضل والتكامل",
    teacher: "أ. محمد أحمد",
    grade: "الثالث الثانوي",
    days: ["السبت", "الثلاثاء"],
    time: "7:00 م - 8:30 م",
    price: 500,
    students: 18,
    maxStudents: 25,
    status: "active",
  },
];

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredGroups = groups.filter(
    (group) =>
      group.name.includes(searchQuery) ||
      group.subject.includes(searchQuery) ||
      group.grade.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المجموعات</h1>
          <p className="text-muted-foreground">إنشاء وإدارة مجموعات الطلاب</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مجموعة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مجموعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>اسم المجموعة</Label>
                <Input placeholder="مثال: الثالث الثانوي - مجموعة أ" />
              </div>
              <div className="space-y-2">
                <Label>المادة</Label>
                <Input placeholder="مثال: الرياضيات" />
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
                <Label>سعر الاشتراك</Label>
                <Input placeholder="500" type="number" />
              </div>
              <div className="space-y-2">
                <Label>الأيام</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأيام" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sat-tue">السبت - الثلاثاء</SelectItem>
                    <SelectItem value="sun-wed">الأحد - الأربعاء</SelectItem>
                    <SelectItem value="mon-thu">الإثنين - الخميس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الموعد</Label>
                <Input placeholder="4:00 م - 5:30 م" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  حفظ المجموعة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن مجموعة..."
          className="pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="card-hover overflow-hidden">
            <div className="h-2 gradient-primary" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{group.subject}</p>
                </div>
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
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{group.students} / {group.maxStudents} طالب</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{group.time}</span>
                </div>
              </div>

              {/* Days */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div className="flex gap-1">
                  {group.days.map((day) => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">الطلاب المسجلين</span>
                  <span className="font-medium">{Math.round((group.students / group.maxStudents) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-full rounded-full gradient-secondary transition-all duration-500"
                    style={{ width: `${(group.students / group.maxStudents) * 100}%` }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-muted-foreground">سعر الاشتراك</span>
                <span className="text-lg font-bold text-primary">{group.price} ج.م</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
