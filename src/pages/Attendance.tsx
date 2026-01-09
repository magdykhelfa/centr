import { useState } from "react";
import { QrCode, Check, X, Clock, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const groups = [
  { id: "1", name: "الثالث الثانوي - مجموعة أ" },
  { id: "2", name: "الثاني الثانوي - مجموعة ب" },
  { id: "3", name: "الأول الثانوي - مجموعة أ" },
];

const studentsAttendance = [
  { id: 1, name: "أحمد محمد علي", status: null },
  { id: 2, name: "سارة أحمد محمود", status: null },
  { id: 3, name: "محمود عبدالله حسن", status: null },
  { id: 4, name: "فاطمة حسين محمد", status: null },
  { id: 5, name: "يوسف إبراهيم عمر", status: null },
  { id: 6, name: "نور الدين أحمد", status: null },
  { id: 7, name: "هدى محمد سعيد", status: null },
  { id: 8, name: "عمر خالد علي", status: null },
];

type AttendanceStatus = "present" | "absent" | "late" | null;

export default function Attendance() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [showQR, setShowQR] = useState(false);

  const handleAttendance = (studentId: number, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تسجيل الحضور</h1>
          <p className="text-muted-foreground">تسجيل حضور وغياب الطلاب</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setShowQR(!showQR)}>
            <QrCode className="w-4 h-4" />
            {showQR ? "إخفاء QR" : "عرض QR"}
          </Button>
          <Button className="gap-2" disabled={!selectedGroup}>
            <Check className="w-4 h-4" />
            حفظ الحضور
          </Button>
        </div>
      </div>

      {/* Group Selection & Date */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المجموعة" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">
            {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-2xl font-bold">{studentsAttendance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">حاضر</p>
                <p className="text-2xl font-bold text-success">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">غائب</p>
                <p className="text-2xl font-bold text-destructive">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متأخر</p>
                <p className="text-2xl font-bold text-warning">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code */}
        {showQR && (
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                كود الحضور
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-primary/30" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                يقوم الطالب بمسح الكود لتسجيل حضوره تلقائياً
              </p>
            </CardContent>
          </Card>
        )}

        {/* Attendance List */}
        <Card className={cn("card-hover", showQR ? "lg:col-span-2" : "lg:col-span-3")}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>قائمة الطلاب</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allPresent: Record<number, AttendanceStatus> = {};
                    studentsAttendance.forEach((s) => (allPresent[s.id] = "present"));
                    setAttendance(allPresent);
                  }}
                >
                  تحضير الكل
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroup ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studentsAttendance.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full transition-all",
                          attendance[student.id] === "present" && "bg-success text-success-foreground hover:bg-success/90"
                        )}
                        onClick={() => handleAttendance(student.id, "present")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full transition-all",
                          attendance[student.id] === "absent" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        )}
                        onClick={() => handleAttendance(student.id, "absent")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full transition-all",
                          attendance[student.id] === "late" && "bg-warning text-warning-foreground hover:bg-warning/90"
                        )}
                        onClick={() => handleAttendance(student.id, "late")}
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>اختر مجموعة لعرض قائمة الطلاب</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
