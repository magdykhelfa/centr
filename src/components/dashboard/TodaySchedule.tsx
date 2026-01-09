import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const schedule = [
  { id: 1, group: "الصف الثالث الثانوي - أ", subject: "الرياضيات", time: "4:00 م", students: 25, status: "upcoming" },
  { id: 2, group: "الصف الثاني الثانوي - ب", subject: "الجبر", time: "5:30 م", students: 20, status: "upcoming" },
  { id: 3, group: "الصف الأول الثانوي - أ", subject: "الهندسة", time: "7:00 م", students: 22, status: "upcoming" },
];

const statusStyles = {
  completed: "bg-success/10 text-success",
  ongoing: "bg-primary/10 text-primary animate-pulse-soft",
  upcoming: "bg-muted text-muted-foreground",
};

const statusLabels = {
  completed: "انتهت",
  ongoing: "جارية",
  upcoming: "قادمة",
};

export function TodaySchedule() {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          حصص اليوم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-14 h-14 rounded-lg gradient-primary flex flex-col items-center justify-center text-primary-foreground">
              <span className="text-xs">الساعة</span>
              <span className="font-bold">{session.time}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{session.group}</h4>
              <p className="text-sm text-muted-foreground">{session.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                {session.students}
              </Badge>
              <Badge className={statusStyles[session.status as keyof typeof statusStyles]}>
                {statusLabels[session.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
