import { Users, UsersRound, ClipboardCheck, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، أستاذ محمد 👋</h1>
          <p className="text-muted-foreground">إليك ملخص نشاطك اليوم</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">اليوم</p>
          <p className="font-medium">
            {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="إجمالي الطلاب"
          value={245}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="المجموعات النشطة"
          value={12}
          icon={UsersRound}
          variant="secondary"
        />
        <StatCard
          title="حضور اليوم"
          value="87%"
          icon={ClipboardCheck}
          variant="success"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="الإيرادات الشهرية"
          value="25,500 ج.م"
          icon={Wallet}
          variant="info"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="حصص اليوم"
          value={5}
          icon={ClipboardCheck}
        />
        <StatCard
          title="غياب اليوم"
          value={8}
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="المتأخرات"
          value="3,200 ج.م"
          icon={Wallet}
          variant="warning"
        />
        <StatCard
          title="طلاب جدد هذا الشهر"
          value={15}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <TodaySchedule />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttendanceChart />
            <RevenueChart />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
