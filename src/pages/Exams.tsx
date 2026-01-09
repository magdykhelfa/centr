import { GraduationCap, Plus, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const exams = [
  {
    id: 1,
    name: "امتحان منتصف الفصل",
    group: "الثالث الثانوي - مجموعة أ",
    date: "2024-02-20",
    totalMarks: 50,
    average: 42,
    status: "graded",
  },
  {
    id: 2,
    name: "اختبار قصير - الجبر",
    group: "الثاني الثانوي - مجموعة ب",
    date: "2024-02-18",
    totalMarks: 20,
    average: 16,
    status: "graded",
  },
  {
    id: 3,
    name: "امتحان الوحدة الأولى",
    group: "الأول الثانوي - مجموعة أ",
    date: "2024-02-25",
    totalMarks: 30,
    average: null,
    status: "upcoming",
  },
];

const topStudents = [
  { id: 1, name: "أحمد محمد علي", group: "الثالث الثانوي - أ", average: 95 },
  { id: 2, name: "سارة أحمد محمود", group: "الثاني الثانوي - ب", average: 92 },
  { id: 3, name: "فاطمة حسين محمد", group: "الثالث الثانوي - ب", average: 90 },
];

export default function Exams() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الامتحانات والدرجات</h1>
          <p className="text-muted-foreground">إنشاء الامتحانات ورصد الدرجات</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إنشاء امتحان
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                قائمة الامتحانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الامتحان</TableHead>
                    <TableHead className="text-right">المجموعة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المتوسط</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>{exam.group}</TableCell>
                      <TableCell>{exam.date}</TableCell>
                      <TableCell>
                        {exam.average !== null ? (
                          <span className="font-medium">
                            {exam.average} / {exam.totalMarks}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            exam.status === "graded"
                              ? "bg-success/10 text-success"
                              : "bg-primary/10 text-primary"
                          }
                        >
                          {exam.status === "graded" ? "تم الرصد" : "قادم"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Top Students */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              الطلاب المتميزون
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topStudents.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? "bg-warning text-warning-foreground" :
                  index === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                  "bg-warning/30 text-warning"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.group}</p>
                </div>
                <div className="flex items-center gap-1 text-success">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold">{student.average}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
