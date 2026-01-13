import { useEffect, useState } from "react";
import { Users, UsersRound, ClipboardCheck, Wallet, TrendingUp, TrendingDown, Calendar, Zap, Clock } from "lucide-react";

// --- مكونات داخلية (Internal Components) لضمان نجاح الـ Build بنسبة 100% ---

// 1. كارت الإحصائيات
const StatCard = ({ title, value, icon: Icon, variant = "default" }: any) => {
  const variants: any = {
    default: "bg-white text-slate-900",
    success: "bg-green-50 text-green-700 border-green-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100"
  };
  return (
    <div className={`p-5 rounded-[2rem] border shadow-sm flex items-center justify-between ${variants[variant]}`}>
      <div className="text-right">
        <p className="text-[10px] font-black opacity-60 uppercase">{title}</p>
        <h3 className="text-xl font-black mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-white/50 rounded-2xl shadow-inner"><Icon className="w-6 h-6" /></div>
    </div>
  );
};

// 2. جدول حصص اليوم (مبسط)
const TodaySchedule = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center gap-2 mb-4 text-slate-800 font-black"><Calendar className="w-5 h-5 text-primary" /> حصص اليوم</div>
    <div className="text-center py-10 border-2 border-dashed border-slate-50 rounded-[2rem]">
      <Clock className="w-10 h-10 text-slate-200 mx-auto mb-2" />
      <p className="text-xs text-slate-400 font-bold">لا يوجد حصص مجدولة لليوم</p>
    </div>
  </div>
);

// 3. الأفعال السريعة
const QuickActions = () => (
  <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl">
    <div className="flex items-center gap-2 mb-4 font-black"><Zap className="w-5 h-5 text-amber-400" /> أفعال سريعة</div>
    <div className="grid grid-cols-2 gap-2">
      <button className="p-3 bg-white/10 rounded-2xl text-[10px] font-black hover:bg-primary transition-all border-none text-white cursor-pointer">إضافة طالب</button>
      <button className="p-3 bg-white/10 rounded-2xl text-[10px] font-black hover:bg-primary transition-all border-none text-white cursor-pointer">تسجيل غياب</button>
    </div>
  </div>
);

// --- الدالة الرئيسية لجلب البيانات ---

const getStatsFromStorage = () => {
  if (typeof window === "undefined") return { students: 0, groups: 0, todayAttendance: 0, todayAbsence: 0, todaySessions: 0, revenueMonth: 0, pendingPayments: 0, newStudentsMonth: 0 };
  
  const students = JSON.parse(localStorage.getItem("students-data") || "[]");
  const groups = JSON.parse(localStorage.getItem("groups-data") || "[]");
  const attendance = JSON.parse(localStorage.getItem("attendance-data") || "{}");
  const finance = JSON.parse(localStorage.getItem("finance-transactions") || "[]");
  const exams = JSON.parse(localStorage.getItem("exams-data") || "[]");
  
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  
  let present = 0; let absent = 0;
  Object.values(attendance).forEach((group: any) => { 
    Object.values(group).forEach((record: any) => { 
      if (record?.status === "present") present++; 
      if (record?.status === "absent") absent++; 
    }); 
  });

  const todaySessions = exams.filter((e: any) => e.date === today).length;
  const revenueMonth = finance.filter((f: any) => f.type === "income" && new Date(f.date).getMonth() === currentMonth).reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const pendingPayments = finance.filter((f: any) => f.status === "partial").reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const newStudentsMonth = students.filter((s: any) => s.createdAt && new Date(s.createdAt).getMonth() === currentMonth).length;

  return { students: students.length, groups: groups.length, todayAttendance: present, todayAbsence: absent, todaySessions, revenueMonth, pendingPayments, newStudentsMonth };
};

export default function Dashboard() {
  const [stats, setStats] = useState(getStatsFromStorage());

  useEffect(() => { 
    const updateStats = () => setStats(getStatsFromStorage()); 
    window.addEventListener("storage", updateStats); 
    const interval = setInterval(updateStats, 2000); 
    return () => { window.removeEventListener("storage", updateStats); clearInterval(interval); }; 
  }, []);

  return (
    <div className="space-y-6 p-2 text-right font-cairo" dir="rtl">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border-r-8 border-primary">
        <div>
          <h1 className="text-2xl font-black text-slate-800">مرحباً بك 👋</h1>
          <p className="text-slate-400 font-bold text-xs uppercase italic">نظام إدارة السنتر الذكي</p>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-black">تاريخ اليوم</p>
          <p className="font-black text-primary text-sm">{new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الطلاب" value={stats.students} icon={Users} />
        <StatCard title="المجموعات النشطة" value={stats.groups} icon={UsersRound} />
        <StatCard title="حضور اليوم" value={stats.todayAttendance} icon={ClipboardCheck} variant="success" />
        <StatCard title="الإيرادات الشهرية" value={`${stats.revenueMonth.toLocaleString()} ج.م`} icon={Wallet} variant="info" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="حصص اليوم" value={stats.todaySessions} icon={Calendar} />
        <StatCard title="غياب اليوم" value={stats.todayAbsence} icon={TrendingDown} variant="warning" />
        <StatCard title="المتأخرات" value={`${stats.pendingPayments.toLocaleString()} ج.م`} icon={Wallet} variant="warning" />
        <StatCard title="طلاب جدد" value={stats.newStudentsMonth} icon={TrendingUp} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodaySchedule />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-slate-300 font-bold text-xs">رسم بياني للحضور (سيظهر هنا)</div>
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-slate-300 font-bold text-xs">رسم بياني للإيرادات (سيظهر هنا)</div>
          </div>
        </div>
        <div className="space-y-6">
          <QuickActions />
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-sm mb-4">آخر النشاطات</h3>
             <p className="text-[10px] text-slate-400 text-center py-4 font-bold">لا يوجد نشاطات حالياً</p>
          </div>
        </div>
      </div>
    </div>
  );
}