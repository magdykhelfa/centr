import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, UserPlus, CreditCard, ClipboardCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "student",
    message: "تم تسجيل طالب جديد: محمد علي",
    time: "منذ 5 دقائق",
    icon: UserPlus,
    color: "text-success",
  },
  {
    id: 2,
    type: "payment",
    message: "دفعة جديدة من: أحمد محمد - 500 ج.م",
    time: "منذ 15 دقيقة",
    icon: CreditCard,
    color: "text-primary",
  },
  {
    id: 3,
    type: "attendance",
    message: "تم تسجيل حضور مجموعة 3 ثانوي",
    time: "منذ ساعة",
    icon: ClipboardCheck,
    color: "text-info",
  },
  {
    id: 4,
    type: "exam",
    message: "تم رصد درجات امتحان الجبر",
    time: "منذ ساعتين",
    icon: GraduationCap,
    color: "text-warning",
  },
];

export function RecentActivity() {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          آخر النشاطات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center bg-muted",
                activity.color
              )}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
