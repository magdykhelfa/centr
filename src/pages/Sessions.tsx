import { BookOpen, Calendar, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sessions = [
  {
    id: 1,
    group: "الثالث الثانوي - مجموعة أ",
    date: "2024-02-15",
    time: "4:00 م - 5:30 م",
    topic: "التفاضل والتكامل - الدرس الرابع",
    homework: "تمارين صفحة 45",
    notes: "مراجعة على القوانين الأساسية",
    status: "completed",
  },
  {
    id: 2,
    group: "الثاني الثانوي - مجموعة ب",
    date: "2024-02-15",
    time: "5:30 م - 7:00 م",
    topic: "الجبر - المعادلات التربيعية",
    homework: "حل أسئلة الكتاب المدرسي",
    notes: "التركيز على طرق الحل المختلفة",
    status: "completed",
  },
  {
    id: 3,
    group: "الأول الثانوي - مجموعة أ",
    date: "2024-02-16",
    time: "7:00 م - 8:30 م",
    topic: "الهندسة - المثلثات",
    homework: null,
    notes: null,
    status: "upcoming",
  },
];

export default function Sessions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الحصص</h1>
          <p className="text-muted-foreground">إدارة وتوثيق الحصص الدراسية</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة حصة
        </Button>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{session.group}</CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.time}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  className={
                    session.status === "completed"
                      ? "bg-success/10 text-success"
                      : "bg-primary/10 text-primary"
                  }
                >
                  {session.status === "completed" ? "مكتملة" : "قادمة"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">المحتوى</p>
                <p className="font-medium">{session.topic}</p>
              </div>
              {session.homework && (
                <div>
                  <p className="text-sm text-muted-foreground">الواجب</p>
                  <p className="font-medium">{session.homework}</p>
                </div>
              )}
              {session.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">ملاحظات</p>
                  <p className="font-medium">{session.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
