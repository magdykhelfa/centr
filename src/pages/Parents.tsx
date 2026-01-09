import { UserCheck, Phone, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const parents = [
  {
    id: 1,
    name: "محمد علي أحمد",
    phone: "01098765432",
    students: ["أحمد محمد علي", "سمية محمد علي"],
    lastContact: "2024-02-10",
  },
  {
    id: 2,
    name: "أحمد محمود",
    phone: "01187654321",
    students: ["سارة أحمد محمود"],
    lastContact: "2024-02-08",
  },
  {
    id: 3,
    name: "عبدالله حسن",
    phone: "01276543210",
    students: ["محمود عبدالله حسن"],
    lastContact: "2024-02-05",
  },
];

export default function Parents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أولياء الأمور</h1>
          <p className="text-muted-foreground">التواصل مع أولياء الأمور ومتابعة الطلاب</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parents.map((parent) => (
          <Card key={parent.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{parent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {parent.phone}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <Users className="w-4 h-4" />
                  الأبناء المسجلون
                </p>
                <div className="flex flex-wrap gap-2">
                  {parent.students.map((student) => (
                    <Badge key={student} variant="secondary">
                      {student}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <FileText className="w-4 h-4" />
                  تقرير
                </Button>
                <Button size="sm" className="flex-1 gap-1">
                  <Phone className="w-4 h-4" />
                  تواصل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
