import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Clock,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GROUPS_KEY = "groups-data";

export default function Groups() {
  const [groups, setGroups] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]");
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState<any>({
    name: "",
    subject: "",
    grade: "",
    price: "",
    days: "",
    time: "",
  });

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }, [groups]);

  const filteredGroups = groups.filter(
    (group) =>
      (group.name || "").includes(searchQuery) ||
      (group.subject || "").includes(searchQuery) ||
      (group.grade || "").includes(searchQuery)
  );

  // ===== Save (Add / Edit)
  const handleSave = () => {
    if (!form.name || !form.subject || !form.grade || !form.time) return;

    if (editId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editId
            ? {
                ...g,
                ...form,
                price: Number(form.price),
                days: form.days.split("،"),
              }
            : g
        )
      );
    } else {
      setGroups((prev) => [
        ...prev,
        {
          id: Date.now(),
          teacher: "أ. محمد أحمد",
          students: 0,
          maxStudents: 30,
          status: "active",
          ...form,
          price: Number(form.price),
          days: form.days.split("،"),
        },
      ]);
    }

    resetForm();
  };

  // ===== Edit
  const handleEdit = (group: any) => {
    setEditId(group.id);
    setForm({
      name: group.name,
      subject: group.subject,
      grade: group.grade,
      price: group.price,
      days: (group.days || []).join("،"),
      time: group.time,
    });
    setIsDialogOpen(true);
  };

  // ===== Delete
  const handleDelete = (id: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditId(null);
    setForm({
      name: "",
      subject: "",
      grade: "",
      price: "",
      days: "",
      time: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المجموعات</h1>
          <p className="text-muted-foreground">
            إنشاء وإدارة مجموعات الطلاب
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setEditId(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4" />
              إضافة مجموعة
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editId ? "تعديل مجموعة" : "إضافة مجموعة جديدة"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>اسم المجموعة</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>المادة</Label>
                <Input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>الصف الدراسي</Label>
                <Input
                  value={form.grade}
                  onChange={(e) =>
                    setForm({ ...form, grade: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>سعر الاشتراك</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>الأيام</Label>
                <Input
                  placeholder="مثال: السبت، الثلاثاء"
                  value={form.days}
                  onChange={(e) =>
                    setForm({ ...form, days: e.target.value })
                  }
                />
              </div>

              {/* ===== الموعد (زي الجلسات) ===== */}
              <div className="space-y-2">
                <Label>الموعد</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({ ...form, time: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
                <Button onClick={handleSave}>
                  {editId ? "حفظ التعديل" : "إضافة المجموعة"}
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {group.subject} – {group.grade}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => handleEdit(group)}
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-destructive"
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>{group.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div className="flex gap-1">
                  {(group.days || []).map((day: string) => (
                    <Badge
                      key={day}
                      variant="secondary"
                      className="text-xs"
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-muted-foreground">
                  سعر الاشتراك
                </span>
                <span className="text-lg font-bold text-primary">
                  {group.price} ج.م
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
