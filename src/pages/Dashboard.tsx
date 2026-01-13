import { useEffect, useState } from "react";
import { Users, UsersRound, ClipboardCheck, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";

const getStatsFromStorage = () => {
  const students = JSON.parse(localStorage.getItem("students-data") || "[]");
  const groups = JSON.parse(localStorage.getItem("groups-data") || "[]");
  const attendance = JSON.parse(localStorage.getItem("attendance-data") || "{}");
  const sessions = JSON.parse(localStorage.getItem("sessions-data") || "[]");
  // تعديل: السحب من finance-transactions (اللي كود الحسابات بتاعك بيسجل فيه)
  const finance = JSON.parse(localStorage.getItem("finance-transactions") || "[]");
  // تعديل: السحب من exams-data (عشان نعد حصص/امتحانات اليوم)
  const exams = JSON.parse(localStorage.getItem("exams-data") || "[]");
  
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  
  let present = 0; let absent = 0;
  Object.values(attendance).forEach((group: any) => { Object.values(group).forEach((record: any) => { if (record?.status === "present") present++; if (record?.status === "absent") absent++; }); });

  // حصص اليوم (لو مسجل امتحان النهاردة يظهر هنا)
  const todaySessions = exams.filter((e: any) => e.date === today).length;
  
  // حساب الإيرادات من المعاملات اللي نوعها income
  const revenueMonth = finance.filter((f: any) => f.type === "income" && new Date(f.date).getMonth() === currentMonth).reduce((acc: number, f: any) => acc + f.amount, 0);
  
  // حساب المصاريف عشان لو عايز تطرحها (اختياري)
  const expensesMonth = finance.filter((f: any) => f.type === "expense" && new Date(f.date).getMonth() === currentMonth).reduce((acc: number, f: any) => acc + f.amount, 0);
  
  // المتأخرات (هنا بيحسب المعاملات اللي حالتها partial)
  const pendingPayments = finance.filter((f: any) => f.status === "partial").reduce((acc: number, f: any) => acc + f.amount, 0);
  
  const newStudentsMonth = students.filter((s: any) => new Date(s.createdAt || Date.now()).getMonth() === currentMonth).length;

  return { students: students.length, groups: groups.length, todayAttendance: present, todayAbsence: absent, todaySessions, revenueMonth, pendingPayments, newStudentsMonth };
};

export default function Dashboard() {
  const [stats, setStats] = useState(getStatsFromStorage());

  // الميزة هنا إن الـ useEffect دي هتخلي الداشبورد "ينور" أول ما أي صفحة تانية تتحدث
  useEffect(() => { 
    const updateStats = () => setStats(getStatsFromStorage()); 
    updateStats(); 
    window.addEventListener("storage", updateStats); 
    // بنضيف "تسميع" يدوي عشان لو التغيير حصل في نفس التاب
    const interval = setInterval(updateStats, 2000); 
    return () => { window.removeEventListener("storage", updateStats); clearInterval(interval); }; 
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-egyptian">مرحباً 👋</h1><p className="text-muted-foreground font-bold italic">ملخص نشاطك اليوم</p></div>
        <div className="text-left font-egyptian"><p className="text-sm text-muted-foreground">اليوم</p><p className="font-black text-primary">{new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الطلاب" value={stats.students} icon={Users} />
        <StatCard title="المجموعات النشطة" value={stats.groups} icon={UsersRound} />
        <StatCard title="حضور اليوم" value={stats.todayAttendance} icon={ClipboardCheck} variant="success" />
        <StatCard title="الإيرادات الشهرية" value={`${stats.revenueMonth.toLocaleString()} ج.م`} icon={Wallet} variant="info" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="حصص اليوم" value={stats.todaySessions} icon={ClipboardCheck} />
        <StatCard title="غياب اليوم" value={stats.todayAbsence} icon={TrendingDown} variant="warning" />
        <StatCard title="المتأخرات" value={`${stats.pendingPayments.toLocaleString()} ج.م`} icon={Wallet} variant="warning" />
        <StatCard title="طلاب جدد هذا الشهر" value={stats.newStudentsMonth} icon={TrendingUp} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6"><TodaySchedule /><div className="grid md:grid-cols-2 gap-6"><AttendanceChart /><RevenueChart /></div></div>
        <div className="space-y-6"><QuickActions /><RecentActivity /></div>
      </div>
    </div>
  );
}