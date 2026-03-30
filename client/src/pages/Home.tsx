import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  History,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  const statsQuery = (trpc as any).dashboard.stats.useQuery();

  const data = statsQuery.data;
  const isLoading = statsQuery.isLoading;

  const statCards = [
    {
      title: "إجمالي الإيرادات",
      value: `${Number(data?.revenue || 0).toLocaleString()} ج.م`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "إجمالي الطلبات",
      value: data?.orders || 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "أرباح الشحن",
      value: `${Number(data?.shippingProfit || 0).toLocaleString()} ج.م`,
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "المديونيات المتبقية",
      value: `${Number(data?.debt || 0).toLocaleString()} ج.م`,
      icon: Wallet,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const chartData = [
    { name: "يناير", sales: 4000, profit: 2400 },
    { name: "فبراير", sales: 3000, profit: 1398 },
    { name: "مارس", sales: 2000, profit: 9800 },
    { name: "أبريل", sales: 2780, profit: 3908 },
    { name: "مايو", sales: 1890, profit: 4800 },
    { name: "يونيو", sales: 2390, profit: 3800 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">أهلاً بك، {user?.name} 👋</h1>
        <p className="text-muted-foreground">إليك نظرة عامة على أداء Bookella اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              إحصائيات المبيعات والأرباح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="sales" name="المبيعات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="الأرباح" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              تنبيهات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.lowStock > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900">نقص في المخزون</p>
                    <p className="text-xs text-amber-700">هناك {data.lowStock} كتب وصلت للحد الأدنى.</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-amber-400" />
                </div>
              )}

              {Number(data?.debt) > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900">مديونيات مستحقة</p>
                    <p className="text-xs text-red-700">إجمالي المبالغ المتبقية للتحصيل: {Number(data.debt).toLocaleString()} ج.م</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-red-400" />
                </div>
              )}

              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="p-2 rounded-lg bg-blue-100">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900">نظام الإعارة</p>
                  <p className="text-xs text-blue-700">جميع الكتب المعارة حالياً تحت السيطرة.</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
