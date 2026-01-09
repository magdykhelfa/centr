import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, CreditCard, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const transactions = [
  { id: 1, type: "income", student: "أحمد محمد علي", amount: 500, date: "2024-02-15", method: "نقدي", status: "completed" },
  { id: 2, type: "income", student: "سارة أحمد محمود", amount: 450, date: "2024-02-14", method: "تحويل", status: "completed" },
  { id: 3, type: "expense", description: "إيجار القاعة", amount: 3000, date: "2024-02-10", category: "إيجار", status: "completed" },
  { id: 4, type: "income", student: "محمود عبدالله حسن", amount: 300, date: "2024-02-12", method: "نقدي", status: "partial" },
  { id: 5, type: "expense", description: "أدوات تعليمية", amount: 500, date: "2024-02-08", category: "أدوات", status: "completed" },
];

const pendingPayments = [
  { id: 1, name: "محمود عبدالله حسن", group: "الأول الثانوي - أ", paid: 300, total: 500, dueDate: "2024-02-20" },
  { id: 2, name: "يوسف إبراهيم عمر", group: "الثاني الثانوي - أ", paid: 400, total: 500, dueDate: "2024-02-18" },
  { id: 3, name: "هدى محمد سعيد", group: "الثالث الثانوي - ب", paid: 0, total: 500, dueDate: "2024-02-25" },
];

export default function Finance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const totalPending = pendingPayments.reduce((acc, p) => acc + (p.total - p.paid), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الحسابات المالية</h1>
          <p className="text-muted-foreground">إدارة الإيرادات والمصروفات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              تسجيل معاملة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تسجيل معاملة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>نوع المعاملة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">إيراد (دفعة طالب)</SelectItem>
                    <SelectItem value="expense">مصروف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input placeholder="0" type="number" />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input placeholder="وصف المعاملة" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold mt-1">{totalIncome.toLocaleString()} ج.م</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover gradient-secondary text-secondary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">إجمالي المصروفات</p>
                <p className="text-3xl font-bold mt-1">{totalExpenses.toLocaleString()} ج.م</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover bg-success/10 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className="text-3xl font-bold mt-1 text-success">
                  {(totalIncome - totalExpenses).toLocaleString()} ج.م
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover bg-warning/10 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المتأخرات</p>
                <p className="text-3xl font-bold mt-1 text-warning">
                  {totalPending.toLocaleString()} ج.م
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="pending">المتأخرات</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>سجل المعاملات</span>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  تصفية
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge
                          className={
                            transaction.type === "income"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          }
                        >
                          {transaction.type === "income" ? "إيراد" : "مصروف"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.type === "income"
                          ? `دفعة من: ${transaction.student}`
                          : transaction.description}
                      </TableCell>
                      <TableCell
                        className={
                          transaction.type === "income" ? "text-success font-medium" : "text-destructive font-medium"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount.toLocaleString()} ج.م
                      </TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status === "completed" ? "مكتمل" : "جزئي"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>المتأخرات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {payment.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{payment.name}</p>
                        <p className="text-sm text-muted-foreground">{payment.group}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">المتبقي</p>
                      <p className="text-lg font-bold text-warning">
                        {(payment.total - payment.paid).toLocaleString()} ج.م
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">المدفوع</p>
                      <p className="text-sm">
                        {payment.paid} / {payment.total} ج.م
                      </p>
                      <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${(payment.paid / payment.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm">تسجيل دفعة</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
