import { Bell, AlertTriangle, Calendar, CreditCard, UserX, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    type: "absence",
    title: "غياب طالب",
    message: "الطالب أحمد محمد غائب اليوم - المجموعة: الثالث الثانوي أ",
    time: "منذ ساعة",
    priority: "high",
    read: false,
  },
  {
    id: 2,
    type: "payment",
    title: "تأخير سداد",
    message: "5 طلاب لم يسددوا اشتراك هذا الشهر",
    time: "منذ 3 ساعات",
    priority: "medium",
    read: false,
  },
  {
    id: 3,
    type: "session",
    title: "حصة اليوم",
    message: "حصة الثالث الثانوي - مجموعة أ الساعة 4:00 م",
    time: "منذ 5 ساعات",
    priority: "low",
    read: true,
  },
  {
    id: 4,
    type: "exam",
    title: "امتحان قريب",
    message: "امتحان الرياضيات للصف الثالث الثانوي بعد غد",
    time: "أمس",
    priority: "medium",
    read: true,
  },
];

const iconMap = {
  absence: UserX,
  payment: CreditCard,
  session: Calendar,
  exam: AlertTriangle,
};

const priorityColors = {
  high: "border-destructive/50 bg-destructive/5",
  medium: "border-warning/50 bg-warning/5",
  low: "border-border",
};

export default function Alerts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التنبيهات</h1>
          <p className="text-muted-foreground">متابعة الإشعارات والتنبيهات الهامة</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Check className="w-4 h-4" />
          تحديد الكل كمقروء
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type as keyof typeof iconMap];
          return (
            <Card
              key={alert.id}
              className={cn(
                "card-hover transition-all",
                priorityColors[alert.priority as keyof typeof priorityColors],
                !alert.read && "border-r-4 border-r-primary"
              )}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  alert.priority === "high" ? "bg-destructive/20 text-destructive" :
                  alert.priority === "medium" ? "bg-warning/20 text-warning" :
                  "bg-primary/20 text-primary"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{alert.title}</h3>
                    {!alert.read && (
                      <Badge className="bg-primary text-primary-foreground text-xs">جديد</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  عرض
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
